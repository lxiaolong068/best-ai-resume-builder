import { OpenRouterModelManager } from './openrouter-models'
import { prisma } from './prisma'
import { aiQueries } from './db-queries'
import { getValidatedConfig } from './env-validation'

export interface UsageQuotaResult {
  canProceed: boolean
  remainingTokens: number
  remainingBudget: number
  recommendedModel?: string
  dailyUsage: number
  monthlySpent: number
}

export interface CostReport {
  dailyTokens: number
  monthlySpent: number
  budgetUtilization: number
  modelBreakdown: any[]
  projectedMonthlySpend: number
  topModels: Array<{
    model: string
    usage: number
    cost: number
    calls: number
  }>
}

export class AICostManager {
  private config: ReturnType<typeof getValidatedConfig>
  private readonly DAILY_TOKEN_LIMIT: number
  private readonly MONTHLY_BUDGET: number
  private modelManager = new OpenRouterModelManager()

  constructor() {
    this.config = getValidatedConfig()
    this.DAILY_TOKEN_LIMIT = this.config.MAX_AI_REQUESTS_PER_HOUR * 1000 // Approximate tokens per day
    this.MONTHLY_BUDGET = this.config.MONTHLY_AI_BUDGET
  }

  async checkUsageQuota(sessionId: string): Promise<UsageQuotaResult> {
    const dailyUsage = await this.getDailyTokenUsage()
    const monthlySpent = await this.getMonthlySpending()
    
    const remainingBudget = this.MONTHLY_BUDGET - monthlySpent
    const remainingTokens = this.DAILY_TOKEN_LIMIT - dailyUsage
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
      remainingTokens: Math.max(0, remainingTokens),
      remainingBudget: Math.max(0, remainingBudget),
      recommendedModel,
      dailyUsage,
      monthlySpent
    }
  }

  async trackUsage(
    sessionId: string,
    operation: string,
    inputText: string,
    outputText: string,
    model: string,
    tokensUsed: number,
    responseTimeMs: number,
    cost: number
  ): Promise<void> {
    try {
      // 使用新的AI生成表记录使用情况
      await aiQueries.trackAIGeneration({
        userSessionId: sessionId,
        generationType: operation,
        inputText,
        generatedContent: outputText,
        modelUsed: model,
        tokensUsed,
        generationTimeMs: responseTimeMs,
        estimatedCost: cost
      })

      // 同时保留事件记录用于分析
      await prisma.userEvent.create({
        data: {
          sessionId,
          eventType: 'ai_usage',
          eventData: {
            operation,
            model,
            tokensUsed,
            responseTimeMs,
            cost,
            inputLength: inputText.length,
            outputLength: outputText.length,
            timestamp: new Date().toISOString()
          },
          pageUrl: '/ai-service'
        }
      })
    } catch (error) {
      console.error('Failed to track AI usage:', error)
    }
  }

  async getDailyTokenUsage(): Promise<number> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const result = await prisma.aiGeneration.aggregate({
        where: {
          createdAt: {
            gte: today
          }
        },
        _sum: {
          tokensUsed: true
        }
      })

      return result._sum.tokensUsed || 0
    } catch (error) {
      console.error('Failed to get daily token usage:', error)
      return 0
    }
  }

  async getMonthlySpending(): Promise<number> {
    try {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const result = await prisma.aiGeneration.aggregate({
        where: {
          createdAt: {
            gte: startOfMonth
          }
        },
        _sum: {
          estimatedCost: true
        }
      })

      return parseFloat(result._sum.estimatedCost?.toString() || '0')
    } catch (error) {
      console.error('Failed to get monthly spending:', error)
      return 0
    }
  }

  async generateCostReport(): Promise<CostReport> {
    try {
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
        projectedMonthlySpend: this.calculateProjectedSpend(monthlySpending),
        topModels: modelUsage.slice(0, 5)
      }
    } catch (error) {
      console.error('Failed to generate cost report:', error)
      return {
        dailyTokens: 0,
        monthlySpent: 0,
        budgetUtilization: 0,
        modelBreakdown: [],
        projectedMonthlySpend: 0,
        topModels: []
      }
    }
  }

  private async getModelUsageBreakdown() {
    try {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const result = await prisma.aiGeneration.groupBy({
        by: ['modelUsed'],
        where: {
          createdAt: {
            gte: startOfMonth
          }
        },
        _sum: {
          tokensUsed: true,
          estimatedCost: true
        },
        _count: {
          id: true
        }
      })

      return result.map(item => ({
        model: item.modelUsed,
        usage: item._sum.tokensUsed || 0,
        cost: parseFloat(item._sum.estimatedCost?.toString() || '0'),
        calls: item._count.id
      })).sort((a, b) => b.cost - a.cost)
    } catch (error) {
      console.error('Failed to get model usage breakdown:', error)
      return []
    }
  }

  private calculateProjectedSpend(currentSpend: number): number {
    const dayOfMonth = new Date().getDate()
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
    
    if (dayOfMonth === 0) return currentSpend
    return (currentSpend / dayOfMonth) * daysInMonth
  }

  // 检查是否需要降级模型
  async shouldDowngradeModel(currentModel: string): Promise<{ shouldDowngrade: boolean, suggestedModel?: string }> {
    const quota = await this.checkUsageQuota('system')
    
    if (quota.remainingBudget < 10) {
      const suggestedModel = await this.modelManager.getOptimalModel('general', 'low')
      return { shouldDowngrade: true, suggestedModel }
    }
    
    if (quota.remainingBudget < 50) {
      const suggestedModel = await this.modelManager.getOptimalModel('general', 'medium')
      return { shouldDowngrade: true, suggestedModel }
    }

    return { shouldDowngrade: false }
  }

  // 获取成本效率最高的模型
  async getMostCostEffectiveModel(): Promise<string> {
    const modelBreakdown = await this.getModelUsageBreakdown()
    
    if (modelBreakdown.length === 0) {
      return process.env.AI_MODEL_NAME || 'anthropic/claude-3.5-sonnet'
    }

    // 计算每个模型的成本效率（tokens per dollar）
    const efficiency = modelBreakdown
      .filter(m => m.cost > 0)
      .map(m => ({
        model: m.model,
        efficiency: m.usage / m.cost
      }))
      .sort((a, b) => b.efficiency - a.efficiency)

    return efficiency[0]?.model || process.env.AI_MODEL_NAME || 'anthropic/claude-3.5-sonnet'
  }
}
