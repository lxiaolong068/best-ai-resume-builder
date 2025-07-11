'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { apiRequest, ApiError } from '@/lib/api-response'

interface UseApiDataOptions<T> {
  initialData?: T
  enabled?: boolean
  refetchOnWindowFocus?: boolean
  refetchInterval?: number
  retryCount?: number
  retryDelay?: number
  onSuccess?: (data: T) => void
  onError?: (error: ApiError) => void
  transform?: (data: any) => T
}

interface UseApiDataResult<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
  refetch: () => Promise<void>
  mutate: (newData: T | ((prevData: T | null) => T)) => void
  reset: () => void
}

export function useApiData<T = any>(
  url: string | null,
  options: UseApiDataOptions<T> = {}
): UseApiDataResult<T> {
  const {
    initialData = null,
    enabled = true,
    refetchOnWindowFocus = false,
    refetchInterval,
    retryCount = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    transform,
  } = options

  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const retryCountRef = useRef(0)
  const intervalRef = useRef<NodeJS.Timeout>()
  const mountedRef = useRef(true)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Fetch function
  const fetchData = useCallback(async (isRetry = false) => {
    if (!url || !enabled) return

    if (!isRetry) {
      setLoading(true)
      setError(null)
      retryCountRef.current = 0
    }

    try {
      const response = await apiRequest<T>(url)
      const transformedData = transform ? transform(response) : response

      if (mountedRef.current) {
        setData(transformedData)
        setLoading(false)
        setError(null)
        retryCountRef.current = 0
        onSuccess?.(transformedData)
      }
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(
        'INTERNAL_ERROR',
        err instanceof Error ? err.message : 'Unknown error occurred'
      )

      if (mountedRef.current) {
        // Retry logic
        if (retryCountRef.current < retryCount) {
          retryCountRef.current++
          setTimeout(() => {
            if (mountedRef.current) {
              fetchData(true)
            }
          }, retryDelay * retryCountRef.current)
          return
        }

        setError(apiError)
        setLoading(false)
        onError?.(apiError)
      }
    }
  }, [url, enabled, retryCount, retryDelay, onSuccess, onError, transform])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Refetch interval
  useEffect(() => {
    if (refetchInterval && enabled && url) {
      intervalRef.current = setInterval(() => {
        fetchData()
      }, refetchInterval)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [refetchInterval, enabled, url, fetchData])

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return

    const handleFocus = () => {
      if (enabled && url) {
        fetchData()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refetchOnWindowFocus, enabled, url, fetchData])

  // Manual refetch
  const refetch = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  // Mutate data locally
  const mutate = useCallback((newData: T | ((prevData: T | null) => T)) => {
    setData(prevData => {
      if (typeof newData === 'function') {
        return (newData as (prevData: T | null) => T)(prevData)
      }
      return newData
    })
  }, [])

  // Reset state
  const reset = useCallback(() => {
    setData(initialData)
    setLoading(false)
    setError(null)
    retryCountRef.current = 0
  }, [initialData])

  return {
    data,
    loading,
    error,
    refetch,
    mutate,
    reset,
  }
}

// Specialized hooks for common use cases
export function useTools(filters?: any) {
  const queryString = filters ? `?${new URLSearchParams(filters).toString()}` : ''
  return useApiData(`/api/tools${queryString}`, {
    refetchOnWindowFocus: true,
  })
}

export function useTool(id: string | null) {
  return useApiData(id ? `/api/tools/${id}` : null, {
    enabled: !!id,
  })
}

export function useToolComparison(toolIds: string[]) {
  return useApiData(
    toolIds.length >= 2 ? '/api/tools/compare' : null,
    {
      enabled: toolIds.length >= 2,
      transform: (data) => data,
    }
  )
}

// Hook for mutations (POST, PUT, DELETE)
interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: ApiError, variables: TVariables) => void
  onSettled?: (data: TData | null, error: ApiError | null, variables: TVariables) => void
}

interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>
  mutateAsync: (variables: TVariables) => Promise<TData>
  data: TData | null
  loading: boolean
  error: ApiError | null
  reset: () => void
}

export function useMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TVariables> = {}
): UseMutationResult<TData, TVariables> {
  const { onSuccess, onError, onSettled } = options

  const [data, setData] = useState<TData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const mutateAsync = useCallback(async (variables: TVariables): Promise<TData> => {
    setLoading(true)
    setError(null)

    try {
      const result = await mutationFn(variables)
      setData(result)
      setLoading(false)
      onSuccess?.(result, variables)
      onSettled?.(result, null, variables)
      return result
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(
        'INTERNAL_ERROR',
        err instanceof Error ? err.message : 'Mutation failed'
      )
      
      setError(apiError)
      setLoading(false)
      onError?.(apiError, variables)
      onSettled?.(null, apiError, variables)
      throw apiError
    }
  }, [mutationFn, onSuccess, onError, onSettled])

  const mutate = useCallback((variables: TVariables) => {
    mutateAsync(variables).catch(() => {
      // Error is already handled in mutateAsync
    })
    return mutateAsync(variables)
  }, [mutateAsync])

  const reset = useCallback(() => {
    setData(null)
    setLoading(false)
    setError(null)
  }, [])

  return {
    mutate,
    mutateAsync,
    data,
    loading,
    error,
    reset,
  }
}

// Specialized mutation hooks
export function useCreateTool() {
  return useMutation(async (toolData: any) => {
    return apiRequest('/api/tools', {
      method: 'POST',
      body: JSON.stringify(toolData),
    })
  })
}

export function useUpdateTool() {
  return useMutation(async ({ id, ...toolData }: any) => {
    return apiRequest(`/api/tools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toolData),
    })
  })
}

export function useDeleteTool() {
  return useMutation(async (id: string) => {
    return apiRequest(`/api/tools/${id}`, {
      method: 'DELETE',
    })
  })
}

// Hook for infinite loading/pagination
interface UseInfiniteDataOptions<T> extends UseApiDataOptions<T> {
  getNextPageParam?: (lastPage: T, allPages: T[]) => string | null
  initialPageParam?: string
}

export function useInfiniteData<T = any>(
  getUrl: (pageParam: string) => string,
  options: UseInfiniteDataOptions<T> = {}
) {
  const { getNextPageParam, initialPageParam = '1', ...restOptions } = options

  const [pages, setPages] = useState<T[]>([])
  const [hasNextPage, setHasNextPage] = useState(true)
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false)
  const [nextPageParam, setNextPageParam] = useState(initialPageParam)

  const { data, loading, error, refetch } = useApiData(
    getUrl(nextPageParam),
    restOptions
  )

  // Add new page data
  useEffect(() => {
    if (data && !loading) {
      setPages(prev => {
        const newPages = [...prev, data]
        const nextParam = getNextPageParam?.(data, newPages)
        setHasNextPage(!!nextParam)
        if (nextParam) {
          setNextPageParam(nextParam)
        }
        return newPages
      })
      setIsFetchingNextPage(false)
    }
  }, [data, loading, getNextPageParam])

  const fetchNextPage = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return

    setIsFetchingNextPage(true)
    await refetch()
  }, [hasNextPage, isFetchingNextPage, refetch])

  return {
    data: pages,
    loading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  }
}
