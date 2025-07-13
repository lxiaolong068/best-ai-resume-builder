'use client'

import { useState, useEffect } from 'react'
import { 
  SparklesIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface AIGenerationResult {
  content: string
  metadata: {
    tokensUsed: number
    responseTimeMs: number
    modelUsed: string
    estimatedCost: number
    sectionType: string
    targetRole: string
    remainingQuota: {
      tokens: number
      budget: number
    }
  }
}

interface QuotaInfo {
  canProceed: boolean
  remainingTokens: number
  remainingBudget: number
  recommendedModel?: string
  dailyUsage: number
  monthlySpent: number
}

export function AIResumeBuilder() {
  const [activeSection, setActiveSection] = useState<'summary' | 'experience' | 'skills'>('summary')
  const [userInput, setUserInput] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null)
  const [lastGeneration, setLastGeneration] = useState<AIGenerationResult | null>(null)

  // 获取会话ID
  const getSessionId = () => {
    let sessionId = localStorage.getItem('session-id')
    if (!sessionId) {
      sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('session-id', sessionId)
    }
    return sessionId
  }

  // 加载配额信息
  useEffect(() => {
    loadQuotaInfo()
  }, [])

  const loadQuotaInfo = async () => {
    try {
      const response = await fetch('/api/ai/generate-resume', {
        method: 'GET',
        headers: {
          'X-Session-ID': getSessionId(),
        },
      })
      const data = await response.json()
      if (data.success) {
        setQuotaInfo(data.data.quota)
      }
    } catch (error) {
      console.error('Failed to load quota info:', error)
    }
  }

  const generateContent = async () => {
    if (!userInput.trim() || !targetRole.trim()) {
      setError('请填写用户输入和目标职位')
      return
    }

    if (!quotaInfo?.canProceed) {
      setError('AI使用配额已用完，请稍后再试')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const response = await fetch('/api/ai/generate-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': getSessionId(),
        },
        body: JSON.stringify({
          sectionType: activeSection,
          userInput: userInput.trim(),
          targetRole: targetRole.trim(),
          complexity: 'medium'
        }),
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedContent(data.data.content)
        setLastGeneration(data.data)
        // 更新配额信息
        await loadQuotaInfo()
      } else {
        setError(data.error || 'AI生成失败')
      }
    } catch (err) {
      setError('网络错误，请重试')
      console.error('Generation error:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const sectionConfig = {
    summary: {
      title: '个人总结',
      icon: DocumentTextIcon,
      placeholder: '请描述您的背景、经验和技能...',
      description: 'AI将为您生成专业的简历总结段落'
    },
    experience: {
      title: '工作经验',
      icon: BriefcaseIcon,
      placeholder: '请描述您的工作经验、职责和成就...',
      description: 'AI将优化您的工作经验描述，使其更具影响力'
    },
    skills: {
      title: '技能列表',
      icon: CogIcon,
      placeholder: '请列出您的技能和专长...',
      description: 'AI将为您优化技能列表并添加相关关键词'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <SparklesIcon className="h-8 w-8 text-blue-600 mr-2" />
          <h1 className="text-3xl font-bold text-gray-900">AI简历生成器</h1>
        </div>
        <p className="text-gray-600">
          使用AI技术生成专业的简历内容，针对特定职位优化
        </p>
      </div>

      {/* 配额信息 */}
      {quotaInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">
                剩余配额: {quotaInfo.remainingTokens.toLocaleString()} tokens
              </span>
            </div>
            <div className="text-sm text-blue-600">
              预算: ${quotaInfo.remainingBudget.toFixed(2)}
            </div>
          </div>
          {quotaInfo.recommendedModel && (
            <div className="mt-2 text-xs text-blue-600">
              推荐模型: {quotaInfo.recommendedModel}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧：输入区域 */}
        <div className="space-y-6">
          {/* 目标职位 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              目标职位 *
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="例如：高级软件工程师"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 部分选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              选择要生成的部分
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(sectionConfig).map(([key, config]) => {
                const IconComponent = config.icon
                return (
                  <button
                    key={key}
                    onClick={() => setActiveSection(key as any)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      activeSection === key
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-sm font-medium">{config.title}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 用户输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {sectionConfig[activeSection].title}内容 *
            </label>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={sectionConfig[activeSection].placeholder}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              {sectionConfig[activeSection].description}
            </p>
          </div>

          {/* 生成按钮 */}
          <button
            onClick={generateContent}
            disabled={isGenerating || !quotaInfo?.canProceed}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isGenerating || !quotaInfo?.canProceed
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isGenerating ? (
              <div className="flex items-center justify-center">
                <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                AI生成中...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <SparklesIcon className="h-5 w-5 mr-2" />
                生成{sectionConfig[activeSection].title}
              </div>
            )}
          </button>

          {/* 错误信息 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* 右侧：生成结果 */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              生成结果
            </h3>
            
            {generatedContent ? (
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="whitespace-pre-wrap text-gray-800">
                    {generatedContent}
                  </div>
                </div>

                {/* 生成元数据 */}
                {lastGeneration && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">生成信息</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                      <div>模型: {lastGeneration.metadata.modelUsed}</div>
                      <div>响应时间: {lastGeneration.metadata.responseTimeMs}ms</div>
                      <div>使用Token: {lastGeneration.metadata.tokensUsed}</div>
                      <div>估算成本: ${lastGeneration.metadata.estimatedCost.toFixed(6)}</div>
                    </div>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedContent)}
                    className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    复制内容
                  </button>
                  <button
                    onClick={generateContent}
                    disabled={isGenerating}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300"
                  >
                    重新生成
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  填写左侧信息并点击生成按钮，AI将为您创建专业的简历内容
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
