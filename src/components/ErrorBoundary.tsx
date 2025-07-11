'use client'

import { Component, ReactNode } from 'react'
import { trackError } from '@/lib/analytics'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: any) => void
  resetOnPropsChange?: boolean
  resetKeys?: Array<string | number>
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: any
  eventId?: string
}

// Default error fallback component
const DefaultErrorFallback = ({ 
  error, 
  resetError, 
  eventId 
}: { 
  error?: Error
  resetError?: () => void
  eventId?: string 
}) => (
  <div className="min-h-[400px] flex items-center justify-center p-8">
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-red-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex-shrink-0">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Something went wrong
          </h3>
          <p className="text-sm text-gray-600">
            We're sorry, but something unexpected happened.
          </p>
        </div>
      </div>
      
      {process.env.NODE_ENV === 'development' && error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm font-medium text-red-800 mb-1">Error Details:</p>
          <p className="text-xs text-red-700 font-mono break-all">
            {error.message}
          </p>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-3">
        {resetError && (
          <button
            onClick={resetError}
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Try Again
          </button>
        )}
        <button
          onClick={() => window.location.reload()}
          className="flex-1 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        >
          Reload Page
        </button>
      </div>
      
      {eventId && (
        <p className="mt-4 text-xs text-gray-500 text-center">
          Error ID: {eventId}
        </p>
      )}
    </div>
  </div>
)

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null

  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      eventId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
    
    // Track error for analytics
    trackError(
      error.message, 
      'boundary', 
      typeof window !== 'undefined' ? window.location.pathname : 'unknown'
    )
    
    // Store error info
    this.setState({ errorInfo })
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
    
    // Send error to external service (e.g., Sentry)
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      })
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetOnPropsChange, resetKeys } = this.props
    const { hasError } = this.state
    
    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetOnPropsChange) {
        this.resetErrorBoundary()
      }
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
    
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      eventId: undefined 
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      
      return (
        <DefaultErrorFallback
          error={this.state.error}
          resetError={this.resetErrorBoundary}
          eventId={this.state.eventId}
        />
      )
    }

    return this.props.children
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  errorFallback?: ReactNode,
  onError?: (error: Error, errorInfo: any) => void
) {
  const WrappedComponent = (props: T) => (
    <ErrorBoundary fallback={errorFallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Hook for error boundary functionality in functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    console.error('Error handled:', error, errorInfo)
    
    // Track error
    trackError(
      error.message,
      'handler',
      typeof window !== 'undefined' ? window.location.pathname : 'unknown'
    )
    
    // Send to external service
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error)
    }
  }
}

// Async error boundary for handling promise rejections
export class AsyncErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidMount() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection)
  }

  componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection)
  }

  handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.error('Unhandled promise rejection:', event.reason)
    
    // Track the error
    trackError(
      event.reason?.message || 'Unhandled promise rejection',
      'async',
      window.location.pathname
    )
    
    // Prevent the default browser behavior
    event.preventDefault()
    
    // Update state to show error UI
    this.setState({
      hasError: true,
      error: new Error(event.reason?.message || 'Async operation failed'),
    })
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Async error caught:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <DefaultErrorFallback
          error={this.state.error}
          resetError={() => this.setState({ hasError: false, error: undefined })}
        />
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
