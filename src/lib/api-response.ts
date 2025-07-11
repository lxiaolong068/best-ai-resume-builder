import { NextResponse } from 'next/server'
import { trackError } from '@/lib/analytics'

// Standard API response interface
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
    timestamp?: string
    requestId?: string
  }
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  meta?: {
    version: string
    timestamp: string
    requestId: string
  }
}

// Error codes enum
export enum ErrorCode {
  // Client errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
  
  // Server errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
}

// Error messages mapping
const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.BAD_REQUEST]: 'The request is invalid or malformed',
  [ErrorCode.UNAUTHORIZED]: 'Authentication is required',
  [ErrorCode.FORBIDDEN]: 'Access to this resource is forbidden',
  [ErrorCode.NOT_FOUND]: 'The requested resource was not found',
  [ErrorCode.METHOD_NOT_ALLOWED]: 'The HTTP method is not allowed for this endpoint',
  [ErrorCode.VALIDATION_ERROR]: 'The provided data is invalid',
  [ErrorCode.RATE_LIMITED]: 'Too many requests, please try again later',
  [ErrorCode.INTERNAL_ERROR]: 'An internal server error occurred',
  [ErrorCode.DATABASE_ERROR]: 'A database error occurred',
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 'An external service error occurred',
  [ErrorCode.TIMEOUT_ERROR]: 'The request timed out',
}

// HTTP status codes mapping
const STATUS_CODES: Record<ErrorCode, number> = {
  [ErrorCode.BAD_REQUEST]: 400,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.METHOD_NOT_ALLOWED]: 405,
  [ErrorCode.VALIDATION_ERROR]: 422,
  [ErrorCode.RATE_LIMITED]: 429,
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 502,
  [ErrorCode.TIMEOUT_ERROR]: 504,
}

// Generate unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Create success response
export function createSuccessResponse<T>(
  data: T,
  pagination?: ApiResponse<T>['pagination'],
  meta?: Partial<ApiResponse<T>['meta']>
): ApiResponse<T> {
  const requestId = generateRequestId()
  
  return {
    success: true,
    data,
    ...(pagination && { pagination }),
    meta: {
      version: '1.0',
      timestamp: new Date().toISOString(),
      requestId,
      ...meta,
    },
  }
}

// Create error response
export function createErrorResponse(
  code: ErrorCode,
  message?: string,
  details?: any,
  requestId?: string
): ApiResponse {
  const errorRequestId = requestId || generateRequestId()
  
  return {
    success: false,
    error: {
      code,
      message: message || ERROR_MESSAGES[code],
      details,
      timestamp: new Date().toISOString(),
      requestId: errorRequestId,
    },
    meta: {
      version: '1.0',
      timestamp: new Date().toISOString(),
      requestId: errorRequestId,
    },
  }
}

// Create Next.js response with proper headers
export function createApiResponse<T>(
  response: ApiResponse<T>,
  statusCode?: number
): NextResponse {
  const status = statusCode || (response.success ? 200 : 
    response.error ? STATUS_CODES[response.error.code as ErrorCode] || 500 : 500)
  
  const nextResponse = NextResponse.json(response, { status })
  
  // Add standard headers
  nextResponse.headers.set('Content-Type', 'application/json')
  nextResponse.headers.set('X-Request-ID', response.meta?.requestId || generateRequestId())
  nextResponse.headers.set('X-API-Version', response.meta?.version || '1.0')
  
  // Add CORS headers if needed
  nextResponse.headers.set('Access-Control-Allow-Origin', '*')
  nextResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  nextResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key')
  
  return nextResponse
}

// Error handler wrapper for API routes
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<NextResponse> => {
    const requestId = generateRequestId()
    
    try {
      const result = await handler(...args)
      
      // If result is already a NextResponse, return it
      if (result instanceof NextResponse) {
        return result
      }
      
      // Otherwise, wrap in success response
      const successResponse = createSuccessResponse(result, undefined, { requestId })
      return createApiResponse(successResponse)
      
    } catch (error) {
      console.error('API Error:', error)
      
      // Track error for analytics
      trackError(
        error instanceof Error ? error.message : 'Unknown API error',
        'api',
        'api-route'
      )
      
      // Determine error type and create appropriate response
      let errorCode = ErrorCode.INTERNAL_ERROR
      let errorMessage = 'An unexpected error occurred'
      let details: any = undefined
      
      if (error instanceof Error) {
        errorMessage = error.message
        
        // Map specific error types
        if (error.message.includes('validation')) {
          errorCode = ErrorCode.VALIDATION_ERROR
        } else if (error.message.includes('not found')) {
          errorCode = ErrorCode.NOT_FOUND
        } else if (error.message.includes('unauthorized')) {
          errorCode = ErrorCode.UNAUTHORIZED
        } else if (error.message.includes('forbidden')) {
          errorCode = ErrorCode.FORBIDDEN
        } else if (error.message.includes('timeout')) {
          errorCode = ErrorCode.TIMEOUT_ERROR
        } else if (error.message.includes('database')) {
          errorCode = ErrorCode.DATABASE_ERROR
        }
        
        // Include stack trace in development
        if (process.env.NODE_ENV === 'development') {
          details = { stack: error.stack }
        }
      }
      
      const errorResponse = createErrorResponse(errorCode, errorMessage, details, requestId)
      return createApiResponse(errorResponse)
    }
  }
}

// Validation error helper
export function createValidationError(
  message: string,
  field?: string,
  value?: any
): NextResponse {
  const errorResponse = createErrorResponse(
    ErrorCode.VALIDATION_ERROR,
    message,
    { field, value }
  )
  return createApiResponse(errorResponse)
}

// Not found error helper
export function createNotFoundError(resource: string): NextResponse {
  const errorResponse = createErrorResponse(
    ErrorCode.NOT_FOUND,
    `${resource} not found`
  )
  return createApiResponse(errorResponse)
}

// Unauthorized error helper
export function createUnauthorizedError(message?: string): NextResponse {
  const errorResponse = createErrorResponse(
    ErrorCode.UNAUTHORIZED,
    message || 'Authentication required'
  )
  return createApiResponse(errorResponse)
}

// Rate limit error helper
export function createRateLimitError(retryAfter?: number): NextResponse {
  const errorResponse = createErrorResponse(
    ErrorCode.RATE_LIMITED,
    'Rate limit exceeded'
  )
  const response = createApiResponse(errorResponse)
  
  if (retryAfter) {
    response.headers.set('Retry-After', retryAfter.toString())
  }
  
  return response
}

// Database error helper
export function createDatabaseError(operation: string): NextResponse {
  const errorResponse = createErrorResponse(
    ErrorCode.DATABASE_ERROR,
    `Database ${operation} failed`
  )
  return createApiResponse(errorResponse)
}

// Client-side API error handling
export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: any,
    public requestId?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
  
  static fromResponse(response: ApiResponse): ApiError {
    if (response.success || !response.error) {
      throw new Error('Cannot create ApiError from successful response')
    }
    
    return new ApiError(
      response.error.code as ErrorCode,
      response.error.message,
      response.error.details,
      response.error.requestId
    )
  }
}

// Fetch wrapper with error handling
export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })
    
    const data: ApiResponse<T> = await response.json()
    
    if (!data.success) {
      throw ApiError.fromResponse(data)
    }
    
    return data.data as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    // Network or parsing error
    throw new ApiError(
      ErrorCode.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Network error occurred'
    )
  }
}
