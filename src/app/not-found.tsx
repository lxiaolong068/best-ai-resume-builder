import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'

export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 pt-20">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a
          href="/"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Home
        </a>
      </div>
      </div>
      <Footer />
    </>
  )
}