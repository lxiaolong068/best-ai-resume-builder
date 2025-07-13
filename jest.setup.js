import '@testing-library/jest-dom'

// Mock environment variables
process.env.OPENROUTER_API_KEY = 'test-api-key'
process.env.OPENROUTER_BASE_URL = 'https://test-openrouter.ai/api/v1'
process.env.AI_MODEL_NAME = 'test-model'
process.env.AI_FALLBACK_MODEL = 'test-fallback-model'
process.env.MAX_TOKENS_PER_REQUEST = '1000'
process.env.AI_CACHE_TTL = '3600'
process.env.MONTHLY_AI_BUDGET = '100'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'

// Mock fetch globally
global.fetch = jest.fn()

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Setup test utilities
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks()
  
  // Reset localStorage
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()
  
  // Reset fetch mock
  fetch.mockClear()
})

// Global test helpers
global.testHelpers = {
  mockSuccessfulAIResponse: (content) => {
    return {
      choices: [{
        message: {
          content: typeof content === 'string' ? content : JSON.stringify(content)
        }
      }]
    }
  },
  
  mockFailedAIResponse: (error) => {
    throw new Error(error || 'AI API Error')
  },
  
  createMockAnalysisResult: (overrides = {}) => {
    return {
      score: 85,
      suggestions: ['Test suggestion 1', 'Test suggestion 2'],
      optimizedContent: 'Test optimized content',
      keywords: ['test', 'keyword'],
      atsCompatibility: {
        score: 80,
        issues: ['Test issue'],
        improvements: ['Test improvement']
      },
      ...overrides
    }
  }
}
