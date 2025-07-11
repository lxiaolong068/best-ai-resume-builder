import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/stats - Get platform statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days
    
    const periodDays = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)
    
    // Get basic counts
    const [
      totalTools,
      totalReviews,
      totalBlogPosts,
      totalSubscribers,
      recentEvents
    ] = await Promise.all([
      prisma.aiTool.count(),
      prisma.toolReview.count(),
      prisma.blogPost.count({ where: { published: true } }),
      prisma.emailSubscriber.count({ where: { active: true } }),
      prisma.userEvent.count({
        where: {
          createdAt: { gte: startDate }
        }
      })
    ])
    
    // Get top-rated tools
    const topRatedTools = await prisma.aiTool.findMany({
      orderBy: { rating: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        rating: true,
        logoUrl: true,
        reviews: {
          select: {
            atsScore: true,
            overallRating: true
          },
          orderBy: { reviewDate: 'desc' },
          take: 1
        }
      }
    })
    
    // Get ATS performance leaders
    const atsLeaders = await prisma.toolReview.findMany({
      orderBy: { atsScore: 'desc' },
      take: 5,
      include: {
        tool: {
          select: {
            id: true,
            name: true,
            logoUrl: true
          }
        }
      }
    })
    
    // Get recent user events breakdown
    const eventTypes = await prisma.userEvent.groupBy({
      by: ['eventType'],
      where: {
        createdAt: { gte: startDate }
      },
      _count: {
        eventType: true
      },
      orderBy: {
        _count: {
          eventType: 'desc'
        }
      }
    })
    
    // Get popular tools (most compared/viewed)
    const popularTools = await prisma.userEvent.findMany({
      where: {
        eventType: 'tool_comparison',
        createdAt: { gte: startDate }
      },
      select: {
        eventData: true
      }
    })
    
    // Process popular tools data
    const toolPopularity: { [key: string]: number } = {}
    popularTools.forEach(event => {
      const toolIds = (event.eventData as any)?.toolIds || []
      toolIds.forEach((toolId: string) => {
        toolPopularity[toolId] = (toolPopularity[toolId] || 0) + 1
      })
    })
    
    const popularToolIds = Object.entries(toolPopularity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([toolId]) => toolId)
    
    const popularToolsData = await prisma.aiTool.findMany({
      where: { id: { in: popularToolIds } },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        rating: true
      }
    })
    
    // Get conversion data (if available)
    const conversions = await prisma.conversion.count({
      where: {
        conversionDate: { gte: startDate }
      }
    })
    
    const conversionRevenue = await prisma.conversion.aggregate({
      where: {
        conversionDate: { gte: startDate }
      },
      _sum: {
        commissionAmount: true
      }
    })
    
    // Calculate growth metrics
    const previousPeriodStart = new Date(startDate)
    previousPeriodStart.setDate(previousPeriodStart.getDate() - periodDays)
    
    const previousEvents = await prisma.userEvent.count({
      where: {
        createdAt: {
          gte: previousPeriodStart,
          lt: startDate
        }
      }
    })
    
    const eventGrowth = previousEvents > 0 
      ? ((recentEvents - previousEvents) / previousEvents) * 100 
      : 0
    
    // Compile statistics
    const stats = {
      overview: {
        totalTools,
        totalReviews,
        totalBlogPosts,
        totalSubscribers,
        recentEvents,
        conversions,
        revenue: conversionRevenue._sum.commissionAmount || 0,
        eventGrowth: Math.round(eventGrowth * 100) / 100
      },
      topRatedTools: topRatedTools.map(tool => ({
        id: tool.id,
        name: tool.name,
        rating: tool.rating,
        logoUrl: tool.logoUrl,
        atsScore: tool.reviews[0]?.atsScore || null
      })),
      atsLeaders: atsLeaders.map(review => ({
        toolId: review.tool.id,
        toolName: review.tool.name,
        logoUrl: review.tool.logoUrl,
        atsScore: review.atsScore,
        overallRating: review.overallRating
      })),
      popularTools: popularToolsData.map(tool => ({
        ...tool,
        comparisonCount: toolPopularity[tool.id] || 0
      })),
      eventBreakdown: eventTypes.map(event => ({
        type: event.eventType,
        count: event._count.eventType
      })),
      period: {
        days: periodDays,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString()
      }
    }
    
    return NextResponse.json({
      success: true,
      data: stats
    })
    
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
