'use client'

import Image from 'next/image'
import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'

interface OptimizedImageProps {
  src: string | null | undefined
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  fallbackSrc?: string
  fallbackIcon?: React.ReactNode
  onLoad?: () => void
  onError?: () => void
  sizes?: string
  fill?: boolean
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  loading?: 'lazy' | 'eager'
}

// Generate blur data URL for placeholder
const generateBlurDataURL = (width: number, height: number): string => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  if (ctx) {
    // Create a simple gradient blur effect
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#f3f4f6')
    gradient.addColorStop(1, '#e5e7eb')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
  }
  
  return canvas.toDataURL('image/jpeg', 0.1)
}

// Default fallback icon
const DefaultFallbackIcon = ({ width, height }: { width: number; height: number }) => (
  <div 
    className="flex items-center justify-center bg-gray-100 text-gray-400"
    style={{ width, height }}
  >
    <svg
      className="w-1/3 h-1/3"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
        clipRule="evenodd"
      />
    </svg>
  </div>
)

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  fallbackSrc = '/images/default-placeholder.png',
  fallbackIcon,
  onLoad,
  onError,
  sizes,
  fill = false,
  objectFit = 'cover',
  loading = 'lazy',
}) => {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentSrc, setCurrentSrc] = useState(src)

  // Generate blur data URL if not provided
  const defaultBlurDataURL = useMemo(() => {
    if (blurDataURL) return blurDataURL
    if (typeof window !== 'undefined') {
      return generateBlurDataURL(width, height)
    }
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
  }, [blurDataURL, width, height])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setImageError(true)
    setIsLoading(false)
    
    // Try fallback source if available and different from current
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setImageError(false)
      setIsLoading(true)
      return
    }
    
    onError?.()
  }, [fallbackSrc, currentSrc, onError])

  // If no src provided or error with fallback, show fallback icon
  if (!currentSrc || (imageError && currentSrc === fallbackSrc)) {
    return (
      <div className={`relative ${className}`}>
        {fallbackIcon || <DefaultFallbackIcon width={width} height={height} />}
      </div>
    )
  }

  const imageProps = {
    src: currentSrc,
    alt,
    onLoad: handleLoad,
    onError: handleError,
    priority,
    quality,
    loading: priority ? 'eager' as const : loading,
    className: `${className} ${objectFit === 'cover' ? 'object-cover' : objectFit === 'contain' ? 'object-contain' : ''}`,
    ...(placeholder === 'blur' && { 
      placeholder: 'blur' as const, 
      blurDataURL: defaultBlurDataURL 
    }),
    ...(sizes && { sizes }),
  }

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''}`}>
      {/* Loading overlay */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10"
          initial={{ opacity: 1 }}
          animate={{ opacity: isLoading ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}

      {fill ? (
        <Image
          {...imageProps}
          fill
          style={{ objectFit }}
        />
      ) : (
        <Image
          {...imageProps}
          width={width}
          height={height}
        />
      )}
    </div>
  )
}

// Specialized components for common use cases
export const ToolLogo: React.FC<{
  tool: { name: string; logoUrl?: string | null }
  size?: 'sm' | 'md' | 'lg'
  className?: string
}> = ({ tool, size = 'md', className = '' }) => {
  const dimensions = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 },
  }

  const { width, height } = dimensions[size]

  const fallbackIcon = (
    <div 
      className={`flex items-center justify-center bg-blue-500 text-white rounded-lg font-bold text-${size === 'sm' ? 'xs' : size === 'md' ? 'sm' : 'base'}`}
      style={{ width, height }}
    >
      {tool.name.charAt(0).toUpperCase()}
    </div>
  )

  return (
    <OptimizedImage
      src={tool.logoUrl}
      alt={`${tool.name} logo`}
      width={width}
      height={height}
      className={`rounded-lg ${className}`}
      fallbackIcon={fallbackIcon}
      priority={false}
      quality={85}
    />
  )
}

export const HeroImage: React.FC<{
  src: string
  alt: string
  className?: string
}> = ({ src, alt, className = '' }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    width={1200}
    height={600}
    className={className}
    priority={true}
    quality={90}
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
  />
)

export const BlogPostImage: React.FC<{
  src: string | null
  alt: string
  className?: string
}> = ({ src, alt, className = '' }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    width={800}
    height={400}
    className={className}
    priority={false}
    quality={80}
    sizes="(max-width: 768px) 100vw, 800px"
    placeholder="blur"
  />
)

// Hook for preloading images
export const useImagePreloader = () => {
  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image()
      img.onload = () => resolve()
      img.onerror = reject
      img.src = src
    })
  }, [])

  const preloadImages = useCallback(async (sources: string[]): Promise<void> => {
    try {
      await Promise.all(sources.map(preloadImage))
    } catch (error) {
      console.warn('Failed to preload some images:', error)
    }
  }, [preloadImage])

  return { preloadImage, preloadImages }
}

export default OptimizedImage
