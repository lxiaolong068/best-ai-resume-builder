import { test, expect } from '@playwright/test'

test.describe('Compare Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/compare')
  })

  test('should load compare page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/AI Resume Builder Comparison 2025/)
    await expect(page.locator('h1')).toContainText('AI Resume Builder Comparison 2025')
  })

  test('should display tools without duplicates', async ({ page }) => {
    // Wait for tools to load
    await page.waitForSelector('[data-testid="tool-card"]', { timeout: 10000 })
    
    // Get all tool cards
    const toolCards = await page.locator('[data-testid="tool-card"]').all()
    
    // Extract tool names
    const toolNames = []
    for (const card of toolCards) {
      const name = await card.locator('[data-testid="tool-name"]').textContent()
      if (name) {
        toolNames.push(name.trim())
      }
    }
    
    // Check for duplicates
    const uniqueNames = [...new Set(toolNames)]
    expect(toolNames.length).toBe(uniqueNames.length)
    
    // Should have exactly 8 unique tools
    expect(uniqueNames.length).toBe(8)
    
    console.log('Found tools:', uniqueNames)
  })

  test('should handle tool selection correctly', async ({ page }) => {
    // Wait for tools to load
    await page.waitForSelector('[data-testid="tool-card"]', { timeout: 10000 })
    
    // Check initial selection (should auto-select top 3)
    const selectedCount = await page.locator('h3').filter({ hasText: /Select tools to compare \((\d+)\/5\):/ }).textContent()
    expect(selectedCount).toContain('(3/5)')
    
    // Click on a tool to deselect it
    const firstTool = page.locator('[data-testid="tool-card"]').first()
    await firstTool.click()
    
    // Check if selection count changed
    await page.waitForTimeout(1000) // Wait for state update
    const newSelectedCount = await page.locator('h3').filter({ hasText: /Select tools to compare \((\d+)\/5\):/ }).textContent()
    expect(newSelectedCount).toContain('(2/5)')
  })

  test('should not have API errors', async ({ page }) => {
    // Listen for console errors
    const consoleErrors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    // Listen for network failures
    const networkErrors = []
    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push(`${response.request().method()} ${response.url()} => ${response.status()}`)
      }
    })
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    
    // Check for errors
    console.log('Console errors:', consoleErrors)
    console.log('Network errors:', networkErrors)
    
    // Should not have any 400 errors from compare API
    const compareErrors = networkErrors.filter(error => error.includes('/api/tools/compare') && error.includes('400'))
    expect(compareErrors.length).toBe(0)
  })

  test('should display comparison table when tools are selected', async ({ page }) => {
    // Wait for tools to load and auto-selection
    await page.waitForSelector('[data-testid="tool-card"]', { timeout: 10000 })
    await page.waitForTimeout(2000) // Wait for auto-selection and comparison data
    
    // Check if comparison table is visible
    const comparisonTable = page.locator('table')
    await expect(comparisonTable).toBeVisible()
    
    // Check if table has the correct structure
    const headers = await page.locator('th').all()
    expect(headers.length).toBeGreaterThan(3) // Should have Features column + selected tools
    
    // Check if features are displayed
    const featuresColumn = page.locator('th').first()
    await expect(featuresColumn).toContainText('Features')
  })

  test('should handle search functionality', async ({ page }) => {
    // Wait for tools to load
    await page.waitForSelector('[data-testid="tool-card"]', { timeout: 10000 })
    
    // Get initial tool count
    const initialCount = await page.locator('[data-testid="tool-card"]').count()
    
    // Search for a specific tool
    const searchInput = page.locator('input[placeholder="Search tools..."]')
    await searchInput.fill('Resume.io')
    
    // Wait for search results
    await page.waitForTimeout(1000)
    
    // Check if results are filtered
    const filteredCount = await page.locator('[data-testid="tool-card"]').count()
    expect(filteredCount).toBeLessThanOrEqual(initialCount)
    
    // Clear search
    await searchInput.clear()
    await page.waitForTimeout(1000)
    
    // Should show all tools again
    const finalCount = await page.locator('[data-testid="tool-card"]').count()
    expect(finalCount).toBe(initialCount)
  })
})
