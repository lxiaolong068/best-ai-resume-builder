import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ToolDetailPage } from '@/components/ToolDetailPage'

interface Props {
  params: { slug: string }
}

// Generate static params for all tools
export async function generateStaticParams() {
  const tools = await prisma.aiTool.findMany({
    select: { id: true, name: true }
  })

  return tools.map((tool) => ({
    slug: tool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = await getToolBySlug(params.slug)
  
  if (!tool) {
    return {
      title: 'Tool Not Found',
      description: 'The requested AI resume builder tool was not found.'
    }
  }

  const latestReview = tool.reviews[0]
  const atsScore = latestReview?.atsScore || 0
  const rating = tool.rating || 'N/A'

  return {
    title: `${tool.name} Review 2025: ATS Score ${atsScore}/100 | Best AI Resume Builder`,
    description: `Comprehensive ${tool.name} review 2025. ATS score: ${atsScore}/100, Rating: ${rating}/5. Features, pricing, pros & cons. Expert analysis for job seekers.`,
    keywords: [
      `${tool.name.toLowerCase()} review 2025`,
      `${tool.name.toLowerCase()} ats score`,
      `${tool.name.toLowerCase()} resume builder`,
      'ai resume builder review',
      'best resume builder 2025',
      'ats optimized resume'
    ],
    openGraph: {
      title: `${tool.name} Review 2025 - ATS Score: ${atsScore}/100`,
      description: `Expert review of ${tool.name}. Real ATS testing results, features analysis, and pricing comparison for 2025.`,
      type: 'article',
      url: `/tools/${params.slug}`,
      images: [
        {
          url: tool.logoUrl || '/images/default-tool-og.jpg',
          width: 1200,
          height: 630,
          alt: `${tool.name} Logo`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tool.name} Review 2025 - ATS Score: ${atsScore}/100`,
      description: `Expert review of ${tool.name}. Real ATS testing results and features analysis.`,
      images: [tool.logoUrl || '/images/default-tool-og.jpg']
    },
    alternates: {
      canonical: `/tools/${params.slug}`
    }
  }
}

async function getToolBySlug(slug: string) {
  const tools = await prisma.aiTool.findMany({
    include: {
      reviews: {
        orderBy: { reviewDate: 'desc' }
      }
    }
  })

  return tools.find(tool => 
    tool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === slug
  )
}

export default async function ToolPage({ params }: Props) {
  const tool = await getToolBySlug(params.slug)

  if (!tool) {
    notFound()
  }

  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'SoftwareApplication',
      name: tool.name,
      description: tool.description,
      url: tool.websiteUrl,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: tool.pricingModel === 'Free/Paid' ? '0' : 'varies',
        description: tool.pricingModel
      }
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: tool.rating || '0',
      bestRating: '5',
      worstRating: '1'
    },
    author: {
      '@type': 'Organization',
      name: 'Best AI Resume Builder 2025',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://bestairesume2025.com'
    },
    datePublished: tool.reviews[0]?.reviewDate || tool.createdAt,
    reviewBody: tool.reviews[0]?.reviewerNotes || tool.description
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolDetailPage tool={tool} />
    </>
  )
}
