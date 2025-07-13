import { getValidatedConfig } from './env-validation'

export interface AIError {
  code: string
  message: string
  details?: any
  retryable: boolean
  fallbackAvailable: boolean
}

export interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
}

export interface FallbackConfig {
  fallbackModel?: string
  degradedResponse?: boolean
  cacheResponse?: boolean
}

export class AIErrorHandler {
  private config: ReturnType<typeof getValidatedConfig>
  private retryConfig: RetryConfig
  
  constructor() {
    this.config = getValidatedConfig()
    this.retryConfig = {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2
    }
  }

  classifyError(error: any): AIError {
    let code: string
    let message: string
    let retryable = false
    let fallbackAvailable = true

    if (error?.response?.status) {
      const status = error.response.status
      switch (status) {
        case 400:
          code = 'INVALID_REQUEST'
          message = 'Invalid request parameters'
          retryable = false
          fallbackAvailable = false
          break
        case 401:
          code = 'UNAUTHORIZED'
          message = 'Invalid API key or authentication failed'
          retryable = false
          fallbackAvailable = false
          break
        case 403:
          code = 'FORBIDDEN'
          message = 'Access forbidden - check permissions'
          retryable = false
          fallbackAvailable = true
          break
        case 429:
          code = 'RATE_LIMIT'
          message = 'Rate limit exceeded'
          retryable = true
          fallbackAvailable = true
          break
        case 500:
        case 502:
        case 503:
        case 504:
          code = 'SERVER_ERROR'
          message = 'Server error - service temporarily unavailable'
          retryable = true
          fallbackAvailable = true
          break
        default:
          code = 'UNKNOWN_HTTP_ERROR'
          message = `HTTP error ${status}`
          retryable = true
          fallbackAvailable = true
      }
    } else if (error?.code) {
      switch (error.code) {
        case 'ECONNREFUSED':
        case 'ENOTFOUND':
        case 'ETIMEDOUT':
          code = 'NETWORK_ERROR'
          message = 'Network connection failed'
          retryable = true
          fallbackAvailable = true
          break
        case 'ECONNRESET':
          code = 'CONNECTION_RESET'
          message = 'Connection was reset'
          retryable = true
          fallbackAvailable = true
          break
        default:
          code = error.code
          message = error.message || 'Unknown network error'
          retryable = true
          fallbackAvailable = true
      }
    } else if (error?.message) {
      if (error.message.includes('timeout')) {
        code = 'TIMEOUT'
        message = 'Request timed out'
        retryable = true
        fallbackAvailable = true
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        code = 'QUOTA_EXCEEDED'
        message = 'API quota or limit exceeded'
        retryable = false
        fallbackAvailable = true
      } else if (error.message.includes('model') || error.message.includes('not found')) {
        code = 'MODEL_NOT_FOUND'
        message = 'Requested AI model not available'
        retryable = false
        fallbackAvailable = true
      } else {
        code = 'UNKNOWN_ERROR'
        message = error.message
        retryable = true
        fallbackAvailable = true
      }
    } else {
      code = 'UNKNOWN_ERROR'
      message = 'Unknown error occurred'
      retryable = true
      fallbackAvailable = true
    }

    return {
      code,
      message,
      details: error,
      retryable,
      fallbackAvailable
    }
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string = 'AI operation'
  ): Promise<T> {
    let lastError: any
    
    for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        const classifiedError = this.classifyError(error)
        
        console.warn(`${context} failed (attempt ${attempt}/${this.retryConfig.maxAttempts}):`, {
          code: classifiedError.code,
          message: classifiedError.message,
          retryable: classifiedError.retryable
        })

        // Don't retry if error is not retryable
        if (!classifiedError.retryable) {
          throw error
        }

        // Don't retry on last attempt
        if (attempt === this.retryConfig.maxAttempts) {
          break
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1),
          this.retryConfig.maxDelay
        )

        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError
  }

  async executeWithFallback<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation?: () => Promise<T>,
    degradedOperation?: () => Promise<T>,
    context: string = 'AI operation'
  ): Promise<T> {
    try {
      return await this.executeWithRetry(primaryOperation, `${context} (primary)`)
    } catch (primaryError) {
      const classifiedError = this.classifyError(primaryError)
      
      console.error(`Primary ${context} failed:`, {
        code: classifiedError.code,
        message: classifiedError.message,
        fallbackAvailable: classifiedError.fallbackAvailable
      })

      if (!classifiedError.fallbackAvailable) {
        throw primaryError
      }

      // Try fallback model if available
      if (fallbackOperation) {
        try {
          console.log(`Attempting fallback for ${context}`)
          return await this.executeWithRetry(fallbackOperation, `${context} (fallback)`)
        } catch (fallbackError) {
          console.error(`Fallback ${context} also failed:`, this.classifyError(fallbackError))
        }
      }

      // Try degraded service if available
      if (degradedOperation) {
        try {
          console.log(`Attempting degraded service for ${context}`)
          return await degradedOperation()
        } catch (degradedError) {
          console.error(`Degraded ${context} also failed:`, this.classifyError(degradedError))
        }
      }

      // If all fallbacks failed, throw the original error
      throw primaryError
    }
  }

  createFallbackFunction<T>(
    originalFunction: (...args: any[]) => Promise<T>,
    fallbackModel: string,
    ...args: any[]
  ): () => Promise<T> {
    return () => {
      // Replace the model parameter with fallback model
      const fallbackArgs = [...args]
      // Assume model is typically the 3rd or 4th parameter in AI functions
      const modelIndex = fallbackArgs.findIndex(arg => 
        typeof arg === 'string' && (
          arg.includes('/') || 
          arg.includes('claude') || 
          arg.includes('gpt') ||
          arg.includes('llama')
        )
      )
      
      if (modelIndex !== -1) {
        fallbackArgs[modelIndex] = fallbackModel
      }
      
      return originalFunction(...fallbackArgs)
    }
  }

  createDegradedFunction<T>(
    degradedResponse: T,
    context: string = 'operation'
  ): () => Promise<T> {
    return async () => {
      console.warn(`Using degraded response for ${context}`)
      return degradedResponse
    }
  }

  logError(error: AIError, context: string, sessionId?: string): void {
    const logData = {
      timestamp: new Date().toISOString(),
      context,
      sessionId,
      errorCode: error.code,
      errorMessage: error.message,
      retryable: error.retryable,
      fallbackAvailable: error.fallbackAvailable,
      details: error.details?.message || error.details
    }

    if (error.retryable) {
      console.warn('Retryable AI error:', logData)
    } else {
      console.error('Non-retryable AI error:', logData)
    }

    // In production, you might want to send this to an error tracking service
    if (this.config.NODE_ENV === 'production') {
      // Send to Sentry, LogRocket, or other monitoring service
    }
  }

  createErrorResponse(error: AIError, context: string = 'AI operation'): {
    success: false
    error: string
    code: string
    retryable: boolean
    fallbackUsed?: boolean
  } {
    return {
      success: false,
      error: `${context} failed: ${error.message}`,
      code: error.code,
      retryable: error.retryable
    }
  }

  getDegradedAnalysisResult(): any {
    return {
      score: 75,
      suggestions: [
        'Unable to perform AI analysis due to service issues',
        'Please review your resume manually for formatting and content',
        'Try again later when AI services are restored'
      ],
      optimizedContent: 'AI optimization temporarily unavailable',
      keywords: ['resume', 'professional', 'experience'],
      atsCompatibility: {
        score: 70,
        issues: ['AI analysis temporarily unavailable'],
        improvements: ['Please try again later']
      }
    }
  }

  getDegradedGenerationResult(sectionType: string): string {
    const degradedResponses = {
      summary: 'Professional summary generation is temporarily unavailable. Please write a brief summary highlighting your key qualifications and experience.',
      experience: 'Experience enhancement is temporarily unavailable. Please review and expand your work experience descriptions manually.',
      skills: 'Skills optimization is temporarily unavailable. Please list your relevant technical and soft skills.'
    }

    return degradedResponses[sectionType as keyof typeof degradedResponses] || 
           'AI content generation is temporarily unavailable. Please try again later.'
  }
}

export const aiErrorHandler = new AIErrorHandler()