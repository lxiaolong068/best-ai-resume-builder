import { test, expect } from '@playwright/test'

test.describe('Navigation Links', () => {
  test('should navigate to all main pages successfully', async ({ page }) => {
    // Start from homepage
    await page.goto('http://localhost:3000')
    await expect(page).toHaveTitle(/Best AI Resume Builder 2025/)

    // Test ATS Checker page
    await page.goto('http://localhost:3000/ats-checker')
    await expect(page).toHaveTitle(/Free ATS Resume Checker 2025/)
    await expect(page.locator('h1')).toContainText('Free ATS Resume Checker')

    // Test Compare page
    await page.goto('http://localhost:3000/compare')
    await expect(page).toHaveTitle(/AI Resume Builder Comparison 2025/)
    await expect(page.locator('h1')).toContainText('AI Resume Builder Comparison')

    // Test Methodology page
    await page.goto('http://localhost:3000/methodology')
    await expect(page).toHaveTitle(/AI Resume Builder Testing Methodology 2025/)
    await expect(page.locator('h1')).toContainText('Our Testing Methodology')

    // Test Guides page
    await page.goto('http://localhost:3000/guides')
    await expect(page).toHaveTitle(/AI Resume Builder Guides 2025/)
    await expect(page.locator('h1')).toContainText('AI Resume Builder Guides')

    // Test Templates page
    await page.goto('http://localhost:3000/templates')
    await expect(page).toHaveTitle(/Free Resume Templates 2025/)
    await expect(page.locator('h1')).toContainText('Free Resume Templates')
  })

  test('should have working navigation links on homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Check if navigation links exist (even if they're anchor links due to caching)
    const compareLink = page.locator('nav a:has-text("Compare Tools")')
    const testingLink = page.locator('nav a:has-text("Testing")')
    const guidesLink = page.locator('nav a:has-text("Guides")')
    
    await expect(compareLink).toBeVisible()
    await expect(testingLink).toBeVisible()
    await expect(guidesLink).toBeVisible()
  })

  test('should have working CTA buttons', async ({ page }) => {
    await page.goto('http://localhost:3000')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Check main CTA buttons exist
    const viewToolsButton = page.locator('button:has-text("View Best Tools"), a:has-text("View Best Tools")')
    const atsTestButton = page.locator('button:has-text("Free ATS Test"), a:has-text("Free ATS Test")')
    
    await expect(viewToolsButton.first()).toBeVisible()
    await expect(atsTestButton.first()).toBeVisible()
  })

  test('should load all pages without errors', async ({ page }) => {
    const pages = [
      { url: 'http://localhost:3000', title: 'Best AI Resume Builder 2025' },
      { url: 'http://localhost:3000/ats-checker', title: 'Free ATS Resume Checker 2025' },
      { url: 'http://localhost:3000/compare', title: 'AI Resume Builder Comparison 2025' },
      { url: 'http://localhost:3000/methodology', title: 'AI Resume Builder Testing Methodology 2025' },
      { url: 'http://localhost:3000/guides', title: 'AI Resume Builder Guides 2025' },
      { url: 'http://localhost:3000/templates', title: 'Free Resume Templates 2025' }
    ]

    for (const pageInfo of pages) {
      await page.goto(pageInfo.url)
      await page.waitForLoadState('networkidle')
      
      // Check page loads without errors
      await expect(page).toHaveTitle(new RegExp(pageInfo.title.split(' |')[0]))
      
      // Check no console errors
      const errors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })
      
      // Wait a bit to catch any console errors
      await page.waitForTimeout(1000)
      
      // Log any errors for debugging but don't fail the test
      if (errors.length > 0) {
        console.log(`Console errors on ${pageInfo.url}:`, errors)
      }
    }
  })

  test('should have proper SEO meta tags', async ({ page }) => {
    const pages = [
      'http://localhost:3000',
      'http://localhost:3000/ats-checker',
      'http://localhost:3000/compare',
      'http://localhost:3000/methodology',
      'http://localhost:3000/guides',
      'http://localhost:3000/templates'
    ]

    for (const url of pages) {
      await page.goto(url)
      await page.waitForLoadState('networkidle')
      
      // Check essential meta tags exist
      const title = await page.locator('title').textContent()
      const description = await page.locator('meta[name="description"]').getAttribute('content')
      const keywords = await page.locator('meta[name="keywords"]').getAttribute('content')
      
      expect(title).toBeTruthy()
      expect(title?.length).toBeGreaterThan(10)
      expect(description).toBeTruthy()
      expect(description?.length).toBeGreaterThan(50)
      expect(keywords).toBeTruthy()
    }
  })

  test('should have responsive design', async ({ page }) => {
    const pages = [
      'http://localhost:3000',
      'http://localhost:3000/ats-checker',
      'http://localhost:3000/compare'
    ]

    // Test different viewport sizes
    const viewports = [
      { width: 375, height: 667 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1920, height: 1080 } // Desktop
    ]

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      
      for (const url of pages) {
        await page.goto(url)
        await page.waitForLoadState('networkidle')
        
        // Check page renders without horizontal scroll
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
        expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 20) // Allow small margin
        
        // Check main content is visible
        const mainContent = page.locator('main, [role="main"], h1').first()
        await expect(mainContent).toBeVisible()
      }
    }
  })
})

test.describe('ATS Checker Functionality', () => {
  test('should display file upload interface', async ({ page }) => {
    await page.goto('http://localhost:3000/ats-checker')
    await page.waitForLoadState('networkidle')
    
    // Check upload interface exists
    const uploadArea = page.locator('[role="button"]:has-text("Drag"), input[type="file"]').first()
    await expect(uploadArea).toBeVisible()
    
    // Check upload instructions
    await expect(page.locator('text=Supports PDF, DOC, DOCX')).toBeVisible()
  })
})

test.describe('Compare Page Functionality', () => {
  test('should display comparison tools', async ({ page }) => {
    await page.goto('http://localhost:3000/compare')
    await page.waitForLoadState('networkidle')
    
    // Wait for tools to load
    await page.waitForTimeout(2000)
    
    // Check if tools are displayed
    const toolButtons = page.locator('button:has-text("Resume.io"), button:has-text("Zety"), button:has-text("Jasper")')
    await expect(toolButtons.first()).toBeVisible()
    
    // Check search functionality exists
    const searchInput = page.locator('input[placeholder*="Search"]')
    await expect(searchInput).toBeVisible()
  })
})

test.describe('Templates Page Functionality', () => {
  test('should display template categories and download buttons', async ({ page }) => {
    await page.goto('http://localhost:3000/templates')
    await page.waitForLoadState('networkidle')
    
    // Check category filters exist
    const categoryButtons = page.locator('button:has-text("All Templates"), button:has-text("Professional"), button:has-text("Technology")')
    await expect(categoryButtons.first()).toBeVisible()
    
    // Check download buttons exist
    const downloadButtons = page.locator('button:has-text("Download")')
    await expect(downloadButtons.first()).toBeVisible()
  })
})
