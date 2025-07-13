import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  
  // OpenRouter AI Configuration
  OPENROUTER_API_KEY: z.string()
    .startsWith('sk-or-v1-', 'OPENROUTER_API_KEY must start with sk-or-v1-')
    .min(64, 'OPENROUTER_API_KEY appears to be invalid (too short)'),
  OPENROUTER_BASE_URL: z.string().url('OPENROUTER_BASE_URL must be a valid URL')
    .default('https://openrouter.ai/api/v1'),
  OPENROUTER_SITE_URL: z.string().url('OPENROUTER_SITE_URL must be a valid URL')
    .optional(),
  OPENROUTER_APP_NAME: z.string().min(1, 'OPENROUTER_APP_NAME is required')
    .default('Best AI Resume Builder 2025'),
  
  // AI Model Configuration
  AI_MODEL_NAME: z.string().min(1, 'AI_MODEL_NAME is required')
    .default('anthropic/claude-3.5-sonnet'),
  AI_FALLBACK_MODEL: z.string().min(1, 'AI_FALLBACK_MODEL is required')
    .default('openai/gpt-4-turbo-preview'),
  
  // AI Limits and Budget
  MAX_TOKENS_PER_REQUEST: z.coerce.number()
    .min(100, 'MAX_TOKENS_PER_REQUEST must be at least 100')
    .max(32000, 'MAX_TOKENS_PER_REQUEST cannot exceed 32000')
    .default(4000),
  AI_CACHE_TTL: z.coerce.number()
    .min(300, 'AI_CACHE_TTL must be at least 5 minutes (300 seconds)')
    .max(86400, 'AI_CACHE_TTL cannot exceed 24 hours (86400 seconds)')
    .default(3600),
  MAX_AI_REQUESTS_PER_HOUR: z.coerce.number()
    .min(1, 'MAX_AI_REQUESTS_PER_HOUR must be at least 1')
    .max(1000, 'MAX_AI_REQUESTS_PER_HOUR cannot exceed 1000')
    .default(100),
  MONTHLY_AI_BUDGET: z.coerce.number()
    .min(0, 'MONTHLY_AI_BUDGET must be non-negative')
    .max(10000, 'MONTHLY_AI_BUDGET cannot exceed $10,000')
    .default(500),
  
  // Optional Services
  REDIS_URL: z.string().url('REDIS_URL must be a valid URL').optional(),
  SENTRY_DSN: z.string().url('SENTRY_DSN must be a valid URL').optional(),
  
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // NextAuth
  NEXTAUTH_SECRET: z.string()
    .min(32, 'NEXTAUTH_SECRET must be at least 32 characters for security')
    .optional(),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL').optional(),
})

export type EnvConfig = z.infer<typeof envSchema>

interface ValidationResult {
  success: boolean
  config?: EnvConfig
  errors?: string[]
  warnings?: string[]
}

export function validateEnvironment(): ValidationResult {
  try {
    const config = envSchema.parse(process.env)
    const warnings: string[] = []
    
    // Add warnings for missing optional but recommended configs
    if (!process.env.REDIS_URL) {
      warnings.push('REDIS_URL not configured - using memory cache (not recommended for production)')
    }
    
    if (!process.env.SENTRY_DSN) {
      warnings.push('SENTRY_DSN not configured - error monitoring disabled')
    }
    
    if (process.env.NODE_ENV === 'production' && !process.env.NEXTAUTH_SECRET) {
      warnings.push('NEXTAUTH_SECRET not configured - required for production')
    }
    
    // Validate model compatibility
    const modelName = config.AI_MODEL_NAME
    const supportedProviders = ['anthropic', 'openai', 'meta-llama', 'google', 'mistralai']
    const hasValidProvider = supportedProviders.some(provider => modelName.startsWith(provider))
    
    if (!hasValidProvider) {
      warnings.push(`AI_MODEL_NAME "${modelName}" may not be supported. Verify with OpenRouter documentation.`)
    }
    
    return {
      success: true,
      config,
      warnings: warnings.length > 0 ? warnings : undefined
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(err => {
        const path = err.path.join('.')
        return `${path}: ${err.message}`
      })
      
      return {
        success: false,
        errors
      }
    }
    
    return {
      success: false,
      errors: [`Unexpected validation error: ${error instanceof Error ? error.message : 'Unknown error'}`]
    }
  }
}

export function getValidatedConfig(): EnvConfig {
  const result = validateEnvironment()
  
  if (!result.success) {
    throw new Error(`Environment validation failed:\n${result.errors?.join('\n')}`)
  }
  
  if (result.warnings) {
    console.warn('Environment warnings:', result.warnings.join('\n'))
  }
  
  return result.config!
}

export function checkAIConfiguration(): { isValid: boolean; issues: string[] } {
  const result = validateEnvironment()
  const issues: string[] = []
  
  if (!result.success) {
    issues.push(...(result.errors || []))
  }
  
  if (result.warnings) {
    issues.push(...result.warnings)
  }
  
  // Additional AI-specific checks
  if (result.config) {
    const { MONTHLY_AI_BUDGET, MAX_AI_REQUESTS_PER_HOUR, MAX_TOKENS_PER_REQUEST } = result.config
    
    if (MONTHLY_AI_BUDGET < 10) {
      issues.push('MONTHLY_AI_BUDGET is very low - may limit AI functionality')
    }
    
    if (MAX_AI_REQUESTS_PER_HOUR < 10) {
      issues.push('MAX_AI_REQUESTS_PER_HOUR is very low - may impact user experience')
    }
    
    if (MAX_TOKENS_PER_REQUEST < 1000) {
      issues.push('MAX_TOKENS_PER_REQUEST is low - may limit AI response quality')
    }
  }
  
  return {
    isValid: result.success && issues.length === 0,
    issues
  }
}