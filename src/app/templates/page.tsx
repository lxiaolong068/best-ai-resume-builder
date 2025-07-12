import { Metadata } from 'next'
import Link from 'next/link'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Free Resume Templates 2025 | ATS-Optimized & Professional Designs',
  description: 'Download free ATS-optimized resume templates for 2025. Professional designs tested across 50+ ATS systems. Perfect for all industries and career levels.',
  keywords: ['free resume templates 2025', 'ats resume templates', 'professional resume templates', 'resume template download'],
  openGraph: {
    title: 'Free Resume Templates 2025 | ATS-Optimized & Professional Designs',
    description: 'Download free ATS-optimized resume templates for 2025. Professional designs tested across 50+ ATS systems. Perfect for all industries and career levels.',
    type: 'website',
  },
}

const templates = [
  {
    id: 1,
    name: 'Modern Professional',
    category: 'Professional',
    atsScore: 95,
    description: 'Clean, modern design perfect for corporate roles and traditional industries',
    features: ['ATS-Optimized', 'Clean Layout', 'Professional Fonts', 'Easy to Edit'],
    industries: ['Finance', 'Consulting', 'Healthcare', 'Legal'],
    preview: '/templates/modern-professional.jpg',
    downloadUrl: '/downloads/modern-professional.docx',
    featured: true
  },
  {
    id: 2,
    name: 'Tech Specialist',
    category: 'Technology',
    atsScore: 92,
    description: 'Designed specifically for software engineers and tech professionals',
    features: ['Skills Section', 'Project Showcase', 'GitHub Integration', 'ATS-Friendly'],
    industries: ['Software Development', 'Data Science', 'DevOps', 'Cybersecurity'],
    preview: '/templates/tech-specialist.jpg',
    downloadUrl: '/downloads/tech-specialist.docx',
    featured: true
  },
  {
    id: 3,
    name: 'Creative Professional',
    category: 'Creative',
    atsScore: 88,
    description: 'Balanced design that showcases creativity while maintaining ATS compatibility',
    features: ['Portfolio Section', 'Visual Elements', 'Brand Colors', 'ATS-Compatible'],
    industries: ['Marketing', 'Design', 'Media', 'Advertising'],
    preview: '/templates/creative-professional.jpg',
    downloadUrl: '/downloads/creative-professional.docx',
    featured: true
  },
  {
    id: 4,
    name: 'Executive Leader',
    category: 'Executive',
    atsScore: 94,
    description: 'Sophisticated template for senior executives and C-level positions',
    features: ['Leadership Focus', 'Achievement Highlights', 'Executive Summary', 'Premium Design'],
    industries: ['Executive', 'Management', 'Strategy', 'Operations'],
    preview: '/templates/executive-leader.jpg',
    downloadUrl: '/downloads/executive-leader.docx'
  },
  {
    id: 5,
    name: 'Entry Level',
    category: 'Entry Level',
    atsScore: 91,
    description: 'Perfect for recent graduates and career changers',
    features: ['Education Focus', 'Skills Emphasis', 'Clean Structure', 'Beginner-Friendly'],
    industries: ['All Industries', 'Recent Graduates', 'Career Change', 'Internships'],
    preview: '/templates/entry-level.jpg',
    downloadUrl: '/downloads/entry-level.docx'
  },
  {
    id: 6,
    name: 'Sales Professional',
    category: 'Sales',
    atsScore: 90,
    description: 'Results-focused template highlighting achievements and metrics',
    features: ['Metrics Focus', 'Achievement Highlights', 'Performance Data', 'Results-Driven'],
    industries: ['Sales', 'Business Development', 'Account Management', 'Retail'],
    preview: '/templates/sales-professional.jpg',
    downloadUrl: '/downloads/sales-professional.docx'
  }
]

const categories = ['All Templates', 'Professional', 'Technology', 'Creative', 'Executive', 'Entry Level', 'Sales']

export default function TemplatesPage() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center bg-blue-500/20 rounded-full px-4 py-2 mb-6">
            <span className="text-sm font-medium">100% Free • ATS-Tested • 2025 Updated</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Free Resume Templates 2025
          </h1>
          
          <p className="text-xl text-blue-100 mb-8 max-w-4xl mx-auto">
            Download professional, ATS-optimized resume templates tested across 50+ applicant tracking systems. 
            Perfect for all industries and career levels.
          </p>
          
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="bg-blue-500/20 rounded-lg p-4">
              <div className="text-2xl font-bold mb-1">50+</div>
              <div className="text-sm text-blue-100">ATS Systems Tested</div>
            </div>
            <div className="bg-blue-500/20 rounded-lg p-4">
              <div className="text-2xl font-bold mb-1">95%</div>
              <div className="text-sm text-blue-100">Average ATS Score</div>
            </div>
            <div className="bg-blue-500/20 rounded-lg p-4">
              <div className="text-2xl font-bold mb-1">100K+</div>
              <div className="text-sm text-blue-100">Downloads</div>
            </div>
            <div className="bg-blue-500/20 rounded-lg p-4">
              <div className="text-2xl font-bold mb-1">Free</div>
              <div className="text-sm text-blue-100">No Email Required</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Templates */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Templates
            </h2>
            <p className="text-lg text-gray-600">
              Our most popular ATS-optimized templates for 2025
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {templates.filter(template => template.featured).map((template) => (
              <div key={template.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-[3/4] bg-gray-100 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-gray-400 text-center">
                      <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm">Template Preview</p>
                    </div>
                  </div>
                  
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ATS Score: {template.atsScore}%
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {template.name}
                    </h3>
                    <span className="text-sm text-gray-500">{template.category}</span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    {template.description}
                  </p>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Features:</h4>
                    <div className="flex flex-wrap gap-1">
                      {template.features.map((feature, index) => (
                        <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Best for:</h4>
                    <p className="text-sm text-gray-600">
                      {template.industries.join(', ')}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Download Free
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Templates */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              All Resume Templates
            </h2>
            <p className="text-lg text-gray-600">
              Choose from our complete collection of ATS-optimized templates
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

          {/* Templates Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="bg-gray-50 rounded-lg overflow-hidden hover:bg-white hover:shadow-md transition-all">
                <div className="aspect-[3/4] bg-gray-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-gray-400 text-center">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      {template.atsScore}%
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {template.name}
                    </h3>
                    <span className="text-xs text-gray-500">{template.category}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">
                    {template.description}
                  </p>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors">
                      Download
                    </button>
                    <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors">
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Template Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Our Templates Work
            </h2>
            <p className="text-lg text-gray-600">
              Every template is designed and tested for maximum ATS compatibility
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">ATS-Tested</h3>
              <p className="text-gray-600 text-sm">
                Every template tested across 50+ ATS systems for maximum compatibility
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Fast Download</h3>
              <p className="text-gray-600 text-sm">
                Instant download in Word format - no email required, completely free
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 001-1v-1a2 2 0 114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Easy to Edit</h3>
              <p className="text-gray-600 text-sm">
                Simple Word format that's easy to customize with your information
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Professional</h3>
              <p className="text-gray-600 text-sm">
                Designed by experts to make a great first impression with employers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Need More Than Just a Template?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Explore our top-rated AI resume builders for advanced features and personalized content
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/ats-checker"
              className="inline-flex items-center bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Test Your Resume
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              View AI Resume Builders
            </Link>
          </div>
        </div>
      </section>
      </div>
      <Footer />
    </>
  )
}
