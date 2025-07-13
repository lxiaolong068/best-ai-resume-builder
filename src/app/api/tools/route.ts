import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { toolsQuerySchema, toolSchema, validateRequest } from '@/lib/validation'
import { getToolsWithCache, revalidateToolsCache, CacheStrategy } from '@/lib/cache'
import {
  createSuccessResponse,
  createApiResponse,
  createValidationError,
  withErrorHandler,
  ErrorCode
} from '@/lib/api-response'

// GET /api/tools - Get all AI tools with optional filtering and sorting
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)

  // Convert search params to object for validation
  const queryParams = Object.fromEntries(searchParams.entries())

  // Validate query parameters
  const validation = toolsQuerySchema.safeParse(queryParams)
  if (!validation.success) {
    return createValidationError('Invalid query parameters')
  }

    // Extract validated parameters with defaults
    const {
      page = 1,
      limit = 10,
      sortBy = 'rating',
      sortOrder = 'desc',
      search = '',
      atsOptimized,
      pricingModel
    } = validation.data

    // Use cached query for better performance
    const result = await getToolsWithCache({
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      atsOptimized: atsOptimized === 'true' ? true : atsOptimized === 'false' ? false : undefined,
      pricingModel
    })

  // Create success response with pagination
  const successResponse = createSuccessResponse(
    result.tools,
    {
      page: result.pagination.currentPage, // Adjusted to match type
      limit: result.pagination.limit,
      total: result.pagination.totalCount,
      totalPages: result.pagination.totalPages,
      hasNextPage: result.pagination.hasNextPage,
      hasPrevPage: result.pagination.hasPrevPage
    }
  )

  // Create API response with cache headers
  const response = createApiResponse(successResponse)
  const cacheHeaders = CacheStrategy.getCacheHeaders('api/tools')

  // Apply cache headers
  Object.entries(cacheHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
})

// POST /api/tools - Create a new AI tool (Admin only)
export const POST = withErrorHandler(async (request: NextRequest) => {
  try {
    const body = await request.json()

    // Validate input using Zod schema
    const validation = validateRequest(toolSchema, body)
    if (!validation.success) {
      return createValidationError(validation.error)
    }

      const { name, description, websiteUrl, pricingModel, features, affiliateLink, logoUrl, rating } = validation.data
      
      // Create new tool
      const tool = await prisma.aiTool.create({
        data: {
          name,
          description,
          websiteUrl,
          pricingModel,
          features: features || {},
          affiliateLink,
          logoUrl,
          rating
        },
        include: {
          reviews: true
        }
      })
      
    // Invalidate cache after creating new tool
    await revalidateToolsCache()

    // Create success response
    const successResponse = createSuccessResponse(tool)
    return createApiResponse(successResponse, 201)
  } catch (error) {
    throw error;
  }
})
