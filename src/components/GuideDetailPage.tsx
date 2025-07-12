'use client'

import Link from 'next/link'
import { useState } from 'react'

interface Guide {
  title: string
  description: string
  category: string
  readTime: string
  slug: string
  featured?: boolean
  topics: string[]
  keywords?: string[]
  publishedAt: string
  updatedAt: string
  author: string
  content: string
}

interface GuideDetailPageProps {
  guide: Guide
  relatedGuides: Guide[]
}

export function GuideDetailPage({ guide, relatedGuides }: GuideDetailPageProps) {
  const [isTableOfContentsOpen, setIsTableOfContentsOpen] = useState(false)

  // 从内容中提取标题作为目录（跳过第一个h1）
  const extractTableOfContents = (content: string) => {
    const headingRegex = /^(#{1,3})\s+(.+)$/gm
    const headings: { level: number; text: string; id: string }[] = []
    let match
    let isFirstH1 = true

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length
      const text = match[2].trim()

      // 跳过第一个h1标题，因为它已经在页面头部显示了
      if (level === 1 && isFirstH1) {
        isFirstH1 = false
        continue
      }

      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      headings.push({ level, text, id })
    }

    return headings
  }

  // 将Markdown内容转换为HTML（简单版本）
  const renderMarkdownContent = (content: string) => {
    let html = content
      // 标题 - 跳过第一个h1标题，因为已经在页面头部显示了
      .replace(/^### (.+)$/gm, '<h3 id="$1" class="text-xl font-semibold text-gray-900 mt-8 mb-4">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 id="$1" class="text-2xl font-bold text-gray-900 mt-10 mb-6">$1</h2>')
      .replace(/^# (.+)$/gm, '') // 移除内容中的h1标题，避免重复
      // 粗体
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      // 列表
      .replace(/^- (.+)$/gm, '<li class="mb-2">$1</li>')
      .replace(/(<li.*<\/li>)/s, '<ul class="list-disc list-inside mb-6 space-y-2 text-gray-700">$1</ul>')
      // 段落
      .replace(/^(?!<[h|u|l]|$)(.+)$/gm, '<p class="mb-4 text-gray-700 leading-relaxed">$1</p>')

    return html
  }

  const tableOfContents = extractTableOfContents(guide.content)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 面包屑导航 */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/guides" className="hover:text-blue-600 transition-colors">
              Guides
            </Link>
            <span>/</span>
            <span className="text-gray-900">{guide.title}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* 主要内容 */}
          <div className="lg:col-span-3">
            {/* 文章头部 */}
            <header className="bg-white rounded-lg shadow-sm p-8 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {guide.category}
                </span>
                <span className="text-sm text-gray-500">{guide.readTime}</span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">Updated {new Date(guide.updatedAt).toLocaleDateString()}</span>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {guide.title}
              </h1>

              <p className="text-xl text-gray-600 mb-6">
                {guide.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {guide.topics.map((topic, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                  >
                    {topic}
                  </span>
                ))}
              </div>

              <div className="flex items-center text-sm text-gray-500">
                <span>By {guide.author}</span>
              </div>
            </header>

            {/* 目录（移动端） */}
            <div className="lg:hidden bg-white rounded-lg shadow-sm p-6 mb-8">
              <button
                onClick={() => setIsTableOfContentsOpen(!isTableOfContentsOpen)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900">Table of Contents</h3>
                <svg
                  className={`w-5 h-5 transform transition-transform ${
                    isTableOfContentsOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isTableOfContentsOpen && (
                <nav className="mt-4 space-y-2">
                  {tableOfContents.map((heading, index) => (
                    <a
                      key={index}
                      href={`#${heading.id}`}
                      className={`block text-sm hover:text-blue-600 transition-colors ${
                        heading.level === 1 ? 'font-semibold text-gray-900' :
                        heading.level === 2 ? 'pl-4 text-gray-700' :
                        'pl-8 text-gray-600'
                      }`}
                    >
                      {heading.text}
                    </a>
                  ))}
                </nav>
              )}
            </div>

            {/* 文章内容 */}
            <article className="bg-white rounded-lg shadow-sm p-8 mb-8">
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdownContent(guide.content)
                }}
              />
            </article>

            {/* 相关指南 */}
            {relatedGuides.length > 0 && (
              <section className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Related Guides
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedGuides.map((relatedGuide, index) => (
                    <Link
                      key={index}
                      href={`/guides/${relatedGuide.slug}`}
                      className="block p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                          {relatedGuide.category}
                        </span>
                        <span className="text-xs text-gray-500">{relatedGuide.readTime}</span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {relatedGuide.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-3">
                        {relatedGuide.description}
                      </p>
                      
                      <div className="flex items-center text-blue-600 text-sm font-medium">
                        Read Guide
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* 侧边栏 */}
          <div className="lg:col-span-1">
            {/* 目录（桌面端） */}
            <div className="hidden lg:block bg-white rounded-lg shadow-sm p-6 mb-8 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h3>
              <nav className="space-y-2">
                {tableOfContents.map((heading, index) => (
                  <a
                    key={index}
                    href={`#${heading.id}`}
                    className={`block text-sm hover:text-blue-600 transition-colors ${
                      heading.level === 1 ? 'font-semibold text-gray-900' :
                      heading.level === 2 ? 'pl-4 text-gray-700' :
                      'pl-8 text-gray-600'
                    }`}
                  >
                    {heading.text}
                  </a>
                ))}
              </nav>
            </div>

            {/* CTA卡片 */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-3">
                Ready to Build Your Resume?
              </h3>
              <p className="text-blue-100 text-sm mb-4">
                Apply what you've learned with our top-rated AI resume builders.
              </p>
              <div className="space-y-3">
                <Link
                  href="/ats-checker"
                  className="block w-full bg-white text-blue-600 text-center py-2 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Test Your Resume
                </Link>
                <Link
                  href="/compare"
                  className="block w-full border border-blue-300 text-center py-2 px-4 rounded-lg font-medium hover:bg-blue-500 transition-colors"
                >
                  Compare Tools
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
