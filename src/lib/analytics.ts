// Analytics and tracking utilities for user behavior monitoring

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

// IP address anonymization for privacy compliance
export const anonymizeIP = (ip: string): string => {
  if (!ip) return 'anonymous'

  // IPv4 anonymization - mask last octet
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
  const ipv4Match = ip.match(ipv4Regex)
  if (ipv4Match) {
    return `${ipv4Match[1]}.${ipv4Match[2]}.${ipv4Match[3]}.0`
  }

  // IPv6 anonymization - mask last 64 bits
  const ipv6Regex = /^([0-9a-fA-F:]+)$/
  if (ipv6Regex.test(ip)) {
    const parts = ip.split(':')
    if (parts.length >= 4) {
      return parts.slice(0, 4).join(':') + '::0'
    }
  }

  return 'anonymous'
}

// Get anonymized client IP from request headers
export const getAnonymizedClientIP = (request: Request): string => {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  let clientIP = null

  if (forwarded) {
    clientIP = forwarded.split(',')[0].trim()
  } else if (realIp) {
    clientIP = realIp
  } else if (cfConnectingIp) {
    clientIP = cfConnectingIp
  }

  return anonymizeIP(clientIP || 'unknown')
}

// Google Analytics 4 configuration
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || ''

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window === 'undefined' || !GA_TRACKING_ID) return

  // Load gtag script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`
  document.head.appendChild(script)

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  
  window.gtag('js', new Date())
  window.gtag('config', GA_TRACKING_ID, {
    page_title: document.title,
    page_location: window.location.href,
  })
}

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('config', GA_TRACKING_ID, {
    page_title: title || document.title,
    page_location: url,
  })
}

// Custom event tracking
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number,
  customParameters?: Record<string, any>
) => {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
    ...customParameters,
  })
}

// Specific tracking functions for our use cases

// Tool comparison tracking
export const trackToolComparison = (toolIds: string[], toolNames: string[]) => {
  trackEvent('compare_tools', 'engagement', `${toolNames.join(' vs ')}`, toolIds.length, {
    tool_ids: toolIds.join(','),
    tool_names: toolNames.join(','),
    comparison_count: toolIds.length,
  })
}

// Tool click tracking (affiliate links)
export const trackToolClick = (toolName: string, toolId: string, linkType: 'affiliate' | 'website' = 'affiliate') => {
  trackEvent('tool_click', 'conversion', toolName, undefined, {
    tool_id: toolId,
    tool_name: toolName,
    link_type: linkType,
  })
}

// Search tracking
export const trackSearch = (searchTerm: string, resultsCount: number) => {
  trackEvent('search', 'engagement', searchTerm, resultsCount, {
    search_term: searchTerm,
    results_count: resultsCount,
  })
}

// Filter usage tracking
export const trackFilterUsage = (filterType: string, filterValue: string) => {
  trackEvent('filter_usage', 'engagement', `${filterType}:${filterValue}`, undefined, {
    filter_type: filterType,
    filter_value: filterValue,
  })
}

// Export functionality tracking
export const trackExport = (exportType: string, itemCount: number) => {
  trackEvent('export_data', 'engagement', exportType, itemCount, {
    export_type: exportType,
    item_count: itemCount,
  })
}

// Newsletter signup tracking
export const trackNewsletterSignup = (email: string, source: string) => {
  trackEvent('newsletter_signup', 'conversion', source, undefined, {
    source: source,
    email_domain: email.split('@')[1],
  })
}

// Blog post engagement tracking
export const trackBlogEngagement = (postSlug: string, postTitle: string, action: 'view' | 'share' | 'save') => {
  trackEvent(`blog_${action}`, 'content', postTitle, undefined, {
    post_slug: postSlug,
    post_title: postTitle,
  })
}

// Scroll depth tracking
export const trackScrollDepth = (depth: number, page: string) => {
  trackEvent('scroll_depth', 'engagement', page, depth, {
    page: page,
    scroll_depth: depth,
  })
}

// Time on page tracking
export const trackTimeOnPage = (timeInSeconds: number, page: string) => {
  trackEvent('time_on_page', 'engagement', page, timeInSeconds, {
    page: page,
    time_seconds: timeInSeconds,
  })
}

// Error tracking
export const trackError = (errorMessage: string, errorType: string, page: string) => {
  trackEvent('error', 'technical', errorType, undefined, {
    error_message: errorMessage,
    error_type: errorType,
    page: page,
  })
}

// Custom conversion tracking for affiliate revenue
export const trackConversion = (toolName: string, toolId: string, estimatedValue?: number) => {
  trackEvent('conversion', 'revenue', toolName, estimatedValue, {
    tool_id: toolId,
    tool_name: toolName,
    estimated_value: estimatedValue,
  })
}

// User journey tracking
export const trackUserJourney = (step: string, funnel: string, additionalData?: Record<string, any>) => {
  trackEvent('user_journey', 'funnel', `${funnel}:${step}`, undefined, {
    funnel: funnel,
    step: step,
    ...additionalData,
  })
}

// Performance tracking
export const trackPerformance = (metric: string, value: number, page: string) => {
  trackEvent('performance', 'technical', metric, value, {
    metric: metric,
    value: value,
    page: page,
  })
}

// Social sharing tracking
export const trackSocialShare = (platform: string, contentType: string, contentId: string) => {
  trackEvent('social_share', 'engagement', platform, undefined, {
    platform: platform,
    content_type: contentType,
    content_id: contentId,
  })
}

// Enhanced ecommerce tracking for affiliate conversions
export const trackPurchase = (toolName: string, toolId: string, value: number, currency: string = 'USD') => {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', 'purchase', {
    transaction_id: `${toolId}_${Date.now()}`,
    value: value,
    currency: currency,
    items: [
      {
        item_id: toolId,
        item_name: toolName,
        category: 'AI Resume Builder',
        quantity: 1,
        price: value,
      },
    ],
  })
}

// Utility function to generate session ID
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Store session data in localStorage
export const getSessionId = (): string => {
  if (typeof window === 'undefined') return generateSessionId()

  let sessionId = localStorage.getItem('session_id')
  if (!sessionId) {
    sessionId = generateSessionId()
    localStorage.setItem('session_id', sessionId)
  }
  return sessionId
}

// Track custom events to our database
export const trackCustomEvent = async (
  eventType: string,
  eventData: Record<string, any>,
  pageUrl?: string
) => {
  try {
    const sessionId = getSessionId()
    
    await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId,
      },
      body: JSON.stringify({
        eventType,
        eventData,
        pageUrl: pageUrl || window.location.pathname,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }),
    })
  } catch (error) {
    console.error('Failed to track custom event:', error)
  }
}

// Initialize scroll depth tracking
export const initScrollTracking = (page: string) => {
  if (typeof window === 'undefined') return

  let maxScroll = 0
  const thresholds = [25, 50, 75, 90, 100]
  const tracked = new Set<number>()

  const handleScroll = () => {
    const scrollTop = window.pageYOffset
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrollPercent = Math.round((scrollTop / docHeight) * 100)

    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent

      thresholds.forEach(threshold => {
        if (scrollPercent >= threshold && !tracked.has(threshold)) {
          tracked.add(threshold)
          trackScrollDepth(threshold, page)
        }
      })
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true })
  
  // Cleanup function
  return () => {
    window.removeEventListener('scroll', handleScroll)
  }
}

// Initialize time tracking
export const initTimeTracking = (page: string) => {
  if (typeof window === 'undefined') return

  const startTime = Date.now()

  const handleBeforeUnload = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    trackTimeOnPage(timeSpent, page)
  }

  window.addEventListener('beforeunload', handleBeforeUnload)
  
  // Also track at intervals for single-page apps
  const interval = setInterval(() => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    if (timeSpent > 0 && timeSpent % 30 === 0) { // Every 30 seconds
      trackTimeOnPage(timeSpent, page)
    }
  }, 1000)

  // Cleanup function
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
    clearInterval(interval)
  }
}
