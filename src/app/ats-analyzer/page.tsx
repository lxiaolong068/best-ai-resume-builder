import { Metadata } from 'next'
import { ATSAnalyzerPage } from '@/components/ATSAnalyzerPage'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Free ATS Resume Checker 2025 | Test Your Resume Compatibility',
  description: 'Free ATS resume checker and analyzer. Test your resume against 50+ ATS systems. Get instant feedback on formatting, keywords, and optimization tips.',
  keywords: [
    'free ats resume checker',
    'ats resume analyzer',
    'resume ats compatibility',
    'ats resume test',
    'free resume checker',
    'ats optimization tool',
    'resume scanner free',
    'ats resume score'
  ],
  openGraph: {
    title: 'Free ATS Resume Checker 2025 | Test Your Resume Compatibility',
    description: 'Free ATS resume checker and analyzer. Test your resume against 50+ ATS systems instantly.',
    type: 'website',
    url: '/ats-analyzer',
    images: [
      {
        url: '/images/ats-analyzer-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Free ATS Resume Checker 2025'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free ATS Resume Checker 2025',
    description: 'Test your resume against 50+ ATS systems. Get instant feedback and optimization tips.',
    images: ['/images/ats-analyzer-og.jpg']
  },
  alternates: {
    canonical: '/ats-analyzer'
  }
}

// Generate JSON-LD structured data for the ATS analyzer tool
export const dynamic = 'force-dynamic'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Free ATS Resume Checker 2025',
  description: 'Free online tool to check your resume compatibility with Applicant Tracking Systems (ATS). Get instant analysis and optimization recommendations.',
  url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bestairesume2025.com'}/ats-analyzer`,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free ATS resume analysis tool'
  },
  creator: {
    '@type': 'Organization',
    name: 'Best AI Resume Builder 2025',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://bestairesume2025.com'
  },
  featureList: [
    'ATS compatibility testing',
    'Resume formatting analysis',
    'Keyword optimization suggestions',
    'Industry-specific recommendations',
    'Instant results and feedback',
    'Free unlimited usage'
  ],
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: process.env.NEXT_PUBLIC_SITE_URL || 'https://bestairesume2025.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Free ATS Resume Checker',
        item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bestairesume2025.com'}/ats-analyzer`
      }
    ]
  }
}

export default function ATSAnalyzerPageRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navigation />
      <div className="pt-20">
        <ATSAnalyzerPage />
      </div>
      <Footer />
    </>
  )
}
