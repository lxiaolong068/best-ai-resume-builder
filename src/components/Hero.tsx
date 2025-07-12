'use client'

import { useState } from 'react'
import { ChevronDownIcon, StarIcon, CheckCircleIcon } from '@heroicons/react/24/solid'

export function Hero() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  const stats = [
    { label: 'AI Tools Tested', value: '25+' },
    { label: 'ATS Systems', value: '50+' },
    { label: 'Success Rate', value: '94%' },
    { label: 'User Reviews', value: '1,200+' },
  ]

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-semibold text-lg">ResumeBuilder</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="/compare" className="text-gray-600 hover:text-blue-600 transition-colors">
              Compare Tools
            </a>
            <a href="/methodology" className="text-gray-600 hover:text-blue-600 transition-colors">
              Testing
            </a>
            <a href="/guides" className="text-gray-600 hover:text-blue-600 transition-colors">
              Guides
            </a>
            <a href="/ats-checker" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Free ATS Check
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                <CheckCircleIcon className="w-4 h-4" />
                <span>Updated January 2025</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Best AI Resume Builder{' '}
                <span className="text-blue-600">2025</span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl text-gray-600 leading-relaxed">
                Expert-tested with real ATS scores. We analyzed 25+ AI resume builders 
                across 50+ ATS systems to find the tools that actually land interviews.
              </p>

              {/* Star Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-gray-600">4.8/5 based on 1,200+ reviews</span>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/compare" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg text-center">
                  View Best Tools 2025
                </a>
                <a href="/ats-checker" className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors text-center">
                  Free ATS Test
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span>100% Free</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span>No Email Required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span>Expert Tested</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="relative">
              {/* Preview Card */}
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Real ATS Test Results
                    </h3>
                    <span className="text-sm text-green-600 font-medium">
                      Live Data
                    </span>
                  </div>

                  {/* Sample Results */}
                  <div className="space-y-4">
                    {[
                      { name: 'Resume.io', score: 94, color: 'bg-green-500' },
                      { name: 'Zety', score: 87, color: 'bg-blue-500' },
                      { name: 'Novoresume', score: 82, color: 'bg-yellow-500' },
                      { name: 'Canva', score: 76, color: 'bg-orange-500' },
                    ].map((tool, index) => (
                      <div
                        key={tool.name}
                        className="flex items-center space-x-4"
                      >
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {tool.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900">{tool.name}</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {tool.score}/100
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${tool.color}`}
                              style={{ width: `${tool.score}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="text-center pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      Based on tests across 50+ ATS systems
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-16 pt-16 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex flex-col items-center space-y-2 text-gray-400 animate-bounce">
          <span className="text-sm">Scroll to explore</span>
          <ChevronDownIcon className="w-5 h-5" />
        </div>
      </div>
    </section>
  )
}