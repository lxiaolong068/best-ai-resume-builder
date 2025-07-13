import { NextRequest, NextResponse } from 'next/server'
import { analyzeResumeATSWithAI } from '@/lib/ats-analyzer'
import { AICostManager } from '@/lib/ai-cost-management'
import { aiErrorHandler } from '@/lib/ai-error-handler'

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.headers.get('x-session-id') || 'anonymous'
    
    // 解析请求体
    const body = await request.json()
    const { resumeText, targetIndustry, model, useAI = true } = body

    // 验证输入
    if (!resumeText || typeof resumeText !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Resume text is required' },
        { status: 400 }
      )
    }

    if (resumeText.length < 50) {
      return NextResponse.json(
        { success: false, error: 'Resume text is too short (minimum 50 characters)' },
        { status: 400 }
      )
    }

    if (resumeText.length > 15000) {
      return NextResponse.json(
        { success: false, error: 'Resume text is too long (maximum 15,000 characters)' },
        { status: 400 }
      )
    }

    // 如果启用AI分析，检查配额
    if (useAI) {
      const costManager = new AICostManager()
      const quotaCheck = await costManager.checkUsageQuota(sessionId)
      
      if (!quotaCheck.canProceed) {
        console.warn('AI quota exceeded, falling back to rule-based analysis')
        // 不返回错误，而是继续使用规则分析
      }
    }

    const startTime = Date.now()
    
    // 执行分析，使用改进的错误处理和降级机制
    const analysis = await aiErrorHandler.executeWithFallback(
      async () => {
        if (!useAI) {
          return (await import('@/lib/ats-analyzer')).analyzeResumeATS(resumeText, targetIndustry)
        }
        return analyzeResumeATSWithAI(resumeText, targetIndustry, sessionId, model)
      },
      async () => {
        // Fallback to rule-based analysis
        console.log('Falling back to rule-based analysis')
        return (await import('@/lib/ats-analyzer')).analyzeResumeATS(resumeText, targetIndustry)
      },
      undefined, // No further degraded operation needed for analysis
      'Resume ATS analysis'
    )
    
    const responseTime = Date.now() - startTime

    // 记录分析事件
    try {
      await fetch(`${request.nextUrl.origin}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId,
        },
        body: JSON.stringify({
          eventType: 'ai_resume_analysis',
          eventData: {
            industry: targetIndustry || 'unknown',
            overallScore: analysis.overallScore,
            resumeLength: resumeText.length,
            responseTime,
            aiEnhanced: analysis.aiEnhanced || false,
            formattingScore: analysis.sections.formatting.score,
            contentScore: analysis.sections.content.score,
            keywordScore: analysis.sections.keywords.score,
            structureScore: analysis.sections.structure.score,
            model: model || 'rule-based'
          },
          pageUrl: '/ai/analyze-resume'
        }),
      })
    } catch (error) {
      console.error('Failed to track analysis event:', error)
    }

    return NextResponse.json({
      success: true,
      data: {
        analysis,
        metadata: {
          responseTimeMs: responseTime,
          aiEnhanced: analysis.aiEnhanced || false,
          analysisType: analysis.aiEnhanced ? 'hybrid' : 'rule-based',
          timestamp: new Date().toISOString()
        }
      }
    })

  } catch (error) {
    console.error('Resume analysis failed:', error)
    
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
          eventType: 'ai_analysis_error',
          eventData: {
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          },
          pageUrl: '/ai/analyze-resume'
        }),
      })
    } catch (trackingError) {
      console.error('Failed to track error event:', trackingError)
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Resume analysis failed. Please try again.',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    )
  }
}

// GET方法用于获取分析服务信息
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.headers.get('x-session-id') || 'anonymous'
    
    const costManager = new AICostManager()
    const quotaInfo = await costManager.checkUsageQuota(sessionId)

    return NextResponse.json({
      success: true,
      data: {
        quota: quotaInfo,
        supportedIndustries: [
          'Technology',
          'Business',
          'Marketing',
          'Finance',
          'Healthcare',
          'Education',
          'Engineering',
          'Sales',
          'Design',
          'Legal'
        ],
        analysisFeatures: {
          ruleBasedAnalysis: true,
          aiEnhancedAnalysis: quotaInfo.canProceed,
          supportedLanguages: ['English', 'Chinese'],
          maxResumeLength: 15000,
          minResumeLength: 50
        }
      }
    })
  } catch (error) {
    console.error('Failed to get analysis service info:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get service information' },
      { status: 500 }
    )
  }
}
