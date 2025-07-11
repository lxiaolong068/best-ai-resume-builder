'use client'

import { useEffect } from 'react'

interface StructuredDataProps {
  data: object | object[]
}

export function StructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    // Validate JSON-LD data in development
    if (process.env.NODE_ENV === 'development') {
      try {
        JSON.stringify(data)
      } catch (error) {
        console.error('Invalid JSON-LD structured data:', error)
      }
    }
  }, [data])

  // Handle both single objects and arrays of structured data
  const schemas = Array.isArray(data) ? data : [data]

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema, null, process.env.NODE_ENV === 'development' ? 2 : 0)
          }}
        />
      ))}
    </>
  )
}

// Utility component for common structured data patterns
export function ToolStructuredData({ tool }: { tool: any }) {
  const schema = {
    '@context': 'https://schema.org',
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
      description: tool.pricingModel,
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: tool.rating ? {
      '@type': 'AggregateRating',
      ratingValue: tool.rating,
      bestRating: '5',
      worstRating: '1',
      ratingCount: '1'
    } : undefined
  }

  return <StructuredData data={schema} />
}

export function ArticleStructuredData({ post }: { post: any }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || '',
    image: post.featuredImage || '/images/default-blog-og.jpg',
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Organization',
      name: 'Best AI Resume Builder 2025',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://bestairesume2025.com'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Best AI Resume Builder 2025',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bestairesume2025.com'}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bestairesume2025.com'}/blog/${post.slug}`
    },
    keywords: post.keywords?.join(', '),
    articleSection: 'AI Resume Builders'
  }

  return <StructuredData data={schema} />
}

export function BreadcrumbStructuredData({ breadcrumbs }: { breadcrumbs: Array<{ name: string; url: string }> }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  }

  return <StructuredData data={schema} />
}

export function FAQStructuredData({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }

  return <StructuredData data={schema} />
}

export function ReviewStructuredData({ tool, review }: { tool: any; review: any }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'SoftwareApplication',
      name: tool.name,
      description: tool.description,
      url: tool.websiteUrl,
      applicationCategory: 'BusinessApplication'
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.overallRating || tool.rating || '0',
      bestRating: '5',
      worstRating: '1'
    },
    author: {
      '@type': 'Organization',
      name: 'Best AI Resume Builder 2025',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://bestairesume2025.com'
    },
    datePublished: review.reviewDate,
    reviewBody: review.reviewerNotes || tool.description,
    publisher: {
      '@type': 'Organization',
      name: 'Best AI Resume Builder 2025',
      logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bestairesume2025.com'}/logo.png`
    }
  }

  return <StructuredData data={schema} />
}

export function ComparisonStructuredData({ tools }: { tools: any[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'AI Resume Builder Comparison 2025',
    description: 'Side-by-side comparison of the best AI resume builders with real ATS testing results',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bestairesume2025.com'}/compare`,
    mainEntity: {
      '@type': 'ItemList',
      name: 'AI Resume Builder Comparison',
      description: 'Detailed comparison of AI resume builders',
      numberOfItems: tools.length,
      itemListElement: tools.map((tool, index) => ({
        '@type': 'SoftwareApplication',
        position: index + 1,
        name: tool.name,
        description: tool.description,
        url: tool.websiteUrl,
        applicationCategory: 'BusinessApplication',
        aggregateRating: tool.rating ? {
          '@type': 'AggregateRating',
          ratingValue: tool.rating,
          bestRating: '5',
          worstRating: '1',
          ratingCount: '1'
        } : undefined
      }))
    }
  }

  return <StructuredData data={schema} />
}
