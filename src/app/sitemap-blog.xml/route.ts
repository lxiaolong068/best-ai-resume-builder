import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bestairesume2025.com'

export async function GET() {
  try {
    // Get all published blog posts with detailed information
    const blogPosts = await prisma.blogPost.findMany({
      where: { published: true },
      select: {
        slug: true,
        title: true,
        excerpt: true,
        keywords: true,
        updatedAt: true,
        publishedAt: true,
        createdAt: true
      },
      orderBy: { publishedAt: 'desc' }
    })

    // Generate XML sitemap for blog posts
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <!-- Blog Index Page -->
  <url>
    <loc>${SITE_URL}/blog</loc>
    <lastmod>${blogPosts[0]?.updatedAt?.toISOString() || new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
${blogPosts.map(post => {
  const isRecent = post.publishedAt && 
    (new Date().getTime() - new Date(post.publishedAt).getTime()) < (7 * 24 * 60 * 60 * 1000) // 7 days
  
  return `  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${post.updatedAt.toISOString()}</lastmod>
    <changefreq>${isRecent ? 'daily' : 'monthly'}</changefreq>
    <priority>${isRecent ? '0.8' : '0.6'}</priority>
    ${post.publishedAt && isRecent ? `
    <news:news>
      <news:publication>
        <news:name>Best AI Resume Builder 2025</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${post.publishedAt.toISOString()}</news:publication_date>
      <news:title><![CDATA[${post.title}]]></news:title>
      <news:keywords><![CDATA[${post.keywords?.join(', ') || 'ai resume builder, resume tips, job search'}]]></news:keywords>
    </news:news>` : ''}
  </url>`
}).join('\n')}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800' // 30 minutes cache
      }
    })

  } catch (error) {
    console.error('Error generating blog sitemap:', error)
    return new NextResponse('Error generating blog sitemap', { status: 500 })
  }
}
