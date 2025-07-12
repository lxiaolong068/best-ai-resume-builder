import { prisma } from './prisma'

/**
 * 调试比较API问题
 */
export async function debugCompareAPI() {
  console.log('🔍 调试比较API问题...')

  try {
    // 1. 获取所有工具
    const tools = await prisma.aiTool.findMany({
      orderBy: { rating: 'desc' },
      take: 5,
      include: {
        reviews: {
          orderBy: { reviewDate: 'desc' },
          take: 1
        }
      }
    })

    console.log(`📊 找到 ${tools.length} 个工具:`)
    for (const tool of tools) {
      console.log(`   - ${tool.name} (ID: ${tool.id}, 评分: ${tool.rating})`)
    }

    // 2. 模拟前端自动选择逻辑
    const topTools = tools
      .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
      .slice(0, 3)
      .map(tool => tool.id)

    console.log(`\n🎯 自动选择的前3个工具ID:`)
    for (const id of topTools) {
      console.log(`   - ${id}`)
    }

    // 3. 检查ID格式
    console.log(`\n🔍 检查ID格式:`)
    for (const id of topTools) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
      console.log(`   - ${id}: ${isUUID ? '✅ 有效UUID' : '❌ 无效UUID'}`)
    }

    // 4. 测试比较API请求体
    const requestBody = {
      toolIds: topTools
    }

    console.log(`\n📤 比较API请求体:`)
    console.log(JSON.stringify(requestBody, null, 2))

    // 5. 验证请求体
    const { toolComparisonSchema } = await import('./validation')
    
    try {
      const validationResult = toolComparisonSchema.parse(requestBody)
      console.log(`\n✅ 请求体验证通过:`)
      console.log(JSON.stringify(validationResult, null, 2))
    } catch (error) {
      console.log(`\n❌ 请求体验证失败:`)
      console.error(error)
    }

    // 6. 测试实际API调用
    console.log(`\n🌐 测试API调用...`)
    try {
      const response = await fetch('http://localhost:3000/api/tools/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log(`📡 API响应状态: ${response.status}`)
      
      const responseData = await response.json()
      console.log(`📡 API响应数据:`)
      console.log(JSON.stringify(responseData, null, 2))

    } catch (error) {
      console.error(`❌ API调用失败:`, error)
    }

  } catch (error) {
    console.error('❌ 调试过程中出错:', error)
    throw error
  }
}

// 如果直接运行此文件
if (require.main === module) {
  debugCompareAPI()
    .then(() => {
      console.log('✅ 调试完成')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ 调试失败:', error)
      process.exit(1)
    })
}
