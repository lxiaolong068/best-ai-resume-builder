import { unstable_cache, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'

// Cache configuration
export const CACHE_TAGS = {
  TOOLS: 'tools',
  REVIEWS: 'reviews',
  EVENTS: 'events',
  ANALYTICS: 'analytics',
} as const

export const CACHE_DURATIONS = {
  TOOLS: 300, // 5 minutes
  REVIEWS: 900, // 15 minutes
  EVENTS: 60, // 1 minute
  ANALYTICS: 1800, // 30 minutes
} as const

// Tool filters interface
export interface ToolFilters {
  search?: string
  atsOptimized?: boolean
  pricingModel?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: string
}

// Cached tool queries
export const getToolsWithCache = unstable_cache(
  async (filters: ToolFilters = {}) => {
    const {
      search = '',
      atsOptimized,
      pricingModel,
      page = 1,
      limit = 10,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = filters

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (atsOptimized !== undefined) {
      where.features = {
        path: ['atsOptimized'],
        equals: atsOptimized
      }
    }
    
    if (pricingModel) {
      where.pricingModel = {
        equals: pricingModel,
        mode: 'insensitive'
      }
    }

    // Calculate offset
    const offset = (page - 1) * limit

    // Build orderBy clause
    const orderBy: any = {}
    if (sortBy === 'rating') {
      orderBy.rating = sortOrder
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder
    }

    // Execute queries in parallel
    const [tools, totalCount] = await Promise.all([
      prisma.aiTool.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          reviews: {
            orderBy: { reviewDate: 'desc' },
            take: 1
          }
        }
      }),
      prisma.aiTool.count({ where })
    ])

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return {
      tools,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit
      }
    }
  },
  ['tools-list'],
  {
    revalidate: CACHE_DURATIONS.TOOLS,
    tags: [CACHE_TAGS.TOOLS],
  }
)

// Cached single tool query
export const getToolByIdWithCache = unstable_cache(
  async (id: string) => {
    return await prisma.aiTool.findUnique({
      where: { id },
      include: {
        reviews: {
          orderBy: { reviewDate: 'desc' }
        }
      }
    })
  },
  ['tool-detail'],
  {
    revalidate: CACHE_DURATIONS.TOOLS,
    tags: [CACHE_TAGS.TOOLS],
  }
)

// Cached tool comparison query
export const getToolsForComparisonWithCache = unstable_cache(
  async (toolIds: string[]) => {
    const tools = await prisma.aiTool.findMany({
      where: {
        id: { in: toolIds }
      },
      include: {
        reviews: {
          orderBy: { reviewDate: 'desc' },
          take: 1
        }
      }
    })

    return tools
  },
  ['tools-comparison'],
  {
    revalidate: CACHE_DURATIONS.TOOLS,
    tags: [CACHE_TAGS.TOOLS],
  }
)

// Cached featured tools query
export const getFeaturedToolsWithCache = unstable_cache(
  async (limit: number = 6) => {
    return await prisma.aiTool.findMany({
      where: {
        rating: {
          gte: 4.0
        }
      },
      orderBy: [
        { rating: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      include: {
        reviews: {
          orderBy: { reviewDate: 'desc' },
          take: 1
        }
      }
    })
  },
  ['featured-tools'],
  {
    revalidate: CACHE_DURATIONS.TOOLS,
    tags: [CACHE_TAGS.TOOLS],
  }
)

// Cached analytics query
export const getAnalyticsWithCache = unstable_cache(
  async (startDate?: Date, endDate?: Date) => {
    const where: any = {}
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: startDate,
        lte: endDate
      }
    }

    const [totalEvents, eventTypeBreakdown, pageBreakdown] = await Promise.all([
      prisma.userEvent.count({ where }),
      prisma.userEvent.groupBy({
        by: ['eventType'],
        where,
        _count: {
          eventType: true
        },
        orderBy: {
          _count: {
            eventType: 'desc'
          }
        },
        take: 10
      }),
      prisma.userEvent.groupBy({
        by: ['pageUrl'],
        where,
        _count: {
          pageUrl: true
        },
        orderBy: {
          _count: {
            pageUrl: 'desc'
          }
        },
        take: 10
      })
    ])

    return {
      totalEvents,
      eventTypeBreakdown: eventTypeBreakdown.map(item => ({
        eventType: item.eventType,
        count: item._count.eventType
      })),
      pageBreakdown: pageBreakdown.map(item => ({
        pageUrl: item.pageUrl,
        count: item._count.pageUrl
      }))
    }
  },
  ['analytics-data'],
  {
    revalidate: CACHE_DURATIONS.ANALYTICS,
    tags: [CACHE_TAGS.ANALYTICS],
  }
)

// Cache invalidation helpers
export async function revalidateToolsCache() {
  const { revalidateTag } = await import('next/cache')
  revalidateTag(CACHE_TAGS.TOOLS)
}

export async function revalidateReviewsCache() {
  const { revalidateTag } = await import('next/cache')
  revalidateTag(CACHE_TAGS.REVIEWS)
}

export async function revalidateAnalyticsCache() {
  const { revalidateTag } = await import('next/cache')
  revalidateTag(CACHE_TAGS.ANALYTICS)
}

// Multi-layer cache strategy
export class CacheStrategy {
  // Memory cache durations (React Query)
  static readonly MEMORY_CACHE = {
    tools: 5 * 60 * 1000, // 5 minutes
    comparison: 10 * 60 * 1000, // 10 minutes
    reviews: 15 * 60 * 1000, // 15 minutes
    analytics: 30 * 60 * 1000, // 30 minutes
  }

  // Server cache configuration (Next.js)
  static readonly SERVER_CACHE = {
    revalidate: 300, // 5 minutes
    tags: [CACHE_TAGS.TOOLS, CACHE_TAGS.REVIEWS],
  }

  // CDN cache headers
  static readonly CDN_CACHE = {
    'public, max-age=3600': ['images', 'static'],
    'public, max-age=300': ['api/tools'],
    'public, max-age=60': ['api/events'],
  }

  // Get cache headers for different content types
  static getCacheHeaders(contentType: string): Record<string, string> {
    for (const [cacheControl, types] of Object.entries(this.CDN_CACHE)) {
      if (types.some(type => contentType.includes(type))) {
        return {
          'Cache-Control': cacheControl,
          'Vary': 'Accept-Encoding',
        }
      }
    }
    
    return {
      'Cache-Control': 'public, max-age=60',
      'Vary': 'Accept-Encoding',
    }
  }
}

// Cache invalidation functions
export async function clearAllCache() {
  console.log('🧹 清除所有缓存...')

  try {
    // Revalidate all cache tags
    revalidateTag(CACHE_TAGS.TOOLS)
    revalidateTag(CACHE_TAGS.REVIEWS)
    revalidateTag(CACHE_TAGS.EVENTS)
    revalidateTag(CACHE_TAGS.ANALYTICS)

    console.log('✅ 缓存清除完成')
  } catch (error) {
    console.error('❌ 清除缓存时出错:', error)
    throw error
  }
}

export async function clearToolsCache() {
  console.log('🧹 清除工具缓存...')

  try {
    revalidateTag(CACHE_TAGS.TOOLS)
    console.log('✅ 工具缓存清除完成')
  } catch (error) {
    console.error('❌ 清除工具缓存时出错:', error)
    throw error
  }
}
