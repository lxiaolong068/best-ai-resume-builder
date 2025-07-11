'use client'

import { useEffect } from 'react'

// Core Web Vitals thresholds
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  FID: { good: 100, poor: 300 },   // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  TTFB: { good: 800, poor: 1800 }  // Time to First Byte
}

interface WebVital {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  navigationType?: string
}

export function WebVitalsMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Import web-vitals library dynamically
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      // Monitor Largest Contentful Paint
      onLCP((metric) => {
        reportWebVital({
          name: 'LCP',
          value: metric.value,
          rating: getRating('LCP', metric.value),
          delta: metric.delta,
          id: metric.id,
          navigationType: metric.navigationType
        })
      })

      // Monitor First Input Delay
      onFID((metric) => {
        reportWebVital({
          name: 'FID',
          value: metric.value,
          rating: getRating('FID', metric.value),
          delta: metric.delta,
          id: metric.id,
          navigationType: metric.navigationType
        })
      })

      // Monitor Cumulative Layout Shift
      onCLS((metric) => {
        reportWebVital({
          name: 'CLS',
          value: metric.value,
          rating: getRating('CLS', metric.value),
          delta: metric.delta,
          id: metric.id,
          navigationType: metric.navigationType
        })
      })

      // Monitor First Contentful Paint
      onFCP((metric) => {
        reportWebVital({
          name: 'FCP',
          value: metric.value,
          rating: getRating('FCP', metric.value),
          delta: metric.delta,
          id: metric.id,
          navigationType: metric.navigationType
        })
      })

      // Monitor Time to First Byte
      onTTFB((metric) => {
        reportWebVital({
          name: 'TTFB',
          value: metric.value,
          rating: getRating('TTFB', metric.value),
          delta: metric.delta,
          id: metric.id,
          navigationType: metric.navigationType
        })
      })
    }).catch(error => {
      console.warn('Failed to load web-vitals library:', error)
    })

    // Monitor additional performance metrics
    monitorAdditionalMetrics()
    
    // Monitor resource loading
    monitorResourceLoading()
    
    // Monitor long tasks
    monitorLongTasks()

  }, [])

  return null // This component doesn't render anything
}

// Get rating based on thresholds
function getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[metric as keyof typeof THRESHOLDS]
  if (!threshold) return 'good'
  
  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

// Report web vital to analytics
function reportWebVital(vital: WebVital) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`${vital.name}: ${vital.value}ms (${vital.rating})`)
  }

  // Send to Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', vital.name, {
      event_category: 'Web Vitals',
      event_label: vital.id,
      value: Math.round(vital.name === 'CLS' ? vital.value * 1000 : vital.value),
      custom_map: {
        metric_rating: vital.rating,
        metric_value: vital.value,
        metric_delta: vital.delta,
        navigation_type: vital.navigationType
      }
    })
  }

  // Send to custom analytics endpoint
  fetch('/api/analytics/web-vitals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      metric: vital.name,
      value: vital.value,
      rating: vital.rating,
      delta: vital.delta,
      id: vital.id,
      navigationType: vital.navigationType,
      url: window.location.pathname,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    })
  }).catch(error => {
    console.warn('Failed to send web vital to analytics:', error)
  })
}

// Monitor additional performance metrics
function monitorAdditionalMetrics() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

  // Monitor navigation timing
  const navigationObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    entries.forEach(entry => {
      if (entry.entryType === 'navigation') {
        const navEntry = entry as PerformanceNavigationTiming
        
        // Calculate additional metrics
        const metrics = {
          domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
          domComplete: navEntry.domComplete - navEntry.navigationStart,
          loadComplete: navEntry.loadEventEnd - navEntry.navigationStart,
          redirectTime: navEntry.redirectEnd - navEntry.redirectStart,
          dnsTime: navEntry.domainLookupEnd - navEntry.domainLookupStart,
          connectTime: navEntry.connectEnd - navEntry.connectStart,
          requestTime: navEntry.responseStart - navEntry.requestStart,
          responseTime: navEntry.responseEnd - navEntry.responseStart,
          renderTime: navEntry.domComplete - navEntry.responseEnd
        }

        // Report significant metrics
        Object.entries(metrics).forEach(([name, value]) => {
          if (value > 0) {
            reportCustomMetric(name, value)
          }
        })
      }
    })
  })

  navigationObserver.observe({ entryTypes: ['navigation'] })

  // Monitor paint timing
  const paintObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    entries.forEach(entry => {
      reportCustomMetric(entry.name.replace('-', '_'), entry.startTime)
    })
  })

  paintObserver.observe({ entryTypes: ['paint'] })
}

// Monitor resource loading performance
function monitorResourceLoading() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

  const resourceObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    entries.forEach(entry => {
      const resourceEntry = entry as PerformanceResourceTiming
      
      // Monitor slow resources
      if (resourceEntry.duration > 1000) { // Resources taking more than 1 second
        reportCustomMetric('slow_resource', resourceEntry.duration, {
          resource_name: resourceEntry.name,
          resource_type: getResourceType(resourceEntry.name),
          transfer_size: resourceEntry.transferSize
        })
      }
    })
  })

  resourceObserver.observe({ entryTypes: ['resource'] })
}

// Monitor long tasks that block the main thread
function monitorLongTasks() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

  const longTaskObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    entries.forEach(entry => {
      if (entry.duration > 50) { // Tasks longer than 50ms
        reportCustomMetric('long_task', entry.duration, {
          task_start: entry.startTime,
          task_duration: entry.duration
        })
      }
    })
  })

  try {
    longTaskObserver.observe({ entryTypes: ['longtask'] })
  } catch (error) {
    // Long task API not supported
    console.warn('Long task monitoring not supported:', error)
  }
}

// Report custom metrics
function reportCustomMetric(name: string, value: number, additionalData?: Record<string, any>) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Custom metric ${name}: ${value}ms`, additionalData)
  }

  // Send to Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'custom_metric', {
      event_category: 'Performance',
      event_label: name,
      value: Math.round(value),
      custom_map: additionalData
    })
  }
}

// Get resource type from URL
function getResourceType(url: string): string {
  if (url.includes('.js')) return 'script'
  if (url.includes('.css')) return 'stylesheet'
  if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image'
  if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font'
  if (url.includes('/api/')) return 'api'
  return 'other'
}

// Performance budget monitoring
export function checkPerformanceBudget() {
  if (typeof window === 'undefined') return

  const budget = {
    LCP: 2500,
    FID: 100,
    CLS: 0.1,
    totalJSSize: 500 * 1024, // 500KB
    totalCSSSize: 100 * 1024, // 100KB
    totalImageSize: 1000 * 1024 // 1MB
  }

  // Check resource sizes
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  let totalJS = 0
  let totalCSS = 0
  let totalImages = 0

  resources.forEach(resource => {
    const type = getResourceType(resource.name)
    const size = resource.transferSize || 0

    switch (type) {
      case 'script':
        totalJS += size
        break
      case 'stylesheet':
        totalCSS += size
        break
      case 'image':
        totalImages += size
        break
    }
  })

  // Report budget violations
  const violations = []
  if (totalJS > budget.totalJSSize) violations.push(`JS: ${Math.round(totalJS / 1024)}KB > ${Math.round(budget.totalJSSize / 1024)}KB`)
  if (totalCSS > budget.totalCSSSize) violations.push(`CSS: ${Math.round(totalCSS / 1024)}KB > ${Math.round(budget.totalCSSSize / 1024)}KB`)
  if (totalImages > budget.totalImageSize) violations.push(`Images: ${Math.round(totalImages / 1024)}KB > ${Math.round(budget.totalImageSize / 1024)}KB`)

  if (violations.length > 0) {
    console.warn('Performance budget violations:', violations)
    
    // Report to analytics
    if (window.gtag) {
      window.gtag('event', 'performance_budget_violation', {
        event_category: 'Performance',
        event_label: violations.join(', '),
        value: violations.length
      })
    }
  }
}
