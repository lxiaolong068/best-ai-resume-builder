'use client'

import { motion } from 'framer-motion'
import { 
  StarIcon, 
  CheckIcon, 
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/solid'
import { ShareIcon, HeartIcon } from '@heroicons/react/24/outline'

interface Tool {
  id: string
  name: string
  description: string | null
  websiteUrl: string | null
  pricingModel: string | null
  features: any | null
  affiliateLink: string | null
  logoUrl: string | null
  rating: number | null
  reviews: Array<{
    id: string
    speedScore: number | null
    atsScore: number | null
    easeOfUse: number | null
    templateCount: number | null
    pricingScore: number | null
    overallRating: number | null
    reviewDate: Date | null
    reviewerNotes: string | null
  }>
}

interface Props {
  tool: Tool
}

export function ToolDetailPage({ tool }: Props) {
  const latestReview = tool.reviews[0]
  const atsScore = latestReview?.atsScore || 0
  const speedScore = latestReview?.speedScore || 0
  const easeOfUse = latestReview?.easeOfUse || 0
  const pricingScore = latestReview?.pricingScore || 0

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${tool.name} Review 2025`,
          text: `Check out this comprehensive review of ${tool.name} - ATS Score: ${atsScore}/100`,
          url: window.location.href
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href)
      alert('URL copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-12"
          >
            {/* Tool Info */}
            <div className="lg:col-span-2">
              <div className="flex items-start space-x-6 mb-8">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-gray-600">
                    {tool.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {tool.name} Review 2025
                  </h1>
                  <p className="text-xl text-gray-600 mb-6">
                    {tool.description || 'No description available'}
                  </p>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <StarIcon className="w-5 h-5 text-yellow-400" />
                      <span className="text-lg font-semibold">{tool.rating || 'N/A'}</span>
                      <span className="text-gray-500">/ 5.0</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ChartBarIcon className="w-5 h-5 text-green-500" />
                      <span className="text-lg font-semibold">{atsScore}</span>
                      <span className="text-gray-500">/ 100 ATS</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CurrencyDollarIcon className="w-5 h-5 text-blue-500" />
                      <span className="text-lg font-semibold">{tool.pricingModel || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
{(tool.affiliateLink || tool.websiteUrl) && (
                  <a
                    href={tool.affiliateLink || tool.websiteUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <span>Try {tool.name}</span>
                    <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                  </a>
                )}
                <button
                  onClick={handleShare}
                  className="inline-flex items-center space-x-2 bg-gray-100 text-gray-700 px-6 py-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  <ShareIcon className="w-5 h-5" />
                  <span>Share</span>
                </button>
                <button className="inline-flex items-center space-x-2 bg-gray-100 text-gray-700 px-6 py-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                  <HeartIcon className="w-5 h-5" />
                  <span>Save</span>
                </button>
              </div>
            </div>

            {/* Score Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Scores</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">ATS Compatibility</span>
                    <span className="font-bold text-gray-900">{atsScore}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        atsScore >= 90 ? 'bg-green-500' :
                        atsScore >= 80 ? 'bg-blue-500' :
                        atsScore >= 70 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${atsScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">Speed</span>
                    <span className="font-bold text-gray-900">{speedScore}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-blue-500"
                      style={{ width: `${speedScore * 10}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">Ease of Use</span>
                    <span className="font-bold text-gray-900">{easeOfUse}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-green-500"
                      style={{ width: `${easeOfUse * 10}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">Value for Money</span>
                    <span className="font-bold text-gray-900">{pricingScore}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-purple-500"
                      style={{ width: `${pricingScore * 10}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
          >
            {/* Features List */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tool.features ? (
                  <>
                    <div className="flex items-center space-x-3">
                      {tool.features.atsOptimized ? (
                        <CheckIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                      ) : (
                        <XMarkIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
                      )}
                      <span className="text-gray-700">ATS Optimized</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      {tool.features.aiSuggestions ? (
                        <CheckIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                      ) : (
                        <XMarkIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
                      )}
                      <span className="text-gray-700">AI Suggestions</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      {tool.features.coverLetter ? (
                        <CheckIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                      ) : (
                        <XMarkIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
                      )}
                      <span className="text-gray-700">Cover Letter Builder</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      {tool.features.tracking ? (
                        <CheckIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                      ) : (
                        <XMarkIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
                      )}
                      <span className="text-gray-700">Application Tracking</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      {tool.features.linkedinIntegration ? (
                        <CheckIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                      ) : (
                        <XMarkIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
                      )}
                      <span className="text-gray-700">LinkedIn Integration</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      {tool.features.collaboration ? (
                        <CheckIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                      ) : (
                        <XMarkIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
                      )}
                      <span className="text-gray-700">Team Collaboration</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-blue-600">{tool.features.templates || 0}</span>
                      </span>
                      <span className="text-gray-700">Templates Available</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-purple-600">{tool.features.languages?.length || 0}</span>
                      </span>
                      <span className="text-gray-700">Languages Supported</span>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2 text-gray-500 italic">
                    Feature details not available
                  </div>
                )}
              </div>
            </div>

            {/* Review Details */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Expert Review</h2>
              {latestReview?.reviewerNotes ? (
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {latestReview.reviewerNotes}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  Detailed review coming soon. Our experts are currently testing this tool.
                </p>
              )}

              {latestReview?.reviewDate && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <ClockIcon className="w-4 h-4" />
                    <span>
                      Last updated: {new Date(latestReview.reviewDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
