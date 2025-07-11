'use client'

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import type { Tool, ToolFilters, Pagination } from '@/types'

// State interface
interface AppState {
  // Tools data
  tools: Tool[]
  featuredTools: Tool[]
  toolsLoading: boolean
  toolsError: string | null
  toolsPagination: Pagination | null

  // Filters
  filters: ToolFilters
  
  // Comparison
  selectedToolsForComparison: string[]
  comparisonData: any | null
  
  // UI state
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  
  // User preferences
  preferences: {
    itemsPerPage: number
    defaultSort: string
    showFeaturedFirst: boolean
    compactView: boolean
  }
  
  // Search
  searchQuery: string
  searchHistory: string[]
  
  // Analytics
  pageViews: Record<string, number>
  userEvents: any[]
}

// Action types
type AppAction =
  | { type: 'SET_TOOLS'; payload: { tools: Tool[]; pagination?: Pagination } }
  | { type: 'SET_FEATURED_TOOLS'; payload: Tool[] }
  | { type: 'SET_TOOLS_LOADING'; payload: boolean }
  | { type: 'SET_TOOLS_ERROR'; payload: string | null }
  | { type: 'UPDATE_FILTERS'; payload: Partial<ToolFilters> }
  | { type: 'RESET_FILTERS' }
  | { type: 'ADD_TO_COMPARISON'; payload: string }
  | { type: 'REMOVE_FROM_COMPARISON'; payload: string }
  | { type: 'CLEAR_COMPARISON' }
  | { type: 'SET_COMPARISON_DATA'; payload: any }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<AppState['preferences']> }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'ADD_TO_SEARCH_HISTORY'; payload: string }
  | { type: 'CLEAR_SEARCH_HISTORY' }
  | { type: 'TRACK_PAGE_VIEW'; payload: string }
  | { type: 'ADD_USER_EVENT'; payload: any }
  | { type: 'HYDRATE_STATE'; payload: Partial<AppState> }

// Initial state
const initialState: AppState = {
  tools: [],
  featuredTools: [],
  toolsLoading: false,
  toolsError: null,
  toolsPagination: null,
  filters: {
    page: 1,
    limit: 12,
    sortBy: 'rating',
    sortOrder: 'desc',
  },
  selectedToolsForComparison: [],
  comparisonData: null,
  sidebarOpen: false,
  theme: 'system',
  preferences: {
    itemsPerPage: 12,
    defaultSort: 'rating',
    showFeaturedFirst: true,
    compactView: false,
  },
  searchQuery: '',
  searchHistory: [],
  pageViews: {},
  userEvents: [],
}

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_TOOLS':
      return {
        ...state,
        tools: action.payload.tools,
        toolsPagination: action.payload.pagination || null,
        toolsLoading: false,
        toolsError: null,
      }

    case 'SET_FEATURED_TOOLS':
      return {
        ...state,
        featuredTools: action.payload,
      }

    case 'SET_TOOLS_LOADING':
      return {
        ...state,
        toolsLoading: action.payload,
      }

    case 'SET_TOOLS_ERROR':
      return {
        ...state,
        toolsError: action.payload,
        toolsLoading: false,
      }

    case 'UPDATE_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
          // Reset page when filters change (except when changing page)
          page: action.payload.page !== undefined ? action.payload.page : 1,
        },
      }

    case 'RESET_FILTERS':
      return {
        ...state,
        filters: {
          page: 1,
          limit: state.preferences.itemsPerPage,
          sortBy: state.preferences.defaultSort as any,
          sortOrder: 'desc',
        },
      }

    case 'ADD_TO_COMPARISON':
      if (state.selectedToolsForComparison.includes(action.payload)) {
        return state
      }
      if (state.selectedToolsForComparison.length >= 5) {
        return state // Max 5 tools for comparison
      }
      return {
        ...state,
        selectedToolsForComparison: [...state.selectedToolsForComparison, action.payload],
      }

    case 'REMOVE_FROM_COMPARISON':
      return {
        ...state,
        selectedToolsForComparison: state.selectedToolsForComparison.filter(
          id => id !== action.payload
        ),
      }

    case 'CLEAR_COMPARISON':
      return {
        ...state,
        selectedToolsForComparison: [],
        comparisonData: null,
      }

    case 'SET_COMPARISON_DATA':
      return {
        ...state,
        comparisonData: action.payload,
      }

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      }

    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      }

    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload,
        },
      }

    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
      }

    case 'ADD_TO_SEARCH_HISTORY':
      const newHistory = [
        action.payload,
        ...state.searchHistory.filter(item => item !== action.payload),
      ].slice(0, 10) // Keep only last 10 searches
      return {
        ...state,
        searchHistory: newHistory,
      }

    case 'CLEAR_SEARCH_HISTORY':
      return {
        ...state,
        searchHistory: [],
      }

    case 'TRACK_PAGE_VIEW':
      return {
        ...state,
        pageViews: {
          ...state.pageViews,
          [action.payload]: (state.pageViews[action.payload] || 0) + 1,
        },
      }

    case 'ADD_USER_EVENT':
      return {
        ...state,
        userEvents: [...state.userEvents, action.payload].slice(-100), // Keep last 100 events
      }

    case 'HYDRATE_STATE':
      return {
        ...state,
        ...action.payload,
      }

    default:
      return state
  }
}

// Context
interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  
  // Convenience methods
  setTools: (tools: Tool[], pagination?: Pagination) => void
  setFeaturedTools: (tools: Tool[]) => void
  setToolsLoading: (loading: boolean) => void
  setToolsError: (error: string | null) => void
  updateFilters: (filters: Partial<ToolFilters>) => void
  resetFilters: () => void
  addToComparison: (toolId: string) => void
  removeFromComparison: (toolId: string) => void
  clearComparison: () => void
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  updatePreferences: (preferences: Partial<AppState['preferences']>) => void
  setSearchQuery: (query: string) => void
  addToSearchHistory: (query: string) => void
  trackPageView: (page: string) => void
  addUserEvent: (event: any) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Provider component
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedState = localStorage.getItem('app-state')
        if (savedState) {
          const parsed = JSON.parse(savedState)
          dispatch({ type: 'HYDRATE_STATE', payload: parsed })
        }
      } catch (error) {
        console.warn('Failed to load state from localStorage:', error)
      }
    }
  }, [])

  // Save state to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stateToSave = {
          selectedToolsForComparison: state.selectedToolsForComparison,
          theme: state.theme,
          preferences: state.preferences,
          searchHistory: state.searchHistory,
          filters: state.filters,
        }
        localStorage.setItem('app-state', JSON.stringify(stateToSave))
      } catch (error) {
        console.warn('Failed to save state to localStorage:', error)
      }
    }
  }, [
    state.selectedToolsForComparison,
    state.theme,
    state.preferences,
    state.searchHistory,
    state.filters,
  ])

  // Convenience methods
  const setTools = useCallback((tools: Tool[], pagination?: Pagination) => {
    dispatch({ type: 'SET_TOOLS', payload: { tools, pagination } })
  }, [])

  const setFeaturedTools = useCallback((tools: Tool[]) => {
    dispatch({ type: 'SET_FEATURED_TOOLS', payload: tools })
  }, [])

  const setToolsLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_TOOLS_LOADING', payload: loading })
  }, [])

  const setToolsError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_TOOLS_ERROR', payload: error })
  }, [])

  const updateFilters = useCallback((filters: Partial<ToolFilters>) => {
    dispatch({ type: 'UPDATE_FILTERS', payload: filters })
  }, [])

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' })
  }, [])

  const addToComparison = useCallback((toolId: string) => {
    dispatch({ type: 'ADD_TO_COMPARISON', payload: toolId })
  }, [])

  const removeFromComparison = useCallback((toolId: string) => {
    dispatch({ type: 'REMOVE_FROM_COMPARISON', payload: toolId })
  }, [])

  const clearComparison = useCallback(() => {
    dispatch({ type: 'CLEAR_COMPARISON' })
  }, [])

  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' })
  }, [])

  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    dispatch({ type: 'SET_THEME', payload: theme })
  }, [])

  const updatePreferences = useCallback((preferences: Partial<AppState['preferences']>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences })
  }, [])

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query })
  }, [])

  const addToSearchHistory = useCallback((query: string) => {
    if (query.trim()) {
      dispatch({ type: 'ADD_TO_SEARCH_HISTORY', payload: query.trim() })
    }
  }, [])

  const trackPageView = useCallback((page: string) => {
    dispatch({ type: 'TRACK_PAGE_VIEW', payload: page })
  }, [])

  const addUserEvent = useCallback((event: any) => {
    dispatch({ type: 'ADD_USER_EVENT', payload: { ...event, timestamp: Date.now() } })
  }, [])

  const contextValue: AppContextType = {
    state,
    dispatch,
    setTools,
    setFeaturedTools,
    setToolsLoading,
    setToolsError,
    updateFilters,
    resetFilters,
    addToComparison,
    removeFromComparison,
    clearComparison,
    toggleSidebar,
    setTheme,
    updatePreferences,
    setSearchQuery,
    addToSearchHistory,
    trackPageView,
    addUserEvent,
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

// Hook to use the context
export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}

// Selector hooks for specific state slices
export function useTools() {
  const { state } = useAppContext()
  return {
    tools: state.tools,
    loading: state.toolsLoading,
    error: state.toolsError,
    pagination: state.toolsPagination,
  }
}

export function useFilters() {
  const { state, updateFilters, resetFilters } = useAppContext()
  return {
    filters: state.filters,
    updateFilters,
    resetFilters,
  }
}

export function useComparison() {
  const { state, addToComparison, removeFromComparison, clearComparison } = useAppContext()
  return {
    selectedTools: state.selectedToolsForComparison,
    comparisonData: state.comparisonData,
    addToComparison,
    removeFromComparison,
    clearComparison,
    canAddMore: state.selectedToolsForComparison.length < 5,
    canCompare: state.selectedToolsForComparison.length >= 2,
  }
}

export function useTheme() {
  const { state, setTheme } = useAppContext()
  return {
    theme: state.theme,
    setTheme,
  }
}

export function useSearch() {
  const { state, setSearchQuery, addToSearchHistory } = useAppContext()
  return {
    query: state.searchQuery,
    history: state.searchHistory,
    setQuery: setSearchQuery,
    addToHistory: addToSearchHistory,
  }
}
