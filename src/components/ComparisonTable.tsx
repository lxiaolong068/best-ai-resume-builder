'use client'

import { useState, useEffect } from 'react'
import {
  CheckIcon,
  XMarkIcon,
  StarIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/solid'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface Tool {
  id: string
  name: string
  description: string | null
  websiteUrl: string | null
  pricingModel: string | null
  features: {
    atsOptimized: boolean
    templates: number
    aiSuggestions: boolean
    coverLetter: boolean
    tracking: boolean
    support: string
    exportFormats: string[]
    languages: string[]
    collaboration: boolean
    analytics: boolean
    linkedinIntegration: boolean
    keywordOptimization: boolean
  } | null
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

interface ComparisonData {
  tools: Tool[]
  comparisonMatrix: any
  summary: {
    bestOverall: Tool | null
    bestValue: Tool | null
    bestATS: Tool | null
    bestForBeginners: Tool | null
    recommendations: Array<{
      toolId: string
      toolName: string
      recommendation: string
    }>
  }
}

export function ComparisonTable() {
  const [tools, setTools] = useState<Tool[]>([])
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null)
  const [showAllFeatures, setShowAllFeatures] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'rating' | 'name' | 'atsScore'>('rating')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterATS, setFilterATS] = useState<boolean | null>(null)
  const [filterPricing, setFilterPricing] = useState<string>('')

  // Fetch tools on component mount
  useEffect(() => {
    fetchTools()
  }, [])

  // Auto-select top 3 tools when data loads
  useEffect(() => {
    if (tools && tools.length > 0 && selectedTools.length === 0) {
      const topTools = tools
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 3)
        .map(tool => tool.id)
      setSelectedTools(topTools)
    }
  }, [tools, selectedTools.length])

  // Fetch comparison data when selected tools change
  useEffect(() => {
    if (selectedTools.length > 0) {
      fetchComparisonData()
    }
  }, [selectedTools])

  const fetchTools = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tools?limit=20&sortBy=rating&sortOrder=desc')
      const data = await response.json()

      if (data.success) {
        setTools(data.data)
      } else {
        setError('Failed to load tools')
      }
    } catch (err) {
      setError('Failed to load tools')
      console.error('Error fetching tools:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchComparisonData = async () => {
    try {
      const response = await fetch('/api/tools/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ toolIds: selectedTools }),
      })
      const data = await response.json()

      if (data.success) {
        setComparisonData(data.data)
      }
    } catch (err) {
      console.error('Error fetching comparison data:', err)
    }
  }

  const toggleTool = (toolId: string) => {
    setSelectedTools(prev => {
      if (prev.includes(toolId)) {
        return prev.filter(id => id !== toolId)
      } else if (prev.length < 5) { // Limit to 5 tools for comparison
        return [...prev, toolId]
      }
      return prev
    })
  }

  // Filter and sort tools
  const filteredTools = (tools || []).filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (tool.description && tool.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesATS = filterATS === null || (tool.features && tool.features.atsOptimized === filterATS)
    const matchesPricing = !filterPricing || (tool.pricingModel && tool.pricingModel.toLowerCase() === filterPricing.toLowerCase())

    return matchesSearch && matchesATS && matchesPricing
  }).sort((a, b) => {
    let aValue, bValue

    switch (sortBy) {
      case 'rating':
        aValue = parseFloat(a.rating) || 0
        bValue = parseFloat(b.rating) || 0
        break
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'atsScore':
        aValue = (a.reviews && a.reviews[0]?.atsScore) || 0
        bValue = (b.reviews && b.reviews[0]?.atsScore) || 0
        break
      default:
        return 0
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const selectedToolsData = comparisonData?.tools || []

  // Export comparison data as CSV
  const exportComparison = () => {
    if (!comparisonData) return

    const csvData = [
      ['Feature', ...selectedToolsData.map(tool => tool.name)],
      ['Rating', ...selectedToolsData.map(tool => tool.rating || 'N/A')],
      ['ATS Score', ...selectedToolsData.map(tool => (tool.reviews && tool.reviews[0]?.atsScore) || 'N/A')],
      ['Pricing Model', ...selectedToolsData.map(tool => tool.pricingModel || 'N/A')],
      ['Templates', ...selectedToolsData.map(tool => tool.features?.templates || 'N/A')],
      ['ATS Optimized', ...selectedToolsData.map(tool => tool.features?.atsOptimized ? 'Yes' : 'No')],
      ['AI Suggestions', ...selectedToolsData.map(tool => tool.features?.aiSuggestions ? 'Yes' : 'No')],
      ['Cover Letter', ...selectedToolsData.map(tool => tool.features?.coverLetter ? 'Yes' : 'No')],
      ['Support', ...selectedToolsData.map(tool => tool.features?.support || 'N/A')],
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ai-resume-builder-comparison.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <section id="comparison" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading AI resume builders...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="comparison" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchTools}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </section>
    )
  }

  return (
    <section id="comparison" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Interactive AI Resume Builder Comparison
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Compare the top AI resume builders side-by-side with real ATS test scores, 
            pricing, and features. Click to add or remove tools from the comparison.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 bg-white rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* ATS Filter */}
            <select
              value={filterATS === null ? '' : filterATS.toString()}
              onChange={(e) => setFilterATS(e.target.value === '' ? null : e.target.value === 'true')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All ATS Types</option>
              <option value="true">ATS Optimized</option>
              <option value="false">Not ATS Optimized</option>
            </select>

            {/* Pricing Filter */}
            <select
              value={filterPricing}
              onChange={(e) => setFilterPricing(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Pricing</option>
              <option value="freemium">Freemium</option>
              <option value="subscription">Subscription</option>
              <option value="free/paid">Free/Paid</option>
            </select>

            {/* Sort */}
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'rating' | 'name' | 'atsScore')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="rating">Sort by Rating</option>
                <option value="name">Sort by Name</option>
                <option value="atsScore">Sort by ATS Score</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ArrowsUpDownIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tool Selection */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Select tools to compare ({selectedTools.length}/5):
            </h3>
            {selectedTools.length > 0 && (
              <button
                onClick={exportComparison}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => toggleTool(tool.id)}
                disabled={!selectedTools.includes(tool.id) && selectedTools.length >= 5}
                className={`flex items-center space-x-3 p-4 rounded-lg border transition-all text-left ${
                  selectedTools.includes(tool.id)
                    ? 'bg-blue-50 border-blue-500 text-blue-900'
                    : selectedTools.length >= 5
                    ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium">{tool.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{tool.name}</div>
                  <div className="text-sm text-gray-500 flex items-center space-x-2">
                    <StarIcon className="w-4 h-4 text-yellow-400" />
                    <span>{tool.rating || 'N/A'}</span>
                    {tool.reviews && tool.reviews[0]?.atsScore && (
                      <>
                        <span>•</span>
                        <span>ATS: {tool.reviews[0].atsScore}/100</span>
                      </>
                    )}
                  </div>
                </div>
                {selectedTools.includes(tool.id) && (
                  <CheckIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        {selectedToolsData.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Recommendations Summary */}
            {comparisonData?.summary && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {comparisonData.summary.bestOverall && (
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="text-sm font-medium text-blue-600 mb-1">Best Overall</div>
                      <div className="font-semibold">{comparisonData.summary.bestOverall.name}</div>
                    </div>
                  )}
                  {comparisonData.summary.bestATS && (
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="text-sm font-medium text-green-600 mb-1">Best ATS Score</div>
                      <div className="font-semibold">{comparisonData.summary.bestATS.name}</div>
                    </div>
                  )}
                  {comparisonData.summary.bestValue && (
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="text-sm font-medium text-purple-600 mb-1">Best Value</div>
                      <div className="font-semibold">{comparisonData.summary.bestValue.name}</div>
                    </div>
                  )}
                  {comparisonData.summary.bestForBeginners && (
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="text-sm font-medium text-orange-600 mb-1">Best for Beginners</div>
                      <div className="font-semibold">{comparisonData.summary.bestForBeginners.name}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-6 font-semibold text-gray-900 min-w-[200px]">
                      Features
                    </th>
                    {selectedToolsData.map((tool) => (
                      <th key={tool.id} className="text-center p-6 min-w-[200px]">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg font-bold text-gray-600">
                              {tool.name.charAt(0)}
                            </span>
                          </div>
                          <div className="text-lg font-semibold text-gray-900">
                            {tool.name}
                          </div>
                          <div className="flex items-center space-x-1">
                            <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{tool.rating || 'N/A'}</span>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
              <tbody className="divide-y divide-gray-200">
                {/* ATS Score */}
                <tr>
                  <td className="p-6 font-medium text-gray-900">
                    ATS Compatibility Score
                    <div className="text-sm text-gray-500">Based on 50+ ATS systems</div>
                  </td>
                  {selectedToolsData.map((tool) => {
                    const atsScore = (tool.reviews && tool.reviews[0]?.atsScore) || 0
                    return (
                      <td key={tool.id} className="p-6 text-center">
                        <div className="flex flex-col items-center space-y-2">
                          <div className={`text-2xl font-bold ${
                            atsScore >= 90 ? 'text-green-600' :
                            atsScore >= 80 ? 'text-blue-600' :
                            atsScore >= 70 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {atsScore}/100
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                atsScore >= 90 ? 'bg-green-500' :
                                atsScore >= 80 ? 'bg-blue-500' :
                                atsScore >= 70 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${atsScore}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    )
                  })}
                </tr>

                {/* Pricing */}
                <tr>
                  <td className="p-6 font-medium text-gray-900">
                    Pricing Model
                    <div className="text-sm text-gray-500">Business model</div>
                  </td>
                  {selectedToolsData.map((tool) => (
                    <td key={tool.id} className="p-6 text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {tool.pricingModel}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Templates */}
                <tr>
                  <td className="p-6 font-medium text-gray-900">
                    Templates Available
                  </td>
                  {selectedToolsData.map((tool) => (
                    <td key={tool.id} className="p-6 text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {tool.features?.templates || 0}+
                      </div>
                    </td>
                  ))}
                </tr>

                {/* ATS Optimized */}
                <tr>
                  <td className="p-6 font-medium text-gray-900">
                    ATS Optimized
                  </td>
                  {selectedToolsData.map((tool) => (
                    <td key={tool.id} className="p-6 text-center">
                      {tool.features?.atsOptimized ? (
                        <CheckIcon className="w-6 h-6 text-green-500 mx-auto" />
                      ) : (
                        <XMarkIcon className="w-6 h-6 text-red-500 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>

                {/* AI Suggestions */}
                <tr>
                  <td className="p-6 font-medium text-gray-900">
                    AI Content Suggestions
                  </td>
                  {selectedToolsData.map((tool) => (
                    <td key={tool.id} className="p-6 text-center">
                      {tool.features?.aiSuggestions ? (
                        <CheckIcon className="w-6 h-6 text-green-500 mx-auto" />
                      ) : (
                        <XMarkIcon className="w-6 h-6 text-red-500 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>

                {/* Speed Score */}
                <tr>
                  <td className="p-6 font-medium text-gray-900">
                    Speed Score
                    <div className="text-sm text-gray-500">Generation speed rating</div>
                  </td>
                  {selectedToolsData.map((tool) => {
                    const speedScore = (tool.reviews && tool.reviews[0]?.speedScore) || 0
                    return (
                      <td key={tool.id} className="p-6 text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {speedScore}/10
                        </div>
                      </td>
                    )
                  })}
                </tr>

                {/* Ease of Use */}
                <tr>
                  <td className="p-6 font-medium text-gray-900">
                    Ease of Use
                    <div className="text-sm text-gray-500">User experience rating</div>
                  </td>
                  {selectedToolsData.map((tool) => {
                    const easeOfUse = (tool.reviews && tool.reviews[0]?.easeOfUse) || 0
                    return (
                      <td key={tool.id} className="p-6 text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {easeOfUse}/10
                        </div>
                      </td>
                    )
                  })}
                </tr>

                {showAllFeatures && (
                  <>
                    {/* Cover Letter */}
                    <tr>
                      <td className="p-6 font-medium text-gray-900">
                        Cover Letter Builder
                      </td>
                      {selectedToolsData.map((tool) => (
                        <td key={tool.id} className="p-6 text-center">
                          {tool.features?.coverLetter ? (
                            <CheckIcon className="w-6 h-6 text-green-500 mx-auto" />
                          ) : (
                            <XMarkIcon className="w-6 h-6 text-red-500 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Application Tracking */}
                    <tr>
                      <td className="p-6 font-medium text-gray-900">
                        Application Tracking
                      </td>
                      {selectedToolsData.map((tool) => (
                        <td key={tool.id} className="p-6 text-center">
                          {tool.features?.tracking ? (
                            <CheckIcon className="w-6 h-6 text-green-500 mx-auto" />
                          ) : (
                            <XMarkIcon className="w-6 h-6 text-red-500 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* LinkedIn Integration */}
                    <tr>
                      <td className="p-6 font-medium text-gray-900">
                        LinkedIn Integration
                      </td>
                      {selectedToolsData.map((tool) => (
                        <td key={tool.id} className="p-6 text-center">
                          {tool.features?.linkedinIntegration ? (
                            <CheckIcon className="w-6 h-6 text-green-500 mx-auto" />
                          ) : (
                            <XMarkIcon className="w-6 h-6 text-red-500 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Collaboration */}
                    <tr>
                      <td className="p-6 font-medium text-gray-900">
                        Team Collaboration
                      </td>
                      {selectedToolsData.map((tool) => (
                        <td key={tool.id} className="p-6 text-center">
                          {tool.features?.collaboration ? (
                            <CheckIcon className="w-6 h-6 text-green-500 mx-auto" />
                          ) : (
                            <XMarkIcon className="w-6 h-6 text-red-500 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Export Formats */}
                    <tr>
                      <td className="p-6 font-medium text-gray-900">
                        Export Formats
                      </td>
                      {selectedToolsData.map((tool) => (
                        <td key={tool.id} className="p-6 text-center">
                          <div className="text-sm text-gray-900">
                            {tool.features?.exportFormats?.join(', ') || 'N/A'}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Languages */}
                    <tr>
                      <td className="p-6 font-medium text-gray-900">
                        Supported Languages
                      </td>
                      {selectedToolsData.map((tool) => (
                        <td key={tool.id} className="p-6 text-center">
                          <div className="text-sm text-gray-900">
                            {tool.features?.languages?.length || 0} languages
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Support */}
                    <tr>
                      <td className="p-6 font-medium text-gray-900">
                        Customer Support
                      </td>
                      {selectedToolsData.map((tool) => (
                        <td key={tool.id} className="p-6 text-center">
                          <div className="text-sm font-medium text-gray-900">
                            {tool.features?.support || 'N/A'}
                          </div>
                        </td>
                      ))}
                    </tr>
                  </>
                )}

                {/* CTA Row */}
                <tr className="bg-gray-50">
                  <td className="p-6 font-medium text-gray-900">
                    Get Started
                  </td>
                  {selectedToolsData.map((tool) => (
                    <td key={tool.id} className="p-6 text-center">
                      <a
                        href={tool.affiliateLink || tool.websiteUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Try {tool.name}
                      </a>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Toggle Features Button */}
          <div className="text-center p-6 border-t">
            <button
              onClick={() => setShowAllFeatures(!showAllFeatures)}
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <span>{showAllFeatures ? 'Show Less Features' : 'Show More Features'}</span>
              <ChevronDownIcon
                className={`w-5 h-5 transition-transform ${showAllFeatures ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-gray-400 mb-4">
              <FunnelIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Select Tools to Compare
            </h3>
            <p className="text-gray-600">
              Choose up to 5 AI resume builders from the list above to see a detailed comparison.
            </p>
          </div>
        )}

        {/* Recommendations */}
        {comparisonData?.summary?.recommendations && comparisonData.summary.recommendations.length > 0 && (
          <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Our Expert Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comparisonData.summary.recommendations.map((rec) => (
                <div key={rec.toolId} className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">{rec.toolName}</h4>
                  <p className="text-gray-600 text-sm">{rec.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}