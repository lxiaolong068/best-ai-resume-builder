import { NextRequest, NextResponse } from 'next/server'
import { clearAllCache, clearToolsCache } from '@/lib/cache'

// POST /api/cache/clear - Clear application cache
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type = 'all' } = body

    if (type === 'tools') {
      await clearToolsCache()
      return NextResponse.json({
        success: true,
        message: 'Tools cache cleared successfully'
      })
    } else {
      await clearAllCache()
      return NextResponse.json({
        success: true,
        message: 'All cache cleared successfully'
      })
    }
  } catch (error) {
    console.error('Error clearing cache:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to clear cache'
      },
      { status: 500 }
    )
  }
}

// GET /api/cache/clear - Clear all cache (for convenience)
export async function GET() {
  try {
    await clearAllCache()
    return NextResponse.json({
      success: true,
      message: 'All cache cleared successfully'
    })
  } catch (error) {
    console.error('Error clearing cache:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to clear cache'
      },
      { status: 500 }
    )
  }
}
