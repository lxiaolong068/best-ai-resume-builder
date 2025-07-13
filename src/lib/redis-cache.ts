import { Redis } from '@upstash/redis'
import { getValidatedConfig } from './env-validation'

export interface RedisCacheConfig {
  defaultTTL: number
  maxKeyLength: number
  keyPrefix: string
  compressionThreshold: number
}

export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
  compressed?: boolean
}

export interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  errors: number
  hitRate: number
}

class RedisCache {
  private redis: Redis | null = null
  private config: RedisCacheConfig
  private stats: CacheStats
  private isConnected = false

  constructor() {
    this.config = {
      defaultTTL: 3600, // 1 hour
      maxKeyLength: 250,
      keyPrefix: 'ai-resume:',
      compressionThreshold: 1024 // Compress data larger than 1KB
    }

    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      hitRate: 0
    }

    this.initializeRedis()
  }

  private initializeRedis(): void {
    try {
      const envConfig = getValidatedConfig()
      
      if (process.env.REDIS_URL && process.env.REDIS_TOKEN) {
        this.redis = new Redis({
          url: process.env.REDIS_URL,
          token: process.env.REDIS_TOKEN
        })
        this.isConnected = true
        console.log('✅ Redis cache initialized')
      } else {
        console.warn('⚠️  Redis URL not configured, using fallback cache')
      }
    } catch (error) {
      console.error('❌ Failed to initialize Redis:', error)
      this.redis = null
      this.isConnected = false
    }
  }

  async isAvailable(): Promise<boolean> {
    if (!this.redis) return false
    
    try {
      await this.redis.ping()
      return true
    } catch (error) {
      console.error('Redis ping failed:', error)
      return false
    }
  }

  private generateKey(key: string): string {
    const fullKey = `${this.config.keyPrefix}${key}`
    
    if (fullKey.length > this.config.maxKeyLength) {
      // Hash long keys
      const hash = this.simpleHash(fullKey)
      return `${this.config.keyPrefix}hash:${hash}`
    }
    
    return fullKey
  }

  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  private compressData(data: string): string {
    // Simple compression - in production you might want to use a proper compression library
    if (data.length < this.config.compressionThreshold) {
      return data
    }
    
    try {
      // Basic compression using JSON.stringify optimization
      const compressed = JSON.stringify(JSON.parse(data))
      return compressed.length < data.length ? compressed : data
    } catch {
      return data
    }
  }

  private decompressData(data: string): string {
    return data // For now, no actual decompression
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (!this.redis || !this.isConnected) {
      return null
    }

    try {
      const redisKey = this.generateKey(key)
      const result = await this.redis.get(redisKey)
      
      if (result === null) {
        this.stats.misses++
        this.updateHitRate()
        return null
      }

      const entry: CacheEntry<T> = JSON.parse(result as string)
      
      // Check if entry has expired
      if (Date.now() > entry.timestamp + (entry.ttl * 1000)) {
        await this.delete(key)
        this.stats.misses++
        this.updateHitRate()
        return null
      }

      this.stats.hits++
      this.updateHitRate()
      
      return entry.compressed ? 
        JSON.parse(this.decompressData(JSON.stringify(entry.data))) : 
        entry.data
        
    } catch (error) {
      console.error('Redis get error:', error)
      this.stats.errors++
      return null
    }
  }

  async set<T = any>(key: string, value: T, ttl?: number): Promise<boolean> {
    if (!this.redis || !this.isConnected) {
      return false
    }

    try {
      const redisKey = this.generateKey(key)
      const entryTTL = ttl || this.config.defaultTTL
      
      const dataStr = JSON.stringify(value)
      const compressed = dataStr.length > this.config.compressionThreshold
      const finalData = compressed ? this.compressData(dataStr) : dataStr
      
      const entry: CacheEntry<T> = {
        data: compressed ? JSON.parse(finalData) : value,
        timestamp: Date.now(),
        ttl: entryTTL,
        compressed
      }

      await this.redis.set(redisKey, JSON.stringify(entry), { ex: entryTTL })
      this.stats.sets++
      return true
      
    } catch (error) {
      console.error('Redis set error:', error)
      this.stats.errors++
      return false
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.redis || !this.isConnected) {
      return false
    }

    try {
      const redisKey = this.generateKey(key)
      const result = await this.redis.del(redisKey)
      this.stats.deletes++
      return result > 0
      
    } catch (error) {
      console.error('Redis delete error:', error)
      this.stats.errors++
      return false
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.redis || !this.isConnected) {
      return false
    }

    try {
      const redisKey = this.generateKey(key)
      const result = await this.redis.exists(redisKey)
      return result === 1
      
    } catch (error) {
      console.error('Redis exists error:', error)
      this.stats.errors++
      return false
    }
  }

  async clear(pattern?: string): Promise<number> {
    if (!this.redis || !this.isConnected) {
      return 0
    }

    try {
      const searchPattern = pattern ? 
        `${this.config.keyPrefix}${pattern}*` : 
        `${this.config.keyPrefix}*`
      
      const keys = await this.redis.keys(searchPattern)
      
      if (keys.length === 0) {
        return 0
      }

      const result = await this.redis.del(...keys)
      this.stats.deletes += keys.length
      return result
      
    } catch (error) {
      console.error('Redis clear error:', error)
      this.stats.errors++
      return 0
    }
  }

  async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    if (!this.redis || !this.isConnected || keys.length === 0) {
      return keys.map(() => null)
    }

    try {
      const redisKeys = keys.map(key => this.generateKey(key))
      const results = await this.redis.mget(...redisKeys)
      
      return results.map((result, index) => {
        if (result === null) {
          this.stats.misses++
          return null
        }

        try {
          const entry: CacheEntry<T> = JSON.parse(result as string)
          
          // Check if entry has expired
          if (Date.now() > entry.timestamp + (entry.ttl * 1000)) {
            this.delete(keys[index]) // Don't await to avoid blocking
            this.stats.misses++
            return null
          }

          this.stats.hits++
          return entry.compressed ? 
            JSON.parse(this.decompressData(JSON.stringify(entry.data))) : 
            entry.data
            
        } catch (parseError) {
          console.error('Redis mget parse error:', parseError)
          this.stats.errors++
          return null
        }
      })
      
    } catch (error) {
      console.error('Redis mget error:', error)
      this.stats.errors++
      return keys.map(() => null)
    } finally {
      this.updateHitRate()
    }
  }

  async mset<T = any>(entries: Array<{ key: string; value: T; ttl?: number }>): Promise<boolean[]> {
    if (!this.redis || !this.isConnected || entries.length === 0) {
      return entries.map(() => false)
    }

    const results = await Promise.allSettled(
      entries.map(entry => this.set(entry.key, entry.value, entry.ttl))
    )

    return results.map(result => result.status === 'fulfilled' ? result.value : false)
  }

  async setWithExpiry<T = any>(key: string, value: T, seconds: number): Promise<boolean> {
    return this.set(key, value, seconds)
  }

  async increment(key: string, delta: number = 1): Promise<number | null> {
    if (!this.redis || !this.isConnected) {
      return null
    }

    try {
      const redisKey = this.generateKey(key)
      const result = await this.redis.incrby(redisKey, delta)
      return result
      
    } catch (error) {
      console.error('Redis increment error:', error)
      this.stats.errors++
      return null
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    if (!this.redis || !this.isConnected) {
      return false
    }

    try {
      const redisKey = this.generateKey(key)
      const result = await this.redis.expire(redisKey, seconds)
      return result === 1
      
    } catch (error) {
      console.error('Redis expire error:', error)
      this.stats.errors++
      return false
    }
  }

  async ttl(key: string): Promise<number | null> {
    if (!this.redis || !this.isConnected) {
      return null
    }

    try {
      const redisKey = this.generateKey(key)
      const result = await this.redis.ttl(redisKey)
      return result
      
    } catch (error) {
      console.error('Redis TTL error:', error)
      this.stats.errors++
      return null
    }
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0
  }

  getStats(): CacheStats {
    return { ...this.stats }
  }

  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      hitRate: 0
    }
  }

  async getMemoryUsage(): Promise<{ used: string; peak: string } | null> {
    // Upstash Redis doesn't support the INFO command
    // Return placeholder data for now
    if (!this.redis || !this.isConnected) {
      return null
    }

    return {
      used: 'N/A (Upstash)',
      peak: 'N/A (Upstash)'
    }
  }

  async healthCheck(): Promise<{
    connected: boolean
    latency?: number
    memoryUsage?: { used: string; peak: string }
    stats: CacheStats
  }> {
    const startTime = Date.now()
    
    try {
      const connected = await this.isAvailable()
      const latency = Date.now() - startTime
      const memoryUsage = await this.getMemoryUsage()
      
      return {
        connected,
        latency: connected ? latency : undefined,
        memoryUsage: memoryUsage || undefined,
        stats: this.getStats()
      }
      
    } catch (error) {
      return {
        connected: false,
        stats: this.getStats()
      }
    }
  }
}

export const redisCache = new RedisCache()

// Enhanced cache interface that supports both Redis and memory cache
export class HybridCache {
  async get<T = any>(key: string): Promise<T | null> {
    // Try Redis first, fall back to memory cache if Redis is not available
    if (await redisCache.isAvailable()) {
      return redisCache.get<T>(key)
    }
    
    // Fallback to memory cache (you would import your existing memory cache here)
    return null
  }

  async set<T = any>(key: string, value: T, ttl?: number): Promise<boolean> {
    if (await redisCache.isAvailable()) {
      return redisCache.set(key, value, ttl)
    }
    
    // Fallback to memory cache
    return false
  }

  async delete(key: string): Promise<boolean> {
    if (await redisCache.isAvailable()) {
      return redisCache.delete(key)
    }
    
    return false
  }

  async clear(pattern?: string): Promise<number> {
    if (await redisCache.isAvailable()) {
      return redisCache.clear(pattern)
    }
    
    return 0
  }

  async healthCheck() {
    return redisCache.healthCheck()
  }
}

export const hybridCache = new HybridCache()