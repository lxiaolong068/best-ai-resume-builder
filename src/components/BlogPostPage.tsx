'use client'

import { motion } from 'framer-motion'
import { 
  CalendarIcon, 
  ClockIcon, 
  ShareIcon,
  BookmarkIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string | null
  excerpt: string | null
  published: boolean
  publishedAt: Date | null
  seoTitle: string | null
  seoDescription: string | null
  keywords: string[]
  featuredImage: string | null
  createdAt: Date
  updatedAt: Date
}

interface Props {
  post: BlogPost
}

export function BlogPostPage({ post }: Props) {
  const readingTime = Math.ceil((post.content?.length || 0) / 1000) // Rough estimate

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || '',
          url: window.location.href
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('URL copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <a href="/" className="text-blue-600 hover:text-blue-700">
                Home
              </a>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <a href="/blog" className="text-blue-600 hover:text-blue-700">
                Blog
              </a>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-600 truncate">{post.title}</li>
          </ol>
        </div>
      </nav>

      {/* Article Header */}
      <article className="bg-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            {/* Keywords Tags */}
            {post.keywords && post.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.keywords.slice(0, 3).map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    <TagIcon className="w-3 h-3" />
                    <span>{keyword}</span>
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {/* Article Meta */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-gray-200">
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                {post.publishedAt && (
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span>
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-4 h-4" />
                  <span>{readingTime} min read</span>
                </div>
                <div className="flex items-center space-x-2">
                  <StarIcon className="w-4 h-4 text-yellow-400" />
                  <span>Expert Analysis</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ShareIcon className="w-4 h-4" />
                  <span>Share</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <BookmarkIcon className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </motion.header>

          {/* Article Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="prose prose-lg prose-gray max-w-none"
          >
            {post.content ? (
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
                <h3 className="text-xl font-semibold text-yellow-800 mb-2">
                  Content Coming Soon
                </h3>
                <p className="text-yellow-700">
                  Our expert team is currently working on this comprehensive guide. 
                  Check back soon for detailed analysis and insights.
                </p>
              </div>
            )}
          </motion.div>

          {/* Article Footer */}
          <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 pt-8 border-t border-gray-200"
          >
            {/* Tags */}
            {post.keywords && post.keywords.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {post.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share Again */}
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Found this helpful?
              </h3>
              <p className="text-gray-600 mb-4">
                Share this article with others who might benefit from these insights.
              </p>
              <button
                onClick={handleShare}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ShareIcon className="w-5 h-5" />
                <span>Share Article</span>
              </button>
            </div>
          </motion.footer>
        </div>
      </article>

      {/* Related Articles Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Related Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-2">
                Best AI Resume Builder 2025: Expert Rankings
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Comprehensive analysis of the top AI resume builders with real ATS testing results.
              </p>
              <a href="/blog/best-ai-resume-builder-2025" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Read More →
              </a>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-2">
                ATS Optimization Guide 2025
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Learn how to optimize your resume for applicant tracking systems in 2025.
              </p>
              <a href="/blog/ats-optimization-guide-2025" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Read More →
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
