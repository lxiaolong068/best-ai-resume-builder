# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server (includes Prisma generate)
- `npm run build` - Build for production (includes Prisma generate)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- Run `npm run lint` after making changes to ensure code quality

### Database Operations
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with initial data
- `npm run db:seed-safe` - Safe seeding (checks for duplicates)
- `npm run db:cleanup` - Clean up duplicate records
- `npm run db:check` - Check database integrity
- `npm run db:studio` - Open Prisma Studio

### Testing
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run test:e2e:ui` - Run E2E tests with UI mode
- `npm run test:e2e:headed` - Run E2E tests in headed mode
- `npx playwright test [file]` - Run specific test file
- `npx playwright test --reporter=html` - Generate HTML test report

### Debug Tools
- `npm run debug:compare` - Debug comparison table functionality

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 14 with App Router and TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Testing**: Playwright for E2E testing
- **Analytics**: Custom analytics system with Web Vitals monitoring

### Database Schema
The application uses PostgreSQL with these core models:
- `AiTool` - AI resume building tools with ratings and features
- `ToolReview` - Detailed reviews with scoring metrics (speed, ATS, ease of use)
- `UserEvent` - User interaction tracking for analytics
- `Conversion` - Affiliate conversion tracking
- `BlogPost` - Content management for blog articles
- `EmailSubscriber` - Newsletter subscription management

### Key Components Architecture

#### Data Layer (`src/lib/`)
- `prisma.ts` - Database client configuration
- `db-queries.ts` - Centralized database query functions
- `cache.ts` - Caching layer for performance optimization
- `analytics.ts` - User event tracking and analytics
- `seo.ts` - SEO metadata generation
- `structured-data.ts` - JSON-LD structured data for search engines

#### Page Components (`src/components/`)
- `ComparisonTable.tsx` - Interactive tool comparison with filtering and sorting
- `ATSChecker.tsx` - Resume ATS compatibility analyzer
- `Hero.tsx` - Landing page hero section
- `FeaturedTools.tsx` - Tool showcase component
- Performance optimization components with lazy loading and virtualization

#### API Architecture (`src/app/api/`)
- RESTful API design with rate limiting via Upstash Redis
- Modular route handlers for tools, reviews, analytics
- Structured response format using `api-response.ts` utility

### Performance Features
- Virtualized lists for large datasets (`VirtualizedToolList.tsx`)
- Lazy loading with `LazyComponents.tsx`
- Image optimization with `OptimizedImage.tsx`
- Web Vitals monitoring and performance tracking
- Resource optimization utilities

### SEO Implementation
- Dynamic metadata generation based on content
- Structured data (JSON-LD) for rich snippets
- Automated sitemap generation for tools and blog posts
- Open Graph and Twitter card meta tags

## Development Guidelines

### Database Development
- Always run `npm run db:generate` after schema changes
- Use `npm run db:check` to verify database integrity before major operations
- Seed data is managed through `src/lib/seed.ts` with duplicate prevention

### Component Development
- Follow the existing TypeScript patterns with proper type definitions in `src/types/`
- Use the established caching patterns from `src/lib/cache.ts`
- Implement proper error boundaries using `ErrorBoundary.tsx`

### API Development
- Use the standardized response format from `src/lib/api-response.ts`
- Implement rate limiting for public endpoints
- Follow the existing validation patterns using Zod schemas

### Testing Strategy
- E2E tests cover navigation, page loads, and component functionality
- Tests are configured to run against `http://localhost:3000`
- Use descriptive test names following the existing patterns in `tests/`

## Environment Setup
Copy `.env.example` to `.env.local` and configure:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Authentication secret
- API keys for external services (JobScan, analytics, etc.)
- Optional Redis URL for caching and rate limiting