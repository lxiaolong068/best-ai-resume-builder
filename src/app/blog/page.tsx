import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { BlogListPage } from '@/components/BlogListPage'

export const metadata: Metadata = {
  title: 'AI Resume Builder Blog 2025 | Expert Tips & Guides',
  description: 'Expert guides on AI resume builders, ATS optimization, and job search strategies. Stay updated with the latest trends in resume writing and career advice.',
  keywords: [
    'ai resume builder blog',
    'resume writing tips 2025',
    'ats optimization guide',
    'job search strategies',
    'career advice blog',
    'resume builder reviews',
    'ai resume tips'
  ],
  openGraph: {
    title: 'AI Resume Builder Blog 2025 | Expert Tips & Guides',
    description: 'Expert guides on AI resume builders, ATS optimization, and job search strategies for 2025.',
    type: 'website',
    url: '/blog',
    images: [
      {
        url: '/images/blog-og.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Resume Builder Blog 2025'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Resume Builder Blog 2025',
    description: 'Expert guides on AI resume builders and job search strategies.',
    images: ['/images/blog-og.jpg']
  },
  alternates: {
    canonical: '/blog'
  }
}

// Generate JSON-LD structured data for the blog page
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'AI Resume Builder Blog 2025',
  description: 'Expert guides on AI resume builders, ATS optimization, and job search strategies for 2025.',
  url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bestairesume2025.com'}/blog`,
  publisher: {
    '@type': 'Organization',
    name: 'Best AI Resume Builder 2025',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bestairesume2025.com'}/logo.png`
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: process.env.NEXT_PUBLIC_SITE_URL || 'https://bestairesume2025.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bestairesume2025.com'}/blog`
      }
    ]
  }
}

export default async function BlogPage() {
  // Fetch published blog posts
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
      keywords: true,
      featuredImage: true,
      createdAt: true
    }
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogListPage posts={posts} />
    </>
  )
}
