import { test, expect } from '@playwright/test'

// 所有指南页面的数据
const guides = [
  {
    slug: 'complete-ai-resume-builder-guide-2025',
    title: 'Complete AI Resume Builder Guide 2025',
    category: 'Getting Started',
    readTime: '15 min read'
  },
  {
    slug: 'ats-optimization-guide',
    title: 'ATS Optimization Guide',
    category: 'ATS Optimization',
    readTime: '12 min read'
  },
  {
    slug: 'industry-specific-resume-tips',
    title: 'Industry-Specific Resume Tips',
    category: 'Industry Guides',
    readTime: '20 min read'
  },
  {
    slug: 'chatgpt-resume-prompts',
    title: 'ChatGPT Resume Prompts',
    category: 'AI Tools',
    readTime: '10 min read'
  },
  {
    slug: 'resume-keywords-guide',
    title: 'Resume Keywords Guide',
    category: 'Keywords',
    readTime: '8 min read'
  },
  {
    slug: 'resume-format-guide-2025',
    title: 'Resume Format Guide 2025',
    category: 'Formatting',
    readTime: '12 min read'
  },
  {
    slug: 'cover-letter-ai-guide',
    title: 'Cover Letter AI Guide',
    category: 'Cover Letters',
    readTime: '10 min read'
  },
  {
    slug: 'resume-review-checklist',
    title: 'Resume Review Checklist',
    category: 'Review Process',
    readTime: '6 min read'
  }
]

test.describe('Guides Pages', () => {
  test('should load guides index page successfully', async ({ page }) => {
    await page.goto('http://localhost:3000/guides')
    
    // 检查页面标题
    await expect(page).toHaveTitle(/AI Resume Builder Guides 2025/)
    
    // 检查主标题
    await expect(page.locator('h1')).toContainText('AI Resume Builder Guides')
    
    // 检查所有指南链接是否存在
    for (const guide of guides) {
      const guideLink = page.locator(`a[href="/guides/${guide.slug}"]`)
      await expect(guideLink).toBeVisible()
    }
  })

  test('should navigate from guides index to individual guide pages', async ({ page }) => {
    await page.goto('http://localhost:3000/guides')
    
    // 点击第一个指南链接
    const firstGuideLink = page.locator(`a[href="/guides/${guides[0].slug}"]`).first()
    await firstGuideLink.click()
    
    // 验证导航成功
    await expect(page).toHaveURL(`http://localhost:3000/guides/${guides[0].slug}`)
    await expect(page.locator('h1')).toContainText(guides[0].title)
  })

  // 为每个指南页面创建单独的测试
  for (const guide of guides) {
    test(`should load ${guide.slug} page successfully`, async ({ page }) => {
      await page.goto(`http://localhost:3000/guides/${guide.slug}`)
      
      // 检查页面标题包含指南标题
      await expect(page).toHaveTitle(new RegExp(guide.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
      
      // 检查主标题
      await expect(page.locator('h1')).toContainText(guide.title)
      
      // 检查类别标签
      await expect(page.locator('text=' + guide.category)).toBeVisible()
      
      // 检查阅读时间
      await expect(page.locator('text=' + guide.readTime)).toBeVisible()
      
      // 检查面包屑导航
      await expect(page.locator('nav').first()).toContainText('Home')
      await expect(page.locator('nav').first()).toContainText('Guides')
      await expect(page.locator('nav').first()).toContainText(guide.title)
      
      // 检查目录是否存在
      await expect(page.locator('text=Table of Contents')).toBeVisible()
      
      // 检查CTA按钮
      await expect(page.locator('text=Test Your Resume')).toBeVisible()
      await expect(page.locator('text=Compare Tools')).toBeVisible()
      
      // 检查相关指南部分（如果存在）
      const relatedGuidesSection = page.locator('text=Related Guides')
      if (await relatedGuidesSection.isVisible()) {
        await expect(relatedGuidesSection).toBeVisible()
      }
    })

    test(`should have proper SEO metadata for ${guide.slug}`, async ({ page }) => {
      await page.goto(`http://localhost:3000/guides/${guide.slug}`)
      
      // 检查页面标题
      const title = await page.title()
      expect(title).toContain(guide.title)
      expect(title).toContain('Best AI Resume Builder 2025')
      
      // 检查meta description
      const metaDescription = await page.locator('meta[name="description"]').getAttribute('content')
      expect(metaDescription).toBeTruthy()
      expect(metaDescription!.length).toBeGreaterThan(50)
      
      // 检查canonical URL
      const canonicalUrl = await page.locator('link[rel="canonical"]').getAttribute('href')
      expect(canonicalUrl).toBe(`/guides/${guide.slug}`)
      
      // 检查Open Graph标签
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
      expect(ogTitle).toContain(guide.title)
      
      const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content')
      expect(ogDescription).toBeTruthy()
      
      const ogType = await page.locator('meta[property="og:type"]').getAttribute('content')
      expect(ogType).toBe('article')
    })

    test(`should have no console errors on ${guide.slug}`, async ({ page }) => {
      const consoleErrors: string[] = []
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })
      
      await page.goto(`http://localhost:3000/guides/${guide.slug}`)
      await page.waitForLoadState('networkidle')
      
      // 过滤掉已知的无害错误（如React DevTools提示）
      const significantErrors = consoleErrors.filter(error => 
        !error.includes('React DevTools') && 
        !error.includes('Download the React DevTools')
      )
      
      expect(significantErrors).toHaveLength(0)
    })
  }

  test('should handle 404 for non-existent guide', async ({ page }) => {
    await page.goto('http://localhost:3000/guides/non-existent-guide')
    
    // 检查404页面
    await expect(page.locator('h1')).toContainText('404')
    await expect(page.locator('text=Page Not Found')).toBeVisible()
    await expect(page.locator('a[href="/"]')).toBeVisible()
    
    // 检查页面标题
    await expect(page).toHaveTitle('Guide Not Found')
  })

  test('should have working navigation links', async ({ page }) => {
    // 测试从指南页面返回到指南索引
    await page.goto(`http://localhost:3000/guides/${guides[0].slug}`)
    
    // 点击面包屑中的"Guides"链接
    await page.locator('nav a[href="/guides"]').click()
    await expect(page).toHaveURL('http://localhost:3000/guides')
    
    // 测试从指南页面返回到首页
    await page.goto(`http://localhost:3000/guides/${guides[0].slug}`)
    await page.locator('nav a[href="/"]').click()
    await expect(page).toHaveURL('http://localhost:3000/')
  })

  test('should have working CTA buttons', async ({ page }) => {
    await page.goto(`http://localhost:3000/guides/${guides[0].slug}`)
    
    // 测试"Test Your Resume"按钮
    const testResumeButton = page.locator('a[href="/ats-checker"]')
    await expect(testResumeButton).toBeVisible()
    
    // 测试"Compare Tools"按钮
    const compareToolsButton = page.locator('a[href="/compare"]')
    await expect(compareToolsButton).toBeVisible()
  })

  test('should have working table of contents links', async ({ page }) => {
    await page.goto(`http://localhost:3000/guides/${guides[0].slug}`)
    
    // 检查目录链接是否可点击（桌面版）
    const tocLinks = page.locator('nav a[href^="#"]')
    const tocCount = await tocLinks.count()
    
    if (tocCount > 0) {
      // 点击第一个目录链接
      await tocLinks.first().click()
      
      // 验证页面滚动到对应位置（通过检查URL hash）
      const currentUrl = page.url()
      expect(currentUrl).toContain('#')
    }
  })

  test('should have responsive design', async ({ page }) => {
    // 测试移动端视图
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(`http://localhost:3000/guides/${guides[0].slug}`)
    
    // 检查移动端目录按钮是否存在
    const mobileTableOfContents = page.locator('button:has-text("Table of Contents")')
    if (await mobileTableOfContents.isVisible()) {
      await expect(mobileTableOfContents).toBeVisible()
      
      // 点击展开目录
      await mobileTableOfContents.click()
      
      // 检查目录是否展开
      const tocNav = page.locator('nav').filter({ hasText: 'Table of Contents' }).locator('a').first()
      await expect(tocNav).toBeVisible()
    }
    
    // 恢复桌面视图
    await page.setViewportSize({ width: 1280, height: 720 })
  })

  test('should have working related guides links', async ({ page }) => {
    await page.goto(`http://localhost:3000/guides/${guides[0].slug}`)
    
    // 检查相关指南部分
    const relatedGuidesSection = page.locator('text=Related Guides')
    if (await relatedGuidesSection.isVisible()) {
      // 获取相关指南链接
      const relatedGuideLinks = page.locator('section:has-text("Related Guides") a[href^="/guides/"]')
      const linkCount = await relatedGuideLinks.count()
      
      if (linkCount > 0) {
        // 点击第一个相关指南链接
        const firstRelatedLink = relatedGuideLinks.first()
        const href = await firstRelatedLink.getAttribute('href')
        
        await firstRelatedLink.click()
        
        // 验证导航成功
        await expect(page).toHaveURL(`http://localhost:3000${href}`)
        await expect(page.locator('h1')).toBeVisible()
      }
    }
  })
})
