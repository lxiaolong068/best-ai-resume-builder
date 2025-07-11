'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// Hook for debouncing values (useful for search inputs)
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook for throttling function calls
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  const lastRan = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout>()

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      const now = Date.now()
      if (now - lastRan.current >= delay) {
        func(...args)
        lastRan.current = now
      } else {
        timeoutRef.current = setTimeout(() => {
          func(...args)
          lastRan.current = Date.now()
        }, delay - (now - lastRan.current))
      }
    }) as T,
    [func, delay]
  )
}

// Hook for intersection observer (lazy loading, infinite scroll)
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const [node, setNode] = useState<Element | null>(null)

  const observer = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (observer.current) observer.current.disconnect()

    observer.current = new IntersectionObserver(([entry]) => {
      setEntry(entry)
    }, options)

    const currentObserver = observer.current

    if (node) currentObserver.observe(node)

    return () => currentObserver.disconnect()
  }, [node, options])

  return [setNode, entry] as const
}

// Hook for virtual scrolling calculations
export function useVirtualScrolling(
  itemCount: number,
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      itemCount - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )

    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, containerHeight, itemCount, overscan])

  const totalHeight = itemCount * itemHeight

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
  }, [])

  return {
    visibleRange,
    totalHeight,
    handleScroll,
    setScrollTop,
  }
}

// Hook for memoizing expensive calculations
export function useExpensiveMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  isExpensive: boolean = true
): T {
  const memoizedValue = useMemo(factory, deps)
  
  // In development, warn about expensive calculations
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && isExpensive) {
      console.log('Expensive calculation executed:', { deps })
    }
  }, deps)

  return memoizedValue
}

// Hook for managing loading states with automatic cleanup
export function useAsyncOperation<T>() {
  const [state, setState] = useState<{
    data: T | null
    loading: boolean
    error: Error | null
  }>({
    data: null,
    loading: false,
    error: null,
  })

  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    if (!mountedRef.current) return

    setState({ data: null, loading: true, error: null })

    try {
      const result = await asyncFunction()
      if (mountedRef.current) {
        setState({ data: result, loading: false, error: null })
      }
    } catch (error) {
      if (mountedRef.current) {
        setState({ data: null, loading: false, error: error as Error })
      }
    }
  }, [])

  return { ...state, execute }
}

// Hook for optimizing re-renders with shallow comparison
export function useShallowMemo<T extends Record<string, any>>(obj: T): T {
  const ref = useRef<T>(obj)

  return useMemo(() => {
    const keys = Object.keys(obj)
    const prevKeys = Object.keys(ref.current)

    if (keys.length !== prevKeys.length) {
      ref.current = obj
      return obj
    }

    for (const key of keys) {
      if (obj[key] !== ref.current[key]) {
        ref.current = obj
        return obj
      }
    }

    return ref.current
  }, [obj])
}

// Hook for batching state updates
export function useBatchedUpdates<T>() {
  const [state, setState] = useState<T | null>(null)
  const batchRef = useRef<Partial<T>>({})
  const timeoutRef = useRef<NodeJS.Timeout>()

  const batchUpdate = useCallback((updates: Partial<T>) => {
    batchRef.current = { ...batchRef.current, ...updates }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setState(prevState => ({ ...prevState, ...batchRef.current } as T))
      batchRef.current = {}
    }, 0)
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return [state, batchUpdate] as const
}

// Hook for measuring component performance
export function usePerformanceMeasure(name: string, enabled: boolean = true) {
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    startTimeRef.current = performance.now()

    return () => {
      const endTime = performance.now()
      const duration = endTime - startTimeRef.current
      
      if (duration > 16) { // Warn if render takes longer than 16ms (60fps)
        console.warn(`Performance warning: ${name} took ${duration.toFixed(2)}ms to render`)
      }
      
      // Send to analytics if needed
      if (window.gtag) {
        window.gtag('event', 'performance_measure', {
          event_category: 'performance',
          event_label: name,
          value: Math.round(duration),
        })
      }
    }
  })
}

// Hook for preloading resources
export function usePreloader() {
  const preloadedResources = useRef<Set<string>>(new Set())

  const preloadImage = useCallback((src: string): Promise<void> => {
    if (preloadedResources.current.has(src)) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        preloadedResources.current.add(src)
        resolve()
      }
      img.onerror = reject
      img.src = src
    })
  }, [])

  const preloadScript = useCallback((src: string): Promise<void> => {
    if (preloadedResources.current.has(src)) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.onload = () => {
        preloadedResources.current.add(src)
        resolve()
      }
      script.onerror = reject
      script.src = src
      document.head.appendChild(script)
    })
  }, [])

  return { preloadImage, preloadScript }
}
