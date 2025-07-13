import { getValidatedConfig } from './env-validation'
import { aiQueries } from './db-queries'

export interface AIMetrics {
  timestamp: number
  operation: string
  model: string
  tokensUsed: number
  responseTime: number
  cost: number
  success: boolean
  errorType?: string
  sessionId: string
  userAgent?: string
  ipAddress?: string
}

export interface PerformanceMetrics {
  avgResponseTime: number
  successRate: number
  totalRequests: number
  totalTokens: number
  totalCost: number
  errorBreakdown: Record<string, number>
  modelUsage: Record<string, { requests: number; tokens: number; cost: number }>
  hourlyTrends: Array<{ hour: number; requests: number; avgResponseTime: number }>
}

export interface AlertRule {
  id: string
  name: string
  condition: (metrics: PerformanceMetrics) => boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  enabled: boolean
}

export interface Alert {
  id: string
  rule: AlertRule
  triggeredAt: number
  metrics: PerformanceMetrics
  resolved: boolean
  resolvedAt?: number
}

class AIMonitoringSystem {
  private config: ReturnType<typeof getValidatedConfig>
  private metrics: AIMetrics[] = []
  private alerts: Alert[] = []
  private alertRules: AlertRule[] = []
  private maxMetricsBuffer = 10000 // Keep last 10k metrics in memory

  constructor() {
    this.config = getValidatedConfig()
    this.initializeAlertRules()
  }

  private initializeAlertRules(): void {
    this.alertRules = [
      {
        id: 'high-error-rate',
        name: 'High Error Rate',
        condition: (metrics) => metrics.successRate < 0.95,
        severity: 'high',
        description: 'AI service error rate exceeds 5%',
        enabled: true
      },
      {
        id: 'slow-response-time',
        name: 'Slow Response Time',
        condition: (metrics) => metrics.avgResponseTime > 10000,
        severity: 'medium',
        description: 'Average AI response time exceeds 10 seconds',
        enabled: true
      },
      {
        id: 'budget-warning',
        name: 'Budget Warning',
        condition: (metrics) => metrics.totalCost > this.config.MONTHLY_AI_BUDGET * 0.8,
        severity: 'medium',
        description: 'AI usage approaching 80% of monthly budget',
        enabled: true
      },
      {
        id: 'budget-critical',
        name: 'Budget Critical',
        condition: (metrics) => metrics.totalCost > this.config.MONTHLY_AI_BUDGET * 0.95,
        severity: 'critical',
        description: 'AI usage approaching 95% of monthly budget',
        enabled: true
      },
      {
        id: 'token-rate-high',
        name: 'High Token Usage Rate',
        condition: (metrics) => {
          const recentHour = metrics.hourlyTrends[metrics.hourlyTrends.length - 1]
          return recentHour && recentHour.requests > this.config.MAX_AI_REQUESTS_PER_HOUR * 0.9
        },
        severity: 'medium',
        description: 'AI request rate approaching hourly limit',
        enabled: true
      }
    ]
  }

  recordMetric(metric: AIMetrics): void {
    metric.timestamp = Date.now()
    this.metrics.push(metric)

    // Keep buffer size manageable
    if (this.metrics.length > this.maxMetricsBuffer) {
      this.metrics = this.metrics.slice(-this.maxMetricsBuffer)
    }

    // Log important events
    if (!metric.success) {
      console.error('AI operation failed:', {
        operation: metric.operation,
        model: metric.model,
        errorType: metric.errorType,
        responseTime: metric.responseTime,
        sessionId: metric.sessionId
      })
    } else if (metric.responseTime > 5000) {
      console.warn('Slow AI operation:', {
        operation: metric.operation,
        model: metric.model,
        responseTime: metric.responseTime,
        tokensUsed: metric.tokensUsed
      })
    }

    // Check alerts
    this.checkAlerts()
  }

  async recordAIOperation(
    operation: string,
    model: string,
    tokensUsed: number,
    responseTime: number,
    cost: number,
    success: boolean,
    sessionId: string,
    errorType?: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<void> {
    const metric: AIMetrics = {
      timestamp: Date.now(),
      operation,
      model,
      tokensUsed,
      responseTime,
      cost,
      success,
      errorType,
      sessionId,
      userAgent,
      ipAddress
    }

    this.recordMetric(metric)

    // Persist to database for long-term storage
    try {
      if (success) {
        await aiQueries.trackAIGeneration({
          userSessionId: sessionId,
          generationType: operation,
          inputText: `${operation} operation`,
          generatedContent: 'Success',
          modelUsed: model,
          tokensUsed,
          generationTimeMs: responseTime,
          estimatedCost: cost
        })
      }
    } catch (error) {
      console.error('Failed to persist AI metrics:', error)
    }
  }

  getPerformanceMetrics(timeWindowHours: number = 24): PerformanceMetrics {
    const now = Date.now()
    const timeWindow = timeWindowHours * 60 * 60 * 1000
    const recentMetrics = this.metrics.filter(m => now - m.timestamp <= timeWindow)

    if (recentMetrics.length === 0) {
      return {
        avgResponseTime: 0,
        successRate: 1,
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        errorBreakdown: {},
        modelUsage: {},
        hourlyTrends: []
      }
    }

    const totalRequests = recentMetrics.length
    const successfulRequests = recentMetrics.filter(m => m.success).length
    const successRate = successfulRequests / totalRequests

    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests
    const totalTokens = recentMetrics.reduce((sum, m) => sum + m.tokensUsed, 0)
    const totalCost = recentMetrics.reduce((sum, m) => sum + m.cost, 0)

    // Error breakdown
    const errorBreakdown: Record<string, number> = {}
    recentMetrics.filter(m => !m.success).forEach(m => {
      const errorType = m.errorType || 'unknown'
      errorBreakdown[errorType] = (errorBreakdown[errorType] || 0) + 1
    })

    // Model usage
    const modelUsage: Record<string, { requests: number; tokens: number; cost: number }> = {}
    recentMetrics.forEach(m => {
      if (!modelUsage[m.model]) {
        modelUsage[m.model] = { requests: 0, tokens: 0, cost: 0 }
      }
      modelUsage[m.model].requests++
      modelUsage[m.model].tokens += m.tokensUsed
      modelUsage[m.model].cost += m.cost
    })

    // Hourly trends
    const hourlyTrends: Array<{ hour: number; requests: number; avgResponseTime: number }> = []
    const hoursToAnalyze = Math.min(timeWindowHours, 24)
    
    for (let i = 0; i < hoursToAnalyze; i++) {
      const hourStart = now - (i + 1) * 60 * 60 * 1000
      const hourEnd = now - i * 60 * 60 * 1000
      const hourMetrics = recentMetrics.filter(m => m.timestamp >= hourStart && m.timestamp < hourEnd)
      
      hourlyTrends.unshift({
        hour: Math.floor(hourStart / (60 * 60 * 1000)),
        requests: hourMetrics.length,
        avgResponseTime: hourMetrics.length > 0 ? 
          hourMetrics.reduce((sum, m) => sum + m.responseTime, 0) / hourMetrics.length : 0
      })
    }

    return {
      avgResponseTime,
      successRate,
      totalRequests,
      totalTokens,
      totalCost,
      errorBreakdown,
      modelUsage,
      hourlyTrends
    }
  }

  private checkAlerts(): void {
    const metrics = this.getPerformanceMetrics()
    
    this.alertRules.filter(rule => rule.enabled).forEach(rule => {
      const isTriggered = rule.condition(metrics)
      const existingAlert = this.alerts.find(a => a.rule.id === rule.id && !a.resolved)
      
      if (isTriggered && !existingAlert) {
        // New alert
        const alert: Alert = {
          id: `${rule.id}-${Date.now()}`,
          rule,
          triggeredAt: Date.now(),
          metrics: { ...metrics },
          resolved: false
        }
        
        this.alerts.push(alert)
        this.sendAlert(alert)
        
      } else if (!isTriggered && existingAlert) {
        // Resolve existing alert
        existingAlert.resolved = true
        existingAlert.resolvedAt = Date.now()
        this.sendAlertResolution(existingAlert)
      }
    })
  }

  private sendAlert(alert: Alert): void {
    const logLevel = alert.rule.severity === 'critical' ? 'error' : 
                     alert.rule.severity === 'high' ? 'error' :
                     alert.rule.severity === 'medium' ? 'warn' : 'info'

    console[logLevel](`🚨 AI Alert: ${alert.rule.name}`, {
      alertId: alert.id,
      severity: alert.rule.severity,
      description: alert.rule.description,
      metrics: {
        successRate: alert.metrics.successRate,
        avgResponseTime: alert.metrics.avgResponseTime,
        totalCost: alert.metrics.totalCost,
        totalRequests: alert.metrics.totalRequests
      }
    })

    // In production, you might want to send to external alerting systems
    if (this.config.NODE_ENV === 'production') {
      this.sendToExternalAlertSystem(alert)
    }
  }

  private sendAlertResolution(alert: Alert): void {
    console.info(`✅ AI Alert Resolved: ${alert.rule.name}`, {
      alertId: alert.id,
      duration: alert.resolvedAt! - alert.triggeredAt,
      resolvedAt: new Date(alert.resolvedAt!).toISOString()
    })
  }

  private sendToExternalAlertSystem(alert: Alert): void {
    // Implement integration with Sentry, PagerDuty, Slack, etc.
    try {
      if (process.env.SENTRY_DSN) {
        // Send to Sentry
        console.log('Would send alert to Sentry:', alert.rule.name)
      }
      
      if (process.env.SLACK_WEBHOOK_URL) {
        // Send to Slack
        console.log('Would send alert to Slack:', alert.rule.name)
      }
    } catch (error) {
      console.error('Failed to send external alert:', error)
    }
  }

  getActiveAlerts(): Alert[] {
    return this.alerts.filter(a => !a.resolved)
  }

  getAllAlerts(limit: number = 100): Alert[] {
    return this.alerts.slice(-limit)
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId && !a.resolved)
    if (alert) {
      alert.resolved = true
      alert.resolvedAt = Date.now()
      this.sendAlertResolution(alert)
      return true
    }
    return false
  }

  addAlertRule(rule: Omit<AlertRule, 'id'>): AlertRule {
    const newRule: AlertRule = {
      ...rule,
      id: `custom-${Date.now()}`
    }
    this.alertRules.push(newRule)
    return newRule
  }

  updateAlertRule(id: string, updates: Partial<AlertRule>): boolean {
    const rule = this.alertRules.find(r => r.id === id)
    if (rule) {
      Object.assign(rule, updates)
      return true
    }
    return false
  }

  async getModelPerformanceReport(model?: string): Promise<{
    model: string
    totalRequests: number
    successRate: number
    avgResponseTime: number
    avgTokensPerRequest: number
    avgCostPerRequest: number
    errorTypes: Record<string, number>
  }[]> {
    const timeWindow = 24 * 60 * 60 * 1000 // 24 hours
    const now = Date.now()
    const recentMetrics = this.metrics.filter(m => now - m.timestamp <= timeWindow)
    
    const modelGroups = recentMetrics.reduce((groups, metric) => {
      if (!groups[metric.model]) {
        groups[metric.model] = []
      }
      groups[metric.model].push(metric)
      return groups
    }, {} as Record<string, AIMetrics[]>)

    const reports = Object.entries(modelGroups).map(([modelName, metrics]) => {
      const totalRequests = metrics.length
      const successfulRequests = metrics.filter(m => m.success).length
      const successRate = successfulRequests / totalRequests
      
      const avgResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests
      const avgTokensPerRequest = metrics.reduce((sum, m) => sum + m.tokensUsed, 0) / totalRequests
      const avgCostPerRequest = metrics.reduce((sum, m) => sum + m.cost, 0) / totalRequests
      
      const errorTypes: Record<string, number> = {}
      metrics.filter(m => !m.success).forEach(m => {
        const errorType = m.errorType || 'unknown'
        errorTypes[errorType] = (errorTypes[errorType] || 0) + 1
      })

      return {
        model: modelName,
        totalRequests,
        successRate,
        avgResponseTime,
        avgTokensPerRequest,
        avgCostPerRequest,
        errorTypes
      }
    })

    return model ? reports.filter(r => r.model === model) : reports
  }

  generateHealthReport(): {
    status: 'healthy' | 'degraded' | 'unhealthy'
    metrics: PerformanceMetrics
    activeAlerts: Alert[]
    recommendations: string[]
  } {
    const metrics = this.getPerformanceMetrics()
    const activeAlerts = this.getActiveAlerts()
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    const recommendations: string[] = []

    // Determine health status
    if (activeAlerts.some(a => a.rule.severity === 'critical')) {
      status = 'unhealthy'
    } else if (activeAlerts.some(a => a.rule.severity === 'high') || metrics.successRate < 0.95) {
      status = 'degraded'
    }

    // Generate recommendations
    if (metrics.successRate < 0.95) {
      recommendations.push('Investigate and fix high error rate')
    }
    
    if (metrics.avgResponseTime > 5000) {
      recommendations.push('Optimize AI service response times')
    }
    
    if (metrics.totalCost > this.config.MONTHLY_AI_BUDGET * 0.7) {
      recommendations.push('Monitor AI usage costs - approaching budget limit')
    }
    
    const topErrorType = Object.entries(metrics.errorBreakdown)
      .sort(([,a], [,b]) => b - a)[0]
    
    if (topErrorType && topErrorType[1] > 10) {
      recommendations.push(`Address frequent ${topErrorType[0]} errors`)
    }

    return {
      status,
      metrics,
      activeAlerts,
      recommendations
    }
  }

  clearMetrics(): void {
    this.metrics = []
    console.log('AI monitoring metrics cleared')
  }

  exportMetrics(): AIMetrics[] {
    return [...this.metrics]
  }
}

export const aiMonitoring = new AIMonitoringSystem()

// Utility function to track AI operations with monitoring
export async function trackAIOperation<T>(
  operation: string,
  model: string,
  sessionId: string,
  aiFunction: () => Promise<T>,
  userAgent?: string,
  ipAddress?: string
): Promise<T> {
  const startTime = Date.now()
  let tokensUsed = 0
  let cost = 0
  
  try {
    const result = await aiFunction()
    const responseTime = Date.now() - startTime
    
    // Try to extract tokens and cost from result if it's an object with metadata
    if (typeof result === 'object' && result !== null) {
      const metadata = (result as any).metadata
      if (metadata) {
        tokensUsed = metadata.tokensUsed || 0
        cost = metadata.estimatedCost || 0
      }
    }
    
    await aiMonitoring.recordAIOperation(
      operation,
      model,
      tokensUsed,
      responseTime,
      cost,
      true,
      sessionId,
      undefined,
      userAgent,
      ipAddress
    )
    
    return result
    
  } catch (error) {
    const responseTime = Date.now() - startTime
    const errorType = error instanceof Error ? error.constructor.name : 'UnknownError'
    
    await aiMonitoring.recordAIOperation(
      operation,
      model,
      tokensUsed,
      responseTime,
      cost,
      false,
      sessionId,
      errorType,
      userAgent,
      ipAddress
    )
    
    throw error
  }
}