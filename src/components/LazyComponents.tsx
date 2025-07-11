'use client'

import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'

// Loading component for lazy-loaded components
const LoadingSpinner = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="flex items-center justify-center p-8">
    <div className="flex items-center space-x-3">
      <motion.div
        className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <span className="text-gray-600">{message}</span>
    </div>
  </div>
)

// Skeleton loader for comparison table
const ComparisonTableSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="h-6 bg-gray-300 rounded w-1/3"></div>
      </div>
      
      {/* Table content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-3 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

// Skeleton loader for ATS analyzer
const ATSAnalyzerSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-300 rounded"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="h-20 bg-gray-300 rounded"></div>
        <div className="h-20 bg-gray-300 rounded"></div>
      </div>
    </div>
  </div>
)

// Lazy-loaded components
export const LazyComparisonTable = lazy(() => 
  import('./ComparisonTable').then(module => ({ default: module.ComparisonTable }))
)

export const LazyATSAnalyzer = lazy(() => 
  import('./ATSAnalyzer').then(module => ({ default: module.ATSAnalyzer }))
)

export const LazyVirtualizedToolList = lazy(() => 
  import('./VirtualizedToolList').then(module => ({ default: module.VirtualizedToolList }))
)

export const LazyToolSelector = lazy(() => 
  import('./comparison/ToolSelector').then(module => ({ default: module.ToolSelector }))
)

export const LazyComparisonMatrix = lazy(() => 
  import('./comparison/ComparisonMatrix').then(module => ({ default: module.ComparisonMatrix }))
)

export const LazyComparisonFilters = lazy(() => 
  import('./comparison/ComparisonFilters').then(module => ({ default: module.ComparisonFilters }))
)

export const LazyComparisonSummary = lazy(() => 
  import('./comparison/ComparisonSummary').then(module => ({ default: module.ComparisonSummary }))
)

// Wrapper components with suspense and error boundaries
export const ComparisonTableWithSuspense = (props: any) => (
  <Suspense fallback={<ComparisonTableSkeleton />}>
    <LazyComparisonTable {...props} />
  </Suspense>
)

export const ATSAnalyzerWithSuspense = (props: any) => (
  <Suspense fallback={<ATSAnalyzerSkeleton />}>
    <LazyATSAnalyzer {...props} />
  </Suspense>
)

export const VirtualizedToolListWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading tools..." />}>
    <LazyVirtualizedToolList {...props} />
  </Suspense>
)

export const ToolSelectorWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading tool selector..." />}>
    <LazyToolSelector {...props} />
  </Suspense>
)

export const ComparisonMatrixWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading comparison matrix..." />}>
    <LazyComparisonMatrix {...props} />
  </Suspense>
)

export const ComparisonFiltersWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading filters..." />}>
    <LazyComparisonFilters {...props} />
  </Suspense>
)

export const ComparisonSummaryWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading summary..." />}>
    <LazyComparisonSummary {...props} />
  </Suspense>
)

// Higher-order component for lazy loading with error boundary
export function withLazyLoading<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: React.ReactNode,
  errorFallback?: React.ReactNode
) {
  return function LazyLoadedComponent(props: T) {
    return (
      <Suspense fallback={fallback || <LoadingSpinner />}>
        <Component {...props} />
      </Suspense>
    )
  }
}

// Hook for dynamic imports with loading states
export function useDynamicImport<T>(
  importFunc: () => Promise<{ default: T }>,
  deps: React.DependencyList = []
) {
  const [component, setComponent] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    let mounted = true
    
    setLoading(true)
    setError(null)
    
    importFunc()
      .then(module => {
        if (mounted) {
          setComponent(module.default)
          setLoading(false)
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err)
          setLoading(false)
        }
      })
    
    return () => {
      mounted = false
    }
  }, deps)

  return { component, loading, error }
}

// Preload function for critical components
export const preloadComponents = {
  comparisonTable: () => import('./ComparisonTable'),
  atsAnalyzer: () => import('./ATSAnalyzer'),
  virtualizedToolList: () => import('./VirtualizedToolList'),
}

// Preload critical components on user interaction
export const preloadOnHover = (componentName: keyof typeof preloadComponents) => {
  return {
    onMouseEnter: () => preloadComponents[componentName](),
    onFocus: () => preloadComponents[componentName](),
  }
}
