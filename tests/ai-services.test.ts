import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { AIResumeService } from '../src/lib/ai-services'
import { aiCache } from '../src/lib/ai-cache'
import { aiQueue } from '../src/lib/ai-queue'

// Mock OpenAI
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn()
        }
      }
    }))
  }
})

describe('AI Resume Services', () => {
  let aiService: AIResumeService
  let mockOpenAI: any

  beforeEach(() => {
    // 设置环境变量
    process.env.OPENROUTER_API_KEY = 'test-key'
    process.env.AI_MODEL_NAME = 'test-model'
    process.env.MAX_TOKENS_PER_REQUEST = '1000'

    aiService = new AIResumeService()
    
    // 获取mock的OpenAI实例
    const OpenAI = require('openai').default
    mockOpenAI = new OpenAI()
    
    // 清理缓存
    aiCache.clearAll()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('analyzeResume', () => {
    test('should analyze resume and return structured result', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              score: 85,
              suggestions: ['Improve formatting', 'Add more keywords'],
              optimizedContent: 'Optimized resume content',
              keywords: ['JavaScript', 'React', 'Node.js'],
              atsCompatibility: {
                score: 80,
                issues: ['Missing contact info'],
                improvements: ['Add phone number', 'Include LinkedIn']
              }
            })
          }
        }]
      }

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse)

      const result = await aiService.analyzeResume(
        'Software engineer with 5 years experience',
        'Senior Developer',
        'test-model',
        false, // disable cache for test
        false  // disable queue for test
      )

      expect(result.score).toBe(85)
      expect(result.suggestions).toHaveLength(2)
      expect(result.keywords).toContain('JavaScript')
      expect(result.atsCompatibility.score).toBe(80)
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(1)
    })

    test('should handle JSON parsing errors gracefully', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Invalid JSON response'
          }
        }]
      }

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse)

      const result = await aiService.analyzeResume(
        'Test resume',
        'Test role',
        'test-model',
        false,
        false
      )

      expect(result.score).toBe(75) // default score
      expect(result.suggestions).toContain('Invalid JSON response')
    })

    test('should use cache when enabled', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              score: 90,
              suggestions: ['Great resume'],
              optimizedContent: 'Perfect',
              keywords: ['AI', 'ML'],
              atsCompatibility: {
                score: 95,
                issues: [],
                improvements: []
              }
            })
          }
        }]
      }

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse)

      // First call - should hit API
      const result1 = await aiService.analyzeResume(
        'Test resume content',
        'AI Engineer',
        'test-model',
        true, // enable cache
        false
      )

      // Second call - should use cache
      const result2 = await aiService.analyzeResume(
        'Test resume content',
        'AI Engineer',
        'test-model',
        true,
        false
      )

      expect(result1.score).toBe(90)
      expect(result2.score).toBe(90)
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(1) // Only called once
    })
  })

  describe('generateResumeSection', () => {
    test('should generate professional resume summary', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Experienced software engineer with expertise in full-stack development...'
          }
        }]
      }

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse)

      const result = await aiService.generateResumeSection(
        'summary',
        'Software engineer with 5 years experience',
        'Senior Developer',
        'test-model',
        false,
        false
      )

      expect(result).toContain('software engineer')
      expect(result.length).toBeGreaterThan(50)
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'test-model',
          max_tokens: 1000,
          temperature: 0.7
        })
      )
    })

    test('should generate different content for different sections', async () => {
      const mockResponses = {
        summary: 'Professional summary content...',
        experience: 'Enhanced work experience description...',
        skills: 'Optimized skills list with keywords...'
      }

      mockOpenAI.chat.completions.create.mockImplementation(async (params: any) => {
        const prompt = params.messages[0].content
        if (prompt.includes('总结段落')) {
          return { choices: [{ message: { content: mockResponses.summary } }] }
        } else if (prompt.includes('工作经验')) {
          return { choices: [{ message: { content: mockResponses.experience } }] }
        } else if (prompt.includes('技能列表')) {
          return { choices: [{ message: { content: mockResponses.skills } }] }
        }
        return { choices: [{ message: { content: 'Default response' } }] }
      })

      const summaryResult = await aiService.generateResumeSection(
        'summary', 'Test input', 'Test role', 'test-model', false, false
      )
      const experienceResult = await aiService.generateResumeSection(
        'experience', 'Test input', 'Test role', 'test-model', false, false
      )
      const skillsResult = await aiService.generateResumeSection(
        'skills', 'Test input', 'Test role', 'test-model', false, false
      )

      expect(summaryResult).toBe(mockResponses.summary)
      expect(experienceResult).toBe(mockResponses.experience)
      expect(skillsResult).toBe(mockResponses.skills)
    })
  })

  describe('optimizeForATS', () => {
    test('should provide ATS optimization suggestions', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'ATS Optimization Suggestions:\n1. Use standard section headers\n2. Include relevant keywords\n3. Avoid complex formatting'
          }
        }]
      }

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse)

      const result = await aiService.optimizeForATS(
        'Sample resume text',
        'Job description text',
        'test-model'
      )

      expect(result).toContain('ATS Optimization')
      expect(result).toContain('keywords')
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'test-model',
          max_tokens: 3000,
          temperature: 0.3
        })
      )
    })
  })

  describe('error handling', () => {
    test('should fallback to backup model on error', async () => {
      process.env.AI_FALLBACK_MODEL = 'backup-model'
      
      // First call fails
      mockOpenAI.chat.completions.create
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: JSON.stringify({
                score: 70,
                suggestions: ['Backup suggestion'],
                optimizedContent: 'Backup content',
                keywords: ['backup'],
                atsCompatibility: {
                  score: 70,
                  issues: [],
                  improvements: []
                }
              })
            }
          }]
        })

      const result = await aiService.analyzeResume(
        'Test resume',
        'Test role',
        'test-model',
        false,
        false
      )

      expect(result.score).toBe(70)
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(2)
    })

    test('should throw error when all models fail', async () => {
      process.env.AI_FALLBACK_MODEL = 'backup-model'
      
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'))

      await expect(
        aiService.analyzeResume('Test resume', 'Test role', 'test-model', false, false)
      ).rejects.toThrow('API Error')
    })
  })

  describe('utility methods', () => {
    test('should estimate tokens correctly', () => {
      const text = 'This is a test text with approximately twenty words in it for testing purposes.'
      const tokens = aiService.estimateTokens(text)
      
      expect(tokens).toBeGreaterThan(15)
      expect(tokens).toBeLessThan(25)
    })

    test('should calculate estimated cost', async () => {
      // Mock model pricing
      aiService.getModelPricing = jest.fn().mockResolvedValue({
        prompt: 0.000001,
        completion: 0.000002
      })

      const cost = await aiService.estimateCost(
        'Input text',
        'Output text',
        'test-model'
      )

      expect(cost).toBeGreaterThan(0)
      expect(typeof cost).toBe('number')
    })
  })
})
