import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

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
      <body className={`${inter.className} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}