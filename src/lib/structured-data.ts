// Structured Data (Schema.org) utilities for SEO optimization
import DOMPurify from 'isomorphic-dompurify'

// XSS Protection for structured data
export const sanitizeStructuredData = (data: any): any => {
  if (typeof data === 'string') {
    // Sanitize string values to prevent XSS
    return DOMPurify.sanitize(data, {
      ALLOWED_TAGS: [], // No HTML tags allowed in structured data
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true // Keep text content, remove tags
    })
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeStructuredData(item))
  }

  if (data && typeof data === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(data)) {
      // Sanitize both keys and values
      const sanitizedKey = DOMPurify.sanitize(key, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true
      })
      sanitized[sanitizedKey] = sanitizeStructuredData(value)
    }
    return sanitized
  }

  return data
}

// Safe JSON stringification with XSS protection
export const safeJSONStringify = (data: any): string => {
  try {
    const sanitizedData = sanitizeStructuredData(data)
    return JSON.stringify(sanitizedData)
  } catch (error) {
    console.error('Error sanitizing structured data:', error)
    return '{}'
  }
}

interface Tool {
  id: string
  name: string
  description: string
  websiteUrl: string
  pricingModel: string
  rating: string | null
  reviews: Array<{
    atsScore: number | null
    overallRating: string | null
    reviewDate: string | null
    reviewerNotes: string | null
  }>
}

interface BlogPost {
  title: string
  slug: string
  excerpt: string | null
  publishedAt: Date | null
  updatedAt: Date
  keywords: string[]
  featuredImage: string | null
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bestairesume2025.com'
const SITE_NAME = 'Best AI Resume Builder 2025'

// Organization Schema
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: 'Expert reviews and comparisons of the best AI resume builders in 2025. Real ATS testing results and unbiased analysis.',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'contact@bestairesume2025.com'
  },
  sameAs: [
    'https://twitter.com/bestairesume2025',
    'https://linkedin.com/company/bestairesume2025'
  ]
}

// Website Schema
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: 'Find the best AI resume builder in 2025. Expert-tested with real ATS scores, pricing comparison, and user reviews.',
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
    logo: `${SITE_URL}/logo.png`
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`
    },
    'query-input': 'required name=search_term_string'
  }
}

// Software Application Schema for AI Tools
export function generateToolSchema(tool: Tool) {
  const latestReview = tool.reviews[0]

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
    } : undefined,
    review: latestReview ? {
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: latestReview.overallRating || tool.rating || '0',
        bestRating: '5',
        worstRating: '1'
      },
      author: {
        '@type': 'Organization',
        name: SITE_NAME
      },
      datePublished: latestReview.reviewDate,
      reviewBody: latestReview.reviewerNotes || tool.description
    } : undefined,
    creator: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL
    }
  }

  return sanitizeStructuredData(schema)
}

// Review Schema for Tool Reviews
export function generateReviewSchema(tool: Tool) {
  const latestReview = tool.reviews[0]
  if (!latestReview) return null

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
      ratingValue: latestReview.overallRating || tool.rating || '0',
      bestRating: '5',
      worstRating: '1'
    },
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL
    },
    datePublished: latestReview.reviewDate,
    reviewBody: latestReview.reviewerNotes || tool.description,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: `${SITE_URL}/logo.png`
    }
  }

  return sanitizeStructuredData(schema)
}

// Article Schema for Blog Posts
export function generateArticleSchema(post: BlogPost) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || '',
    image: post.featuredImage || `${SITE_URL}/images/default-blog-og.jpg`,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.slug}`
    },
    keywords: post.keywords?.join(', '),
    articleSection: 'AI Resume Builders',
    wordCount: post.excerpt?.length || 0
  }

  return sanitizeStructuredData(schema)
}

// ItemList Schema for Tool Comparisons
export function generateToolListSchema(tools: Tool[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Best AI Resume Builders 2025',
    description: 'Comprehensive list of the top AI resume builders tested and ranked for 2025',
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, index) => ({
      '@type': 'SoftwareApplication',
      position: index + 1,
      name: tool.name,
      description: tool.description,
      url: tool.websiteUrl,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
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

// FAQ Schema
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
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
}

// HowTo Schema for Guides
export function generateHowToSchema(title: string, steps: Array<{ name: string; text: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    description: `Step-by-step guide: ${title}`,
    supply: [
      {
        '@type': 'HowToSupply',
        name: 'Computer or mobile device'
      },
      {
        '@type': 'HowToSupply',
        name: 'Internet connection'
      }
    ],
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text
    }))
  }
}

// Breadcrumb Schema
export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  }
}

// Product Comparison Schema
export function generateComparisonSchema(tools: Tool[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'AI Resume Builder Comparison 2025',
    description: 'Side-by-side comparison of the best AI resume builders with real ATS testing results',
    url: `${SITE_URL}/compare`,
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
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: SITE_URL
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Compare AI Resume Builders',
          item: `${SITE_URL}/compare`
        }
      ]
    }
  }
}
