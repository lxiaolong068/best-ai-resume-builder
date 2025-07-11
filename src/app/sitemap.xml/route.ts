import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bestairesume2025.com'

export async function GET() {
  try {
    // Get all published blog posts
    const blogPosts = await prisma.blogPost.findMany({
      where: { published: true },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true
      },
      orderBy: { publishedAt: 'desc' }
    })

    // Get all AI tools
    const tools = await prisma.aiTool.findMany({
      select: {
        id: true,
        name: true,
        updatedAt: true
      }
    })

    // Static pages with their priorities and change frequencies
    const staticPages = [
      {
        url: '',
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: '1.0'
      },
      {
        url: '/compare',
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: '0.9'
      },
      {
        url: '/ats-analyzer',
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: '0.8'
      },
      {
        url: '/blog',
        lastmod: blogPosts[0]?.updatedAt?.toISOString() || new Date().toISOString(),
        changefreq: 'daily',
        priority: '0.8'
      }
    ]

    // Generate tool pages
    const toolPages = tools.map(tool => ({
      url: `/tools/${tool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
      lastmod: tool.updatedAt.toISOString(),
      changefreq: 'weekly',
      priority: '0.7'
    }))

    // Generate blog post pages
    const blogPages = blogPosts.map(post => ({
      url: `/blog/${post.slug}`,
      lastmod: post.updatedAt.toISOString(),
      changefreq: 'monthly',
      priority: '0.6'
    }))

    // Combine all pages
    const allPages = [...staticPages, ...toolPages, ...blogPages]

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${allPages.map(page => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    })

  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}
