import OpenAI from 'openai'
import { aiCache, SmartCacheStrategy, CacheMetrics } from './ai-cache'
import { aiQueue, Priority, Operations } from './ai-queue'
import { getValidatedConfig } from './env-validation'
import { aiErrorHandler } from './ai-error-handler'

export interface AIAnalysisResult {
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

export interface OpenRouterModel {
  id: string
  name: string
  pricing: {
    prompt: string
    completion: string
  }
}

export interface AIGenerationMetadata {
  tokensUsed: number
  responseTimeMs: number
  modelUsed: string
  estimatedCost: number
}

export class AIResumeService {
  private client: OpenAI
  private availableModels: OpenRouterModel[] = []
  private config: ReturnType<typeof getValidatedConfig>

  constructor() {
    this.config = getValidatedConfig()
    
    this.client = new OpenAI({
      apiKey: this.config.OPENROUTER_API_KEY,
      baseURL: this.config.OPENROUTER_BASE_URL,
      defaultHeaders: {
        "HTTP-Referer": this.config.OPENROUTER_SITE_URL,
        "X-Title": this.config.OPENROUTER_APP_NAME,
      }
    })
  }

  async getAvailableModels(): Promise<OpenRouterModel[]> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.config.OPENROUTER_API_KEY}`
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
    model: string = this.config.AI_MODEL_NAME,
    useCache: boolean = true,
    useQueue: boolean = true
  ): Promise<AIAnalysisResult> {
    // 生成缓存键
    const cacheKey = aiCache.generateAnalysisHash(resumeText, targetRole || '', model)

    // 尝试从缓存获取
    if (useCache) {
      const cached = await aiCache.getCachedResponse(cacheKey)
      if (cached) {
        CacheMetrics.recordHit()
        return JSON.parse(cached)
      }
      CacheMetrics.recordMiss()
    }

    const primaryOperation = async (): Promise<AIAnalysisResult> => {
      let result: AIAnalysisResult

      if (useQueue) {
        // 使用队列系统
        result = await aiQueue.enqueue<AIAnalysisResult>(
          Operations.ANALYZE_RESUME,
          { resumeText, targetRole, model },
          { priority: Priority.NORMAL, maxRetries: 2 }
        )
      } else {
        // 直接执行
        result = await this.executeAnalysis(resumeText, targetRole, model)
      }

      // 缓存结果
      if (useCache && SmartCacheStrategy.shouldCache('analysis', resumeText.length, JSON.stringify(result).length)) {
        const ttl = SmartCacheStrategy.getTTL('analysis', resumeText.length, 'medium')
        await aiCache.setCachedResponse(cacheKey, JSON.stringify(result), ttl)
      }

      return result
    }

    const fallbackOperation = model !== this.config.AI_FALLBACK_MODEL 
      ? () => this.analyzeResume(resumeText, targetRole, this.config.AI_FALLBACK_MODEL, useCache, false)
      : undefined

    const degradedOperation = () => Promise.resolve(aiErrorHandler.getDegradedAnalysisResult())

    return aiErrorHandler.executeWithFallback(
      primaryOperation,
      fallbackOperation,
      degradedOperation,
      'Resume analysis'
    )
  }

  private async executeAnalysis(
    resumeText: string,
    targetRole?: string,
    model: string = this.config.AI_MODEL_NAME
  ): Promise<AIAnalysisResult> {
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

请以JSON格式返回结果，格式如下：
{
  "score": 85,
  "suggestions": ["建议1", "建议2"],
  "optimizedContent": "优化后的内容建议",
  "keywords": ["关键词1", "关键词2"],
  "atsCompatibility": {
    "score": 80,
    "issues": ["问题1", "问题2"],
    "improvements": ["改进1", "改进2"]
  }
}`

    const completion = await this.client.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: this.config.MAX_TOKENS_PER_REQUEST,
      temperature: 0.3
    })

    const result = completion.choices[0].message.content
    return this.parseAnalysisResult(result)
  }

  async generateResumeSection(
    sectionType: 'summary' | 'experience' | 'skills',
    userInput: string,
    targetRole: string,
    model: string = this.config.AI_MODEL_NAME,
    useCache: boolean = true,
    useQueue: boolean = true
  ): Promise<string> {
    // 生成缓存键
    const cacheKey = aiCache.generateGenerationHash(sectionType, userInput, targetRole, model)

    // 尝试从缓存获取
    if (useCache) {
      const cached = await aiCache.getCachedResponse(cacheKey)
      if (cached) {
        CacheMetrics.recordHit()
        return cached
      }
      CacheMetrics.recordMiss()
    }

    const primaryOperation = async (): Promise<string> => {
      let result: string

      if (useQueue) {
        // 使用队列系统
        result = await aiQueue.enqueue<string>(
          Operations.GENERATE_SECTION,
          { sectionType, userInput, targetRole, model },
          { priority: Priority.NORMAL, maxRetries: 2 }
        )
      } else {
        // 直接执行
        result = await this.executeGeneration(sectionType, userInput, targetRole, model)
      }

      // 缓存结果
      if (useCache && SmartCacheStrategy.shouldCache('generation', userInput.length, result.length)) {
        const complexity = userInput.length > 1000 ? 'complex' : 'simple'
        const ttl = SmartCacheStrategy.getTTL('generation', userInput.length, complexity)
        await aiCache.setCachedResponse(cacheKey, result, ttl)
      }

      return result
    }

    const fallbackOperation = model !== this.config.AI_FALLBACK_MODEL 
      ? () => this.generateResumeSection(sectionType, userInput, targetRole, this.config.AI_FALLBACK_MODEL, useCache, false)
      : undefined

    const degradedOperation = () => Promise.resolve(aiErrorHandler.getDegradedGenerationResult(sectionType))

    return aiErrorHandler.executeWithFallback(
      primaryOperation,
      fallbackOperation,
      degradedOperation,
      `Resume ${sectionType} generation`
    )
  }

  private async executeGeneration(
    sectionType: 'summary' | 'experience' | 'skills',
    userInput: string,
    targetRole: string,
    model: string
  ): Promise<string> {
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
      max_tokens: Math.min(this.config.MAX_TOKENS_PER_REQUEST / 4, 1000),
      temperature: 0.7
    })

    return completion.choices[0].message.content || ''
  }

  async optimizeForATS(
    resumeText: string, 
    jobDescription?: string,
    model: string = this.config.AI_MODEL_NAME
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
        max_tokens: Math.min(this.config.MAX_TOKENS_PER_REQUEST * 0.75, 3000),
        temperature: 0.3
      })

      return completion.choices[0].message.content || ''
    } catch (error) {
      console.error('ATS optimization failed:', error)
      if (model !== this.config.AI_FALLBACK_MODEL) {
        return this.optimizeForATS(resumeText, jobDescription, this.config.AI_FALLBACK_MODEL)
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

  // 估算token使用量（粗略估算）
  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4)
  }

  // 计算估算成本
  async estimateCost(inputText: string, outputText: string, model: string): Promise<number> {
    const pricing = await this.getModelPricing(model)
    if (!pricing) return 0

    const inputTokens = this.estimateTokens(inputText)
    const outputTokens = this.estimateTokens(outputText)

    const inputCost = (inputTokens / 1000000) * pricing.prompt
    const outputCost = (outputTokens / 1000000) * pricing.completion

    return inputCost + outputCost
  }
}
