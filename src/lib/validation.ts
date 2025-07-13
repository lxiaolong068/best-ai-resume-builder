import { z } from 'zod'

// Tool comparison validation schema
export const toolComparisonSchema = z.object({
  toolIds: z.array(z.string().min(1)).min(1).max(5), // Accept any non-empty string ID (cuid or uuid)
  filters: z.object({
    atsOptimized: z.boolean().optional(),
    pricingModel: z.enum(['free', 'freemium', 'subscription']).optional(),
  }).optional(),
})

// Event tracking validation schema
export const eventTrackingSchema = z.object({
  eventType: z.string().min(1).max(100),
  eventData: z.record(z.string(), z.any()),
  pageUrl: z.string().url().optional(),
  timestamp: z.string().datetime().optional(),
})

// Tool creation/update validation schema
export const toolSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(10).max(2000),
  websiteUrl: z.string().url(),
  pricingModel: z.enum(['free', 'freemium', 'subscription']),
  features: z.object({
    atsOptimized: z.boolean().optional(),
    templates: z.number().int().min(0).optional(),
    aiSuggestions: z.boolean().optional(),
    coverLetter: z.boolean().optional(),
    tracking: z.boolean().optional(),
    support: z.enum(['email', 'chat', 'phone', 'none']).optional(),
    exportFormats: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    collaboration: z.boolean().optional(),
    analytics: z.boolean().optional(),
    linkedinIntegration: z.boolean().optional(),
    keywordOptimization: z.boolean().optional(),
  }).optional(),
  affiliateLink: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  rating: z.number().min(0).max(5).optional(),
})

// API query parameters validation
export const toolsQuerySchema = z.object({
  page: z.string().optional().transform((val) => val ? Number(val) : undefined),
  limit: z.string().optional().transform((val) => val ? Number(val) : undefined),
  sortBy: z.enum(['rating', 'name', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().max(200).optional(),
  atsOptimized: z.enum(['true', 'false']).optional(),
  pricingModel: z.enum(['free', 'freemium', 'subscription']).optional(),
})

// Events query parameters validation
export const eventsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  eventType: z.string().max(100).optional(),
  page: z.string().optional().transform((val) => val ? Number(val) : undefined),
  limit: z.string().optional().transform((val) => val ? Number(val) : undefined),
})

// Generic validation helper
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
      return { success: false, error: `Validation error: ${errorMessages}` }
    }
    return { success: false, error: 'Unknown validation error' }
  }
}

// Sanitize string input to prevent XSS
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

// Validate UUID format
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// Validate URL format
export function isValidURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Rate limiting validation
export const rateLimitHeaders = {
  'X-RateLimit-Limit': 'number',
  'X-RateLimit-Remaining': 'number',
  'X-RateLimit-Reset': 'string',
} as const

// Common response schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  pagination: z.object({
    currentPage: z.number(),
    totalPages: z.number(),
    totalCount: z.number(),
    hasNextPage: z.boolean(),
    hasPrevPage: z.boolean(),
    limit: z.number(),
  }).optional(),
})

export type ApiResponse<T = any> = z.infer<typeof apiResponseSchema> & {
  data?: T
}
