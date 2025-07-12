'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface ATSResult {
  score: number
  issues: Array<{
    type: 'error' | 'warning' | 'info'
    title: string
    description: string
    suggestion: string
  }>
  strengths: string[]
  recommendations: string[]
}

export default function ATSChecker() {
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<ATSResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0]
    if (uploadedFile) {
      setFile(uploadedFile)
      setResult(null)
      setError(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  })

  const analyzeResume = async () => {
    if (!file) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('resume', file)

      const response = await fetch('/api/ats-analyzer', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to analyze resume')
      }

      const data = await response.json()
      setResult(data.result)
    } catch (err) {
      setError('Failed to analyze resume. Please try again.')
      console.error('ATS analysis error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* File Upload Section */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Upload Your Resume for ATS Analysis
        </h2>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          
          <div className="mb-4">
            <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          {file ? (
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                {file.name}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume here'}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                or click to browse files
              </p>
            </div>
          )}

          <p className="text-xs text-gray-400">
            Supports PDF, DOC, DOCX • Max 5MB
          </p>
        </div>

        {file && (
          <div className="mt-6 text-center">
            <button
              onClick={analyzeResume}
              disabled={isAnalyzing}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAnalyzing ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing Resume...
                </span>
              ) : (
                'Analyze Resume'
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-8">
          {/* Score Overview */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                ATS Compatibility Score
              </h3>
              
              <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBackground(result.score)} mb-4`}>
                <span className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                  {result.score}
                </span>
              </div>
              
              <p className="text-lg text-gray-600">
                {result.score >= 80 ? 'Excellent ATS compatibility!' :
                 result.score >= 60 ? 'Good, but room for improvement' :
                 'Needs significant optimization'}
              </p>
            </div>

            {/* Strengths */}
            {result.strengths.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-green-600 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  What's Working Well
                </h4>
                <ul className="space-y-2">
                  {result.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Issues */}
          {result.issues.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-6">
                Issues Found ({result.issues.length})
              </h4>
              
              <div className="space-y-4">
                {result.issues.map((issue, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    issue.type === 'error' ? 'bg-red-50 border-red-400' :
                    issue.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                    'bg-blue-50 border-blue-400'
                  }`}>
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 w-5 h-5 mt-1 mr-3 ${
                        issue.type === 'error' ? 'text-red-500' :
                        issue.type === 'warning' ? 'text-yellow-500' :
                        'text-blue-500'
                      }`}>
                        {issue.type === 'error' ? (
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        ) : issue.type === 'warning' ? (
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 mb-1">
                          {issue.title}
                        </h5>
                        <p className="text-sm text-gray-600 mb-2">
                          {issue.description}
                        </p>
                        <p className="text-sm font-medium text-gray-800">
                          💡 {issue.suggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-6">
                Optimization Recommendations
              </h4>
              
              <div className="space-y-3">
                {result.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    <p className="text-gray-700">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
