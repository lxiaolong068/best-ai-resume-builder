import { NextRequest, NextResponse } from 'next/server'

interface WebVitalData {
  metric: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  navigationType?: string
  url: string
  userAgent: string
  timestamp: number
}

// Store web vitals data (in production, you'd want to use a proper database)
const webVitalsData: WebVitalData[] = []

export async function POST(request: NextRequest) {
  try {
    const data: WebVitalData = await request.json()
    
    // Validate required fields
    if (!data.metric || typeof data.value !== 'number' || !data.url) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Add additional metadata
    const enrichedData = {
      ...data,
      ip: request.ip || 'unknown',
      country: request.geo?.country || 'unknown',
      city: request.geo?.city || 'unknown',
      region: request.geo?.region || 'unknown',
      receivedAt: new Date().toISOString()
    }

    // Store the data (in production, save to database)
    webVitalsData.push(enrichedData)

    // Keep only last 1000 entries in memory
    if (webVitalsData.length > 1000) {
      webVitalsData.splice(0, webVitalsData.length - 1000)
    }

    // Log performance issues
    if (data.rating === 'poor') {
      console.warn(`Poor ${data.metric} performance:`, {
        value: data.value,
        url: data.url,
        userAgent: data.userAgent
      })
    }

    // Send to external analytics services if configured
    await sendToExternalServices(enrichedData)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error processing web vitals data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process data' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metric = searchParams.get('metric')
    const timeframe = searchParams.get('timeframe') || '24h'
    const url = searchParams.get('url')

    // Calculate time range
    const now = Date.now()
    const timeRanges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    }
    const timeRange = timeRanges[timeframe as keyof typeof timeRanges] || timeRanges['24h']
    const startTime = now - timeRange

    // Filter data
    let filteredData = webVitalsData.filter(item => item.timestamp >= startTime)
    
    if (metric) {
      filteredData = filteredData.filter(item => item.metric === metric)
    }
    
    if (url) {
      filteredData = filteredData.filter(item => item.url === url)
    }

    // Calculate statistics
    const stats = calculateStats(filteredData)

    return NextResponse.json({
      success: true,
      data: {
        totalEntries: filteredData.length,
        timeframe,
        stats,
        recentEntries: filteredData.slice(-10) // Last 10 entries
      }
    })

  } catch (error) {
    console.error('Error fetching web vitals data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}

// Calculate statistics for web vitals data
function calculateStats(data: WebVitalData[]) {
  if (data.length === 0) {
    return {
      metrics: {},
      ratings: { good: 0, 'needs-improvement': 0, poor: 0 },
      topPages: [],
      deviceTypes: {}
    }
  }

  // Group by metric
  const metricGroups = data.reduce((acc, item) => {
    if (!acc[item.metric]) acc[item.metric] = []
    acc[item.metric].push(item.value)
    return acc
  }, {} as Record<string, number[]>)

  // Calculate metric statistics
  const metrics = Object.entries(metricGroups).reduce((acc, [metric, values]) => {
    values.sort((a, b) => a - b)
    acc[metric] = {
      count: values.length,
      min: values[0],
      max: values[values.length - 1],
      median: values[Math.floor(values.length / 2)],
      p75: values[Math.floor(values.length * 0.75)],
      p90: values[Math.floor(values.length * 0.90)],
      p95: values[Math.floor(values.length * 0.95)],
      average: values.reduce((sum, val) => sum + val, 0) / values.length
    }
    return acc
  }, {} as Record<string, any>)

  // Calculate rating distribution
  const ratings = data.reduce((acc, item) => {
    acc[item.rating] = (acc[item.rating] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Top pages by frequency
  const pageFrequency = data.reduce((acc, item) => {
    acc[item.url] = (acc[item.url] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topPages = Object.entries(pageFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([url, count]) => ({ url, count }))

  // Device type analysis (simplified)
  const deviceTypes = data.reduce((acc, item) => {
    const isMobile = /Mobile|Android|iPhone|iPad/.test(item.userAgent)
    const deviceType = isMobile ? 'mobile' : 'desktop'
    acc[deviceType] = (acc[deviceType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    metrics,
    ratings,
    topPages,
    deviceTypes
  }
}

// Send data to external analytics services
async function sendToExternalServices(data: any) {
  // Example: Send to Google Analytics Measurement Protocol
  if (process.env.GA_MEASUREMENT_ID && process.env.GA_API_SECRET) {
    try {
      await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${process.env.GA_MEASUREMENT_ID}&api_secret=${process.env.GA_API_SECRET}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: data.id,
          events: [{
            name: 'web_vitals',
            params: {
              metric_name: data.metric,
              metric_value: data.value,
              metric_rating: data.rating,
              page_location: data.url
            }
          }]
        })
      })
    } catch (error) {
      console.warn('Failed to send to Google Analytics:', error)
    }
  }

  // Example: Send to custom monitoring service
  if (process.env.MONITORING_WEBHOOK_URL) {
    try {
      await fetch(process.env.MONITORING_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'web_vitals',
          data,
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.warn('Failed to send to monitoring service:', error)
    }
  }
}
