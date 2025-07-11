'use client'

import { 
  CalendarIcon, 
  ClockIcon, 
  TagIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  publishedAt: Date | null
  keywords: string[]
  featuredImage: string | null
  createdAt: Date
}

interface Props {
  posts: BlogPost[]
}

export function BlogListPage({ posts }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedKeyword, setSelectedKeyword] = useState('')

  // Get all unique keywords
  const allKeywords = Array.from(
    new Set(posts.flatMap(post => post.keywords))
  ).sort()

  // Filter posts based on search and keyword
  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesKeyword = !selectedKeyword || 
      post.keywords.includes(selectedKeyword)
    
    return matchesSearch && matchesKeyword
  })

  const readingTime = (excerpt: string | null) => {
    if (!excerpt) return 1
    return Math.ceil(excerpt.length / 1000) || 1
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <a href="/" className="text-blue-600 hover:text-blue-700">
                Home
              </a>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-600">Blog</li>
          </ol>
        </div>
      </nav>

      {/* Page Header */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              AI Resume Builder Blog 2025
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Expert guides, tips, and insights on AI resume builders, ATS optimization, 
              and modern job search strategies. Stay ahead in your career journey.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <StarIcon className="w-4 h-4 text-yellow-400" />
                <span>Expert Analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4 text-blue-500" />
                <span>Updated Weekly</span>
              </div>
              <div className="flex items-center space-x-2">
                <TagIcon className="w-4 h-4 text-green-500" />
                <span>Actionable Tips</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Keyword Filter */}
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedKeyword}
                onChange={(e) => setSelectedKeyword(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[200px]"
              >
                <option value="">All Topics</option>
                {allKeywords.map(keyword => (
                  <option key={keyword} value={keyword}>
                    {keyword}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {/* Featured Image */}
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                    {post.featuredImage ? (
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-white text-xl font-bold">
                            {post.title.charAt(0)}
                          </span>
                        </div>
                        <p className="text-blue-600 font-medium">AI Resume Guide</p>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Keywords */}
                    {post.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.keywords.slice(0, 2).map((keyword, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            <TagIcon className="w-3 h-3" />
                            <span>{keyword}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h2>

                    {post.excerpt && (
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        {post.publishedAt && (
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span>
                              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>{readingTime(post.excerpt)} min read</span>
                        </div>
                      </div>
                    </div>

                    {/* Read More */}
                    <a
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Read More →
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <MagnifyingGlassIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No articles found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search terms or filters.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedKeyword('')
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Stay Updated with AI Resume Trends
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Get weekly insights on AI resume builders, job market trends, and career tips.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-300"
              />
              <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
