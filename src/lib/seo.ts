import { Metadata } from 'next'

export const defaultMetadata: Metadata = {
  title: 'Best AI Resume Builder 2025 | ATS-Optimized & Expert Tested',
  description: 'Find the best AI resume builder in 2025. Expert-tested with real ATS scores, pricing comparison, and user reviews. Free tools included.',
  metadataBase: new URL('https://your-domain.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com',
    siteName: 'Best AI Resume Builder',
    title: 'Best AI Resume Builder 2025 | ATS-Optimized & Expert Tested',
    description: 'Find the best AI resume builder in 2025. Expert-tested with real ATS scores, pricing comparison, and user reviews.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Best AI Resume Builder 2025',
      },
    ],
  },
  twitter: {
    creator: '@airesumenews',
    site: '@airesumenews',
    card: 'summary_large_image',
  },
  keywords: 'AI resume builder, best resume builder 2025, ATS optimized, resume generator, AI resume tools, automated resume, resume maker',
  authors: [{ name: 'Best AI Resume Builder Team' }],
  robots: 'index,follow',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

export const generateToolMetadata = (toolName: string, rating: number, atsScore: number, price: string): Metadata => ({
  title: `${toolName} Review 2025: ATS Score ${atsScore}/100, Pricing & Real User Tests`,
  description: `${toolName} review 2025: ATS score ${atsScore}/100, pricing from ${price}, tested by experts. See real before/after examples and user feedback.`,
  alternates: {
    canonical: `/reviews/${toolName.toLowerCase().replace(/\s+/g, '-')}`,
  },
  openGraph: {
    title: `${toolName} Review 2025 | Expert Analysis & ATS Test Results`,
    description: `Comprehensive ${toolName} review with real ATS testing. Rating: ${rating}/5, ATS Score: ${atsScore}/100, Price: ${price}`,
    type: 'article',
    publishedTime: new Date().toISOString(),
    modifiedTime: new Date().toISOString(),
    authors: ['Expert Resume Team'],
    tags: ['AI Resume Builder', toolName, 'ATS Testing', 'Resume Tools'],
  },
})

export const generateComparisonMetadata = (tools: string[]): Metadata => ({
  title: `${tools.join(' vs ')} Comparison 2025 | Side-by-Side Analysis`,
  description: `Compare ${tools.join(', ')} side-by-side with real ATS scores, pricing, features, and expert analysis. Find the best AI resume builder for your needs.`,
  alternates: {
    canonical: `/compare/${tools.join('-vs-').toLowerCase()}`,
  },
  openGraph: {
    title: `${tools.join(' vs ')} Comparison 2025`,
    description: `Detailed comparison of ${tools.join(', ')} with ATS testing results and expert recommendations.`,
    type: 'article',
  },
})

export const structuredData = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Best AI Resume Builder',
    url: 'https://your-domain.com',
    logo: 'https://your-domain.com/logo.png',
    description: 'Expert reviews and comparisons of AI resume builders with real ATS testing.',
    sameAs: [
      'https://twitter.com/airesumenews',
      'https://linkedin.com/company/ai-resume-builder',
    ],
  },
  
  website: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Best AI Resume Builder',
    url: 'https://your-domain.com',
    description: 'Find the best AI resume builder in 2025 with expert testing and real ATS scores.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://your-domain.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  },
  
  breadcrumbList: (items: Array<{name: string, url: string}>) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }),
  
  review: (tool: any, review: any) => ({
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'SoftwareApplication',
      name: tool.name,
      description: tool.description,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: tool.websiteUrl,
      offers: {
        '@type': 'Offer',
        price: tool.pricing?.monthly || '0',
        priceCurrency: 'USD',
        category: 'subscription',
      },
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.overallRating,
      bestRating: 5,
      worstRating: 1,
    },
    author: {
      '@type': 'Organization',
      name: 'Best AI Resume Builder',
    },
    reviewBody: review.reviewerNotes,
    datePublished: review.reviewDate,
  }),
  
  howTo: (title: string, steps: Array<{name: string, text: string}>) => ({
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    description: `Step-by-step guide: ${title}`,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  }),
  
  faq: (faqs: Array<{question: string, answer: string}>) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }),
}