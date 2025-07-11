'use client'

import { motion } from 'framer-motion'
import { 
  BeakerIcon, 
  ChartBarIcon, 
  ClockIcon, 
  UserGroupIcon,
  CheckBadgeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

const methodologySteps = [
  {
    icon: BeakerIcon,
    title: 'ATS Compatibility Testing',
    description: 'We test each resume builder across 50+ different ATS systems including Workday, Greenhouse, Lever, and more.',
    details: [
      'Test parsing accuracy',
      'Keyword extraction',
      'Format preservation',
      'Contact information detection'
    ]
  },
  {
    icon: ClockIcon,
    title: 'Speed & Performance',
    description: 'Measure loading times, generation speed, and overall user experience across different devices.',
    details: [
      'Page load times',
      'Resume generation speed',
      'Mobile responsiveness',
      'Server response times'
    ]
  },
  {
    icon: UserGroupIcon,
    title: 'Real User Testing',
    description: 'Actual job seekers create resumes and track their application success rates over 6 months.',
    details: [
      '500+ real users',
      'Interview callback rates',
      'Job offer conversions',
      'User satisfaction scores'
    ]
  },
  {
    icon: ChartBarIcon,
    title: 'Feature Analysis',
    description: 'Comprehensive evaluation of templates, AI capabilities, customization options, and additional features.',
    details: [
      'Template quality & variety',
      'AI suggestion accuracy',
      'Customization options',
      'Export formats'
    ]
  }
]

const testResults = [
  { metric: 'ATS Systems Tested', value: '50+', description: 'Including all major platforms' },
  { metric: 'Resumes Analyzed', value: '2,500+', description: 'Across different industries' },
  { metric: 'Real Users', value: '500+', description: 'Tracking success rates' },
  { metric: 'Hours of Testing', value: '1,200+', description: 'Comprehensive evaluation' }
]

export function TestingMethodology() {
  return (
    <section id="methodology" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BeakerIcon className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Our Testing Methodology
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We use rigorous, scientific testing methods to evaluate AI resume builders. 
            Our rankings are based on real data, not opinions or affiliate commissions.
          </p>
        </motion.div>

        {/* Testing Process */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {methodologySteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-gray-50 rounded-2xl p-8"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
              </div>
              <p className="text-gray-600 mb-6">{step.description}</p>
              <ul className="space-y-2">
                {step.details.map((detail, detailIndex) => (
                  <li key={detailIndex} className="flex items-center space-x-2">
                    <CheckBadgeIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600">{detail}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Test Results Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-16"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Testing Scale</h3>
            <p className="text-blue-100">
              The largest independent study of AI resume builders
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {testResults.map((result, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold mb-2">{result.value}</div>
                <div className="text-lg font-semibold mb-1">{result.metric}</div>
                <div className="text-blue-200 text-sm">{result.description}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ATS Testing Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">
              ATS Compatibility: The Most Important Factor
            </h3>
            <p className="text-lg text-gray-600">
              Over 98% of Fortune 500 companies use ATS systems to filter resumes. 
              If your resume isn't ATS-compatible, it might never reach human eyes.
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <DocumentTextIcon className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Format Testing</h4>
                  <p className="text-gray-600">
                    We test how well each tool's resumes parse through different ATS systems.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <ChartBarIcon className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Keyword Analysis</h4>
                  <p className="text-gray-600">
                    Measure how accurately ATS systems extract skills and keywords.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <UserGroupIcon className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Real-World Results</h4>
                  <p className="text-gray-600">
                    Track actual interview callback rates from real job applications.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-6">
              ATS Systems We Test Against
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {[
                'Workday', 'Greenhouse', 'Lever', 'BambooHR',
                'iCIMS', 'Jobvite', 'SmartRecruiters', 'Bullhorn',
                'JazzHR', 'Recruiterbox', 'ClearCompany', 'Zoho Recruit'
              ].map((ats, index) => (
                <div
                  key={index}
                  className="bg-white p-3 rounded-lg text-center text-sm font-medium text-gray-700"
                >
                  {ats}
                </div>
              ))}
              <div className="bg-blue-100 p-3 rounded-lg text-center text-sm font-medium text-blue-800 col-span-2">
                + 38 more systems
              </div>
            </div>
          </div>
        </motion.div>

        {/* Transparency Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 mt-16"
        >
          <div className="flex items-start space-x-4">
            <CheckBadgeIcon className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Transparency & Independence
              </h4>
              <p className="text-gray-700 mb-4">
                Our testing is completely independent. While we may earn affiliate commissions 
                when you purchase through our links, this does not influence our rankings or scores. 
                All tests are conducted objectively using the same criteria for every tool.
              </p>
              <p className="text-sm text-gray-600">
                Last updated: January 2025 | Next update: April 2025
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}