import { test, expect } from '@playwright/test'

// 测试几个关键的指南页面
const testGuides = [
  {
    slug: 'complete-ai-resume-builder-guide-2025',
    title: 'Complete AI Resume Builder Guide 2025',
    category: 'Getting Started'
  },
  {
    slug: 'ats-optimization-guide',
    title: 'ATS Optimization Guide',
    category: 'ATS Optimization'
  },
  {
    slug: 'resume-keywords-guide',
    title: 'Resume Keywords Guide',
    category: 'Keywords'
  }
]

test.describe('Guides Pages - Basic Tests', () => {
  test('should load guides index page successfully', async ({ page }) => {
    await page.goto('/guides')
    await page.waitForLoadState('networkidle')
    
    // 检查页面标题
    await expect(page).toHaveTitle(/AI Resume Builder Guides 2025/)
    
    // 检查主标题
    await expect(page.locator('h1')).toContainText('AI Resume Builder Guides')
    
    // 检查至少有一些指南链接
    const guideLinks = page.locator('a[href^="/guides/"]')
    await expect(guideLinks.first()).toBeVisible()
  })

  test('should load individual guide pages without 404 errors', async ({ page }) => {
    for (const guide of testGuides) {
      console.log(`Testing guide: ${guide.slug}`)

      await page.goto(`/guides/${guide.slug}`)
      await page.waitForLoadState('networkidle')

      // 检查不是404页面
      await expect(page.locator('h1').first()).not.toContainText('404')

      // 检查页面标题包含指南标题
      const title = await page.title()
      expect(title).toContain(guide.title)

      // 检查主标题（使用第一个h1标签）
      await expect(page.locator('h1').first()).toContainText(guide.title)

      // 检查面包屑导航
      await expect(page.locator('nav').first()).toContainText('Guides')

      // 检查页面内容不为空
      await expect(page.locator('article')).toBeVisible()
    }
  })

  test('should have working navigation from guides index to detail pages', async ({ page }) => {
    await page.goto('/guides')
    await page.waitForLoadState('networkidle')
    
    // 点击第一个指南链接
    const firstGuideLink = page.locator('a[href^="/guides/"]').first()
    await firstGuideLink.click()
    await page.waitForLoadState('networkidle')
    
    // 验证导航成功（不是404页面）
    await expect(page.locator('h1')).not.toContainText('404')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should handle 404 for non-existent guide', async ({ page }) => {
    await page.goto('/guides/non-existent-guide-test')
    await page.waitForLoadState('networkidle')
    
    // 检查404页面
    await expect(page.locator('h1')).toContainText('404')
    await expect(page.locator('text=Page Not Found')).toBeVisible()
  })

  test('should have no critical console errors', async ({ page }) => {
    const consoleErrors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    // 测试指南索引页面
    await page.goto('/guides')
    await page.waitForLoadState('networkidle')
    
    // 测试一个指南详情页面
    await page.goto(`/guides/${testGuides[0].slug}`)
    await page.waitForLoadState('networkidle')
    
    // 过滤掉已知的无害错误
    const significantErrors = consoleErrors.filter(error => 
      !error.includes('React DevTools') && 
      !error.includes('Download the React DevTools') &&
      !error.includes('Failed to load resource') // 某些静态资源404是正常的
    )
    
    if (significantErrors.length > 0) {
      console.log('Console errors found:', significantErrors)
    }
    
    expect(significantErrors).toHaveLength(0)
  })

  test('should have basic SEO elements', async ({ page }) => {
    await page.goto(`/guides/${testGuides[0].slug}`)
    await page.waitForLoadState('networkidle')
    
    // 检查页面标题
    const title = await page.title()
    expect(title).toBeTruthy()
    expect(title.length).toBeGreaterThan(10)
    
    // 检查meta description（如果存在）
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content')
    if (metaDescription) {
      expect(metaDescription.length).toBeGreaterThan(50)
    }
  })

  test('should have working breadcrumb navigation', async ({ page }) => {
    await page.goto(`/guides/${testGuides[0].slug}`)
    await page.waitForLoadState('networkidle')
    
    // 检查面包屑导航
    const breadcrumb = page.locator('nav').first()
    await expect(breadcrumb).toContainText('Home')
    await expect(breadcrumb).toContainText('Guides')
    
    // 点击Guides链接返回指南索引
    await page.locator('nav a[href="/guides"]').click()
    await page.waitForLoadState('networkidle')
    
    await expect(page).toHaveURL(/\/guides$/)
    await expect(page.locator('h1')).toContainText('AI Resume Builder Guides')
  })
})
