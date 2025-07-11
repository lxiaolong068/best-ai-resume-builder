// Core type definitions for the AI Resume Builder application

// Base entity interface
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

// Pricing model enum
export enum PricingModel {
  FREE = 'free',
  FREEMIUM = 'freemium',
  SUBSCRIPTION = 'subscription',
}

// Support level enum
export enum SupportLevel {
  EMAIL = 'email',
  CHAT = 'chat',
  PHONE = 'phone',
  NONE = 'none',
}

// Export format enum
export enum ExportFormat {
  PDF = 'pdf',
  DOCX = 'docx',
  TXT = 'txt',
  HTML = 'html',
  JSON = 'json',
}

// Language enum
export enum Language {
  ENGLISH = 'en',
  SPANISH = 'es',
  FRENCH = 'fr',
  GERMAN = 'de',
  ITALIAN = 'it',
  PORTUGUESE = 'pt',
  CHINESE = 'zh',
  JAPANESE = 'ja',
  KOREAN = 'ko',
}

// Tool features interface with strict typing
export interface ToolFeatures {
  atsOptimized: boolean
  templates: number
  aiSuggestions: boolean
  coverLetter: boolean
  tracking: boolean
  support: SupportLevel
  exportFormats: ExportFormat[]
  languages: Language[]
  collaboration: boolean
  analytics: boolean
  linkedinIntegration: boolean
  keywordOptimization: boolean
  customBranding?: boolean
  multipleResumes?: boolean
  jobMatching?: boolean
  salaryInsights?: boolean
  interviewPrep?: boolean
}

// Tool interface
export interface Tool extends BaseEntity {
  name: string
  description: string | null
  websiteUrl: string | null
  pricingModel: string | null
  features: any | null
  affiliateLink: string | null
  logoUrl: string | null
  rating: number | null
  reviews: ToolReview[]
}

// Tool review interface
export interface ToolReview extends BaseEntity {
  toolId: string
  tool?: Tool
  speedScore: number | null
  atsScore: number | null
  easeOfUse: number | null
  templateCount: number | null
  pricingScore: number | null
  overallRating: number | null
  reviewDate: Date | null
  reviewerNotes: string | null
}

// User event interface
export interface UserEvent extends BaseEntity {
  sessionId: string
  eventType: string
  eventData: Record<string, any>
  pageUrl: string
  userAgent: string
  timestamp: Date
  userId?: string
  anonymizedIP?: string
}

// Blog post interface
export interface BlogPost extends BaseEntity {
  title: string
  slug: string
  excerpt: string | null
  content: string
  publishedAt: Date | null
  authorId: string
  author?: Author
  featuredImage: string | null
  keywords: string[]
  metaDescription: string | null
  readingTime: number
  published: boolean
  featured: boolean
  category: string
  tags: string[]
  seoScore?: number
  viewCount: number
  shareCount: number
}

// Author interface
export interface Author extends BaseEntity {
  name: string
  email: string
  bio: string | null
  avatar: string | null
  socialLinks: {
    twitter?: string
    linkedin?: string
    website?: string
  }
  posts: BlogPost[]
}

// Comparison interface
export interface Comparison {
  id: string
  tools: Tool[]
  comparisonMatrix: ComparisonMatrix
  summary: ComparisonSummary
  createdAt: Date
  userId?: string
  sessionId: string
}

// Comparison matrix interface
export interface ComparisonMatrix {
  [featureName: string]: Array<{
    toolId: string
    toolName: string
    value: any
  }>
}

// Comparison summary interface
export interface ComparisonSummary {
  winner: {
    overall: string
    categories: Record<string, string>
  }
  recommendations: Array<{
    toolId: string
    reason: string
    bestFor: string[]
  }>
  insights: string[]
}

// Filter interfaces
export interface ToolFilters {
  search?: string
  atsOptimized?: boolean
  pricingModel?: PricingModel
  supportLevel?: SupportLevel
  exportFormats?: ExportFormat[]
  languages?: Language[]
  features?: Partial<ToolFeatures>
  rating?: {
    min?: number
    max?: number
  }
  page?: number
  limit?: number
  sortBy?: 'rating' | 'name' | 'createdAt' | 'popularity'
  sortOrder?: 'asc' | 'desc'
}

// Pagination interface
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// API response interfaces
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
    timestamp?: string
    requestId?: string
  }
  pagination?: Pagination
  meta?: {
    version: string
    timestamp: string
    requestId: string
  }
}

// Form interfaces
export interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
  honeypot?: string // Anti-spam field
}

export interface NewsletterForm {
  email: string
  firstName?: string
  interests?: string[]
  source?: string
}

export interface ToolSubmissionForm {
  toolName: string
  websiteUrl: string
  description: string
  contactEmail: string
  features: Partial<ToolFeatures>
  pricingInfo: string
  additionalNotes?: string
}

// Analytics interfaces
export interface AnalyticsData {
  totalEvents: number
  eventTypeBreakdown: Array<{
    eventType: string
    count: number
  }>
  pageBreakdown: Array<{
    pageUrl: string
    count: number
  }>
  timeRange: {
    start: Date
    end: Date
  }
}

export interface WebVitals {
  fcp: number // First Contentful Paint
  lcp: number // Largest Contentful Paint
  fid: number // First Input Delay
  cls: number // Cumulative Layout Shift
  ttfb: number // Time to First Byte
}

// SEO interfaces
export interface SEOData {
  title: string
  description: string
  keywords: string[]
  canonicalUrl: string
  ogImage?: string
  ogType?: string
  twitterCard?: string
  structuredData?: any
  robots?: string
  alternateUrls?: Array<{
    hreflang: string
    href: string
  }>
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type WithTimestamps<T> = T & {
  createdAt: Date
  updatedAt: Date
}

// Type guards
export function isValidPricingModel(value: string): value is PricingModel {
  return Object.values(PricingModel).includes(value as PricingModel)
}

export function isValidSupportLevel(value: string): value is SupportLevel {
  return Object.values(SupportLevel).includes(value as SupportLevel)
}

export function isValidExportFormat(value: string): value is ExportFormat {
  return Object.values(ExportFormat).includes(value as ExportFormat)
}

export function isValidLanguage(value: string): value is Language {
  return Object.values(Language).includes(value as Language)
}

// Type assertion helpers
export function assertTool(obj: any): asserts obj is Tool {
  if (!obj || typeof obj !== 'object') {
    throw new Error('Invalid tool object')
  }
  if (typeof obj.id !== 'string') {
    throw new Error('Tool must have a valid id')
  }
  if (typeof obj.name !== 'string') {
    throw new Error('Tool must have a valid name')
  }
  if (obj.description !== null && typeof obj.description !== 'string') {
    throw new Error('Tool description must be a string or null')
  }
}

export function assertToolReview(obj: any): asserts obj is ToolReview {
  if (!obj || typeof obj !== 'object') {
    throw new Error('Invalid tool review object')
  }
  if (typeof obj.toolId !== 'string') {
    throw new Error('Tool review must have a valid toolId')
  }
}
