import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, validateApiKey, getClientIP } from '@/lib/rate-limit'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files and internal Next.js routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/_') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    const clientIP = getClientIP(request)
    const rateLimitResult = await rateLimit(clientIP)
    
    if (!rateLimitResult.success) {
      const response = new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )
      
      // Add rate limit headers
      if (rateLimitResult.limit) {
        response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
      }
      if (rateLimitResult.remaining !== undefined) {
        response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
      }
      if (rateLimitResult.reset) {
        response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toISOString())
      }
      
      return response
    }
    
    // Add rate limit headers to successful responses
    const response = NextResponse.next()
    if (rateLimitResult.limit) {
      response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
    }
    if (rateLimitResult.remaining !== undefined) {
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    }
    if (rateLimitResult.reset) {
      response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toISOString())
    }
  }

  // API key validation for admin endpoints
  if (pathname.startsWith('/api/admin')) {
    const apiKey = request.headers.get('X-API-Key')
    
    if (!apiKey || !validateApiKey(apiKey)) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Unauthorized',
          message: 'Valid API key required for admin endpoints.',
        }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )
    }
  }

  // Enhanced security for sensitive endpoints
  if (pathname.startsWith('/api/tools') && request.method === 'POST') {
    // Require API key for creating tools
    const apiKey = request.headers.get('X-API-Key')
    
    if (!apiKey || !validateApiKey(apiKey)) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Unauthorized',
          message: 'API key required for creating tools.',
        }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )
    }
  }

  // Enhanced security for tool updates and deletions
  if (pathname.match(/^\/api\/tools\/[^\/]+$/) && (request.method === 'PUT' || request.method === 'DELETE')) {
    const apiKey = request.headers.get('X-API-Key')
    
    if (!apiKey || !validateApiKey(apiKey)) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Unauthorized',
          message: 'API key required for modifying tools.',
        }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Content Security Policy for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'none'; script-src 'none'; object-src 'none'; base-uri 'none';"
    )
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
