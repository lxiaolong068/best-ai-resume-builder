import { prisma } from '@/lib/prisma'
import type { 
  Tool, 
  ToolReview, 
  ToolFilters, 
  Pagination,
  PricingModel,
  SupportLevel,
  ExportFormat,
  Language 
} from '@/types'

// Type-safe query builder for tools
export class ToolQueryBuilder {
  private whereClause: any = {}
  private includeClause: any = {}
  private orderByClause: any = {}
  private paginationOptions: { skip?: number; take?: number } = {}

  // Add search filter
  search(query: string): this {
    if (query.trim()) {
      this.whereClause.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { hasSome: [query] } },
      ]
    }
    return this
  }

  // Add pricing model filter
  pricingModel(model: PricingModel): this {
    this.whereClause.pricingModel = model
    return this
  }

  // Add ATS optimization filter
  atsOptimized(optimized: boolean): this {
    this.whereClause.features = {
      ...this.whereClause.features,
      path: ['atsOptimized'],
      equals: optimized,
    }
    return this
  }

  // Add support level filter
  supportLevel(level: SupportLevel): this {
    this.whereClause.features = {
      ...this.whereClause.features,
      path: ['support'],
      equals: level,
    }
    return this
  }

  // Add export format filter
  exportFormats(formats: ExportFormat[]): this {
    this.whereClause.features = {
      ...this.whereClause.features,
      path: ['exportFormats'],
      array_contains: formats,
    }
    return this
  }

  // Add language filter
  languages(langs: Language[]): this {
    this.whereClause.features = {
      ...this.whereClause.features,
      path: ['languages'],
      array_contains: langs,
    }
    return this
  }

  // Add rating filter
  rating(min?: number, max?: number): this {
    if (min !== undefined || max !== undefined) {
      this.whereClause.rating = {}
      if (min !== undefined) this.whereClause.rating.gte = min
      if (max !== undefined) this.whereClause.rating.lte = max
    }
    return this
  }

  // Add featured filter
  featured(isFeatured: boolean): this {
    this.whereClause.featured = isFeatured
    return this
  }

  // Add active filter
  active(isActive: boolean = true): this {
    this.whereClause.active = isActive
    return this
  }

  // Include reviews
  withReviews(latest: boolean = false): this {
    this.includeClause.reviews = latest
      ? {
          orderBy: { reviewDate: 'desc' },
          take: 1,
        }
      : {
          orderBy: { reviewDate: 'desc' },
        }
    return this
  }

  // Add sorting
  sortBy(field: 'rating' | 'name' | 'createdAt' | 'popularity', order: 'asc' | 'desc' = 'desc'): this {
    switch (field) {
      case 'rating':
        this.orderByClause.rating = order
        break
      case 'name':
        this.orderByClause.name = order
        break
      case 'createdAt':
        this.orderByClause.createdAt = order
        break
      case 'popularity':
        // Assuming popularity is based on view count or similar metric
        this.orderByClause.monthlyVisitors = order
        break
    }
    return this
  }

  // Add pagination
  paginate(page: number, limit: number): this {
    this.paginationOptions.skip = (page - 1) * limit
    this.paginationOptions.take = limit
    return this
  }

  // Execute query and return tools
  async findMany(): Promise<Tool[]> {
    const tools = await prisma.aiTool.findMany({
      where: this.whereClause,
      include: this.includeClause,
      orderBy: this.orderByClause,
      ...this.paginationOptions,
    })

    return tools as Tool[]
  }

  // Execute query and return tools with count
  async findManyWithCount(): Promise<{ tools: Tool[]; total: number }> {
    const [tools, total] = await Promise.all([
      this.findMany(),
      prisma.aiTool.count({ where: this.whereClause }),
    ])

    return { tools, total }
  }

  // Execute query and return paginated result
  async findManyPaginated(page: number, limit: number): Promise<{
    tools: Tool[]
    pagination: Pagination
  }> {
    this.paginate(page, limit)
    const { tools, total } = await this.findManyWithCount()

    const totalPages = Math.ceil(total / limit)
    const pagination: Pagination = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    }

    return { tools, pagination }
  }
}

// Type-safe query functions
export const toolQueries = {
  // Get all tools with filters
  async getTools(filters: ToolFilters = {}): Promise<{
    tools: Tool[]
    pagination: Pagination
  }> {
    const builder = new ToolQueryBuilder()

    // Apply filters
    if (filters.search) builder.search(filters.search)
    if (filters.pricingModel) builder.pricingModel(filters.pricingModel)
    if (filters.atsOptimized !== undefined) builder.atsOptimized(filters.atsOptimized)
    if (filters.supportLevel) builder.supportLevel(filters.supportLevel)
    if (filters.exportFormats?.length) builder.exportFormats(filters.exportFormats)
    if (filters.languages?.length) builder.languages(filters.languages)
    if (filters.rating) builder.rating(filters.rating.min, filters.rating.max)

    // Apply sorting
    if (filters.sortBy) {
      builder.sortBy(filters.sortBy, filters.sortOrder || 'desc')
    } else {
      builder.sortBy('rating', 'desc') // Default sort
    }

    // Include reviews
    builder.withReviews(true)

    // Apply active filter
    builder.active(true)

    // Execute with pagination
    return builder.findManyPaginated(
      filters.page || 1,
      filters.limit || 10
    )
  },

  // Get tool by ID
  async getToolById(id: string): Promise<Tool | null> {
    const tool = await prisma.aiTool.findUnique({
      where: { id, active: true },
      include: {
        reviews: {
          orderBy: { reviewDate: 'desc' },
        },
      },
    })

    return tool as Tool | null
  },

  // Get featured tools
  async getFeaturedTools(limit: number = 6): Promise<Tool[]> {
    const builder = new ToolQueryBuilder()
    return builder
      .featured(true)
      .active(true)
      .withReviews(true)
      .sortBy('rating', 'desc')
      .paginate(1, limit)
      .findMany()
  },

  // Get tools for comparison
  async getToolsForComparison(toolIds: string[]): Promise<Tool[]> {
    const tools = await prisma.aiTool.findMany({
      where: {
        id: { in: toolIds },
        active: true,
      },
      include: {
        reviews: {
          orderBy: { reviewDate: 'desc' },
          take: 1,
        },
      },
    })

    return tools as Tool[]
  },

  // Search tools
  async searchTools(query: string, limit: number = 10): Promise<Tool[]> {
    const builder = new ToolQueryBuilder()
    return builder
      .search(query)
      .active(true)
      .withReviews(true)
      .sortBy('rating', 'desc')
      .paginate(1, limit)
      .findMany()
  },

  // Get tools by category
  async getToolsByCategory(category: string, limit: number = 10): Promise<Tool[]> {
    const tools = await prisma.aiTool.findMany({
      where: {
        category: {
          equals: category,
          mode: 'insensitive',
        },
        active: true,
      },
      include: {
        reviews: {
          orderBy: { reviewDate: 'desc' },
          take: 1,
        },
      },
      orderBy: { rating: 'desc' },
      take: limit,
    })

    return tools as Tool[]
  },

  // Get top rated tools
  async getTopRatedTools(limit: number = 10): Promise<Tool[]> {
    const builder = new ToolQueryBuilder()
    return builder
      .active(true)
      .rating(4.0) // Minimum rating of 4.0
      .withReviews(true)
      .sortBy('rating', 'desc')
      .paginate(1, limit)
      .findMany()
  },
}

// Type-safe review queries
export const reviewQueries = {
  // Get reviews for a tool
  async getReviewsForTool(toolId: string): Promise<ToolReview[]> {
    const reviews = await prisma.toolReview.findMany({
      where: { toolId },
      orderBy: { reviewDate: 'desc' },
      include: {
        tool: true,
      },
    })

    return reviews as ToolReview[]
  },

  // Get latest review for a tool
  async getLatestReview(toolId: string): Promise<ToolReview | null> {
    const review = await prisma.toolReview.findFirst({
      where: { toolId },
      orderBy: { reviewDate: 'desc' },
      include: {
        tool: true,
      },
    })

    return review as ToolReview | null
  },

  // Get verified reviews
  async getVerifiedReviews(limit: number = 10): Promise<ToolReview[]> {
    const reviews = await prisma.toolReview.findMany({
      where: { verified: true },
      orderBy: { reviewDate: 'desc' },
      take: limit,
      include: {
        tool: true,
      },
    })

    return reviews as ToolReview[]
  },
}

// Type-safe utility functions
export const dbUtils = {
  // Build where clause from filters
  buildWhereClause(filters: ToolFilters): any {
    const where: any = { active: true }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    if (filters.pricingModel) {
      where.pricingModel = filters.pricingModel
    }

    if (filters.atsOptimized !== undefined) {
      where.features = {
        path: ['atsOptimized'],
        equals: filters.atsOptimized,
      }
    }

    if (filters.rating) {
      where.rating = {}
      if (filters.rating.min !== undefined) where.rating.gte = filters.rating.min
      if (filters.rating.max !== undefined) where.rating.lte = filters.rating.max
    }

    return where
  },

  // Build order by clause
  buildOrderByClause(sortBy?: string, sortOrder?: string): any {
    const orderBy: any = {}

    switch (sortBy) {
      case 'rating':
        orderBy.rating = sortOrder || 'desc'
        break
      case 'name':
        orderBy.name = sortOrder || 'asc'
        break
      case 'createdAt':
        orderBy.createdAt = sortOrder || 'desc'
        break
      default:
        orderBy.rating = 'desc'
    }

    return orderBy
  },
}
