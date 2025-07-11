import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getToolByIdWithCache, revalidateToolsCache, CacheStrategy } from '@/lib/cache'
import { toolSchema, validateRequest } from '@/lib/validation'

// GET /api/tools/[id] - Get a specific AI tool by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Use cached query
    const tool = await getToolByIdWithCache(id)

    if (!tool) {
      return NextResponse.json(
        { success: false, error: 'Tool not found' },
        { status: 404 }
      )
    }

    // Set cache headers
    const cacheHeaders = CacheStrategy.getCacheHeaders('api/tools')
    const response = NextResponse.json({
      success: true,
      data: tool
    })

    // Apply cache headers
    Object.entries(cacheHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
    
  } catch (error) {
    console.error('Error fetching tool:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tool' },
      { status: 500 }
    )
  }
}

// PUT /api/tools/[id] - Update a specific AI tool (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    // Check if tool exists
    const existingTool = await prisma.aiTool.findUnique({
      where: { id }
    })
    
    if (!existingTool) {
      return NextResponse.json(
        { success: false, error: 'Tool not found' },
        { status: 404 }
      )
    }
    
    // Update tool
    const updatedTool = await prisma.aiTool.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        websiteUrl: body.websiteUrl,
        pricingModel: body.pricingModel,
        features: body.features,
        affiliateLink: body.affiliateLink,
        logoUrl: body.logoUrl,
        rating: body.rating
      },
      include: {
        reviews: {
          orderBy: { reviewDate: 'desc' }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      data: updatedTool
    })
    
  } catch (error) {
    console.error('Error updating tool:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update tool' },
      { status: 500 }
    )
  }
}

// DELETE /api/tools/[id] - Delete a specific AI tool (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Check if tool exists
    const existingTool = await prisma.aiTool.findUnique({
      where: { id }
    })
    
    if (!existingTool) {
      return NextResponse.json(
        { success: false, error: 'Tool not found' },
        { status: 404 }
      )
    }
    
    // Delete tool (reviews will be deleted automatically due to cascade)
    await prisma.aiTool.delete({
      where: { id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Tool deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting tool:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete tool' },
      { status: 500 }
    )
  }
}
