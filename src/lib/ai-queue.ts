interface QueueItem {
  id: string
  operation: string
  params: any
  resolve: (value: any) => void
  reject: (error: any) => void
  priority: number
  timestamp: number
  retries: number
  maxRetries: number
}

export class AIRequestQueue {
  private queue: QueueItem[] = []
  private processing = new Set<string>()
  private readonly maxConcurrent: number
  private readonly maxQueueSize: number
  private readonly defaultTimeout: number

  constructor(
    maxConcurrent: number = 3,
    maxQueueSize: number = 100,
    defaultTimeout: number = 30000
  ) {
    this.maxConcurrent = maxConcurrent
    this.maxQueueSize = maxQueueSize
    this.defaultTimeout = defaultTimeout
  }

  async enqueue<T>(
    operation: string,
    params: any,
    options: {
      priority?: number
      maxRetries?: number
      timeout?: number
    } = {}
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = this.generateId()
      const item: QueueItem = {
        id,
        operation,
        params,
        resolve,
        reject,
        priority: options.priority || 0,
        timestamp: Date.now(),
        retries: 0,
        maxRetries: options.maxRetries || 2
      }

      // 检查队列大小
      if (this.queue.length >= this.maxQueueSize) {
        reject(new Error('Queue is full'))
        return
      }

      // 按优先级插入队列
      this.insertByPriority(item)

      // 设置超时
      setTimeout(() => {
        this.removeFromQueue(id)
        reject(new Error('Request timeout'))
      }, options.timeout || this.defaultTimeout)

      // 尝试处理队列
      this.processQueue()
    })
  }

  private insertByPriority(item: QueueItem): void {
    let inserted = false
    for (let i = 0; i < this.queue.length; i++) {
      if (item.priority > this.queue[i].priority) {
        this.queue.splice(i, 0, item)
        inserted = true
        break
      }
    }
    if (!inserted) {
      this.queue.push(item)
    }
  }

  private async processQueue(): Promise<void> {
    if (this.processing.size >= this.maxConcurrent || this.queue.length === 0) {
      return
    }

    const item = this.queue.shift()
    if (!item) return

    this.processing.add(item.id)

    try {
      const result = await this.executeOperation(item)
      item.resolve(result)
    } catch (error) {
      if (item.retries < item.maxRetries) {
        item.retries++
        // 重新加入队列，降低优先级
        item.priority = Math.max(0, item.priority - 1)
        this.insertByPriority(item)
      } else {
        item.reject(error)
      }
    } finally {
      this.processing.delete(item.id)
      // 继续处理队列
      setImmediate(() => this.processQueue())
    }
  }

  private async executeOperation(item: QueueItem): Promise<any> {
    const { operation, params } = item

    switch (operation) {
      case 'analyze_resume':
        return this.executeAnalysis(params)
      case 'generate_section':
        return this.executeGeneration(params)
      case 'optimize_ats':
        return this.executeOptimization(params)
      default:
        throw new Error(`Unknown operation: ${operation}`)
    }
  }

  private async executeAnalysis(params: any): Promise<any> {
    const { AIResumeService } = await import('./ai-services')
    const service = new AIResumeService()
    return service.analyzeResume(params.resumeText, params.targetRole, params.model)
  }

  private async executeGeneration(params: any): Promise<any> {
    const { AIResumeService } = await import('./ai-services')
    const service = new AIResumeService()
    return service.generateResumeSection(
      params.sectionType,
      params.userInput,
      params.targetRole,
      params.model
    )
  }

  private async executeOptimization(params: any): Promise<any> {
    const { AIResumeService } = await import('./ai-services')
    const service = new AIResumeService()
    return service.optimizeForATS(params.resumeText, params.jobDescription, params.model)
  }

  private removeFromQueue(id: string): void {
    this.queue = this.queue.filter(item => item.id !== id)
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // 获取队列状态
  getStatus(): {
    queueLength: number
    processing: number
    maxConcurrent: number
    averageWaitTime: number
  } {
    const now = Date.now()
    const waitTimes = this.queue.map(item => now - item.timestamp)
    const averageWaitTime = waitTimes.length > 0 
      ? waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length 
      : 0

    return {
      queueLength: this.queue.length,
      processing: this.processing.size,
      maxConcurrent: this.maxConcurrent,
      averageWaitTime: Math.round(averageWaitTime)
    }
  }

  // 清空队列
  clear(): void {
    this.queue.forEach(item => {
      item.reject(new Error('Queue cleared'))
    })
    this.queue = []
  }
}

// 智能负载均衡
export class LoadBalancer {
  private queues: Map<string, AIRequestQueue> = new Map()
  private readonly maxQueues = 3

  constructor() {
    // 创建多个队列实例
    for (let i = 0; i < this.maxQueues; i++) {
      this.queues.set(`queue-${i}`, new AIRequestQueue())
    }
  }

  async enqueue<T>(operation: string, params: any, options: any = {}): Promise<T> {
    // 选择负载最轻的队列
    const queue = this.selectOptimalQueue()
    return queue.enqueue<T>(operation, params, options)
  }

  private selectOptimalQueue(): AIRequestQueue {
    let optimalQueue: AIRequestQueue | null = null
    let minLoad = Infinity

    for (const queue of this.queues.values()) {
      const status = queue.getStatus()
      const load = status.queueLength + status.processing
      
      if (load < minLoad) {
        minLoad = load
        optimalQueue = queue
      }
    }

    if (optimalQueue) {
      return optimalQueue
    }
    
    // Fallback to first available queue
    const firstQueue = this.queues.values().next().value
    if (!firstQueue) {
      throw new Error('No AI queues available')
    }
    
    return firstQueue
  }

  getOverallStatus(): {
    totalQueued: number
    totalProcessing: number
    averageWaitTime: number
    queues: Array<{ id: string; status: any }>
  } {
    let totalQueued = 0
    let totalProcessing = 0
    let totalWaitTime = 0
    const queues: Array<{ id: string; status: any }> = []

    for (const [id, queue] of this.queues.entries()) {
      const status = queue.getStatus()
      totalQueued += status.queueLength
      totalProcessing += status.processing
      totalWaitTime += status.averageWaitTime
      queues.push({ id, status })
    }

    return {
      totalQueued,
      totalProcessing,
      averageWaitTime: Math.round(totalWaitTime / this.queues.size),
      queues
    }
  }
}

// 单例实例
export const aiQueue = new LoadBalancer()

// 请求优先级常量
export const Priority = {
  LOW: 0,
  NORMAL: 1,
  HIGH: 2,
  URGENT: 3
} as const

// 操作类型常量
export const Operations = {
  ANALYZE_RESUME: 'analyze_resume',
  GENERATE_SECTION: 'generate_section',
  OPTIMIZE_ATS: 'optimize_ats'
} as const
