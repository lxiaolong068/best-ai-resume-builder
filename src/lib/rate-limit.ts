import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create Redis instance for rate limiting
// For development, we'll use a simple in-memory store
// In production, you should use Upstash Redis
const redis = process.env.UPSTASH_REDIS_REST_URL 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : undefined

// Create rate limiter instance
const ratelimit = redis 
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
      analytics: true,
    })
  : null

// In-memory rate limiting for development
const inMemoryStore = new Map<string, { count: number; resetTime: number }>()

export async function rateLimit(identifier: string | null): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: Date }> {
  // Use IP address or fallback to 'anonymous'
  const key = identifier || 'anonymous'
  
  if (ratelimit) {
    // Use Redis-based rate limiting in production
    try {
      const { success, limit, remaining, reset } = await ratelimit.limit(key)
      return { success, limit, remaining, reset }
    } catch (error) {
      console.error('Rate limiting error:', error)
      // Fallback to allowing the request if Redis fails
      return { success: true }
    }
  } else {
    // Use in-memory rate limiting for development
    const now = Date.now()
    const windowMs = 10 * 1000 // 10 seconds
    const maxRequests = 10
    
    const record = inMemoryStore.get(key)
    
    if (!record || now > record.resetTime) {
      // First request or window expired
      inMemoryStore.set(key, { count: 1, resetTime: now + windowMs })
      return { 
        success: true, 
        limit: maxRequests, 
        remaining: maxRequests - 1, 
        reset: new Date(now + windowMs) 
      }
    }
    
    if (record.count >= maxRequests) {
      // Rate limit exceeded
      return { 
        success: false, 
        limit: maxRequests, 
        remaining: 0, 
        reset: new Date(record.resetTime) 
      }
    }
    
    // Increment counter
    record.count++
    inMemoryStore.set(key, record)
    
    return { 
      success: true, 
      limit: maxRequests, 
      remaining: maxRequests - record.count, 
      reset: new Date(record.resetTime) 
    }
  }
}

// API key validation function
export function validateApiKey(apiKey: string): boolean {
  const validApiKeys = process.env.ADMIN_API_KEYS?.split(',') || []
  return validApiKeys.includes(apiKey)
}

// Get client IP address from request
export function getClientIP(request: Request): string | null {
  // Try various headers that might contain the real IP
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  if (cfConnectingIp) {
    return cfConnectingIp
  }
  
  return null
}
