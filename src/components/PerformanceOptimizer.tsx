'use client'

import { useEffect } from 'react'

// Performance optimization utilities
export function PerformanceOptimizer() {
  useEffect(() => {
    // Preload critical resources
    preloadCriticalResources()
    
    // Optimize images
    optimizeImages()
    
    // Implement lazy loading for non-critical content
    implementLazyLoading()
    
    // Monitor Core Web Vitals
    monitorCoreWebVitals()
    
  }, [])

  return null // This component doesn't render anything
}

// Preload critical resources
function preloadCriticalResources() {
  if (typeof window === 'undefined') return

  // Preload critical fonts
  const fontPreloads = [
    '/fonts/inter-var.woff2',
    '/fonts/inter-bold.woff2'
  ]

  fontPreloads.forEach(font => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = font
    link.as = 'font'
    link.type = 'font/woff2'
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })

  // Preload critical API endpoints
  const criticalEndpoints = [
    '/api/tools?limit=8',
    '/api/stats'
  ]

  criticalEndpoints.forEach(endpoint => {
    fetch(endpoint, { method: 'GET' }).catch(() => {
      // Silently fail - this is just for preloading
    })
  })
}

// Optimize images with lazy loading and WebP support
function optimizeImages() {
  if (typeof window === 'undefined') return

  // Add intersection observer for lazy loading
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        if (img.dataset.src) {
          img.src = img.dataset.src
          img.classList.remove('lazy')
          imageObserver.unobserve(img)
        }
      }
    })
  })

  // Observe all lazy images
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img)
  })
}

// Implement lazy loading for non-critical content
function implementLazyLoading() {
  if (typeof window === 'undefined') return

  // Lazy load non-critical sections
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const section = entry.target as HTMLElement
        section.classList.add('loaded')
        sectionObserver.unobserve(section)
      }
    })
  }, {
    rootMargin: '50px'
  })

  // Observe sections marked for lazy loading
  document.querySelectorAll('.lazy-section').forEach(section => {
    sectionObserver.observe(section)
  })
}

// Monitor Core Web Vitals
function monitorCoreWebVitals() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

  // Largest Contentful Paint (LCP)
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    const lastEntry = entries[entries.length - 1]
    
    // Track LCP
    if (window.gtag) {
      window.gtag('event', 'web_vitals', {
        event_category: 'Web Vitals',
        event_label: 'LCP',
        value: Math.round(lastEntry.startTime),
        custom_map: { metric_value: lastEntry.startTime }
      })
    }
  })
  lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

  // First Input Delay (FID)
  const fidObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    entries.forEach(entry => {
      const fid = entry.processingStart - entry.startTime
      
      if (window.gtag) {
        window.gtag('event', 'web_vitals', {
          event_category: 'Web Vitals',
          event_label: 'FID',
          value: Math.round(fid),
          custom_map: { metric_value: fid }
        })
      }
    })
  })
  fidObserver.observe({ entryTypes: ['first-input'] })

  // Cumulative Layout Shift (CLS)
  let clsValue = 0
  const clsObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    entries.forEach(entry => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value
      }
    })
  })
  clsObserver.observe({ entryTypes: ['layout-shift'] })

  // Report CLS on page unload
  window.addEventListener('beforeunload', () => {
    if (window.gtag) {
      window.gtag('event', 'web_vitals', {
        event_category: 'Web Vitals',
        event_label: 'CLS',
        value: Math.round(clsValue * 1000),
        custom_map: { metric_value: clsValue }
      })
    }
  })
}

// Utility function to optimize third-party scripts
export function optimizeThirdPartyScripts() {
  if (typeof window === 'undefined') return

  // Delay non-critical third-party scripts
  const delayedScripts = [
    'https://www.googletagmanager.com/gtag/js',
    // Add other non-critical scripts here
  ]

  // Load scripts after user interaction or after 3 seconds
  let userInteracted = false
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
  
  const loadDelayedScripts = () => {
    if (userInteracted) return
    userInteracted = true

    delayedScripts.forEach(src => {
      const script = document.createElement('script')
      script.src = src
      script.async = true
      document.head.appendChild(script)
    })

    // Remove event listeners
    events.forEach(event => {
      window.removeEventListener(event, loadDelayedScripts)
    })
  }

  // Load on user interaction
  events.forEach(event => {
    window.addEventListener(event, loadDelayedScripts, { once: true, passive: true })
  })

  // Fallback: load after 3 seconds
  setTimeout(loadDelayedScripts, 3000)
}

// Resource hints for better performance
export function addResourceHints() {
  if (typeof window === 'undefined') return

  const hints = [
    // DNS prefetch for external domains
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: '//www.googletagmanager.com' },
    { rel: 'dns-prefetch', href: '//www.google-analytics.com' },
    
    // Preconnect to critical external resources
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
    
    // Prefetch likely next pages
    { rel: 'prefetch', href: '/compare' },
    { rel: 'prefetch', href: '/ats-analyzer' },
    { rel: 'prefetch', href: '/blog' }
  ]

  hints.forEach(hint => {
    const link = document.createElement('link')
    link.rel = hint.rel
    link.href = hint.href
    if (hint.crossOrigin) link.crossOrigin = hint.crossOrigin
    document.head.appendChild(link)
  })
}

// Service Worker registration for caching
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration)
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}

// Critical CSS inlining utility
export function inlineCriticalCSS() {
  if (typeof window === 'undefined') return

  // This would typically be done at build time
  // Here we're just ensuring critical styles are loaded first
  const criticalStyles = `
    /* Critical above-the-fold styles */
    .hero-section { display: block; }
    .navigation { display: flex; }
    .loading-spinner { animation: spin 1s linear infinite; }
  `

  const style = document.createElement('style')
  style.textContent = criticalStyles
  document.head.insertBefore(style, document.head.firstChild)
}

// Image optimization utilities
export function optimizeImageLoading() {
  if (typeof window === 'undefined') return

  // Add loading="lazy" to images below the fold
  const images = document.querySelectorAll('img')
  images.forEach((img, index) => {
    if (index > 2) { // Skip first 3 images (likely above the fold)
      img.loading = 'lazy'
    }
  })

  // Add WebP support detection
  const supportsWebP = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
  }

  if (supportsWebP()) {
    document.documentElement.classList.add('webp-support')
  }
}

// Bundle splitting and code splitting utilities
export function implementCodeSplitting() {
  // This is typically handled by Next.js automatically
  // But we can add dynamic imports for heavy components
  
  const loadHeavyComponent = async () => {
    const { default: HeavyComponent } = await import('./HeavyComponent')
    return HeavyComponent
  }

  return { loadHeavyComponent }
}

// Performance monitoring and reporting
export function setupPerformanceMonitoring() {
  if (typeof window === 'undefined') return

  // Monitor long tasks
  if ('PerformanceObserver' in window) {
    const longTaskObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        if (entry.duration > 50) { // Tasks longer than 50ms
          console.warn('Long task detected:', entry.duration)
          
          if (window.gtag) {
            window.gtag('event', 'long_task', {
              event_category: 'Performance',
              event_label: 'Long Task',
              value: Math.round(entry.duration)
            })
          }
        }
      })
    })
    longTaskObserver.observe({ entryTypes: ['longtask'] })
  }

  // Monitor memory usage (if available)
  if ('memory' in performance) {
    const memoryInfo = (performance as any).memory
    console.log('Memory usage:', {
      used: Math.round(memoryInfo.usedJSHeapSize / 1048576),
      total: Math.round(memoryInfo.totalJSHeapSize / 1048576),
      limit: Math.round(memoryInfo.jsHeapSizeLimit / 1048576)
    })
  }
}
