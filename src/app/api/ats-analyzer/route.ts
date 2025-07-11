import { NextRequest, NextResponse } from 'next/server'
import { analyzeResumeATS } from '@/lib/ats-analyzer'
import { trackCustomEvent } from '@/lib/analytics'

// POST /api/ats-analyzer - Analyze resume for ATS compatibility
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { resumeText, targetIndustry, email } = body
    
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
    
    if (resumeText.length > 10000) {
      return NextResponse.json(
        { success: false, error: 'Resume text is too long (maximum 10,000 characters)' },
        { status: 400 }
      )
    }
    
    // Analyze the resume
    const analysis = analyzeResumeATS(resumeText, targetIndustry)
    
    // Track usage analytics
    const sessionId = request.headers.get('x-session-id') || 'anonymous'
    const userAgent = request.headers.get('user-agent') || ''
    
    // Track the analysis event
    try {
      await fetch(`${request.nextUrl.origin}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId,
        },
        body: JSON.stringify({
          eventType: 'ats_analysis',
          eventData: {
            industry: targetIndustry || 'unknown',
            overallScore: analysis.overallScore,
            resumeLength: resumeText.length,
            hasEmail: !!email,
            formattingScore: analysis.sections.formatting.score,
            contentScore: analysis.sections.content.score,
            keywordScore: analysis.sections.keywords.score,
            structureScore: analysis.sections.structure.score
          },
          pageUrl: '/ats-analyzer'
        }),
      })
    } catch (error) {
      console.error('Failed to track ATS analysis event:', error)
    }
    
    // If email provided, save for newsletter (optional feature)
    if (email && isValidEmail(email)) {
      try {
        // You could save to database here for newsletter signup
        // await prisma.emailSubscriber.upsert({...})
        console.log('Email provided for ATS analysis:', email)
      } catch (error) {
        console.error('Failed to save email:', error)
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        analysis,
        timestamp: new Date().toISOString(),
        analysisId: generateAnalysisId()
      }
    })
    
  } catch (error) {
    console.error('Error analyzing resume:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to analyze resume' },
      { status: 500 }
    )
  }
}

// GET /api/ats-analyzer/stats - Get usage statistics (public)
export async function GET(request: NextRequest) {
  try {
    // This could fetch real stats from database
    // For now, return mock data
    const stats = {
      totalAnalyses: 15420,
      averageScore: 73,
      topIndustries: [
        { industry: 'Technology', count: 4521, avgScore: 76 },
        { industry: 'Business', count: 3892, avgScore: 71 },
        { industry: 'Marketing', count: 2156, avgScore: 74 },
        { industry: 'Finance', count: 1987, avgScore: 69 },
        { industry: 'Healthcare', count: 1654, avgScore: 72 }
      ],
      commonIssues: [
        { issue: 'Missing quantifiable achievements', frequency: 68 },
        { issue: 'Poor keyword optimization', frequency: 54 },
        { issue: 'Formatting issues', frequency: 43 },
        { issue: 'Missing required sections', frequency: 31 },
        { issue: 'Passive language overuse', frequency: 29 }
      ],
      scoreDistribution: {
        '90-100': 12,
        '80-89': 23,
        '70-79': 31,
        '60-69': 21,
        '50-59': 9,
        'below-50': 4
      }
    }
    
    return NextResponse.json({
      success: true,
      data: stats
    })
    
  } catch (error) {
    console.error('Error fetching ATS analyzer stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}

// Helper functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function generateAnalysisId(): string {
  return `ats_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
