import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bestairesume2025.com'

export async function GET() {
  try {
    // Get all AI tools
    const tools = await prisma.aiTool.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        pricingModel: true,
        features: true,
        updatedAt: true,
        createdAt: true
      },
      orderBy: { rating: 'desc' }
    })

    // Generate tool page URLs
    const toolPages = tools.map(tool => {
      const slug = tool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      return {
        ...tool,
        slug,
        url: `/tools/${slug}`
      }
    })

    // Generate XML sitemap for tools
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Tools Index Page -->
  <url>
    <loc>${SITE_URL}/tools</loc>
    <lastmod>${tools[0]?.updatedAt?.toISOString() || new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Compare Page -->
  <url>
    <loc>${SITE_URL}/compare</loc>
    <lastmod>${tools[0]?.updatedAt?.toISOString() || new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- ATS Analyzer Tool -->
  <url>
    <loc>${SITE_URL}/ats-analyzer</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
${toolPages.map(tool => `  <url>
    <loc>${SITE_URL}${tool.url}</loc>
    <lastmod>${tool.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    ${tool.description ? `
    <image:image>
      <image:loc>${SITE_URL}/images/tools/${tool.slug}-screenshot.jpg</image:loc>
      <image:title><![CDATA[${tool.name} - AI Resume Builder Screenshot]]></image:title>
      <image:caption><![CDATA[${tool.description}]]></image:caption>
    </image:image>` : ''}
  </url>`).join('\n')}
  
  <!-- Category Pages -->
  <url>
    <loc>${SITE_URL}/tools/free</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${SITE_URL}/tools/premium</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${SITE_URL}/tools/enterprise</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600' // 1 hour cache
      }
    })

  } catch (error) {
    console.error('Error generating tools sitemap:', error)
    return new NextResponse('Error generating tools sitemap', { status: 500 })
  }
}
