'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { apiRequest } from '@/lib/api-response'
import { trackToolComparison } from '@/lib/analytics'
import type { Tool, Comparison, ComparisonMatrix, ComparisonSummary } from '@/types'

interface UseToolComparisonOptions {
  maxTools?: number
  autoSave?: boolean
  persistToStorage?: boolean
}

interface ComparisonState {
  selectedTools: string[]
  comparisonData: Comparison | null
  loading: boolean
  error: string | null
}

export function useToolComparison(options: UseToolComparisonOptions = {}) {
  const {
    maxTools = 5,
    autoSave = false,
    persistToStorage = true,
  } = options

  // State management
  const [state, setState] = useState<ComparisonState>({
    selectedTools: [],
    comparisonData: null,
    loading: false,
    error: null,
  })

  // Load from localStorage on mount
  useEffect(() => {
    if (persistToStorage && typeof window !== 'undefined') {
      const saved = localStorage.getItem('tool-comparison')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setState(prev => ({
            ...prev,
            selectedTools: parsed.selectedTools || [],
          }))
        } catch (error) {
          console.warn('Failed to load comparison from storage:', error)
        }
      }
    }
  }, [persistToStorage])

  // Save to localStorage when selectedTools changes
  useEffect(() => {
    if (persistToStorage && typeof window !== 'undefined') {
      localStorage.setItem('tool-comparison', JSON.stringify({
        selectedTools: state.selectedTools,
        timestamp: Date.now(),
      }))
    }
  }, [state.selectedTools, persistToStorage])

  // Add tool to comparison
  const addTool = useCallback((toolId: string) => {
    setState(prev => {
      // Check if tool is already selected
      if (prev.selectedTools.includes(toolId)) {
        return prev
      }

      // Check if we've reached the maximum
      if (prev.selectedTools.length >= maxTools) {
        return {
          ...prev,
          error: `Maximum ${maxTools} tools can be compared at once`,
        }
      }

      const newSelectedTools = [...prev.selectedTools, toolId]

      // Auto-fetch comparison if enabled and we have enough tools
      if (autoSave && newSelectedTools.length >= 2) {
        fetchComparison(newSelectedTools)
      }

      return {
        ...prev,
        selectedTools: newSelectedTools,
        error: null,
      }
    })
  }, [maxTools, autoSave])

  // Remove tool from comparison
  const removeTool = useCallback((toolId: string) => {
    setState(prev => ({
      ...prev,
      selectedTools: prev.selectedTools.filter(id => id !== toolId),
      error: null,
    }))
  }, [])

  // Clear all selected tools
  const clearAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedTools: [],
      comparisonData: null,
      error: null,
    }))

    if (persistToStorage && typeof window !== 'undefined') {
      localStorage.removeItem('tool-comparison')
    }
  }, [persistToStorage])

  // Toggle tool selection
  const toggleTool = useCallback((toolId: string) => {
    setState(prev => {
      if (prev.selectedTools.includes(toolId)) {
        return {
          ...prev,
          selectedTools: prev.selectedTools.filter(id => id !== toolId),
          error: null,
        }
      } else {
        if (prev.selectedTools.length >= maxTools) {
          return {
            ...prev,
            error: `Maximum ${maxTools} tools can be compared at once`,
          }
        }
        return {
          ...prev,
          selectedTools: [...prev.selectedTools, toolId],
          error: null,
        }
      }
    })
  }, [maxTools])

  // Fetch comparison data
  const fetchComparison = useCallback(async (toolIds?: string[]) => {
    const idsToCompare = toolIds || state.selectedTools

    if (idsToCompare.length < 2) {
      setState(prev => ({
        ...prev,
        error: 'At least 2 tools are required for comparison',
      }))
      return
    }

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }))

    try {
      const comparisonData = await apiRequest<Comparison>('/api/tools/compare', {
        method: 'POST',
        body: JSON.stringify({ toolIds: idsToCompare }),
      })

      setState(prev => ({
        ...prev,
        comparisonData,
        loading: false,
      }))

      // Track comparison event
      const toolNames = comparisonData.tools.map(tool => tool.name)
      trackToolComparison(idsToCompare, toolNames)

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch comparison',
      }))
    }
  }, [state.selectedTools])

  // Generate comparison matrix
  const generateMatrix = useCallback((tools: Tool[]): ComparisonMatrix => {
    const features = [
      'atsOptimized',
      'templates',
      'aiSuggestions',
      'coverLetter',
      'tracking',
      'support',
      'exportFormats',
      'languages',
      'collaboration',
      'analytics',
      'linkedinIntegration',
      'keywordOptimization',
    ]

    const matrix: ComparisonMatrix = {}

    features.forEach(feature => {
      matrix[feature] = tools.map(tool => ({
        toolId: tool.id,
        toolName: tool.name,
        value: tool.features?.[feature as keyof typeof tool.features] || null,
      }))
    })

    return matrix
  }, [])

  // Generate comparison summary
  const generateSummary = useCallback((tools: Tool[]): ComparisonSummary => {
    // Find overall winner based on rating
    const winner = tools.reduce((best, current) => {
      const bestRating = best.rating || 0
      const currentRating = current.rating || 0
      return currentRating > bestRating ? current : best
    })

    // Generate category winners
    const categories: Record<string, string> = {
      'Best Overall': winner.id,
      'Best for ATS': tools.find(t => t.features.atsOptimized)?.id || winner.id,
      'Most Templates': tools.reduce((best, current) => 
        (current.features.templates || 0) > (best.features.templates || 0) ? current : best
      ).id,
      'Best Support': tools.find(t => t.features.support === 'phone')?.id || 
                     tools.find(t => t.features.support === 'chat')?.id || 
                     winner.id,
    }

    // Generate recommendations
    const recommendations = tools.map(tool => ({
      toolId: tool.id,
      reason: `Great for ${tool.features.atsOptimized ? 'ATS optimization' : 'general use'}`,
      bestFor: [
        ...(tool.features.atsOptimized ? ['ATS-friendly resumes'] : []),
        ...(tool.features.aiSuggestions ? ['AI-powered suggestions'] : []),
        ...(tool.features.templates > 50 ? ['Template variety'] : []),
        ...(tool.features.collaboration ? ['Team collaboration'] : []),
      ],
    }))

    // Generate insights
    const insights = [
      `${tools.filter(t => t.features.atsOptimized).length} out of ${tools.length} tools are ATS-optimized`,
      `Average template count: ${Math.round(tools.reduce((sum, t) => sum + (t.features.templates || 0), 0) / tools.length)}`,
      `${tools.filter(t => t.features.aiSuggestions).length} tools offer AI suggestions`,
    ]

    return {
      winner: {
        overall: winner.id,
        categories,
      },
      recommendations,
      insights,
    }
  }, [])

  // Memoized computed values
  const canAddMore = useMemo(() => 
    state.selectedTools.length < maxTools, 
    [state.selectedTools.length, maxTools]
  )

  const canCompare = useMemo(() => 
    state.selectedTools.length >= 2, 
    [state.selectedTools.length]
  )

  const isToolSelected = useCallback((toolId: string) => 
    state.selectedTools.includes(toolId), 
    [state.selectedTools]
  )

  // Export comparison data
  const exportComparison = useCallback(() => {
    if (!state.comparisonData) return

    const dataStr = JSON.stringify(state.comparisonData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `tool-comparison-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }, [state.comparisonData])

  // Share comparison
  const shareComparison = useCallback(async () => {
    if (!state.comparisonData) return

    const toolNames = state.comparisonData.tools.map(t => t.name).join(' vs ')
    const shareData = {
      title: `AI Resume Builder Comparison: ${toolNames}`,
      text: `Compare ${toolNames} - See which AI resume builder is best for you!`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log('Share cancelled or failed:', error)
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url)
        // You might want to show a toast notification here
      } catch (error) {
        console.error('Failed to copy to clipboard:', error)
      }
    }
  }, [state.comparisonData])

  return {
    // State
    selectedTools: state.selectedTools,
    comparisonData: state.comparisonData,
    loading: state.loading,
    error: state.error,

    // Actions
    addTool,
    removeTool,
    toggleTool,
    clearAll,
    fetchComparison,

    // Utilities
    canAddMore,
    canCompare,
    isToolSelected,
    generateMatrix,
    generateSummary,
    exportComparison,
    shareComparison,

    // Computed values
    selectedCount: state.selectedTools.length,
    maxTools,
  }
}
