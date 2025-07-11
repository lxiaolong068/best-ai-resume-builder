'use client'

import { motion } from 'framer-motion'
import { StarIcon, CheckCircleIcon, TrophyIcon } from '@heroicons/react/24/solid'

const featuredTools = [
  {
    id: 1,
    name: 'Resume.io',
    badge: 'Editor\'s Choice',
    badgeColor: 'bg-green-100 text-green-800',
    rating: 4.8,
    atsScore: 94,
    price: '$2.95/month',
    description: 'The highest-scoring AI resume builder in our tests with exceptional ATS compatibility.',
    features: [
      'AI-powered content suggestions',
      'ATS optimization scanner',
      '25+ professional templates',
      'Real-time feedback',
      'Cover letter builder'
    ],
    pros: [
      'Highest ATS compatibility score',
      'Affordable pricing',
      'Excellent AI suggestions',
      'User-friendly interface'
    ],
    image: '/screenshots/resume-io.png',
    link: '#'
  },
  {
    id: 2,
    name: 'Zety',
    badge: 'Most Popular',
    badgeColor: 'bg-blue-100 text-blue-800',
    rating: 4.6,
    atsScore: 87,
    price: '$5.95/month',
    description: 'Popular choice with beautiful templates and solid ATS performance.',
    features: [
      'Beautiful design templates',
      'Content optimization',
      'Multi-format downloads',
      'Career advice blog',
      'LinkedIn integration'
    ],
    pros: [
      'Stunning visual designs',
      'Great customization options',
      'Comprehensive career resources',
      'Strong brand recognition'
    ],
    image: '/screenshots/zety.png',
    link: '#'
  },
  {
    id: 3,
    name: 'Novoresume',
    badge: 'Best Value',
    badgeColor: 'bg-purple-100 text-purple-800',
    rating: 4.4,
    atsScore: 82,
    price: '$16/month',
    description: 'Clean, professional templates with good ATS compatibility and unlimited downloads.',
    features: [
      'Clean, modern templates',
      'Unlimited downloads',
      'Application tracking',
      'Interview preparation',
      'Career counseling'
    ],
    pros: [
      'Unlimited resume downloads',
      'Professional appearance',
      'Good ATS compatibility',
      'Comprehensive job search tools'
    ],
    image: '/screenshots/novoresume.png',
    link: '#'
  }
]

export function FeaturedTools() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <TrophyIcon className="w-8 h-8 text-yellow-500" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Top 3 AI Resume Builders 2025
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Based on our comprehensive testing across 50+ ATS systems, user reviews, 
            and feature analysis. These tools consistently deliver the best results.
          </p>
        </motion.div>

        {/* Featured Tools Grid */}
        <div className="space-y-12">
          {featuredTools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-gray-50 rounded-2xl p-8 lg:p-12"
            >
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Content */}
                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  {/* Badge and Title */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${tool.badgeColor}`}>
                        {tool.badge}
                      </span>
                      <div className="flex items-center space-x-1">
                        <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="font-semibold text-gray-900">{tool.rating}</span>
                        <span className="text-gray-500">/ 5</span>
                      </div>
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
                      {tool.name}
                    </h3>
                    <p className="text-lg text-gray-600">
                      {tool.description}
                    </p>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {tool.atsScore}/100
                      </div>
                      <div className="text-sm text-gray-500">ATS Score</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {tool.price}
                      </div>
                      <div className="text-sm text-gray-500">Starting Price</div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Key Features:</h4>
                    <ul className="space-y-2">
                      {tool.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-2">
                          <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pros */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Why We Recommend It:</h4>
                    <ul className="space-y-2">
                      {tool.pros.map((pro, proIndex) => (
                        <li key={proIndex} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-600">{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href={tool.link}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
                    >
                      Try {tool.name} Free
                    </a>
                    <a
                      href={`#${tool.name.toLowerCase()}-review`}
                      className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
                    >
                      Read Full Review
                    </a>
                  </div>
                </div>

                {/* Screenshot/Preview */}
                <div className={`relative ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="bg-white rounded-xl shadow-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg aspect-[4/3] flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto">
                          <span className="text-white font-bold text-xl">
                            {tool.name.charAt(0)}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="text-lg font-semibold text-gray-900">
                            {tool.name} Dashboard
                          </div>
                          <div className="text-sm text-gray-500">
                            Preview of the resume builder interface
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Floating metrics */}
                  <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
                    <div className="text-xs text-gray-500">ATS Score</div>
                    <div className="text-lg font-bold text-green-600">
                      {tool.atsScore}/100
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mt-16 p-8 bg-blue-50 rounded-2xl"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Can't decide which tool is right for you?
          </h3>
          <p className="text-lg text-gray-600 mb-6">
            Try our free ATS compatibility checker to see how your current resume performs
          </p>
          <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
            Test Your Resume for Free
          </button>
        </motion.div>
      </div>
    </section>
  )
}