// Resource optimization utilities and configurations

// Image optimization settings
export const IMAGE_OPTIMIZATION = {
  // Quality settings for different use cases
  QUALITY: {
    HERO: 90,        // High quality for hero images
    CONTENT: 80,     // Good quality for content images
    THUMBNAIL: 75,   // Standard quality for thumbnails
    LOGO: 85,        // Good quality for logos
    AVATAR: 70,      // Lower quality for small avatars
  },
  
  // Size configurations
  SIZES: {
    HERO: '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px',
    CONTENT: '(max-width: 768px) 100vw, 800px',
    THUMBNAIL: '(max-width: 768px) 50vw, 300px',
    LOGO: '48px',
    AVATAR: '(max-width: 768px) 32px, 48px',
  },
  
  // Placeholder configurations
  BLUR_DATA_URLS: {
    LIGHT: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
    DARK: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  }
} as const

// Font optimization settings
export const FONT_OPTIMIZATION = {
  // Preload critical fonts
  PRELOAD_FONTS: [
    {
      href: '/fonts/inter-var.woff2',
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous',
    },
  ],
  
  // Font display strategies
  DISPLAY_STRATEGIES: {
    CRITICAL: 'swap',     // For critical text
    DECORATIVE: 'optional', // For decorative fonts
    FALLBACK: 'fallback',  // For non-critical text
  },
  
  // Font loading optimization
  LOADING: {
    // Use font-display: swap for better performance
    SWAP_FONTS: ['Inter', 'system-ui', 'sans-serif'],
    // Preload critical font subsets
    CRITICAL_SUBSETS: ['latin', 'latin-ext'],
  },
} as const

// CSS optimization
export const CSS_OPTIMIZATION = {
  // Critical CSS patterns
  CRITICAL_PATTERNS: [
    // Above-the-fold styles
    'header', 'nav', 'hero', 'main',
    // Layout styles
    'container', 'grid', 'flex',
    // Typography
    'h1', 'h2', 'h3', 'p', 'text-',
    // Buttons and forms
    'btn', 'button', 'input', 'form',
  ],
  
  // Non-critical CSS (can be loaded asynchronously)
  NON_CRITICAL_PATTERNS: [
    'footer', 'sidebar', 'modal', 'tooltip',
    'animation', 'transition', 'hover:',
  ],
} as const

// JavaScript optimization
export const JS_OPTIMIZATION = {
  // Bundle splitting strategy
  CHUNKS: {
    // Vendor libraries that change infrequently
    VENDOR: ['react', 'react-dom', 'next'],
    // Common utilities used across pages
    COMMON: ['@/lib/', '@/hooks/', '@/utils/'],
    // Page-specific code
    PAGES: ['@/app/', '@/components/'],
  },
  
  // Preloading strategies
  PRELOAD: {
    // Critical scripts to preload
    CRITICAL: ['/js/critical.js'],
    // Scripts to prefetch for next navigation
    PREFETCH: ['/js/analytics.js', '/js/tracking.js'],
  },
} as const

// Resource hints and preloading
export const RESOURCE_HINTS = {
  // DNS prefetch for external domains
  DNS_PREFETCH: [
    'https://www.google-analytics.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://api.convertkit.com',
  ],
  
  // Preconnect to critical origins
  PRECONNECT: [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ],
  
  // Prefetch likely next pages
  PREFETCH_PAGES: [
    '/compare',
    '/tools',
    '/blog',
  ],
} as const

// Performance budgets
export const PERFORMANCE_BUDGETS = {
  // Size budgets (in KB)
  SIZE: {
    TOTAL_JS: 250,      // Total JavaScript bundle size
    TOTAL_CSS: 50,      // Total CSS size
    IMAGES_PER_PAGE: 500, // Images per page
    FONTS: 100,         // Font files
  },
  
  // Timing budgets (in ms)
  TIMING: {
    FCP: 1500,          // First Contentful Paint
    LCP: 2500,          // Largest Contentful Paint
    FID: 100,           // First Input Delay
    CLS: 0.1,           // Cumulative Layout Shift
    TTFB: 600,          // Time to First Byte
  },
} as const

// Utility functions for resource optimization
export class ResourceOptimizer {
  // Generate responsive image srcSet
  static generateSrcSet(baseSrc: string, widths: number[]): string {
    return widths
      .map(width => `${baseSrc}?w=${width} ${width}w`)
      .join(', ')
  }
  
  // Generate blur data URL for images
  static generateBlurDataURL(width: number = 10, height: number = 10): string {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, '#f3f4f6')
      gradient.addColorStop(1, '#e5e7eb')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    }
    
    return canvas.toDataURL('image/jpeg', 0.1)
  }
  
  // Preload critical resources
  static preloadResource(href: string, as: string, type?: string): void {
    if (typeof window === 'undefined') return
    
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as
    if (type) link.type = type
    if (as === 'font') link.crossOrigin = 'anonymous'
    
    document.head.appendChild(link)
  }
  
  // Prefetch next page resources
  static prefetchResource(href: string): void {
    if (typeof window === 'undefined') return
    
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = href
    
    document.head.appendChild(link)
  }
  
  // DNS prefetch for external domains
  static dnsPrefetch(domain: string): void {
    if (typeof window === 'undefined') return
    
    const link = document.createElement('link')
    link.rel = 'dns-prefetch'
    link.href = domain
    
    document.head.appendChild(link)
  }
  
  // Preconnect to critical origins
  static preconnect(origin: string): void {
    if (typeof window === 'undefined') return
    
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = origin
    link.crossOrigin = 'anonymous'
    
    document.head.appendChild(link)
  }
  
  // Initialize resource hints
  static initializeResourceHints(): void {
    // DNS prefetch
    RESOURCE_HINTS.DNS_PREFETCH.forEach(domain => {
      this.dnsPrefetch(domain)
    })
    
    // Preconnect
    RESOURCE_HINTS.PRECONNECT.forEach(origin => {
      this.preconnect(origin)
    })
    
    // Preload critical fonts
    FONT_OPTIMIZATION.PRELOAD_FONTS.forEach(font => {
      this.preloadResource(font.href, font.as, font.type)
    })
  }
  
  // Check if resource should be preloaded based on user interaction
  static shouldPreload(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    
    // Preload if element is within 2 viewport heights
    return rect.top < viewportHeight * 2
  }
  
  // Lazy load images with intersection observer
  static lazyLoadImages(selector: string = 'img[data-src]'): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return
    
    const images = document.querySelectorAll(selector)
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          const src = img.dataset.src
          
          if (src) {
            img.src = src
            img.removeAttribute('data-src')
            imageObserver.unobserve(img)
          }
        }
      })
    }, {
      rootMargin: '50px 0px', // Start loading 50px before entering viewport
    })
    
    images.forEach(img => imageObserver.observe(img))
  }
}

// Performance monitoring
export class PerformanceMonitor {
  // Measure Core Web Vitals
  static measureWebVitals(): void {
    if (typeof window === 'undefined') return
    
    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      console.log('LCP:', lastEntry.startTime)
      
      // Send to analytics
      if (window.gtag) {
        window.gtag('event', 'web_vitals', {
          event_category: 'performance',
          event_label: 'LCP',
          value: Math.round(lastEntry.startTime),
        })
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] })
    
    // First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        console.log('FID:', entry.processingStart - entry.startTime)
        
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            event_category: 'performance',
            event_label: 'FID',
            value: Math.round(entry.processingStart - entry.startTime),
          })
        }
      })
    }).observe({ entryTypes: ['first-input'] })
    
    // Cumulative Layout Shift
    let clsValue = 0
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      
      console.log('CLS:', clsValue)
      
      if (window.gtag) {
        window.gtag('event', 'web_vitals', {
          event_category: 'performance',
          event_label: 'CLS',
          value: Math.round(clsValue * 1000),
        })
      }
    }).observe({ entryTypes: ['layout-shift'] })
  }
  
  // Monitor bundle sizes
  static monitorBundleSizes(): void {
    if (typeof window === 'undefined') return
    
    const scripts = document.querySelectorAll('script[src]')
    let totalSize = 0
    
    scripts.forEach(script => {
      const src = (script as HTMLScriptElement).src
      if (src.includes('/_next/static/')) {
        // Estimate size based on typical Next.js bundle patterns
        totalSize += 50 // KB estimate
      }
    })
    
    if (totalSize > PERFORMANCE_BUDGETS.SIZE.TOTAL_JS) {
      console.warn(`Bundle size (${totalSize}KB) exceeds budget (${PERFORMANCE_BUDGETS.SIZE.TOTAL_JS}KB)`)
    }
  }
}
