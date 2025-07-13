import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'

export interface SecurityValidationResult {
  valid: boolean
  sanitizedContent?: string
  threats: string[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  blocked: boolean
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  limit: number
}

export interface SecurityConfig {
  maxInputLength: number
  maxOutputLength: number
  allowedFileTypes: string[]
  blockedPatterns: RegExp[]
  suspiciousPatterns: RegExp[]
  maxRequestsPerMinute: number
  maxRequestsPerHour: number
  maxTokensPerSession: number
}

class AISecurityValidator {
  private config: SecurityConfig
  private rateLimitStore = new Map<string, { count: number; resetTime: number }>()
  private sessionUsage = new Map<string, { tokens: number; resetTime: number }>()

  constructor() {
    this.config = {
      maxInputLength: 15000,
      maxOutputLength: 50000,
      allowedFileTypes: ['.txt', '.pdf', '.doc', '.docx'],
      blockedPatterns: [
        /(<script[\s\S]*?>[\s\S]*?<\/script>)/gi, // Script tags
        /(javascript:|vbscript:|onload=|onerror=)/gi, // JS protocols and events
        /(eval\s*\(|Function\s*\(|setTimeout\s*\(|setInterval\s*\()/gi, // JS functions
        /(document\.|window\.|global\.|process\.)/gi, // Global objects
        /(__import__|exec\(|eval\()/gi, // Python execution
        /(system\(|shell_exec\(|exec\(|passthru\()/gi, // System commands
        /(union\s+select|drop\s+table|delete\s+from)/gi, // SQL injection
        /(\.\.\/|\.\.\\|\/etc\/|\\windows\\)/gi, // Path traversal
      ],
      suspiciousPatterns: [
        /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, // Email addresses
        /((?:https?:\/\/)?(?:[-\w.])+(?:\.[a-zA-Z]{2,3})+(?::\d{1,5})?(?:\/[^\s]*)?)/g, // URLs
        /(\b(?:\d{1,3}\.){3}\d{1,3}\b)/g, // IP addresses
        /(password|token|api_key|secret|private_key)/gi, // Sensitive keywords
        /(\b[A-Za-z0-9]{20,}\b)/g, // Long strings (potential tokens)
      ],
      maxRequestsPerMinute: 30,
      maxRequestsPerHour: 500,
      maxTokensPerSession: 50000
    }
  }

  // Input validation schema
  private readonly inputSchema = z.object({
    text: z.string()
      .min(1, 'Input cannot be empty')
      .max(15000, 'Input too long (maximum 15,000 characters)')
      .transform(str => str.trim()),
    
    sessionId: z.string()
      .min(1, 'Session ID required')
      .max(64, 'Session ID too long')
      .regex(/^[a-zA-Z0-9-_]+$/, 'Invalid session ID format'),
    
    userAgent: z.string()
      .max(512, 'User agent too long')
      .optional(),
    
    targetRole: z.string()
      .max(100, 'Target role too long')
      .optional(),
    
    sectionType: z.enum(['summary', 'experience', 'skills'])
      .optional(),
    
    model: z.string()
      .max(100, 'Model name too long')
      .regex(/^[a-zA-Z0-9\-_.\/]+$/, 'Invalid model name format')
      .optional()
  })

  validateInput(input: any): { valid: boolean; data?: any; errors?: string[] } {
    try {
      const validatedData = this.inputSchema.parse(input)
      return { valid: true, data: validatedData }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map(err => `${err.path.join('.')}: ${err.message}`)
        return { valid: false, errors }
      }
      return { valid: false, errors: ['Invalid input format'] }
    }
  }

  sanitizeContent(content: string): SecurityValidationResult {
    const threats: string[] = []
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
    let blocked = false

    // Check for blocked patterns (high security risk)
    for (const pattern of this.config.blockedPatterns) {
      if (pattern.test(content)) {
        threats.push(`Blocked pattern detected: ${pattern.source}`)
        riskLevel = 'critical'
        blocked = true
      }
    }

    if (blocked) {
      return {
        valid: false,
        threats,
        riskLevel,
        blocked: true
      }
    }

    // Check for suspicious patterns
    for (const pattern of this.config.suspiciousPatterns) {
      const matches = content.match(pattern)
      if (matches && matches.length > 0) {
        threats.push(`Suspicious pattern detected: ${matches.length} instances`)
        riskLevel = riskLevel === 'low' ? 'medium' : riskLevel
      }
    }

    // Check content length
    if (content.length > this.config.maxInputLength) {
      threats.push('Content exceeds maximum length')
      riskLevel = 'high'
      blocked = true
    }

    // Sanitize HTML content
    let sanitizedContent = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
      FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover']
    })

    // Additional text sanitization
    sanitizedContent = this.sanitizeText(sanitizedContent)

    return {
      valid: !blocked,
      sanitizedContent,
      threats,
      riskLevel,
      blocked
    }
  }

  private sanitizeText(text: string): string {
    // Remove null bytes and control characters
    let sanitized = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    
    // Normalize whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim()
    
    // Remove potentially dangerous Unicode characters
    sanitized = sanitized.replace(/[\u202A-\u202E\u2066-\u2069]/g, '')
    
    return sanitized
  }

  checkRateLimit(sessionId: string, type: 'minute' | 'hour' = 'minute'): RateLimitResult {
    const now = Date.now()
    const limit = type === 'minute' ? this.config.maxRequestsPerMinute : this.config.maxRequestsPerHour
    const window = type === 'minute' ? 60 * 1000 : 60 * 60 * 1000
    
    const key = `${sessionId}:${type}`
    const existing = this.rateLimitStore.get(key)
    
    if (!existing || now > existing.resetTime) {
      // Reset window
      this.rateLimitStore.set(key, { count: 1, resetTime: now + window })
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: now + window,
        limit
      }
    }
    
    if (existing.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: existing.resetTime,
        limit
      }
    }
    
    existing.count++
    return {
      allowed: true,
      remaining: limit - existing.count,
      resetTime: existing.resetTime,
      limit
    }
  }

  checkTokenUsage(sessionId: string, tokensRequested: number): {
    allowed: boolean
    remaining: number
    resetTime: number
    limit: number
  } {
    const now = Date.now()
    const windowMs = 24 * 60 * 60 * 1000 // 24 hours
    
    const existing = this.sessionUsage.get(sessionId)
    
    if (!existing || now > existing.resetTime) {
      // Reset daily window
      this.sessionUsage.set(sessionId, { 
        tokens: tokensRequested, 
        resetTime: now + windowMs 
      })
      return {
        allowed: true,
        remaining: this.config.maxTokensPerSession - tokensRequested,
        resetTime: now + windowMs,
        limit: this.config.maxTokensPerSession
      }
    }
    
    const newTotal = existing.tokens + tokensRequested
    if (newTotal > this.config.maxTokensPerSession) {
      return {
        allowed: false,
        remaining: this.config.maxTokensPerSession - existing.tokens,
        resetTime: existing.resetTime,
        limit: this.config.maxTokensPerSession
      }
    }
    
    existing.tokens = newTotal
    return {
      allowed: true,
      remaining: this.config.maxTokensPerSession - newTotal,
      resetTime: existing.resetTime,
      limit: this.config.maxTokensPerSession
    }
  }

  validateFileUpload(file: { name: string; size: number; type: string }): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []
    
    // Check file extension
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    if (!this.config.allowedFileTypes.includes(extension)) {
      errors.push(`File type ${extension} not allowed`)
    }
    
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      errors.push('File size too large (maximum 10MB)')
    }
    
    // Check filename for suspicious characters
    if (/[<>:"|?*\x00-\x1f]/.test(file.name)) {
      errors.push('Filename contains invalid characters')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  detectPromptInjection(prompt: string): {
    detected: boolean
    confidence: number
    patterns: string[]
  } {
    const injectionPatterns = [
      /ignore\s+(previous|all)\s+(instructions?|prompts?)/gi,
      /system\s*:?\s*(override|reset|ignore)/gi,
      /act\s+as\s+(if\s+you\s+are|a|an)\s+/gi,
      /pretend\s+(you\s+are|to\s+be)/gi,
      /role\s*[:=]\s*(admin|root|system)/gi,
      /```[\s\S]*?```/g, // Code blocks
      /\[INST\]|\[\/INST\]/gi, // Instruction tokens
      /<\|.*?\|>/gi, // Special tokens
      /assistant\s*[:=]\s*/gi,
      /human\s*[:=]\s*/gi,
    ]
    
    const patterns: string[] = []
    let confidence = 0
    
    for (const pattern of injectionPatterns) {
      const matches = prompt.match(pattern)
      if (matches) {
        patterns.push(pattern.source)
        confidence += matches.length * 0.2
      }
    }
    
    // Check for excessive instructions or role playing
    if (prompt.toLowerCase().includes('ignore') && prompt.toLowerCase().includes('instruction')) {
      confidence += 0.5
    }
    
    if (prompt.length > 1000 && /\b(system|admin|override|ignore)\b/gi.test(prompt)) {
      confidence += 0.3
    }
    
    return {
      detected: confidence > 0.5,
      confidence: Math.min(confidence, 1),
      patterns
    }
  }

  maskSensitiveData(text: string): string {
    // Mask email addresses
    text = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
    
    // Mask phone numbers
    text = text.replace(/(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g, '[PHONE]')
    
    // Mask potential API keys or tokens
    text = text.replace(/\b[A-Za-z0-9]{20,}\b/g, (match) => {
      if (match.length > 30) return '[TOKEN]'
      return match
    })
    
    // Mask SSN patterns
    text = text.replace(/\b\d{3}-?\d{2}-?\d{4}\b/g, '[SSN]')
    
    // Mask credit card patterns
    text = text.replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CARD]')
    
    return text
  }

  generateSecurityReport(sessionId: string): {
    sessionId: string
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    rateLimit: {
      minute: RateLimitResult
      hour: RateLimitResult
    }
    tokenUsage: {
      used: number
      limit: number
      remaining: number
    }
    threats: number
    recommendations: string[]
  } {
    const minuteRateLimit = this.checkRateLimit(sessionId, 'minute')
    const hourRateLimit = this.checkRateLimit(sessionId, 'hour')
    const tokenInfo = this.checkTokenUsage(sessionId, 0)
    
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
    let threats = 0
    const recommendations: string[] = []
    
    // Assess risk based on usage patterns
    if (!minuteRateLimit.allowed || !hourRateLimit.allowed) {
      riskLevel = 'high'
      threats++
      recommendations.push('Rate limit exceeded - potential abuse')
    }
    
    if (tokenInfo.remaining < tokenInfo.limit * 0.1) {
      riskLevel = riskLevel === 'low' ? 'medium' : riskLevel
      recommendations.push('Token usage approaching limit')
    }
    
    if (hourRateLimit.remaining < hourRateLimit.limit * 0.1) {
      riskLevel = riskLevel === 'low' ? 'medium' : riskLevel
      recommendations.push('Hourly request rate high')
    }
    
    return {
      sessionId,
      riskLevel,
      rateLimit: {
        minute: minuteRateLimit,
        hour: hourRateLimit
      },
      tokenUsage: {
        used: tokenInfo.limit - tokenInfo.remaining,
        limit: tokenInfo.limit,
        remaining: tokenInfo.remaining
      },
      threats,
      recommendations
    }
  }

  cleanupExpiredData(): void {
    const now = Date.now()
    
    // Clean up rate limit store
    for (const [key, data] of this.rateLimitStore.entries()) {
      if (now > data.resetTime) {
        this.rateLimitStore.delete(key)
      }
    }
    
    // Clean up session usage
    for (const [key, data] of this.sessionUsage.entries()) {
      if (now > data.resetTime) {
        this.sessionUsage.delete(key)
      }
    }
  }

  updateSecurityConfig(updates: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...updates }
  }
}

export const aiSecurity = new AISecurityValidator()

// Cleanup expired data every hour
if (typeof window === 'undefined') { // Server-side only
  setInterval(() => {
    aiSecurity.cleanupExpiredData()
  }, 60 * 60 * 1000)
}