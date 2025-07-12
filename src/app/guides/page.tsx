import { Metadata } from 'next'
import Link from 'next/link'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'AI Resume Builder Guides 2025 | Expert Tips & Best Practices',
  description: 'Complete guides for using AI resume builders effectively. Learn ATS optimization, keyword strategies, and industry-specific tips for 2025 job market.',
  keywords: ['ai resume builder guide', 'resume writing tips 2025', 'ats optimization guide', 'resume best practices'],
  openGraph: {
    title: 'AI Resume Builder Guides 2025 | Expert Tips & Best Practices',
    description: 'Complete guides for using AI resume builders effectively. Learn ATS optimization, keyword strategies, and industry-specific tips for 2025 job market.',
    type: 'website',
  },
}

const guides = [
  {
    title: 'Complete AI Resume Builder Guide 2025',
    description: 'Everything you need to know about using AI resume builders effectively in 2025',
    category: 'Getting Started',
    readTime: '15 min read',
    slug: 'complete-ai-resume-builder-guide-2025',
    featured: true,
    topics: ['AI Resume Basics', 'Tool Selection', 'Best Practices', 'Common Mistakes']
  },
  {
    title: 'ATS Optimization Guide',
    description: 'Master ATS systems and ensure your resume gets through automated screening',
    category: 'ATS Optimization',
    readTime: '12 min read',
    slug: 'ats-optimization-guide',
    featured: true,
    topics: ['ATS Basics', 'Keyword Strategy', 'Formatting Tips', 'Testing Methods']
  },
  {
    title: 'Industry-Specific Resume Tips',
    description: 'Tailored advice for different industries and career levels',
    category: 'Industry Guides',
    readTime: '20 min read',
    slug: 'industry-specific-resume-tips',
    featured: true,
    topics: ['Tech Resumes', 'Healthcare', 'Finance', 'Creative Industries']
  },
  {
    title: 'ChatGPT Resume Prompts',
    description: 'Best prompts and strategies for using ChatGPT to write your resume',
    category: 'AI Tools',
    readTime: '10 min read',
    slug: 'chatgpt-resume-prompts',
    topics: ['Prompt Engineering', 'Content Generation', 'Editing Tips']
  },
  {
    title: 'Resume Keywords Guide',
    description: 'How to research and incorporate the right keywords for your industry',
    category: 'Keywords',
    readTime: '8 min read',
    slug: 'resume-keywords-guide',
    topics: ['Keyword Research', 'Placement Strategy', 'Industry Terms']
  },
  {
    title: 'Resume Format Guide 2025',
    description: 'Choose the right resume format and structure for maximum impact',
    category: 'Formatting',
    readTime: '12 min read',
    slug: 'resume-format-guide-2025',
    topics: ['Format Types', 'Layout Design', 'Visual Hierarchy']
  },
  {
    title: 'Cover Letter AI Guide',
    description: 'Use AI tools to create compelling cover letters that get noticed',
    category: 'Cover Letters',
    readTime: '10 min read',
    slug: 'cover-letter-ai-guide',
    topics: ['AI Writing Tools', 'Personalization', 'Templates']
  },
  {
    title: 'Resume Review Checklist',
    description: 'Complete checklist to review and optimize your resume before applying',
    category: 'Review Process',
    readTime: '6 min read',
    slug: 'resume-review-checklist',
    topics: ['Quality Check', 'Error Detection', 'Final Polish']
  }
]

const categories = [
  'All Guides',
  'Getting Started',
  'ATS Optimization',
  'Industry Guides',
  'AI Tools',
  'Keywords',
  'Formatting',
  'Cover Letters',
  'Review Process'
]

export default function GuidesPage() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center bg-blue-500/20 rounded-full px-4 py-2 mb-6">
            <span className="text-sm font-medium">Expert Guides • Updated for 2025</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            AI Resume Builder Guides
          </h1>
          
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Master AI resume builders with our comprehensive guides. Learn ATS optimization, 
            keyword strategies, and industry-specific tips to land more interviews in 2025.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center bg-blue-500/20 rounded-full px-4 py-2">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Expert-Written
            </div>
            <div className="flex items-center bg-blue-500/20 rounded-full px-4 py-2">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Actionable Tips
            </div>
            <div className="flex items-center bg-blue-500/20 rounded-full px-4 py-2">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              2025 Updated
            </div>
          </div>
        </div>
      </section>

      {/* Featured Guides */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Guides
            </h2>
            <p className="text-lg text-gray-600">
              Start with these essential guides for AI resume building success
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {guides.filter(guide => guide.featured).map((guide, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {guide.category}
                    </span>
                    <span className="text-sm text-gray-500">{guide.readTime}</span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {guide.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    {guide.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {guide.topics.slice(0, 3).map((topic, topicIndex) => (
                      <span key={topicIndex} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {topic}
                      </span>
                    ))}
                  </div>
                  
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Read Guide
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Guides */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              All Guides
            </h2>
            <p className="text-lg text-gray-600">
              Comprehensive collection of AI resume building guides
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  index === 0
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Guides Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 hover:bg-white hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700">
                    {guide.category}
                  </span>
                  <span className="text-xs text-gray-500">{guide.readTime}</span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {guide.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4">
                  {guide.description}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {guide.topics.map((topic, topicIndex) => (
                    <span key={topicIndex} className="text-xs bg-white text-gray-500 px-2 py-1 rounded">
                      {topic}
                    </span>
                  ))}
                </div>
                
                <Link
                  href={`/guides/${guide.slug}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Read Guide
                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Tips Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Quick Tips for AI Resume Success
            </h2>
            <p className="text-lg text-gray-600">
              Essential tips to get started immediately
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Choose ATS-Optimized Tools</h3>
                  <p className="text-gray-600 text-sm">Select AI resume builders with proven ATS compatibility scores above 85%</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Use Industry Keywords</h3>
                  <p className="text-gray-600 text-sm">Research and include relevant keywords from job descriptions in your target field</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Test Before Applying</h3>
                  <p className="text-gray-600 text-sm">Always test your resume with ATS checkers before submitting applications</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Customize for Each Job</h3>
                  <p className="text-gray-600 text-sm">Tailor your resume for each application using AI tools to match job requirements</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Keep It Simple</h3>
                  <p className="text-gray-600 text-sm">Use clean, professional templates without complex graphics or unusual fonts</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Review AI Suggestions</h3>
                  <p className="text-gray-600 text-sm">Always review and edit AI-generated content to ensure accuracy and authenticity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Build Your Perfect Resume?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Apply what you've learned with our top-rated AI resume builders
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/ats-checker"
              className="inline-flex items-center bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Test Your Current Resume
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              View Best AI Resume Builders
            </Link>
          </div>
        </div>
      </section>
      </div>
      <Footer />
    </>
  )
}
