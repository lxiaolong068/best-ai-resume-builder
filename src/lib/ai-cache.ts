import crypto from 'crypto'

// 简单的内存缓存实现（生产环境建议使用Redis）
class MemoryCache {
  private cache = new Map<string, { data: any; expiry: number }>()
  private readonly maxSize = 1000 // 最大缓存条目数

  set(key: string, value: any, ttlSeconds: number = 3600): void {
    const expiry = Date.now() + (ttlSeconds * 1000)
    
    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }
    
    this.cache.set(key, { data: value, expiry })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  // 清理过期条目
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key)
      }
    }
  }
}

export class AIResponseCache {
  private cache = new MemoryCache()
  private readonly defaultTTL = parseInt(process.env.AI_CACHE_TTL || '3600') // 1小时

  constructor() {
    // 每10分钟清理一次过期缓存
    setInterval(() => {
      this.cache.cleanup()
    }, 10 * 60 * 1000)
  }

  async getCachedResponse(inputHash: string): Promise<string | null> {
    return this.cache.get(inputHash)
  }

  async setCachedResponse(inputHash: string, response: string, ttl?: number): Promise<void> {
    this.cache.set(inputHash, response, ttl || this.defaultTTL)
  }

  generateInputHash(input: string, model: string, temperature: number = 0.3): string {
    const content = `${input}:${model}:${temperature}`
    return crypto.createHash('sha256').update(content).digest('hex')
  }

  // 为不同类型的AI操作生成特定的缓存键
  generateAnalysisHash(resumeText: string, targetRole: string, model: string): string {
    const content = `analysis:${resumeText}:${targetRole}:${model}`
    return crypto.createHash('sha256').update(content).digest('hex')
  }

  generateGenerationHash(sectionType: string, userInput: string, targetRole: string, model: string): string {
    const content = `generation:${sectionType}:${userInput}:${targetRole}:${model}`
    return crypto.createHash('sha256').update(content).digest('hex')
  }

  generateOptimizationHash(resumeText: string, jobDescription: string, model: string): string {
    const content = `optimization:${resumeText}:${jobDescription}:${model}`
    return crypto.createHash('sha256').update(content).digest('hex')
  }

  // 获取缓存统计信息
  getStats(): { size: number; hitRate?: number } {
    return {
      size: this.cache.size()
    }
  }

  // 清除所有缓存
  clearAll(): void {
    this.cache.clear()
  }

  // 预热缓存 - 为常见请求预生成响应
  async warmupCache(commonRequests: Array<{
    type: 'analysis' | 'generation' | 'optimization'
    params: any
  }>): Promise<void> {
    // 这里可以实现缓存预热逻辑
    console.log(`Warming up cache with ${commonRequests.length} requests`)
  }
}

// 单例实例
export const aiCache = new AIResponseCache()

// 缓存装饰器
export function cached(ttl: number = 3600) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cacheKey = aiCache.generateInputHash(
        JSON.stringify(args),
        'method',
        0
      )

      // 尝试从缓存获取
      const cached = await aiCache.getCachedResponse(cacheKey)
      if (cached) {
        return JSON.parse(cached)
      }

      // 执行原方法
      const result = await method.apply(this, args)

      // 缓存结果
      await aiCache.setCachedResponse(cacheKey, JSON.stringify(result), ttl)

      return result
    }
  }
}

// 智能缓存策略
export class SmartCacheStrategy {
  // 根据内容类型和复杂度决定缓存时间
  static getTTL(operationType: string, contentLength: number, complexity: string): number {
    const baseTTL = parseInt(process.env.AI_CACHE_TTL || '3600')
    
    // 分析类操作缓存时间更长
    if (operationType === 'analysis') {
      return baseTTL * 2
    }
    
    // 复杂内容缓存时间更长
    if (complexity === 'complex' || contentLength > 5000) {
      return baseTTL * 1.5
    }
    
    // 简单生成任务缓存时间较短
    if (operationType === 'generation' && complexity === 'simple') {
      return baseTTL * 0.5
    }
    
    return baseTTL
  }

  // 判断是否应该缓存
  static shouldCache(operationType: string, inputLength: number, outputLength: number): boolean {
    // 输入太短的不缓存（可能是测试）
    if (inputLength < 50) {
      return false
    }
    
    // 输出太短的不缓存（可能是错误）
    if (outputLength < 20) {
      return false
    }
    
    // 输入太长的不缓存（占用内存过多）
    if (inputLength > 20000) {
      return false
    }
    
    return true
  }
}

// 缓存性能监控
export class CacheMetrics {
  private static hits = 0
  private static misses = 0
  private static errors = 0

  static recordHit(): void {
    this.hits++
  }

  static recordMiss(): void {
    this.misses++
  }

  static recordError(): void {
    this.errors++
  }

  static getMetrics(): { hits: number; misses: number; errors: number; hitRate: number } {
    const total = this.hits + this.misses
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0
    
    return {
      hits: this.hits,
      misses: this.misses,
      errors: this.errors,
      hitRate: Math.round(hitRate * 100) / 100
    }
  }

  static reset(): void {
    this.hits = 0
    this.misses = 0
    this.errors = 0
  }
}
