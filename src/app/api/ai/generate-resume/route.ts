import { NextRequest, NextResponse } from 'next/server'
import { AIResumeService } from '@/lib/ai-services'
import { AICostManager } from '@/lib/ai-cost-management'
import { OpenRouterModelManager } from '@/lib/openrouter-models'

// 速率限制配置
const RATE_LIMIT_REQUESTS = 10 // 每小时最大请求数
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1小时窗口

// 简单的内存速率限制器
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(sessionId: string): { success: boolean; remaining: number } {
  const now = Date.now()
  const key = sessionId
  const limit = rateLimitMap.get(key)

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return { success: true, remaining: RATE_LIMIT_REQUESTS - 1 }
  }

  if (limit.count >= RATE_LIMIT_REQUESTS) {
    return { success: false, remaining: 0 }
  }

  limit.count++
  return { success: true, remaining: RATE_LIMIT_REQUESTS - limit.count }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.headers.get('x-session-id') || 'anonymous'
    
    // 速率限制检查
    const rateLimitResult = checkRateLimit(sessionId)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: 3600 // 1小时后重试
        },
        { status: 429 }
      )
    }

    // 解析请求体
    const body = await request.json()
    const { sectionType, userInput, targetRole, model, complexity = 'medium' } = body

    // 验证输入
    if (!sectionType || !['summary', 'experience', 'skills'].includes(sectionType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid section type. Must be: summary, experience, or skills' },
        { status: 400 }
      )
    }

    if (!userInput || typeof userInput !== 'string' || userInput.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'User input is required and must be at least 10 characters' },
        { status: 400 }
      )
    }

    if (!targetRole || typeof targetRole !== 'string' || targetRole.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Target role is required and must be at least 2 characters' },
        { status: 400 }
      )
    }

    // 成本控制检查
    const costManager = new AICostManager()
    const quotaCheck = await costManager.checkUsageQuota(sessionId)
    
    if (!quotaCheck.canProceed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Usage quota exceeded', 
          quota: {
            remainingBudget: quotaCheck.remainingBudget,
            remainingTokens: quotaCheck.remainingTokens,
            dailyUsage: quotaCheck.dailyUsage,
            monthlySpent: quotaCheck.monthlySpent
          }
        },
        { status: 429 }
      )
    }

    // 选择最优模型
    const modelManager = new OpenRouterModelManager()
    const selectedModel = model || quotaCheck.recommendedModel || 
      await modelManager.recommendModelForTask('generation', complexity, 'medium')

    // 执行AI生成
    const aiService = new AIResumeService()
    const startTime = Date.now()
    
    const generatedContent = await aiService.generateResumeSection(
      sectionType,
      userInput.trim(),
      targetRole.trim(),
      selectedModel
    )
    
    const responseTime = Date.now() - startTime

    // 计算成本
    const inputText = `Generate ${sectionType} for ${targetRole}: ${userInput}`
    const estimatedCost = await aiService.estimateCost(inputText, generatedContent, selectedModel)
    const tokensUsed = aiService.estimateTokens(inputText + generatedContent)

    // 记录使用情况
    await costManager.trackUsage(
      sessionId,
      'generate_resume_section',
      inputText,
      generatedContent,
      selectedModel,
      tokensUsed,
      responseTime,
      estimatedCost
    )

    // 记录成功的分析事件
    try {
      await fetch(`${request.nextUrl.origin}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId,
        },
        body: JSON.stringify({
          eventType: 'ai_generation_success',
          eventData: {
            sectionType,
            targetRole,
            model: selectedModel,
            responseTime,
            tokensUsed,
            estimatedCost,
            inputLength: userInput.length,
            outputLength: generatedContent.length
          },
          pageUrl: '/ai/generate-resume'
        }),
      })
    } catch (error) {
      console.error('Failed to track AI generation event:', error)
    }

    return NextResponse.json({
      success: true,
      data: {
        content: generatedContent,
        metadata: {
          tokensUsed,
          responseTimeMs: responseTime,
          modelUsed: selectedModel,
          estimatedCost,
          sectionType,
          targetRole,
          remainingQuota: {
            tokens: quotaCheck.remainingTokens - tokensUsed,
            budget: quotaCheck.remainingBudget - estimatedCost
          }
        }
      }
    })

  } catch (error) {
    console.error('AI generation failed:', error)
    
    const sessionId = request.headers.get('x-session-id') || 'anonymous'
    
    // 记录错误事件
    try {
      await fetch(`${request.nextUrl.origin}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId,
        },
        body: JSON.stringify({
          eventType: 'ai_generation_error',
          eventData: {
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          },
          pageUrl: '/ai/generate-resume'
        }),
      })
    } catch (trackingError) {
      console.error('Failed to track error event:', trackingError)
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'AI generation failed. Please try again.',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    )
  }
}

// GET方法用于获取可用模型和配额信息
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.headers.get('x-session-id') || 'anonymous'
    
    const costManager = new AICostManager()
    const modelManager = new OpenRouterModelManager()
    
    const [quotaInfo, availableModels] = await Promise.all([
      costManager.checkUsageQuota(sessionId),
      modelManager.getAvailableModels()
    ])

    return NextResponse.json({
      success: true,
      data: {
        quota: quotaInfo,
        availableModels: availableModels.slice(0, 10), // 返回前10个模型
        supportedSections: ['summary', 'experience', 'skills'],
        rateLimit: {
          maxRequests: RATE_LIMIT_REQUESTS,
          windowMs: RATE_LIMIT_WINDOW
        }
      }
    })
  } catch (error) {
    console.error('Failed to get AI service info:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get service information' },
      { status: 500 }
    )
  }
}
