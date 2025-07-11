// Service Worker for Best AI Resume Builder 2025
// Implements caching strategies for optimal performance

const CACHE_NAME = 'best-ai-resume-builder-v1'
const STATIC_CACHE = 'static-v1'
const DYNAMIC_CACHE = 'dynamic-v1'
const API_CACHE = 'api-v1'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/compare',
  '/ats-analyzer',
  '/blog',
  '/manifest.json',
  '/offline.html'
]

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/tools',
  '/api/stats',
  '/api/blog'
]

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        return self.clients.claim()
      })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) {
    return
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - Network First with cache fallback
    event.respondWith(handleApiRequest(request))
  } else if (isStaticAsset(url.pathname)) {
    // Static assets - Cache First
    event.respondWith(handleStaticAsset(request))
  } else {
    // Pages - Stale While Revalidate
    event.respondWith(handlePageRequest(request))
  }
})

// Handle API requests with Network First strategy
async function handleApiRequest(request) {
  const cacheName = API_CACHE
  
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    // Network failed, try cache
    console.log('Network failed for API request, trying cache:', request.url)
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline response for API
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Offline - please check your connection',
        offline: true 
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Handle static assets with Cache First strategy
async function handleStaticAsset(request) {
  const cacheName = STATIC_CACHE
  
  // Try cache first
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    // Cache miss, fetch from network
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Failed to fetch static asset:', request.url)
    
    // Return offline fallback if available
    if (request.destination === 'document') {
      return caches.match('/offline.html')
    }
    
    return new Response('Offline', { status: 503 })
  }
}

// Handle page requests with Stale While Revalidate strategy
async function handlePageRequest(request) {
  const cacheName = DYNAMIC_CACHE
  
  // Get from cache
  const cachedResponse = await caches.match(request)
  
  // Fetch from network in background
  const networkResponsePromise = fetch(request)
    .then(response => {
      if (response.ok) {
        const cache = caches.open(cacheName)
        cache.then(c => c.put(request, response.clone()))
      }
      return response
    })
    .catch(() => null)
  
  // Return cached version immediately if available
  if (cachedResponse) {
    // Update cache in background
    networkResponsePromise.catch(() => {})
    return cachedResponse
  }
  
  // No cache, wait for network
  try {
    const networkResponse = await networkResponsePromise
    if (networkResponse) {
      return networkResponse
    }
  } catch (error) {
    console.log('Network failed for page request:', request.url)
  }
  
  // Return offline page
  return caches.match('/offline.html') || new Response('Offline', { status: 503 })
}

// Check if URL is a static asset
function isStaticAsset(pathname) {
  const staticExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg',
    '.woff', '.woff2', '.ttf', '.eot', '.ico', '.json'
  ]
  
  return staticExtensions.some(ext => pathname.endsWith(ext))
}

// Background sync for form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // Handle any queued form submissions or API calls
  console.log('Performing background sync')
  
  // This could include:
  // - Retry failed API requests
  // - Submit queued form data
  // - Update cached content
}

// Push notifications (if needed in the future)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json()
    
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: data.url
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close()
  
  if (event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    )
  }
})

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'content-sync') {
    event.waitUntil(updateContent())
  }
})

async function updateContent() {
  // Update cached content periodically
  console.log('Updating content in background')
  
  try {
    // Refresh critical API data
    const toolsResponse = await fetch('/api/tools?limit=20')
    if (toolsResponse.ok) {
      const cache = await caches.open(API_CACHE)
      cache.put('/api/tools?limit=20', toolsResponse)
    }
    
    const statsResponse = await fetch('/api/stats')
    if (statsResponse.ok) {
      const cache = await caches.open(API_CACHE)
      cache.put('/api/stats', statsResponse)
    }
  } catch (error) {
    console.log('Failed to update content:', error)
  }
}

// Message handling for communication with main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        )
      })
    )
  }
})

// Error handling
self.addEventListener('error', event => {
  console.error('Service Worker error:', event.error)
})

self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker unhandled rejection:', event.reason)
})
