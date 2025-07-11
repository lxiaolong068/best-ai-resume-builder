import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { DefaultSeo } from 'next-seo'
import './globals.css'
import { defaultSEO, structuredData } from '@/lib/seo'
import { Analytics, AnalyticsErrorBoundary, PerformanceMonitor } from '@/components/Analytics'
import { PerformanceOptimizer } from '@/components/PerformanceOptimizer'
import { WebVitalsMonitor } from '@/components/WebVitalsMonitor'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Best AI Resume Builder 2025 | ATS-Optimized & Expert Tested',
  description: 'Find the best AI resume builder in 2025. Expert-tested with real ATS scores, pricing comparison, and user reviews. Free tools included.',
  keywords: 'AI resume builder, ATS optimized, resume generator, best resume builder 2025, AI resume tools',
  authors: [{ name: 'Best AI Resume Builder Team' }],
  creator: 'Best AI Resume Builder Team',
  publisher: 'Best AI Resume Builder',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://your-domain.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Best AI Resume Builder 2025 | ATS-Optimized & Expert Tested',
    description: 'Find the best AI resume builder in 2025. Expert-tested with real ATS scores, pricing comparison, and user reviews.',
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com',
    siteName: 'Best AI Resume Builder',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Best AI Resume Builder 2025',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best AI Resume Builder 2025',
    description: 'Find the best AI resume builder in 2025. Expert-tested with real ATS scores.',
    site: '@airesumenews',
    creator: '@airesumenews',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    other: {
      'msvalidate.01': 'your-bing-verification-code',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData.organization),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData.website),
          }}
        />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        
        {/* DNS prefetch for affiliate links */}
        <link rel="dns-prefetch" href="https://resume.io" />
        <link rel="dns-prefetch" href="https://zety.com" />
        <link rel="dns-prefetch" href="https://novoresume.com" />
        
        {/* Favicon and icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme color */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        
        {/* Additional meta tags */}
        <meta name="rating" content="general" />
        <meta name="referrer" content="origin-when-cross-origin" />
      </head>
      <body className={`${inter.className} font-sans antialiased`}>
        <DefaultSeo {...defaultSEO} />
        <AnalyticsErrorBoundary>
          <Analytics>
            <PerformanceMonitor />
            <PerformanceOptimizer />
            <WebVitalsMonitor />
            {children}
          </Analytics>
        </AnalyticsErrorBoundary>
        
        {/* Analytics and tracking scripts would go here */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google Analytics */}
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  )
}