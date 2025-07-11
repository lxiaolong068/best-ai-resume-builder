'use client'

import React, { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { 
  initGA, 
  trackPageView, 
  initScrollTracking, 
  initTimeTracking,
  trackCustomEvent 
} from '@/lib/analytics'

interface AnalyticsProps {
  children: React.ReactNode
}

export function Analytics({ children }: AnalyticsProps) {
  const pathname = usePathname()

  useEffect(() => {
    // Initialize Google Analytics
    if (process.env.NODE_ENV === 'production') {
      initGA()
    }
  }, [])

  useEffect(() => {
    // Track page view
    if (process.env.NODE_ENV === 'production') {
      trackPageView(window.location.href, document.title)
    }

    // Track custom page view event
    trackCustomEvent('page_view', {
      page: pathname,
      title: document.title,
      referrer: document.referrer
    })

    // Initialize scroll and time tracking
    const cleanupScroll = initScrollTracking(pathname)
    const cleanupTime = initTimeTracking(pathname)

    // Cleanup on unmount
    return () => {
      if (cleanupScroll) cleanupScroll()
      if (cleanupTime) cleanupTime()
    }
  }, [pathname])

  return <>{children}</>
}

// Hook for tracking events in components
export function useAnalytics() {
  return {
    trackEvent: trackCustomEvent,
    trackPageView,
  }
}

// Component for tracking specific interactions
export function TrackableButton({
  children,
  onClick,
  eventType,
  eventData,
  className,
  ...props
}: {
  children: React.ReactNode
  onClick?: () => void
  eventType: string
  eventData?: Record<string, any>
  className?: string
  [key: string]: any
}) {
  const handleClick = () => {
    // Track the event
    trackCustomEvent(eventType, eventData || {})
    
    // Call original onClick if provided
    if (onClick) {
      onClick()
    }
  }

  return (
    <button
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}

// Component for tracking link clicks
export function TrackableLink({
  children,
  href,
  eventType,
  eventData,
  className,
  target,
  rel,
  ...props
}: {
  children: React.ReactNode
  href: string
  eventType: string
  eventData?: Record<string, any>
  className?: string
  target?: string
  rel?: string
  [key: string]: any
}) {
  const handleClick = () => {
    // Track the event
    trackCustomEvent(eventType, {
      href,
      target,
      ...eventData
    })
  }

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  )
}

// Component for tracking form submissions
export function TrackableForm({
  children,
  onSubmit,
  eventType,
  eventData,
  className,
  ...props
}: {
  children: React.ReactNode
  onSubmit?: (e: React.FormEvent) => void
  eventType: string
  eventData?: Record<string, any>
  className?: string
  [key: string]: any
}) {
  const handleSubmit = (e: React.FormEvent) => {
    // Track the event
    trackCustomEvent(eventType, eventData || {})
    
    // Call original onSubmit if provided
    if (onSubmit) {
      onSubmit(e)
    }
  }

  return (
    <form
      className={className}
      onSubmit={handleSubmit}
      {...props}
    >
      {children}
    </form>
  )
}

// Component for tracking section views
export function TrackableSection({
  children,
  sectionName,
  eventData,
  className,
  ...props
}: {
  children: React.ReactNode
  sectionName: string
  eventData?: Record<string, any>
  className?: string
  [key: string]: any
}) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            trackCustomEvent('section_view', {
              section: sectionName,
              ...eventData
            })
          }
        })
      },
      { threshold: 0.5 } // Trigger when 50% of the section is visible
    )

    const element = document.getElementById(`section-${sectionName}`)
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [sectionName, eventData])

  return (
    <section
      id={`section-${sectionName}`}
      className={className}
      {...props}
    >
      {children}
    </section>
  )
}

// Error boundary with analytics
export class AnalyticsErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Track error
    trackCustomEvent('javascript_error', {
      error_message: error.message,
      error_stack: error.stack,
      component_stack: errorInfo.componentStack,
      page: window.location.pathname
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              We've been notified about this error and are working to fix it.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Performance monitoring component
export function PerformanceMonitor() {
  useEffect(() => {
    // Monitor Core Web Vitals
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        trackCustomEvent('core_web_vitals', {
          metric: 'LCP',
          value: lastEntry.startTime,
          page: window.location.pathname
        })
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          trackCustomEvent('core_web_vitals', {
            metric: 'FID',
            value: entry.processingStart - entry.startTime,
            page: window.location.pathname
          })
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // Cumulative Layout Shift
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        
        // Track CLS when page is about to unload
        window.addEventListener('beforeunload', () => {
          trackCustomEvent('core_web_vitals', {
            metric: 'CLS',
            value: clsValue,
            page: window.location.pathname
          })
        })
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    }
  }, [])

  return null
}
