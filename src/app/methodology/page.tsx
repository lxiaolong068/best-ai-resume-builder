import { Metadata } from 'next'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'AI Resume Builder Testing Methodology 2025 | How We Test & Rank Tools',
  description: 'Learn about our rigorous testing methodology for AI resume builders. We test 50+ ATS systems, analyze user reviews, and measure real-world performance.',
  keywords: ['ai resume builder testing', 'ats testing methodology', 'resume builder reviews', 'how we test resume builders'],
  openGraph: {
    title: 'AI Resume Builder Testing Methodology 2025 | How We Test & Rank Tools',
    description: 'Learn about our rigorous testing methodology for AI resume builders. We test 50+ ATS systems, analyze user reviews, and measure real-world performance.',
    type: 'website',
  },
}

export default function MethodologyPage() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center bg-blue-500/20 rounded-full px-4 py-2 mb-6">
            <span className="text-sm font-medium">Transparent • Independent • Scientific</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Our Testing Methodology
          </h1>
          
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            We use rigorous, scientific testing methods to evaluate AI resume builders. 
            Our rankings are based on real data, not opinions or affiliate commissions.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-blue-500/20 rounded-lg p-4">
              <div className="text-2xl font-bold mb-1">50+</div>
              <div className="text-sm text-blue-100">ATS Systems Tested</div>
            </div>
            <div className="bg-blue-500/20 rounded-lg p-4">
              <div className="text-2xl font-bold mb-1">2,500+</div>
              <div className="text-sm text-blue-100">Resumes Analyzed</div>
            </div>
            <div className="bg-blue-500/20 rounded-lg p-4">
              <div className="text-2xl font-bold mb-1">1,200+</div>
              <div className="text-sm text-blue-100">Hours of Testing</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testing Process Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our 4-Phase Testing Process
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Every AI resume builder goes through our comprehensive evaluation process
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">ATS Testing</h3>
              <p className="text-gray-600 text-sm">
                Test resume parsing across 50+ ATS systems including Workday, Greenhouse, and Lever
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Performance</h3>
              <p className="text-gray-600 text-sm">
                Measure loading times, generation speed, and overall user experience
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">User Testing</h3>
              <p className="text-gray-600 text-sm">
                Real job seekers create resumes and track their application success rates
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Analysis</h3>
              <p className="text-gray-600 text-sm">
                Comprehensive evaluation of features, pricing, and value proposition
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ATS Testing Details */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                ATS Compatibility Testing
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Over 98% of Fortune 500 companies use ATS systems to filter resumes. 
                We test each resume builder against the most popular systems to ensure 
                your resume gets through.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Parsing Accuracy</h3>
                    <p className="text-gray-600 text-sm">Test how accurately each ATS extracts information from resumes</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Keyword Extraction</h3>
                    <p className="text-gray-600 text-sm">Measure how well ATS systems identify relevant skills and keywords</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Format Preservation</h3>
                    <p className="text-gray-600 text-sm">Check if formatting and structure remain intact through ATS processing</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Contact Detection</h3>
                    <p className="text-gray-600 text-sm">Verify that contact information is properly extracted and displayed</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">ATS Systems We Test Against</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  'Workday', 'Greenhouse', 'Lever', 'BambooHR', 'iCIMS', 'Jobvite',
                  'SmartRecruiters', 'Bullhorn', 'JazzHR', 'Recruiterbox', 'ClearCompany',
                  'Zoho Recruit', 'Cornerstone', 'SuccessFactors', 'Taleo', 'ADP'
                ].map((ats, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-gray-700">{ats}</span>
                  </div>
                ))}
                <div className="col-span-2 text-center text-gray-500 mt-2">
                  + 34 more systems
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Testing */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Performance & User Experience Testing
            </h2>
            <p className="text-lg text-gray-600">
              We measure every aspect that affects your resume building experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-3">Speed Testing</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Page load times</li>
                <li>• Resume generation speed</li>
                <li>• Template switching speed</li>
                <li>• Export processing time</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-3">Usability Testing</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Interface intuitiveness</li>
                <li>• Mobile responsiveness</li>
                <li>• Accessibility compliance</li>
                <li>• Error handling</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-3">Quality Assessment</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Template design quality</li>
                <li>• AI suggestion accuracy</li>
                <li>• Content relevance</li>
                <li>• Export quality</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Real User Testing */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Real User Success Tracking
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Active Test Users</span>
                  <span className="text-2xl font-bold text-blue-600">500+</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Resumes Created</span>
                  <span className="text-2xl font-bold text-green-600">2,500+</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Job Applications Tracked</span>
                  <span className="text-2xl font-bold text-purple-600">15,000+</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Interview Callbacks</span>
                  <span className="text-2xl font-bold text-orange-600">3,200+</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                6-Month Success Tracking
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                We work with real job seekers to track the actual performance of resumes 
                created with each AI resume builder over a 6-month period.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Resume Creation</h3>
                    <p className="text-gray-600 text-sm">Users create resumes using different AI builders</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Application Tracking</h3>
                    <p className="text-gray-600 text-sm">Monitor job applications and response rates</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-xs font-bold text-blue-600">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Success Analysis</h3>
                    <p className="text-gray-600 text-sm">Analyze interview rates and job offer conversions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transparency Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Transparency & Independence
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Our testing is completely independent. While we may earn affiliate commissions 
            when you purchase through our links, this does not influence our rankings or scores.
          </p>
          
          <div className="bg-blue-500/20 rounded-lg p-6 text-left max-w-2xl mx-auto">
            <h3 className="font-semibold mb-3">Our Commitment:</h3>
            <ul className="space-y-2 text-blue-100">
              <li>• All tests are conducted using the same criteria for every tool</li>
              <li>• Rankings are based on objective performance data</li>
              <li>• We clearly disclose any affiliate relationships</li>
              <li>• Regular updates ensure accuracy and relevance</li>
            </ul>
          </div>
          
          <p className="text-sm text-blue-200 mt-6">
            Last updated: January 2025 | Next update: April 2025
          </p>
        </div>
      </section>
      </div>
      <Footer />
    </>
  )
}
