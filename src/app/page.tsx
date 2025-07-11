import { Hero } from '@/components/Hero'
import { ComparisonTable } from '@/components/ComparisonTable'
import { FeaturedTools } from '@/components/FeaturedTools'
import { TestingMethodology } from '@/components/TestingMethodology'
import { FAQ } from '@/components/FAQ'

export const dynamic = 'force-dynamic'

// Generate JSON-LD structured data for the homepage
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Best AI Resume Builder 2025',
  description: 'Find the best AI resume builder in 2025. Expert-tested with real ATS scores, pricing comparison, and user reviews.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://bestairesume2025.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bestairesume2025.com'}/search?q={search_term_string}`
    },
    'query-input': 'required name=search_term_string'
  },
  mainEntity: {
    '@type': 'ItemList',
    name: 'Best AI Resume Builders 2025',
    description: 'Comprehensive list of the top AI resume builders tested and ranked for 2025',
    numberOfItems: 8,
    itemListElement: [
      {
        '@type': 'SoftwareApplication',
        position: 1,
        name: 'Resume.io',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          bestRating: '5',
          worstRating: '1',
          ratingCount: '1'
        }
      },
      {
        '@type': 'SoftwareApplication',
        position: 2,
        name: 'Jasper AI Resume',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.7',
          bestRating: '5',
          worstRating: '1',
          ratingCount: '1'
        }
      },
      {
        '@type': 'SoftwareApplication',
        position: 3,
        name: 'Zety',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.6',
          bestRating: '5',
          worstRating: '1',
          ratingCount: '1'
        }
      }
    ]
  }
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-background">
        <Hero />
        <FeaturedTools />
        <ComparisonTable />
        <TestingMethodology />
        <FAQ />
      </div>
    </>
  )
}