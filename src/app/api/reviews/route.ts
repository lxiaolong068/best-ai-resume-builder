import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/reviews - Get all reviews with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const toolId = searchParams.get('toolId')
    const sortBy = searchParams.get('sortBy') || 'reviewDate'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // Build where clause
    const where: any = {}
    if (toolId) {
      where.toolId = toolId
    }
    
    // Calculate offset
    const offset = (page - 1) * limit
    
    // Build orderBy clause
    const orderBy: any = {}
    if (sortBy === 'reviewDate') {
      orderBy.reviewDate = sortOrder
    } else if (sortBy === 'overallRating') {
      orderBy.overallRating = sortOrder
    } else if (sortBy === 'atsScore') {
      orderBy.atsScore = sortOrder
    }
    
    // Fetch reviews with tool information
    const [reviews, totalCount] = await Promise.all([
      prisma.toolReview.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          tool: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              websiteUrl: true
            }
          }
        }
      }),
      prisma.toolReview.count({ where })
    ])
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1
    
    return NextResponse.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit
        }
      }
    })
    
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST /api/reviews - Create a new review (Admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { toolId, overallRating } = body
    
    if (!toolId || !overallRating) {
      return NextResponse.json(
        { success: false, error: 'Tool ID and overall rating are required' },
        { status: 400 }
      )
    }
    
    // Check if tool exists
    const tool = await prisma.aiTool.findUnique({
      where: { id: toolId }
    })
    
    if (!tool) {
      return NextResponse.json(
        { success: false, error: 'Tool not found' },
        { status: 404 }
      )
    }
    
    // Create new review
    const review = await prisma.toolReview.create({
      data: {
        toolId,
        speedScore: body.speedScore,
        atsScore: body.atsScore,
        easeOfUse: body.easeOfUse,
        templateCount: body.templateCount,
        pricingScore: body.pricingScore,
        overallRating,
        reviewDate: body.reviewDate ? new Date(body.reviewDate) : new Date(),
        reviewerNotes: body.reviewerNotes
      },
      include: {
        tool: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            websiteUrl: true
          }
        }
      }
    })
    
    // Update tool's average rating
    await updateToolAverageRating(toolId)
    
    return NextResponse.json({
      success: true,
      data: review
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    )
  }
}

// Helper function to update tool's average rating
async function updateToolAverageRating(toolId: string) {
  try {
    const reviews = await prisma.toolReview.findMany({
      where: { toolId },
      select: { overallRating: true }
    })
    
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => 
        sum + (review.overallRating?.toNumber() || 0), 0
      )
      const averageRating = totalRating / reviews.length
      
      await prisma.aiTool.update({
        where: { id: toolId },
        data: { rating: averageRating }
      })
    }
  } catch (error) {
    console.error('Error updating tool average rating:', error)
  }
}
