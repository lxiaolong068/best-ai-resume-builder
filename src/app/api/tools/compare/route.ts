import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { toolComparisonSchema, validateRequest } from '@/lib/validation'
import { getToolsForComparisonWithCache, CacheStrategy } from '@/lib/cache'

// POST /api/tools/compare - Compare multiple AI tools
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input using Zod schema
    const validation = validateRequest(toolComparisonSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    const { toolIds } = validation.data

    // Use cached query for better performance
    const tools = await getToolsForComparisonWithCache(toolIds)
    
    if (tools.length !== toolIds.length) {
      return NextResponse.json(
        { success: false, error: 'One or more tools not found' },
        { status: 404 }
      )
    }
    
    // Create comparison data structure
    const comparison = {
      tools: tools.map(tool => ({
        id: tool.id,
        name: tool.name,
        description: tool.description,
        websiteUrl: tool.websiteUrl,
        pricingModel: tool.pricingModel,
        features: tool.features,
        affiliateLink: tool.affiliateLink,
        logoUrl: tool.logoUrl,
        rating: tool.rating,
        latestReview: tool.reviews[0] || null
      })),
      comparisonMatrix: generateComparisonMatrix(tools),
      summary: generateComparisonSummary(tools)
    }
    
    // Track comparison event
    await trackComparisonEvent(toolIds, request)

    // Set cache headers
    const cacheHeaders = CacheStrategy.getCacheHeaders('api/tools')
    const response = NextResponse.json({
      success: true,
      data: comparison
    })

    // Apply cache headers
    Object.entries(cacheHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
    
  } catch (error) {
    console.error('Error comparing tools:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to compare tools' },
      { status: 500 }
    )
  }
}

// Generate comparison matrix for easy feature comparison
function generateComparisonMatrix(tools: any[]) {
  const features = [
    'atsOptimized',
    'templates',
    'aiSuggestions',
    'coverLetter',
    'tracking',
    'support',
    'exportFormats',
    'languages',
    'collaboration',
    'analytics',
    'linkedinIntegration',
    'keywordOptimization'
  ]
  
  const matrix: any = {}
  
  features.forEach(feature => {
    matrix[feature] = tools.map(tool => ({
      toolId: tool.id,
      toolName: tool.name,
      value: tool.features?.[feature] || null
    }))
  })
  
  return matrix
}

// Generate comparison summary with scores and recommendations
function generateComparisonSummary(tools: any[]) {
  const summary = {
    bestOverall: null as any,
    bestValue: null as any,
    bestATS: null as any,
    bestForBeginners: null as any,
    recommendations: [] as any[]
  }
  
  // Find best overall (highest rating)
  summary.bestOverall = tools.reduce((best, current) => 
    (current.rating || 0) > (best.rating || 0) ? current : best
  )
  
  // Find best ATS (highest ATS score from reviews)
  summary.bestATS = tools.reduce((best, current) => {
    const currentATS = current.reviews[0]?.atsScore || 0
    const bestATS = best.reviews[0]?.atsScore || 0
    return currentATS > bestATS ? current : best
  })
  
  // Find best for beginners (highest ease of use)
  summary.bestForBeginners = tools.reduce((best, current) => {
    const currentEase = current.reviews[0]?.easeOfUse || 0
    const bestEase = best.reviews[0]?.easeOfUse || 0
    return currentEase > bestEase ? current : best
  })
  
  // Find best value (highest pricing score)
  summary.bestValue = tools.reduce((best, current) => {
    const currentValue = current.reviews[0]?.pricingScore || 0
    const bestValue = best.reviews[0]?.pricingScore || 0
    return currentValue > bestValue ? current : best
  })
  
  // Generate recommendations
  tools.forEach(tool => {
    const review = tool.reviews[0]
    let recommendation = ''
    
    if (tool.id === summary.bestOverall?.id) {
      recommendation = 'Best Overall Choice - Highest rated with excellent features'
    } else if (tool.id === summary.bestATS?.id) {
      recommendation = 'Best for ATS Compatibility - Highest success rate with applicant tracking systems'
    } else if (tool.id === summary.bestForBeginners?.id) {
      recommendation = 'Best for Beginners - Easiest to use with intuitive interface'
    } else if (tool.id === summary.bestValue?.id) {
      recommendation = 'Best Value for Money - Great features at competitive pricing'
    } else if (review?.atsScore >= 90) {
      recommendation = 'Excellent ATS Performance - Great for corporate job applications'
    } else if (tool.pricingModel === 'Free/Paid') {
      recommendation = 'Budget-Friendly Option - Good for cost-conscious users'
    } else {
      recommendation = 'Solid Choice - Good performance across key metrics'
    }
    
    summary.recommendations.push({
      toolId: tool.id,
      toolName: tool.name,
      recommendation
    })
  })
  
  return summary
}

// Track comparison event for analytics
async function trackComparisonEvent(toolIds: string[], request: NextRequest) {
  try {
    const userAgent = request.headers.get('user-agent') || ''
    const sessionId = request.headers.get('x-session-id') || 'anonymous'
    
    await prisma.userEvent.create({
      data: {
        sessionId,
        eventType: 'tool_comparison',
        eventData: {
          toolIds,
          toolCount: toolIds.length,
          timestamp: new Date().toISOString()
        },
        pageUrl: '/compare',
        userAgent
      }
    })
  } catch (error) {
    console.error('Error tracking comparison event:', error)
    // Don't fail the main request if tracking fails
  }
}
