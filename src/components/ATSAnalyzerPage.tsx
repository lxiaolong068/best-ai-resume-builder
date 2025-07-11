'use client'

import { useState } from 'react'
import { 
  DocumentTextIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ArrowPathIcon,
  ShareIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'

interface ATSAnalysisResult {
  overallScore: number
  sections: {
    formatting: {
      score: number
      issues: string[]
      recommendations: string[]
    }
    content: {
      score: number
      issues: string[]
      recommendations: string[]
    }
    keywords: {
      score: number
      issues: string[]
      recommendations: string[]
      suggestedKeywords: string[]
    }
    structure: {
      score: number
      issues: string[]
      recommendations: string[]
    }
  }
  summary: {
    strengths: string[]
    criticalIssues: string[]
    quickWins: string[]
  }
}



export function ATSAnalyzerPage() {
  const [resumeText, setResumeText] = useState('')
  const [targetIndustry, setTargetIndustry] = useState('')
  const [email, setEmail] = useState('')
  const [analysis, setAnalysis] = useState<ATSAnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const industries = [
    { value: '', label: 'Select Industry (Optional)' },
    { value: 'technology', label: 'Technology & Software' },
    { value: 'business', label: 'Business & Management' },
    { value: 'marketing', label: 'Marketing & Sales' },
    { value: 'finance', label: 'Finance & Accounting' },
    { value: 'healthcare', label: 'Healthcare & Medical' }
  ]

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError('Please paste your resume text')
      return
    }

    if (resumeText.length < 50) {
      setError('Resume text is too short (minimum 50 characters)')
      return
    }


    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/ats-analyzer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': getSessionId(),
        },
        body: JSON.stringify({
          resumeText,
          targetIndustry: targetIndustry || undefined,
          email: email || undefined
        }),
      })

      const data = await response.json()

      if (data.success) {
        setAnalysis(data.data.analysis)
      } else {
        setError(data.error || 'Failed to analyze resume')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Analysis error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getSessionId = () => {
    let sessionId = localStorage.getItem('session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('session_id', sessionId)
    }
    return sessionId
  }


  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }


  const handleShare = async () => {
    if (navigator.share && analysis) {
      try {
        await navigator.share({
          title: 'Free ATS Resume Checker',
          text: `I just analyzed my resume and got a ${analysis.overallScore}/100 ATS score!`,
          url: window.location.href
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('URL copied to clipboard!')
    }
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <a href="/" className="text-blue-600 hover:text-blue-700">
                Home
              </a>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-600">Free ATS Resume Checker</li>
          </ol>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div>
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <CheckCircleIcon className="w-4 h-4" />
              <span>100% Free • No Registration Required</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Free ATS Resume Checker 2025
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Test your resume against 50+ Applicant Tracking Systems instantly. 
              Get detailed feedback on formatting, keywords, and optimization tips 
              to increase your chances of landing interviews.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <ChartBarIcon className="w-4 h-4 text-blue-500" />
                <span>Instant Analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <DocumentTextIcon className="w-4 h-4 text-green-500" />
                <span>ATS Compatibility</span>
              </div>
              <div className="flex items-center space-x-2">
                <LightBulbIcon className="w-4 h-4 text-yellow-500" />
                <span>Optimization Tips</span>
              </div>
              <div className="flex items-center space-x-2">
                <StarIcon className="w-4 h-4 text-purple-500" />
                <span>Expert Recommendations</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Input Form */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Analyze Your Resume
              </h2>
              
              <div className="space-y-6">
                {/* Resume Text Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paste Your Resume Text *
                  </label>
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Copy and paste your resume text here..."
                    rows={12}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {resumeText.length}/10,000 characters
                  </p>
                </div>

                {/* Industry Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Industry
                  </label>
                  <select
                    value={targetIndustry}
                    onChange={(e) => setTargetIndustry(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {industries.map(industry => (
                      <option key={industry.value} value={industry.value}>
                        {industry.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Get resume tips via email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    We'll send you personalized resume tips and job search advice
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                      <span className="text-red-700">{error}</span>
                    </div>
                  </div>
                )}

                {/* Analyze Button */}
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !resumeText.trim()}
                  className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <ChartBarIcon className="w-5 h-5" />
                      <span>Analyze Resume</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              {analysis ? (
                <div className="space-y-8">
                  {/* Overall Score */}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Your ATS Score
                    </h3>
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="2"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeDasharray={`${analysis.overallScore}, 100`}
                          className={getScoreColor(analysis.overallScore)}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                          {analysis.overallScore}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600">
                      {analysis.overallScore >= 80 ? 'Excellent ATS compatibility!' :
                       analysis.overallScore >= 60 ? 'Good, with room for improvement' :
                       'Needs significant optimization'}
                    </p>
                  </div>

                  {/* Section Scores */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Section Breakdown</h4>
                    
                    {Object.entries(analysis.sections).map(([key, section]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-gray-700 capitalize">
                          {key === 'keywords' ? 'Keywords' : key}
                        </span>
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getScoreBgColor(section.score)}`}
                              style={{ width: `${section.score}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${getScoreColor(section.score)}`}>
                            {section.score}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Share Button */}
                  <button
                    onClick={handleShare}
                    className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ShareIcon className="w-5 h-5" />
                    <span>Share Results</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Ready to Analyze
                  </h3>
                  <p className="text-gray-600">
                    Paste your resume text and click "Analyze Resume" to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
