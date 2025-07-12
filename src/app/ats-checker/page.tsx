import { Metadata } from 'next'
import ATSChecker from '@/components/ATSChecker'

export const metadata: Metadata = {
  title: 'Free ATS Resume Checker 2025 | Test Your Resume Compatibility',
  description: 'Free ATS resume checker tool. Test how well your resume passes through Applicant Tracking Systems. Get instant feedback and optimization tips.',
  keywords: ['ats resume checker', 'free ats test', 'resume compatibility', 'applicant tracking system', 'resume scanner'],
  openGraph: {
    title: 'Free ATS Resume Checker 2025 | Test Your Resume Compatibility',
    description: 'Free ATS resume checker tool. Test how well your resume passes through Applicant Tracking Systems. Get instant feedback and optimization tips.',
    type: 'website',
  },
}

export default function ATSCheckerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center bg-blue-500/20 rounded-full px-4 py-2 mb-6">
            <span className="text-sm font-medium">100% Free • No Email Required</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Free ATS Resume Checker
          </h1>
          
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Test your resume against real ATS systems used by Fortune 500 companies. 
            Get instant feedback and optimization tips to improve your job application success rate.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Tests 50+ ATS Systems
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Instant Results
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Actionable Feedback
            </div>
          </div>
        </div>
      </section>

      {/* ATS Checker Tool */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <ATSChecker />
        </div>
      </section>

      {/* Why ATS Matters Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why ATS Compatibility Matters in 2025
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Over 98% of Fortune 500 companies use Applicant Tracking Systems to filter resumes. 
              If your resume isn't ATS-compatible, it might never reach human eyes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">75% Rejection Rate</h3>
              <p className="text-gray-600">
                Resumes that fail ATS parsing are automatically rejected before human review
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">6 Second Review</h3>
              <p className="text-gray-600">
                Average time recruiters spend reviewing resumes that pass ATS screening
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">3x More Interviews</h3>
              <p className="text-gray-600">
                ATS-optimized resumes receive significantly more interview callbacks
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Common ATS Issues Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Common ATS Issues We Check For
            </h2>
            <p className="text-lg text-gray-600">
              Our tool identifies and helps you fix these critical ATS compatibility problems
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'File Format Issues',
                description: 'PDFs with complex formatting, images, or tables that ATS cannot parse',
                icon: '📄'
              },
              {
                title: 'Font & Formatting',
                description: 'Unusual fonts, colors, or formatting that confuse ATS systems',
                icon: '🎨'
              },
              {
                title: 'Section Headers',
                description: 'Non-standard section names that ATS cannot recognize',
                icon: '📋'
              },
              {
                title: 'Contact Information',
                description: 'Phone numbers and emails in formats ATS cannot extract',
                icon: '📞'
              },
              {
                title: 'Keywords Missing',
                description: 'Lack of relevant industry keywords and skills',
                icon: '🔍'
              },
              {
                title: 'Date Formats',
                description: 'Employment dates in formats that ATS cannot understand',
                icon: '📅'
              }
            ].map((issue, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl mb-3">{issue.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{issue.title}</h3>
                <p className="text-gray-600 text-sm">{issue.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Optimize Your Resume?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Use our free ATS checker above, then explore our top-rated AI resume builders for 2025
          </p>
          <a
            href="/"
            className="inline-flex items-center bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            View Best AI Resume Builders 2025
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </section>
    </div>
  )
}
