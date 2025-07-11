import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { eventTrackingSchema, eventsQuerySchema, validateRequest } from '@/lib/validation'
import { getAnonymizedClientIP } from '@/lib/analytics'

// POST /api/events - Track user events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const sessionId = request.headers.get('x-session-id') || 'anonymous'
    const userAgent = request.headers.get('user-agent') || ''
    const anonymizedIP = getAnonymizedClientIP(request)

    // Validate input using Zod schema
    const validation = validateRequest(eventTrackingSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    const { eventType, eventData, pageUrl, timestamp } = validation.data

    // Create event record with anonymized IP
    const event = await prisma.userEvent.create({
      data: {
        sessionId,
        eventType,
        eventData: {
          ...eventData,
          anonymizedIP, // Store anonymized IP for analytics
        },
        pageUrl: pageUrl || '/',
        userAgent,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      }
    })
    
    return NextResponse.json({
      success: true,
      data: { eventId: event.id }
    })
    
  } catch (error) {
    console.error('Error tracking event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to track event' },
      { status: 500 }
    )
  }
}

// GET /api/events - Get events analytics (Admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Convert search params to object for validation
    const queryParams = Object.fromEntries(searchParams.entries())

    // Validate query parameters
    const validation = validateRequest(eventsQuerySchema, queryParams)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    const {
      startDate,
      endDate,
      eventType,
      page = 1,
      limit = 100
    } = validation.data
    
    // Build where clause
    const where: any = {}
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }
    
    if (eventType) {
      where.eventType = eventType
    }
    
    // Calculate offset
    const offset = (page - 1) * limit
    
    // Fetch events
    const [events, totalCount] = await Promise.all([
      prisma.userEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.userEvent.count({ where })
    ])
    
    // Get event type breakdown
    const eventTypeBreakdown = await prisma.userEvent.groupBy({
      by: ['eventType'],
      where: startDate && endDate ? {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      } : {},
      _count: {
        eventType: true
      },
      orderBy: {
        _count: {
          eventType: 'desc'
        }
      }
    })
    
    // Get page breakdown
    const pageBreakdown = await prisma.userEvent.groupBy({
      by: ['pageUrl'],
      where: startDate && endDate ? {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      } : {},
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
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1
    
    return NextResponse.json({
      success: true,
      data: {
        events,
        analytics: {
          totalEvents: totalCount,
          eventTypeBreakdown: eventTypeBreakdown.map(item => ({
            eventType: item.eventType,
            count: item._count.eventType
          })),
          pageBreakdown: pageBreakdown.map(item => ({
            pageUrl: item.pageUrl,
            count: item._count.pageUrl
          }))
        },
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
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}
