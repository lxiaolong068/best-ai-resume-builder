import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/blog/[id] - Get a specific blog post by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params; // Await the params promise
    const { id } = resolvedParams; // Extract id
    
    const post = await prisma.blogPost.findUnique({
      where: { id }
    })
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: post
    })
    
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog post' },
      { status: 500 }
    )
  }
}

// PUT /api/blog/[id] - Update a specific blog post (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params; // Await the params promise
    const { id } = resolvedParams; // Extract id
    const body = await request.json()
    
    // Check if post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id }
    })
    
    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      )
    }
    
    // If slug is being changed, check for conflicts
    if (body.slug && body.slug !== existingPost.slug) {
      const slugConflict = await prisma.blogPost.findUnique({
        where: { slug: body.slug }
      })
      
      if (slugConflict) {
        return NextResponse.json(
          { success: false, error: 'A post with this slug already exists' },
          { status: 400 }
        )
      }
    }
    
    // Update post
    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        content: body.content,
        excerpt: body.excerpt,
        published: body.published,
        publishedAt: body.published && !existingPost.published ? new Date() : 
                     !body.published ? null : existingPost.publishedAt,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        keywords: body.keywords,
        featuredImage: body.featuredImage
      }
    })
    
    return NextResponse.json({
      success: true,
      data: updatedPost
    })
    
  } catch (error) {
    console.error('Error updating blog post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update blog post' },
      { status: 500 }
    )
  }
}

// DELETE /api/blog/[id] - Delete a specific blog post (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params; // Await the params promise
    const { id } = resolvedParams; // Extract id
    
    // Check if post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id }
    })
    
    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      )
    }
    
    // Delete post
    await prisma.blogPost.delete({
      where: { id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete blog post' },
      { status: 500 }
    )
  }
}
