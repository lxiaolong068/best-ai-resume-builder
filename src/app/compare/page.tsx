import { Metadata } from 'next'
import { ComparisonTable } from '@/components/ComparisonTable'

export const metadata: Metadata = {
  title: 'AI Resume Builder Comparison 2025 | Side-by-Side Analysis',
  description: 'Compare the best AI resume builders of 2025 side-by-side. Real ATS scores, features, pricing, and expert recommendations. Find the perfect tool for your needs.',
  keywords: [
    'ai resume builder comparison 2025',
    'best resume builder comparison',
    'ats resume builder comparison',
    'resume builder features comparison',
    'ai resume tools comparison',
    'resume builder pricing comparison'
  ],
  openGraph: {
    title: 'AI Resume Builder Comparison 2025 | Side-by-Side Analysis',
    description: 'Compare the best AI resume builders of 2025. Real ATS scores, features, and pricing analysis.',
    type: 'website',
    url: '/compare',
    images: [
      {
        url: '/images/comparison-og.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Resume Builder Comparison 2025'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Resume Builder Comparison 2025',
    description: 'Compare the best AI resume builders side-by-side with real ATS scores and expert analysis.',
    images: ['/images/comparison-og.jpg']
  },
  alternates: {
    canonical: '/compare'
  }
}

// Generate JSON-LD structured data for the comparison page
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'AI Resume Builder Comparison 2025',
  description: 'Comprehensive comparison of the best AI resume builders in 2025 with real ATS testing results.',
  url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bestairesume2025.com'}/compare`,
  mainEntity: {
    '@type': 'ItemList',
    name: 'Best AI Resume Builders 2025',
    description: 'Top-rated AI resume builders tested and compared for 2025',
    numberOfItems: 8,
    itemListElement: [
      {
        '@type': 'SoftwareApplication',
        position: 1,
        name: 'Resume.io',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web'
      },
      {
        '@type': 'SoftwareApplication',
        position: 2,
        name: 'Jasper AI Resume',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web'
      },
      {
        '@type': 'SoftwareApplication',
        position: 3,
        name: 'Zety',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web'
      }
    ]
  },
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
        name: 'Compare AI Resume Builders',
        item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bestairesume2025.com'}/compare`
      }
    ]
  }
}

export default function ComparePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Breadcrumb Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <a href="/" className="text-blue-600 hover:text-blue-700">
                Home
              </a>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-600">Compare AI Resume Builders</li>
          </ol>
        </div>
      </nav>

      {/* Page Header */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            AI Resume Builder Comparison 2025
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Compare the top AI resume builders side-by-side with real ATS test scores, 
            detailed feature analysis, and expert recommendations. Make an informed decision 
            for your career success.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Real ATS Testing</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Expert Analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Updated Monthly</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Unbiased Reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <ComparisonTable />

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                How do you test ATS compatibility?
              </h3>
              <p className="text-gray-600">
                We test each resume builder against 50+ popular ATS systems including Workday, 
                Greenhouse, Lever, and BambooHR. Our testing methodology includes parsing accuracy, 
                formatting preservation, and keyword extraction effectiveness.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Which AI resume builder is best for 2025?
              </h3>
              <p className="text-gray-600">
                Based on our comprehensive testing, Resume.io and Jasper AI Resume consistently 
                rank highest for overall performance, with excellent ATS compatibility and 
                advanced AI features. However, the best choice depends on your specific needs 
                and budget.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Are AI resume builders worth it in 2025?
              </h3>
              <p className="text-gray-600">
                Yes, AI resume builders have significantly improved in 2025, offering better 
                ATS optimization, more sophisticated content suggestions, and time-saving features. 
                They're particularly valuable for job seekers who want professional results 
                without hiring a resume writer.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                How often do you update these comparisons?
              </h3>
              <p className="text-gray-600">
                We update our comparisons monthly to reflect new features, pricing changes, 
                and performance improvements. Major reviews are conducted quarterly with 
                fresh ATS testing and feature analysis.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
