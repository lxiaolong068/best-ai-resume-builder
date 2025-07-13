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

export interface ModelInfo {
  id: string
  name: string
  pricing: {
    prompt: string
    completion: string
  }
  context_length?: number
  architecture?: {
    modality: string
    tokenizer: string
    instruct_type?: string
  }
}

export class OpenRouterModelManager {
  private cachedModels: ModelInfo[] = []
  private lastFetch: number = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

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
    const availableModels = await this.getAvailableModels()
    const modelInfo = availableModels.find((m: ModelInfo) => m.id === model)
    
    if (!modelInfo) return 0

    const promptCost = (inputTokens / 1000000) * parseFloat(modelInfo.pricing.prompt)
    const completionCost = (outputTokens / 1000000) * parseFloat(modelInfo.pricing.completion)
    
    return promptCost + completionCost
  }

  async getAvailableModels(): Promise<ModelInfo[]> {
    const now = Date.now()
    
    // 使用缓存的模型列表
    if (this.cachedModels.length > 0 && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.cachedModels
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      this.cachedModels = data.data || []
      this.lastFetch = now
      
      return this.cachedModels
    } catch (error) {
      console.error('Failed to fetch OpenRouter models:', error)
      
      // 如果API调用失败，返回默认模型列表
      return [
        {
          id: 'anthropic/claude-3.5-sonnet',
          name: 'Claude 3.5 Sonnet',
          pricing: { prompt: '0.000003', completion: '0.000015' }
        },
        {
          id: 'openai/gpt-4-turbo-preview',
          name: 'GPT-4 Turbo Preview',
          pricing: { prompt: '0.00001', completion: '0.00003' }
        },
        {
          id: 'openai/gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          pricing: { prompt: '0.0000005', completion: '0.0000015' }
        }
      ]
    }
  }

  async getModelInfo(modelId: string): Promise<ModelInfo | null> {
    const models = await this.getAvailableModels()
    return models.find(m => m.id === modelId) || null
  }

  // 根据任务类型推荐最佳模型
  async recommendModelForTask(
    taskType: 'analysis' | 'generation' | 'optimization',
    complexity: 'simple' | 'medium' | 'complex',
    budget: 'low' | 'medium' | 'high'
  ): Promise<string> {
    const taskModelMapping = {
      analysis: {
        simple: budget === 'low' ? OPENROUTER_MODELS.budget : OPENROUTER_MODELS.balanced,
        medium: budget === 'low' ? OPENROUTER_MODELS.balanced : OPENROUTER_MODELS.premium,
        complex: OPENROUTER_MODELS.premium
      },
      generation: {
        simple: OPENROUTER_MODELS.budget,
        medium: OPENROUTER_MODELS.balanced,
        complex: budget === 'low' ? OPENROUTER_MODELS.balanced : OPENROUTER_MODELS.premium
      },
      optimization: {
        simple: OPENROUTER_MODELS.balanced,
        medium: OPENROUTER_MODELS.premium,
        complex: OPENROUTER_MODELS.premium
      }
    }

    const recommendedModels = taskModelMapping[taskType][complexity]
    const availableModels = await this.getAvailableModels()

    // 选择第一个可用的推荐模型
    for (const model of recommendedModels) {
      if (availableModels.some(m => m.id === model)) {
        return model
      }
    }

    // fallback
    return process.env.AI_MODEL_NAME || 'anthropic/claude-3.5-sonnet'
  }

  // 获取模型性能统计
  getModelTier(modelId: string): 'premium' | 'balanced' | 'budget' | 'unknown' {
    if (OPENROUTER_MODELS.premium.includes(modelId)) return 'premium'
    if (OPENROUTER_MODELS.balanced.includes(modelId)) return 'balanced'
    if (OPENROUTER_MODELS.budget.includes(modelId)) return 'budget'
    return 'unknown'
  }

  // 清除缓存
  clearCache(): void {
    this.cachedModels = []
    this.lastFetch = 0
  }
}
