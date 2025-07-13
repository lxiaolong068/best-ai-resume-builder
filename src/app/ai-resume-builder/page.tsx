import { Metadata } from 'next'
import { AIResumeBuilder } from '@/components/AIResumeBuilder'

export const metadata: Metadata = {
  title: 'AI Resume Builder - Generate Professional Resume Content | Best AI Resume Builder 2025',
  description: 'Use advanced AI technology to generate professional resume content. Create compelling summaries, optimize work experience, and enhance skills sections with our AI-powered resume builder.',
  keywords: [
    'AI resume builder',
    'AI resume generator',
    'resume content generator',
    'AI resume writing',
    'professional resume builder',
    'resume optimization',
    'AI career tools',
    'resume AI assistant',
    'automated resume builder',
    'smart resume creator'
  ],
  openGraph: {
    title: 'AI Resume Builder - Generate Professional Resume Content',
    description: 'Transform your career with AI-powered resume generation. Create professional, ATS-optimized resume content in minutes.',
    type: 'website',
    url: 'https://bestairesume2025.com/ai-resume-builder',
    images: [
      {
        url: '/og-ai-resume-builder.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Resume Builder - Professional Resume Generation'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Resume Builder - Generate Professional Resume Content',
    description: 'Use advanced AI to create compelling resume content that gets you hired.',
    images: ['/og-ai-resume-builder.jpg']
  },
  alternates: {
    canonical: 'https://bestairesume2025.com/ai-resume-builder'
  }
}

export default function AIResumeBuilderPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              AI Resume Builder
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Generate professional resume content with advanced AI technology. 
              Create compelling summaries, optimize work experience, and enhance skills sections.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                ✨ AI-Powered Content Generation
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                🎯 Role-Specific Optimization
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                ⚡ Instant Results
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12">
        <AIResumeBuilder />
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our AI Resume Builder?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our advanced AI technology helps you create professional resume content 
              that stands out to employers and passes ATS systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600">
                Generate professional resume content in seconds, not hours. 
                Our AI understands what employers want to see.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">ATS Optimized</h3>
              <p className="text-gray-600">
                Content is automatically optimized for Applicant Tracking Systems 
                to ensure your resume gets seen by human recruiters.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M13 13h4a2 2 0 012 2v4a2 2 0 01-2 2h-4m-6-4a2 2 0 01-2-2V9a2 2 0 012-2h2m0 0V5a2 2 0 012-2h4a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Personalized</h3>
              <p className="text-gray-600">
                Tailored content for your specific role and industry. 
                Each generation is unique and relevant to your career goals.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple 3-step process to generate professional resume content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Section</h3>
              <p className="text-gray-600">
                Select the resume section you want to improve: summary, experience, or skills.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Provide Input</h3>
              <p className="text-gray-600">
                Enter your current content and target role. Our AI will understand your context.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Results</h3>
              <p className="text-gray-600">
                Receive professionally written, ATS-optimized content ready to use in your resume.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Resume?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of job seekers who have improved their resumes with our AI technology.
          </p>
          <a
            href="#ai-resume-builder"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Start Building Now
          </a>
        </div>
      </div>
    </div>
  )
}
