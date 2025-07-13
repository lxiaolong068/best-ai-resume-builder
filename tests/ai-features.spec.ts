import { test, expect } from '@playwright/test'

test.describe('AI Features End-to-End Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 设置测试环境
    await page.goto('/')
  })

  test.describe('AI Resume Builder', () => {
    test('should load AI resume builder page', async ({ page }) => {
      await page.goto('/ai-resume-builder')
      
      await expect(page.locator('h1')).toContainText('AI Resume Builder')
      await expect(page.locator('text=Generate professional resume content')).toBeVisible()
    })

    test('should generate resume summary with AI', async ({ page }) => {
      await page.goto('/ai-resume-builder')
      
      // 填写目标职位
      await page.fill('input[placeholder*="高级软件工程师"]', 'Senior Software Engineer')
      
      // 选择summary部分
      await page.click('button:has-text("个人总结")')
      
      // 填写用户输入
      await page.fill('textarea[placeholder*="请描述您的背景"]', 
        'I am a software engineer with 5 years of experience in full-stack development, specializing in React and Node.js.')
      
      // 点击生成按钮
      await page.click('button:has-text("生成个人总结")')
      
      // 等待生成完成
      await expect(page.locator('text=AI生成中')).toBeVisible()
      await expect(page.locator('text=AI生成中')).not.toBeVisible({ timeout: 30000 })
      
      // 验证生成结果
      const generatedContent = page.locator('[class*="whitespace-pre-wrap"]')
      await expect(generatedContent).toBeVisible()
      await expect(generatedContent).not.toBeEmpty()
    })

    test('should show quota information', async ({ page }) => {
      await page.goto('/ai-resume-builder')
      
      // 检查配额信息显示
      await expect(page.locator('text=剩余配额')).toBeVisible()
      await expect(page.locator('text=tokens')).toBeVisible()
      await expect(page.locator('text=预算')).toBeVisible()
    })

    test('should handle different resume sections', async ({ page }) => {
      await page.goto('/ai-resume-builder')
      
      const sections = ['个人总结', '工作经验', '技能列表']
      
      for (const section of sections) {
        await page.click(`button:has-text("${section}")`)
        await expect(page.locator(`button:has-text("${section}")`)).toHaveClass(/border-blue-500/)
        
        // 验证对应的占位符文本更新
        const textarea = page.locator('textarea[placeholder*="请"]')
        await expect(textarea).toBeVisible()
      }
    })

    test('should copy generated content', async ({ page }) => {
      await page.goto('/ai-resume-builder')
      
      // 模拟已生成内容的状态
      await page.evaluate(() => {
        // 这里可以通过设置localStorage或其他方式模拟已生成的内容
        const event = new CustomEvent('test-set-content', {
          detail: { content: 'Test generated content for copying' }
        })
        window.dispatchEvent(event)
      })
      
      // 如果有生成的内容，测试复制功能
      const copyButton = page.locator('button:has-text("复制内容")')
      if (await copyButton.isVisible()) {
        await copyButton.click()
        // 验证复制成功的反馈
      }
    })
  })

  test.describe('Enhanced ATS Analyzer', () => {
    test('should show AI enhancement toggle', async ({ page }) => {
      await page.goto('/ats-analyzer')
      
      // 检查AI增强开关
      await expect(page.locator('text=AI增强分析')).toBeVisible()
      await expect(page.locator('input[type="checkbox"]')).toBeVisible()
    })

    test('should analyze resume with AI enhancement', async ({ page }) => {
      await page.goto('/ats-analyzer')
      
      // 确保AI增强开关开启
      const aiToggle = page.locator('input[type="checkbox"]')
      if (!(await aiToggle.isChecked())) {
        await aiToggle.click()
      }
      
      // 填写简历文本
      const resumeText = `
        John Doe
        Software Engineer
        
        Experience:
        - Developed web applications using React and Node.js
        - Collaborated with cross-functional teams
        - Implemented responsive designs
        
        Skills:
        JavaScript, React, Node.js, HTML, CSS
      `
      
      await page.fill('textarea[placeholder*="Copy and paste"]', resumeText)
      
      // 选择目标行业
      await page.selectOption('select', 'Technology')
      
      // 点击分析按钮
      await page.click('button:has-text("Analyze Resume")')
      
      // 等待分析完成
      await expect(page.locator('text=Analyzing')).toBeVisible()
      await expect(page.locator('text=Your ATS Score')).toBeVisible({ timeout: 30000 })
      
      // 验证AI洞察部分
      await expect(page.locator('text=AI深度洞察')).toBeVisible()
      await expect(page.locator('text=AI增强')).toBeVisible()
    })

    test('should show AI insights when available', async ({ page }) => {
      await page.goto('/ats-analyzer')
      
      // 启用AI增强
      await page.check('input[type="checkbox"]')
      
      // 填写测试简历
      await page.fill('textarea[placeholder*="Copy and paste"]', 
        'Software Engineer with experience in React and Node.js development.')
      
      await page.click('button:has-text("Analyze Resume")')
      
      // 等待分析完成并检查AI洞察
      await page.waitForSelector('text=Your ATS Score', { timeout: 30000 })
      
      // 如果有AI洞察，验证其内容
      const aiInsights = page.locator('text=AI深度洞察')
      if (await aiInsights.isVisible()) {
        await expect(page.locator('text=AI评分')).toBeVisible()
        await expect(page.locator('text=AI建议')).toBeVisible()
      }
    })

    test('should fallback to rule-based analysis when AI fails', async ({ page }) => {
      await page.goto('/ats-analyzer')
      
      // 禁用AI增强
      const aiToggle = page.locator('input[type="checkbox"]')
      if (await aiToggle.isChecked()) {
        await aiToggle.click()
      }
      
      await page.fill('textarea[placeholder*="Copy and paste"]', 
        'Basic resume text for rule-based analysis testing.')
      
      await page.click('button:has-text("Analyze Resume")')
      
      // 验证基础分析结果
      await expect(page.locator('text=Your ATS Score')).toBeVisible({ timeout: 15000 })
      
      // 确保没有AI洞察部分
      await expect(page.locator('text=AI深度洞察')).not.toBeVisible()
    })
  })

  test.describe('API Endpoints', () => {
    test('should handle AI generation API', async ({ page }) => {
      const response = await page.request.post('/api/ai/generate-resume', {
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': 'test-session'
        },
        data: {
          sectionType: 'summary',
          userInput: 'Software engineer with 5 years experience',
          targetRole: 'Senior Developer',
          complexity: 'medium'
        }
      })
      
      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data.content).toBeDefined()
      expect(data.data.metadata).toBeDefined()
    })

    test('should handle AI analysis API', async ({ page }) => {
      const response = await page.request.post('/api/ai/analyze-resume', {
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': 'test-session'
        },
        data: {
          resumeText: 'Software engineer with experience in web development',
          targetIndustry: 'Technology',
          useAI: true
        }
      })
      
      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data.analysis).toBeDefined()
      expect(data.data.metadata).toBeDefined()
    })

    test('should validate input parameters', async ({ page }) => {
      // 测试无效的section type
      const response1 = await page.request.post('/api/ai/generate-resume', {
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': 'test-session'
        },
        data: {
          sectionType: 'invalid',
          userInput: 'test',
          targetRole: 'test'
        }
      })
      
      expect(response1.status()).toBe(400)
      
      // 测试空的用户输入
      const response2 = await page.request.post('/api/ai/generate-resume', {
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': 'test-session'
        },
        data: {
          sectionType: 'summary',
          userInput: '',
          targetRole: 'test'
        }
      })
      
      expect(response2.status()).toBe(400)
    })

    test('should handle rate limiting', async ({ page }) => {
      const sessionId = 'rate-limit-test-session'
      
      // 发送多个快速请求
      const requests = Array.from({ length: 15 }, (_, i) => 
        page.request.post('/api/ai/generate-resume', {
          headers: {
            'Content-Type': 'application/json',
            'X-Session-ID': sessionId
          },
          data: {
            sectionType: 'summary',
            userInput: `Test input ${i}`,
            targetRole: 'Test Role'
          }
        })
      )
      
      const responses = await Promise.all(requests)
      
      // 应该有一些请求被限制
      const rateLimitedResponses = responses.filter(r => r.status() === 429)
      expect(rateLimitedResponses.length).toBeGreaterThan(0)
    })
  })

  test.describe('Performance', () => {
    test('should load AI resume builder page quickly', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/ai-resume-builder')
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime
      
      expect(loadTime).toBeLessThan(5000) // 5秒内加载完成
    })

    test('should handle concurrent AI requests', async ({ page }) => {
      await page.goto('/ai-resume-builder')
      
      // 模拟多个并发请求
      const requests = Array.from({ length: 3 }, async (_, i) => {
        return page.request.post('/api/ai/generate-resume', {
          headers: {
            'Content-Type': 'application/json',
            'X-Session-ID': `concurrent-test-${i}`
          },
          data: {
            sectionType: 'summary',
            userInput: `Concurrent test input ${i}`,
            targetRole: 'Test Role'
          }
        })
      })
      
      const responses = await Promise.all(requests)
      
      // 所有请求都应该成功
      responses.forEach(response => {
        expect(response.status()).toBe(200)
      })
    })
  })
})
