# AI功能实现计划 - Best AI Resume Builder 2025

## 项目概述

本文档详细规划了为"Best AI Resume Builder 2025"网站添加真正AI功能的实施方案，以确保网站内容与SEO关键词保持一致，同时提供实际的AI驱动简历构建服务。

## 当前状态分析

### 现有功能
- ✅ 工具比较系统
- ✅ 基础ATS兼容性检查（规则基础）
- ✅ 用户事件追踪
- ✅ 内容管理系统

### 功能差距
- ❌ 真正的AI简历生成
- ❌ AI驱动的内容优化
- ❌ 智能ATS分析和建议
- ❌ 个性化AI推荐

## 实施路线图

### 阶段1：基础AI集成 (2-4周)

#### 1.1 AI服务配置

**环境变量配置**
```bash
# 更新 .env.local
OPENROUTER_API_KEY="sk-or-v1-..."
OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"
AI_MODEL_NAME="anthropic/claude-3.5-sonnet" # 或其他OpenRouter支持的模型
AI_FALLBACK_MODEL="openai/gpt-4-turbo-preview"
MAX_TOKENS_PER_REQUEST=4000
OPENROUTER_SITE_URL="https://bestairesume2025.com"
OPENROUTER_APP_NAME="Best AI Resume Builder 2025"
```

**依赖包安装**
```bash
npm install openai # OpenRouter使用OpenAI兼容的接口
npm install @types/openai --save-dev
```

#### 1.2 核心AI服务模块

**创建 `src/lib/ai-services.ts`**
```typescript
import OpenAI from 'openai'

interface AIAnalysisResult {
  score: number
  suggestions: string[]
  optimizedContent: string
  keywords: string[]
  atsCompatibility: {
    score: number
    issues: string[]
    improvements: string[]
  }
}

interface OpenRouterModel {
  id: string
  name: string
  pricing: {
    prompt: string
    completion: string
  }
}

export class AIResumeService {
  private client: OpenAI
  private availableModels: OpenRouterModel[] = []

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL,
        "X-Title": process.env.OPENROUTER_APP_NAME,
      }
    })
  }

  async getAvailableModels(): Promise<OpenRouterModel[]> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
        }
      })
      const data = await response.json()
      this.availableModels = data.data
      return this.availableModels
    } catch (error) {
      console.error('Failed to fetch OpenRouter models:', error)
      return []
    }
  }

  async analyzeResume(
    resumeText: string, 
    targetRole?: string,
    model: string = process.env.AI_MODEL_NAME || 'anthropic/claude-3.5-sonnet'
  ): Promise<AIAnalysisResult> {
    try {
      const prompt = `作为专业的简历分析专家，请分析以下简历并提供详细的改进建议。

简历内容：
${resumeText}

目标职位：${targetRole || '通用职位'}

请提供以下分析：
1. 整体评分 (0-100)
2. 具体改进建议
3. ATS兼容性分析
4. 关键词优化建议
5. 内容优化建议

请以JSON格式返回结果。`

      const completion = await this.client.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: parseInt(process.env.MAX_TOKENS_PER_REQUEST || '4000'),
        temperature: 0.3
      })

      const result = completion.choices[0].message.content
      return this.parseAnalysisResult(result)
    } catch (error) {
      console.error('AI analysis failed:', error)
      // fallback to backup model
      if (model !== process.env.AI_FALLBACK_MODEL) {
        return this.analyzeResume(resumeText, targetRole, process.env.AI_FALLBACK_MODEL)
      }
      throw error
    }
  }

  async generateResumeSection(
    sectionType: 'summary' | 'experience' | 'skills',
    userInput: string,
    targetRole: string,
    model: string = process.env.AI_MODEL_NAME || 'anthropic/claude-3.5-sonnet'
  ): Promise<string> {
    try {
      const prompts = {
        summary: `请为以下背景生成一个专业的简历总结段落，针对${targetRole}职位优化：\n${userInput}`,
        experience: `请优化以下工作经验描述，使其更具影响力并适合${targetRole}职位：\n${userInput}`,
        skills: `请为${targetRole}职位优化以下技能列表，确保包含相关关键词：\n${userInput}`
      }

      const completion = await this.client.chat.completions.create({
        model: model,
        messages: [{ 
          role: 'user', 
          content: prompts[sectionType] 
        }],
        max_tokens: 1000,
        temperature: 0.7
      })

      return completion.choices[0].message.content || ''
    } catch (error) {
      console.error('AI generation failed:', error)
      // fallback to backup model
      if (model !== process.env.AI_FALLBACK_MODEL) {
        return this.generateResumeSection(sectionType, userInput, targetRole, process.env.AI_FALLBACK_MODEL)
      }
      throw error
    }
  }

  async optimizeForATS(
    resumeText: string, 
    jobDescription?: string,
    model: string = process.env.AI_MODEL_NAME || 'anthropic/claude-3.5-sonnet'
  ): Promise<string> {
    const prompt = `请优化以下简历以提高ATS兼容性：

简历：${resumeText}

${jobDescription ? `职位描述：${jobDescription}` : ''}

请提供：
1. ATS优化建议
2. 关键词增强
3. 格式改进建议
4. 优化后的简历内容`

    try {
      const completion = await this.client.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 3000,
        temperature: 0.3
      })

      return completion.choices[0].message.content || ''
    } catch (error) {
      console.error('ATS optimization failed:', error)
      if (model !== process.env.AI_FALLBACK_MODEL) {
        return this.optimizeForATS(resumeText, jobDescription, process.env.AI_FALLBACK_MODEL)
      }
      throw error
    }
  }

  private parseAnalysisResult(result: string | null): AIAnalysisResult {
    if (!result) {
      throw new Error('No result from AI service')
    }

    try {
      return JSON.parse(result)
    } catch {
      // 如果JSON解析失败，创建默认结构
      return {
        score: 75,
        suggestions: [result],
        optimizedContent: '',
        keywords: [],
        atsCompatibility: {
          score: 75,
          issues: [],
          improvements: [result]
        }
      }
    }
  }

  async getModelPricing(model: string): Promise<{ prompt: number, completion: number } | null> {
    const modelInfo = this.availableModels.find(m => m.id === model)
    if (!modelInfo) return null

    return {
      prompt: parseFloat(modelInfo.pricing.prompt),
      completion: parseFloat(modelInfo.pricing.completion)
    }
  }
}
```

#### 1.3 升级ATS分析器

**更新 `src/lib/ats-analyzer.ts`**
```typescript
import { AIResumeService } from './ai-services'

export async function analyzeResumeATSWithAI(
  resumeText: string, 
  targetIndustry?: string,
  model?: string
): Promise<ATSAnalysisResult> {
  const aiService = new AIResumeService()
  
  // 结合原有规则引擎 + AI分析
  const ruleBasedAnalysis = analyzeResumeATS(resumeText, targetIndustry)
  const aiAnalysis = await aiService.analyzeResume(resumeText, targetIndustry, model)
  
  // 合并分析结果
  return mergeAnalysisResults(ruleBasedAnalysis, aiAnalysis)
}

function mergeAnalysisResults(
  ruleBasedResult: ATSAnalysisResult,
  aiResult: AIAnalysisResult
): ATSAnalysisResult {
  return {
    overallScore: Math.round((ruleBasedResult.overallScore + aiResult.score) / 2),
    sections: {
      formatting: ruleBasedResult.sections.formatting,
      content: {
        ...ruleBasedResult.sections.content,
        recommendations: [
          ...ruleBasedResult.sections.content.recommendations,
          ...aiResult.suggestions
        ]
      },
      keywords: {
        ...ruleBasedResult.sections.keywords,
        suggestedKeywords: [
          ...ruleBasedResult.sections.keywords.suggestedKeywords,
          ...aiResult.keywords
        ]
      },
      structure: ruleBasedResult.sections.structure
    },
    summary: {
      strengths: [
        ...ruleBasedResult.summary.strengths,
        ...(aiResult.atsCompatibility.score > 80 ? ['AI分析显示良好的ATS兼容性'] : [])
      ],
      criticalIssues: [
        ...ruleBasedResult.summary.criticalIssues,
        ...aiResult.atsCompatibility.issues
      ],
      quickWins: [
        ...ruleBasedResult.summary.quickWins,
        ...aiResult.atsCompatibility.improvements.slice(0, 3)
      ]
    }
  }
}
```

### 阶段2：AI简历生成器 (4-6周)

#### 2.1 简历生成组件

**创建 `src/components/AIResumeBuilder.tsx`**
```typescript
'use client'

import { useState } from 'react'
import { AIResumeService } from '@/lib/ai-services'

interface ResumeData {
  personalInfo: PersonalInfo
  summary: string
  experience: WorkExperience[]
  education: Education[]
  skills: string[]
}

export function AIResumeBuilder() {
  const [resumeData, setResumeData] = useState<ResumeData>()
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const generateWithAI = async (sectionType: string, userInput: string) => {
    setIsGenerating(true)
    try {
      const aiService = new AIResumeService()
      const generatedContent = await aiService.generateResumeSection(
        sectionType,
        userInput,
        resumeData?.targetRole || ''
      )
      // 更新简历数据
    } catch (error) {
      console.error('AI generation failed:', error)
    }
    setIsGenerating(false)
  }

  return (
    <div className="ai-resume-builder">
      {/* 多步骤AI简历构建界面 */}
    </div>
  )
}
```

#### 2.2 AI生成API端点

**创建 `src/app/api/ai/generate-resume/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { AIResumeService } from '@/lib/ai-services'
import { rateLimit } from '@/lib/rate-limit'
import { AICostManager } from '@/lib/ai-cost-management'

export async function POST(request: NextRequest) {
  // 速率限制
  const rateLimitResult = await rateLimit(request)
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
  }

  // 成本控制检查
  const costManager = new AICostManager()
  const sessionId = request.headers.get('x-session-id') || 'anonymous'
  const quotaCheck = await costManager.checkUsageQuota(sessionId)
  
  if (!quotaCheck.canProceed) {
    return NextResponse.json(
      { error: 'Usage quota exceeded', quota: quotaCheck },
      { status: 429 }
    )
  }

  try {
    const { sectionType, userInput, targetRole, model } = await request.json()
    
    const aiService = new AIResumeService()
    const startTime = Date.now()
    const generatedContent = await aiService.generateResumeSection(
      sectionType,
      userInput,
      targetRole,
      model
    )
    const responseTime = Date.now() - startTime

    // 估算token使用量和成本
    const estimatedTokens = Math.ceil(generatedContent.length / 4) // 粗略估算
    const modelPricing = await aiService.getModelPricing(model || process.env.AI_MODEL_NAME!)
    const estimatedCost = modelPricing ? 
      (estimatedTokens * modelPricing.completion / 1000000) : 0

    // 记录使用情况
    await costManager.trackUsage(sessionId, estimatedTokens, estimatedCost)

    // 记录性能指标
    await fetch(`${request.nextUrl.origin}/api/analytics/ai-usage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'generate_resume_section',
        model: model || process.env.AI_MODEL_NAME,
        responseTime,
        tokensUsed: estimatedTokens,
        cost: estimatedCost,
        success: true
      })
    })

    return NextResponse.json({
      success: true,
      content: generatedContent,
      metadata: {
        tokens_used: estimatedTokens,
        response_time_ms: responseTime,
        model_used: model || process.env.AI_MODEL_NAME,
        estimated_cost: estimatedCost
      }
    })
  } catch (error) {
    console.error('AI generation failed:', error)
    
    // 记录错误
    await fetch(`${request.nextUrl.origin}/api/analytics/ai-usage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'generate_resume_section',
        model: model || process.env.AI_MODEL_NAME,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    })

    return NextResponse.json(
      { error: 'AI generation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
```

### 阶段3：智能优化功能 (6-8周)

#### 3.1 AI驱动的工具推荐

**创建 `src/lib/ai-recommendations.ts`**
```typescript
export class AIRecommendationEngine {
  async recommendTools(
    resumeContent: string,
    userPreferences: UserPreferences,
    budget: number
  ): Promise<ToolRecommendation[]> {
    // 基于AI分析推荐最适合的简历工具
    const analysis = await this.analyzeUserNeeds(resumeContent)
    const tools = await this.getToolsFromDB()
    
    return this.rankToolsByAIScore(tools, analysis, userPreferences)
  }

  private async analyzeUserNeeds(resumeContent: string): Promise<UserAnalysis> {
    // AI分析用户简历确定需求
  }
}
```

#### 3.2 个性化仪表板

**创建 `src/components/PersonalizedDashboard.tsx`**
```typescript
export function PersonalizedDashboard({ userId }: { userId: string }) {
  const [recommendations, setRecommendations] = useState<ToolRecommendation[]>([])
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([])

  useEffect(() => {
    loadPersonalizedRecommendations()
  }, [userId])

  return (
    <div className="personalized-dashboard">
      <AIRecommendationsSection recommendations={recommendations} />
      <ProgressTrackingSection insights={aiInsights} />
      <SmartSuggestionsSection />
    </div>
  )
}
```

### 阶段4：高级AI功能 (8-12周)

#### 4.1 职位匹配AI

**创建 `src/lib/job-matching-ai.ts`**
```typescript
export class JobMatchingAI {
  async analyzeJobFit(
    resumeText: string,
    jobDescription: string
  ): Promise<JobMatchAnalysis> {
    // AI分析简历与职位的匹配度
    const prompt = `
      Analyze the compatibility between this resume and job description.
      Resume: ${resumeText}
      Job Description: ${jobDescription}
      
      Provide:
      1. Match score (0-100)
      2. Missing skills/keywords
      3. Strengths alignment
      4. Improvement suggestions
    `
    
    const analysis = await this.aiService.analyze(prompt)
    return this.parseJobMatchResult(analysis)
  }
}
```

#### 4.2 行业特定优化

**创建 `src/lib/industry-optimization.ts`**
```typescript
export class IndustryOptimizationAI {
  async optimizeForIndustry(
    resumeText: string,
    targetIndustry: string
  ): Promise<IndustryOptimizedResume> {
    const industryRequirements = await this.getIndustryRequirements(targetIndustry)
    const optimizedContent = await this.aiService.optimizeForIndustry(
      resumeText,
      industryRequirements
    )
    
    return {
      optimizedResume: optimizedContent,
      industryScore: this.calculateIndustryScore(optimizedContent, industryRequirements),
      suggestions: this.generateIndustrySuggestions(optimizedContent, industryRequirements)
    }
  }
}
```

## 数据库架构更新

### 新增表结构

```sql
-- AI生成记录
CREATE TABLE ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_session_id VARCHAR(255),
  generation_type VARCHAR(50), -- 'resume_section', 'optimization', 'analysis'
  input_text TEXT,
  generated_content TEXT,
  model_used VARCHAR(50),
  tokens_used INTEGER,
  generation_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI分析结果
CREATE TABLE ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_session_id VARCHAR(255),
  resume_text TEXT,
  target_role VARCHAR(255),
  analysis_type VARCHAR(50), -- 'ats_compatibility', 'job_match', 'industry_fit'
  ai_score INTEGER,
  ai_suggestions JSONB,
  improvement_areas JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 用户偏好和历史
CREATE TABLE user_ai_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255),
  preferred_ai_model VARCHAR(50),
  target_industries VARCHAR(255)[],
  career_level VARCHAR(50), -- 'entry', 'mid', 'senior', 'executive'
  optimization_goals JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Prisma Schema 更新

```prisma
model AiGeneration {
  id                String   @id @default(cuid())
  userSessionId     String   @map("user_session_id")
  generationType    String   @map("generation_type")
  inputText         String   @map("input_text")
  generatedContent  String   @map("generated_content")
  modelUsed         String   @map("model_used")
  tokensUsed        Int      @map("tokens_used")
  generationTimeMs  Int      @map("generation_time_ms")
  createdAt         DateTime @default(now()) @map("created_at")

  @@map("ai_generations")
}

model AiAnalysis {
  id             String   @id @default(cuid())
  userSessionId  String   @map("user_session_id")
  resumeText     String   @map("resume_text")
  targetRole     String?  @map("target_role")
  analysisType   String   @map("analysis_type")
  aiScore        Int      @map("ai_score")
  aiSuggestions  Json     @map("ai_suggestions")
  improvementAreas Json   @map("improvement_areas")
  createdAt      DateTime @default(now()) @map("created_at")

  @@map("ai_analyses")
}
```

## OpenRouter特定功能

### 模型选择和管理

**创建 `src/lib/openrouter-models.ts`**
```typescript
export const OPENROUTER_MODELS = {
  // 高质量模型（适合复杂分析）
  premium: [
    'anthropic/claude-3.5-sonnet',
    'openai/gpt-4-turbo-preview',
    'google/gemini-pro-1.5'
  ],
  // 平衡性价比模型（适合常规生成）
  balanced: [
    'anthropic/claude-3-haiku',
    'openai/gpt-3.5-turbo',
    'meta-llama/llama-3-8b-instruct'
  ],
  // 经济型模型（适合简单任务）
  budget: [
    'microsoft/wizardlm-2-8x22b',
    'mistralai/mixtral-8x7b-instruct',
    'openchat/openchat-7b'
  ]
}

export class OpenRouterModelManager {
  async getOptimalModel(taskType: string, budget: 'low' | 'medium' | 'high'): Promise<string> {
    const modelTiers = {
      low: OPENROUTER_MODELS.budget,
      medium: OPENROUTER_MODELS.balanced,
      high: OPENROUTER_MODELS.premium
    }

    const availableModels = await this.getAvailableModels()
    const preferredModels = modelTiers[budget]

    // 选择第一个可用的推荐模型
    for (const model of preferredModels) {
      if (availableModels.some(m => m.id === model)) {
        return model
      }
    }

    // fallback到默认模型
    return process.env.AI_MODEL_NAME || 'anthropic/claude-3.5-sonnet'
  }

  async getModelCost(model: string, inputTokens: number, outputTokens: number): Promise<number> {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
      }
    })
    
    const data = await response.json()
    const modelInfo = data.data.find((m: any) => m.id === model)
    
    if (!modelInfo) return 0

    const promptCost = (inputTokens / 1000000) * parseFloat(modelInfo.pricing.prompt)
    const completionCost = (outputTokens / 1000000) * parseFloat(modelInfo.pricing.completion)
    
    return promptCost + completionCost
  }

  private async getAvailableModels() {
    // 实现获取可用模型列表的逻辑
    return []
  }
}
```

## API成本管理

### OpenRouter费用控制策略

**创建 `src/lib/ai-cost-management.ts`**
```typescript
import { OpenRouterModelManager } from './openrouter-models'

interface UsageQuotaResult {
  canProceed: boolean
  remainingTokens: number
  remainingBudget: number
  recommendedModel?: string
}

export class AICostManager {
  private readonly DAILY_TOKEN_LIMIT = 100000
  private readonly MONTHLY_BUDGET = 500 // USD
  private modelManager = new OpenRouterModelManager()

  async checkUsageQuota(sessionId: string): Promise<UsageQuotaResult> {
    const dailyUsage = await this.getDailyTokenUsage()
    const monthlySpent = await this.getMonthlySpending()
    
    const remainingBudget = this.MONTHLY_BUDGET - monthlySpent
    const canProceed = dailyUsage < this.DAILY_TOKEN_LIMIT && monthlySpent < this.MONTHLY_BUDGET

    // 根据剩余预算推荐模型
    let recommendedModel: string | undefined
    if (remainingBudget > 100) {
      recommendedModel = await this.modelManager.getOptimalModel('general', 'high')
    } else if (remainingBudget > 20) {
      recommendedModel = await this.modelManager.getOptimalModel('general', 'medium')
    } else if (remainingBudget > 5) {
      recommendedModel = await this.modelManager.getOptimalModel('general', 'low')
    }

    return {
      canProceed,
      remainingTokens: this.DAILY_TOKEN_LIMIT - dailyUsage,
      remainingBudget,
      recommendedModel
    }
  }

  async trackUsage(sessionId: string, tokensUsed: number, cost: number): Promise<void> {
    // 记录使用情况到数据库
    await this.prisma.aiGeneration.create({
      data: {
        userSessionId: sessionId,
        generationType: 'api_call',
        tokensUsed,
        generationTimeMs: 0, // 在调用处设置
        inputText: '',
        generatedContent: '',
        modelUsed: '',
        cost
      }
    })
  }

  async getDailyTokenUsage(): Promise<number> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const usage = await this.prisma.aiGeneration.aggregate({
      where: {
        createdAt: {
          gte: today
        }
      },
      _sum: {
        tokensUsed: true
      }
    })

    return usage._sum.tokensUsed || 0
  }

  async getMonthlySpending(): Promise<number> {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const spending = await this.prisma.aiGeneration.aggregate({
      where: {
        createdAt: {
          gte: startOfMonth
        }
      },
      _sum: {
        cost: true
      }
    })

    return spending._sum.cost || 0
  }

  async generateCostReport(): Promise<CostReport> {
    const [dailyUsage, monthlySpending, modelUsage] = await Promise.all([
      this.getDailyTokenUsage(),
      this.getMonthlySpending(),
      this.getModelUsageBreakdown()
    ])

    return {
      dailyTokens: dailyUsage,
      monthlySpent: monthlySpending,
      budgetUtilization: (monthlySpending / this.MONTHLY_BUDGET) * 100,
      modelBreakdown: modelUsage,
      projectedMonthlySpend: this.calculateProjectedSpend(monthlySpending)
    }
  }

  private async getModelUsageBreakdown() {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    return await this.prisma.aiGeneration.groupBy({
      by: ['modelUsed'],
      where: {
        createdAt: {
          gte: startOfMonth
        }
      },
      _sum: {
        tokensUsed: true,
        cost: true
      },
      _count: {
        id: true
      }
    })
  }

  private calculateProjectedSpend(currentSpend: number): number {
    const dayOfMonth = new Date().getDate()
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
    
    return (currentSpend / dayOfMonth) * daysInMonth
  }
}

interface CostReport {
  dailyTokens: number
  monthlySpent: number
  budgetUtilization: number
  modelBreakdown: any[]
  projectedMonthlySpend: number
}
```

## 性能优化

### 缓存策略

```typescript
// src/lib/ai-cache.ts
export class AIResponseCache {
  private redis: Redis

  async getCachedResponse(inputHash: string): Promise<string | null> {
    return await this.redis.get(`ai:${inputHash}`)
  }

  async setCachedResponse(inputHash: string, response: string, ttl: number = 3600): Promise<void> {
    await this.redis.setex(`ai:${inputHash}`, ttl, response)
  }

  generateInputHash(input: string, model: string, temperature: number): string {
    return crypto.createHash('sha256').update(`${input}:${model}:${temperature}`).digest('hex')
  }
}
```

## 安全和隐私

### 数据保护措施

1. **输入清理**
```typescript
export function sanitizeResumeInput(input: string): string {
  // 移除敏感信息（SSN、护照号等）
  return input.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED]')
             .replace(/\b[A-Z]{2}\d{7}\b/g, '[REDACTED]')
}
```

2. **数据加密**
```typescript
export class ResumeDataEncryption {
  async encryptResumeData(data: string): Promise<string> {
    // 使用AES-256加密敏感简历数据
  }

  async decryptResumeData(encryptedData: string): Promise<string> {
    // 解密简历数据
  }
}
```

## 监控和分析

### AI功能监控

**创建 `src/lib/ai-monitoring.ts`**
```typescript
export class AIFunctionMonitoring {
  async logAIOperation(operation: AIOperation): Promise<void> {
    // 记录AI操作性能指标
    await this.metricsService.record({
      operation: operation.type,
      latency: operation.responseTime,
      tokenUsage: operation.tokensUsed,
      success: operation.success,
      errorType: operation.error?.type
    })
  }

  async generateAIUsageReport(): Promise<AIUsageReport> {
    // 生成AI使用情况报告
  }
}
```

## 用户体验增强

### AI功能引导

**创建 `src/components/AIFeatureTour.tsx`**
```typescript
export function AIFeatureTour() {
  return (
    <div className="ai-feature-tour">
      <Step title="AI Resume Analysis">
        <p>我们的AI分析您的简历，提供个性化改进建议</p>
      </Step>
      <Step title="Smart Content Generation">
        <p>AI帮助您生成专业的简历内容和关键词优化</p>
      </Step>
      <Step title="ATS Optimization">
        <p>AI确保您的简历通过申请追踪系统筛选</p>
      </Step>
    </div>
  )
}
```

## 测试策略

### AI功能测试

```typescript
// tests/ai-services.test.ts
describe('AI Resume Services', () => {
  test('should generate professional resume summary', async () => {
    const aiService = new AIResumeService()
    const result = await aiService.generateResumeSection(
      'summary',
      'Software engineer with 5 years experience',
      'Senior Developer'
    )
    
    expect(result).toContain('software engineer')
    expect(result.length).toBeGreaterThan(100)
    expect(result.length).toBeLessThan(500)
  })

  test('should provide ATS optimization suggestions', async () => {
    const result = await aiService.optimizeForATS(sampleResume, sampleJobDescription)
    expect(result.suggestions).toHaveLength.greaterThan(0)
    expect(result.score).toBeGreaterThan(0)
  })
})
```

## 部署和发布

### 环境配置

```yaml
# docker-compose.yml 更新
services:
  web:
    environment:
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
      - OPENROUTER_SITE_URL=${OPENROUTER_SITE_URL}
      - OPENROUTER_APP_NAME=${OPENROUTER_APP_NAME}
      - AI_MODEL_NAME=anthropic/claude-3.5-sonnet
      - AI_FALLBACK_MODEL=openai/gpt-3.5-turbo
      - AI_CACHE_TTL=3600
      - MAX_AI_REQUESTS_PER_HOUR=100
      - MONTHLY_AI_BUDGET=500
```

### OpenRouter管理面板集成

**创建 `src/components/OpenRouterDashboard.tsx`**
```typescript
'use client'

import { useState, useEffect } from 'react'
import { OpenRouterModelManager, OPENROUTER_MODELS } from '@/lib/openrouter-models'
import { AICostManager } from '@/lib/ai-cost-management'

interface ModelStats {
  id: string
  name: string
  calls: number
  totalCost: number
  avgResponseTime: number
  successRate: number
}

export function OpenRouterDashboard() {
  const [models, setModels] = useState<ModelStats[]>([])
  const [costReport, setCostReport] = useState<any>(null)
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const costManager = new AICostManager()
      const report = await costManager.generateCostReport()
      setCostReport(report)

      // 获取模型统计信息
      const modelStats = await fetch('/api/openrouter/stats').then(r => r.json())
      setModels(modelStats.data || [])
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const switchModel = async (newModel: string) => {
    try {
      await fetch('/api/admin/update-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: newModel })
      })
      setSelectedModel(newModel)
    } catch (error) {
      console.error('Failed to switch model:', error)
    }
  }

  if (loading) {
    return <div className="animate-spin">Loading...</div>
  }

  return (
    <div className="openrouter-dashboard p-6">
      <h2 className="text-2xl font-bold mb-6">OpenRouter AI管理面板</h2>
      
      {/* 成本概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">本月支出</h3>
          <p className="text-2xl font-bold">${costReport?.monthlySpent.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">预算使用率</h3>
          <p className="text-2xl font-bold">{costReport?.budgetUtilization.toFixed(1)}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">今日Token</h3>
          <p className="text-2xl font-bold">{costReport?.dailyTokens.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">预计月支出</h3>
          <p className="text-2xl font-bold">${costReport?.projectedMonthlySpend.toFixed(2)}</p>
        </div>
      </div>

      {/* 模型选择器 */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">AI模型配置</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(OPENROUTER_MODELS).map(([tier, models]) => (
            <div key={tier} className="border rounded-lg p-4">
              <h4 className="font-medium mb-2 capitalize">{tier} 级别</h4>
              {models.map((model) => (
                <button
                  key={model}
                  onClick={() => switchModel(model)}
                  className={`block w-full text-left p-2 rounded mb-1 ${
                    selectedModel === model ? 'bg-blue-100' : 'hover:bg-gray-50'
                  }`}
                >
                  {model}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 模型性能统计 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">模型性能统计</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">模型</th>
                <th className="px-4 py-2 text-left">调用次数</th>
                <th className="px-4 py-2 text-left">总成本</th>
                <th className="px-4 py-2 text-left">平均响应时间</th>
                <th className="px-4 py-2 text-left">成功率</th>
              </tr>
            </thead>
            <tbody>
              {models.map((model) => (
                <tr key={model.id} className="border-b">
                  <td className="px-4 py-2">{model.name}</td>
                  <td className="px-4 py-2">{model.calls}</td>
                  <td className="px-4 py-2">${model.totalCost.toFixed(4)}</td>
                  <td className="px-4 py-2">{model.avgResponseTime}ms</td>
                  <td className="px-4 py-2">{model.successRate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
```

### 性能监控

```typescript
// src/lib/ai-performance.ts
export class AIPerformanceMonitor {
  async trackResponseTime(operation: string, startTime: number): Promise<void> {
    const endTime = Date.now()
    const duration = endTime - startTime

    // 记录到分析系统
    await analytics.track('ai_operation_performance', {
      operation,
      duration,
      timestamp: new Date().toISOString()
    })

    // 如果响应时间过长，发送告警
    if (duration > 10000) {
      await this.sendSlowResponseAlert(operation, duration)
    }
  }
}
```

## 成功指标和KPI

### 关键指标追踪

1. **AI功能使用率**
   - AI生成请求数量
   - 用户AI功能采用率
   - AI优化建议接受率

2. **质量指标**
   - AI生成内容满意度评分
   - ATS通过率改善情况
   - 用户反馈NPS评分

3. **技术指标**
   - AI API响应时间
   - 错误率
   - 成本每次生成

### 数据追踪实现

```typescript
// src/lib/ai-analytics.ts
export class AIAnalytics {
  async trackAIUsage(event: AIUsageEvent): Promise<void> {
    await this.analytics.track('ai_feature_used', {
      feature: event.feature,
      userId: event.sessionId,
      success: event.success,
      responseTime: event.responseTime,
      tokensUsed: event.tokensUsed
    })
  }

  async generateWeeklyAIReport(): Promise<AIUsageReport> {
    // 生成AI功能使用周报
  }
}
```

## OpenRouter特有优势

### 1. 模型多样性
- **多供应商支持**：同时访问OpenAI、Anthropic、Google、Meta等模型
- **成本优化**：根据任务复杂度和预算自动选择最优模型
- **fallback机制**：主模型不可用时自动切换到备用模型

### 2. 透明定价
- **实时定价**：通过API获取最新的模型定价信息
- **细粒度成本控制**：按token精确计费和预算管理
- **成本预测**：根据使用模式预测月度支出

### 3. 统一接口
- **OpenAI兼容**：使用熟悉的OpenAI SDK，降低迁移成本
- **简化集成**：无需为每个AI提供商维护单独的SDK
- **一致性**：统一的错误处理和响应格式

## 实施优先级建议

### 第1周：基础设置
1. 配置OpenRouter API密钥和环境变量
2. 实现基础AIResumeService类
3. 创建简单的模型选择逻辑

### 第2-3周：核心功能
1. 升级现有ATS分析器整合AI功能
2. 实现简历段落生成API
3. 添加基础成本监控

### 第4-6周：用户界面
1. 创建AI简历生成器组件
2. 实现模型选择和预算显示
3. 添加用户反馈收集

### 第7-8周：优化和监控
1. 实现智能模型选择算法
2. 添加OpenRouter管理面板
3. 完善成本控制和告警

### 第9-12周：高级功能
1. 个性化推荐引擎
2. 行业特定优化
3. 性能调优和缓存优化

## 成功指标和KPI

### 技术指标
- **响应时间**：95%的AI请求在5秒内完成
- **成功率**：99%的AI调用成功率
- **成本效率**：平均每次生成成本低于$0.05

### 业务指标  
- **用户采用率**：60%的访问者使用AI功能
- **转化率**：AI功能使用者的工具点击率提升30%
- **用户满意度**：AI生成内容满意度评分4.0+/5.0

### OpenRouter特定指标
- **模型多样性使用**：使用3+不同AI模型
- **成本优化**：相比单一供应商节省20%成本
- **故障转移成功率**：主模型故障时99%成功切换

## 风险管控

### 技术风险
- **API稳定性**：实现多层fallback机制
- **成本控制**：设置严格的预算限制和告警
- **数据安全**：敏感信息处理和加密

### 业务风险  
- **用户体验**：渐进式引入AI功能，避免突然变化
- **SEO影响**：确保AI功能真正提升用户价值
- **竞争优势**：持续优化AI质量保持领先

## 总结

通过使用OpenRouter API，本实施计划将在12周内为"Best AI Resume Builder 2025"添加完整的AI功能套件。OpenRouter的统一接口、成本透明度和模型多样性将为项目提供以下核心优势：

1. **成本效益**：智能模型选择降低AI成本
2. **可靠性**：多模型fallback确保服务稳定性  
3. **灵活性**：根据需求动态调整AI模型
4. **可扩展性**：轻松接入新发布的AI模型

通过这个计划，网站将真正成为一个AI驱动的简历构建平台，完全支持"Best AI Resume Builder 2025"的SEO定位，同时保持成本可控和技术先进性。