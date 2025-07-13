import { validateEnvironment, checkAIConfiguration } from './env-validation'
import { prisma } from './prisma'

export interface ConfigValidationResult {
  valid: boolean
  environment: {
    valid: boolean
    errors: string[]
    warnings: string[]
  }
  database: {
    connected: boolean
    tablesExist: boolean
    errors: string[]
  }
  ai: {
    configured: boolean
    keysValid: boolean
    modelsAccessible: boolean
    errors: string[]
    warnings: string[]
  }
  services: {
    redis: { available: boolean; error?: string }
    sentry: { configured: boolean }
  }
  summary: {
    totalErrors: number
    totalWarnings: number
    criticalIssues: string[]
    recommendations: string[]
  }
}

class ConfigValidator {
  async validateAll(): Promise<ConfigValidationResult> {
    const result: ConfigValidationResult = {
      valid: true,
      environment: { valid: true, errors: [], warnings: [] },
      database: { connected: false, tablesExist: false, errors: [] },
      ai: { configured: false, keysValid: false, modelsAccessible: false, errors: [], warnings: [] },
      services: { redis: { available: false }, sentry: { configured: false } },
      summary: { totalErrors: 0, totalWarnings: 0, criticalIssues: [], recommendations: [] }
    }

    // Validate environment variables
    await this.validateEnvironment(result)
    
    // Validate database connection
    await this.validateDatabase(result)
    
    // Validate AI configuration
    await this.validateAI(result)
    
    // Validate external services
    await this.validateServices(result)
    
    // Generate summary
    this.generateSummary(result)
    
    return result
  }

  private async validateEnvironment(result: ConfigValidationResult): Promise<void> {
    try {
      const envValidation = validateEnvironment()
      
      if (envValidation.success) {
        result.environment.valid = true
        if (envValidation.warnings) {
          result.environment.warnings = envValidation.warnings
        }
      } else {
        result.environment.valid = false
        result.environment.errors = envValidation.errors || []
        result.valid = false
      }
      
      // Additional environment checks
      if (process.env.NODE_ENV === 'production') {
        if (!process.env.NEXTAUTH_SECRET) {
          result.environment.errors.push('NEXTAUTH_SECRET is required in production')
        }
        
        if (!process.env.SENTRY_DSN) {
          result.environment.warnings.push('SENTRY_DSN not configured - error monitoring disabled')
        }
      }
      
    } catch (error) {
      result.environment.valid = false
      result.environment.errors.push(`Environment validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      result.valid = false
    }
  }

  private async validateDatabase(result: ConfigValidationResult): Promise<void> {
    try {
      // Test database connection
      await prisma.$connect()
      result.database.connected = true
      
      // Check if AI tables exist and have correct structure
      const tables = await prisma.$queryRaw<Array<{table_name: string}>>`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('ai_generations', 'ai_analyses', 'user_ai_preferences')
      `
      
      const requiredTables = ['ai_generations', 'ai_analyses', 'user_ai_preferences']
      const existingTables = tables.map(t => t.table_name)
      const missingTables = requiredTables.filter(table => !existingTables.includes(table))
      
      if (missingTables.length === 0) {
        result.database.tablesExist = true
      } else {
        result.database.errors.push(`Missing AI tables: ${missingTables.join(', ')}`)
        result.valid = false
      }
      
      // Test basic CRUD operations
      await this.testDatabaseOperations(result)
      
    } catch (error) {
      result.database.connected = false
      result.database.errors.push(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      result.valid = false
    } finally {
      await prisma.$disconnect()
    }
  }

  private async testDatabaseOperations(result: ConfigValidationResult): Promise<void> {
    try {
      // Test creating and deleting a test record
      const testRecord = await prisma.aiGeneration.create({
        data: {
          userSessionId: 'config-test',
          generationType: 'test',
          inputText: 'test input',
          generatedContent: 'test output',
          modelUsed: 'test-model',
          tokensUsed: 10,
          generationTimeMs: 100,
          estimatedCost: 0.001
        }
      })
      
      await prisma.aiGeneration.delete({
        where: { id: testRecord.id }
      })
      
    } catch (error) {
      result.database.errors.push(`Database operations test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async validateAI(result: ConfigValidationResult): Promise<void> {
    try {
      const aiCheck = checkAIConfiguration()
      
      if (aiCheck.isValid) {
        result.ai.configured = true
      } else {
        result.ai.errors = aiCheck.issues
      }
      
      // Test AI API key validity
      if (process.env.OPENROUTER_API_KEY) {
        try {
          const response = await fetch('https://openrouter.ai/api/v1/models', {
            headers: {
              'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
            }
          })
          
          if (response.ok) {
            result.ai.keysValid = true
            
            const data = await response.json()
            if (data.data && data.data.length > 0) {
              result.ai.modelsAccessible = true
              
              // Check if preferred models are available
              const availableModels = data.data.map((model: any) => model.id)
              const preferredModel = process.env.AI_MODEL_NAME
              const fallbackModel = process.env.AI_FALLBACK_MODEL
              
              if (preferredModel && !availableModels.includes(preferredModel)) {
                result.ai.warnings.push(`Preferred model "${preferredModel}" not available`)
              }
              
              if (fallbackModel && !availableModels.includes(fallbackModel)) {
                result.ai.warnings.push(`Fallback model "${fallbackModel}" not available`)
              }
            } else {
              result.ai.warnings.push('No AI models accessible with current API key')
            }
          } else if (response.status === 401) {
            result.ai.errors.push('OpenRouter API key is invalid')
            result.valid = false
          } else {
            result.ai.warnings.push(`OpenRouter API returned status ${response.status}`)
          }
        } catch (error) {
          result.ai.warnings.push(`Could not validate OpenRouter API: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      } else {
        result.ai.errors.push('OpenRouter API key not configured')
        result.valid = false
      }
      
    } catch (error) {
      result.ai.errors.push(`AI configuration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async validateServices(result: ConfigValidationResult): Promise<void> {
    // Validate Redis
    if (process.env.REDIS_URL) {
      try {
        // Simple Redis connection test (you would need to import redis client)
        // For now, just check if URL is valid
        new URL(process.env.REDIS_URL)
        result.services.redis.available = true
      } catch (error) {
        result.services.redis.available = false
        result.services.redis.error = `Invalid Redis URL: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
    
    // Validate Sentry
    result.services.sentry.configured = !!process.env.SENTRY_DSN
  }

  private generateSummary(result: ConfigValidationResult): void {
    // Count errors and warnings
    result.summary.totalErrors = 
      result.environment.errors.length + 
      result.database.errors.length + 
      result.ai.errors.length

    result.summary.totalWarnings = 
      result.environment.warnings.length + 
      result.ai.warnings.length

    // Identify critical issues
    if (!result.database.connected) {
      result.summary.criticalIssues.push('Database connection failed')
    }
    
    if (!result.ai.configured) {
      result.summary.criticalIssues.push('AI services not properly configured')
    }
    
    if (!result.environment.valid) {
      result.summary.criticalIssues.push('Environment variables validation failed')
    }

    // Generate recommendations
    if (!result.services.redis.available) {
      result.summary.recommendations.push('Configure Redis for improved caching and rate limiting')
    }
    
    if (!result.services.sentry.configured) {
      result.summary.recommendations.push('Configure Sentry for error monitoring in production')
    }
    
    if (result.ai.warnings.length > 0) {
      result.summary.recommendations.push('Review AI model configuration and availability')
    }
    
    if (result.environment.warnings.length > 0) {
      result.summary.recommendations.push('Review environment configuration warnings')
    }

    // Overall validity
    result.valid = result.summary.criticalIssues.length === 0
  }

  generateReport(result: ConfigValidationResult): string {
    const lines: string[] = []
    
    lines.push('=== Configuration Validation Report ===\n')
    lines.push(`Overall Status: ${result.valid ? '✅ VALID' : '❌ INVALID'}\n`)
    
    if (result.summary.criticalIssues.length > 0) {
      lines.push('🚨 Critical Issues:')
      result.summary.criticalIssues.forEach(issue => lines.push(`  - ${issue}`))
      lines.push('')
    }
    
    lines.push(`📊 Summary: ${result.summary.totalErrors} errors, ${result.summary.totalWarnings} warnings\n`)
    
    // Environment section
    lines.push('🌍 Environment Variables:')
    lines.push(`  Status: ${result.environment.valid ? '✅' : '❌'}`)
    if (result.environment.errors.length > 0) {
      result.environment.errors.forEach(error => lines.push(`    ❌ ${error}`))
    }
    if (result.environment.warnings.length > 0) {
      result.environment.warnings.forEach(warning => lines.push(`    ⚠️  ${warning}`))
    }
    lines.push('')
    
    // Database section
    lines.push('🗄️  Database:')
    lines.push(`  Connection: ${result.database.connected ? '✅' : '❌'}`)
    lines.push(`  AI Tables: ${result.database.tablesExist ? '✅' : '❌'}`)
    if (result.database.errors.length > 0) {
      result.database.errors.forEach(error => lines.push(`    ❌ ${error}`))
    }
    lines.push('')
    
    // AI section
    lines.push('🤖 AI Services:')
    lines.push(`  Configuration: ${result.ai.configured ? '✅' : '❌'}`)
    lines.push(`  API Keys: ${result.ai.keysValid ? '✅' : '❌'}`)
    lines.push(`  Model Access: ${result.ai.modelsAccessible ? '✅' : '❌'}`)
    if (result.ai.errors.length > 0) {
      result.ai.errors.forEach(error => lines.push(`    ❌ ${error}`))
    }
    if (result.ai.warnings.length > 0) {
      result.ai.warnings.forEach(warning => lines.push(`    ⚠️  ${warning}`))
    }
    lines.push('')
    
    // Services section
    lines.push('🔧 External Services:')
    lines.push(`  Redis: ${result.services.redis.available ? '✅' : '❌'}`)
    if (result.services.redis.error) {
      lines.push(`    ❌ ${result.services.redis.error}`)
    }
    lines.push(`  Sentry: ${result.services.sentry.configured ? '✅' : '❌'}`)
    lines.push('')
    
    // Recommendations
    if (result.summary.recommendations.length > 0) {
      lines.push('💡 Recommendations:')
      result.summary.recommendations.forEach(rec => lines.push(`  - ${rec}`))
    }
    
    return lines.join('\n')
  }
}

export const configValidator = new ConfigValidator()

export async function validateApplicationConfig(): Promise<ConfigValidationResult> {
  return configValidator.validateAll()
}

export async function logConfigurationStatus(): Promise<void> {
  const result = await validateApplicationConfig()
  const report = configValidator.generateReport(result)
  
  if (result.valid) {
    console.log('✅ Application configuration is valid')
    if (result.summary.totalWarnings > 0) {
      console.warn(`⚠️  Configuration has ${result.summary.totalWarnings} warnings`)
    }
  } else {
    console.error('❌ Application configuration is invalid')
    console.error(report)
  }
  
  // In development, always show the full report
  if (process.env.NODE_ENV === 'development') {
    console.log('\n' + report)
  }
}