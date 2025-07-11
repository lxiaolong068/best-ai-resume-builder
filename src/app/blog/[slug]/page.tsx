import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BlogPostPage } from '@/components/BlogPostPage'

interface Props {
  params: { slug: string }
}

// Generate static params for all published blog posts
export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { slug: true }
  })

  return posts.map((post) => ({
    slug: post.slug
  }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug }
  })
  
  if (!post || !post.published) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post was not found.'
    }
  }

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || '',
    keywords: post.keywords,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || '',
      type: 'article',
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: ['Best AI Resume Builder 2025'],
      images: [
        {
          url: post.featuredImage || '/images/default-blog-og.jpg',
          width: 1200,
          height: 630,
          alt: post.title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || '',
      images: [post.featuredImage || '/images/default-blog-og.jpg']
    },
    alternates: {
      canonical: `/blog/${post.slug}`
    }
  }
}

export default async function BlogPostPageRoute({ params }: Props) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug }
  })

  if (!post || !post.published) {
    notFound()
  }

  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || '',
    image: post.featuredImage || '/images/default-blog-og.jpg',
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Organization',
      name: 'Best AI Resume Builder 2025',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://bestairesume2025.com'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Best AI Resume Builder 2025',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bestairesume2025.com'}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bestairesume2025.com'}/blog/${post.slug}`
    },
    keywords: post.keywords?.join(', '),
    articleSection: 'AI Resume Builders',
    wordCount: post.content?.length || 0
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostPage post={post} />
    </>
  )
}
