import { prisma } from './prisma'

/**
 * 清理数据库中的重复AI工具记录
 * 保留每个工具名称的最新记录，删除其他重复项
 */
export async function cleanupDuplicateTools() {
  console.log('🧹 开始清理重复的AI工具数据...')

  try {
    // 1. 查找所有工具，按名称分组
    const allTools = await prisma.aiTool.findMany({
      orderBy: { createdAt: 'desc' }
    })

    console.log(`📊 找到 ${allTools.length} 个工具记录`)

    // 2. 按名称分组，找出重复项
    const toolsByName = new Map<string, typeof allTools>()
    
    for (const tool of allTools) {
      if (!toolsByName.has(tool.name)) {
        toolsByName.set(tool.name, [])
      }
      toolsByName.get(tool.name)!.push(tool)
    }

    // 3. 处理每个工具名称的重复项
    let totalDeleted = 0
    
    for (const [toolName, tools] of toolsByName) {
      if (tools.length > 1) {
        console.log(`🔍 发现 ${toolName} 有 ${tools.length} 个重复记录`)
        
        // 保留最新的记录（第一个，因为已按创建时间降序排列）
        const keepTool = tools[0]
        const duplicateTools = tools.slice(1)
        
        console.log(`✅ 保留记录: ${keepTool.id} (创建于: ${keepTool.createdAt})`)
        
        // 删除重复记录及其相关的评论
        for (const duplicateTool of duplicateTools) {
          console.log(`🗑️  删除重复记录: ${duplicateTool.id} (创建于: ${duplicateTool.createdAt})`)
          
          // 先删除相关的评论
          await prisma.toolReview.deleteMany({
            where: { toolId: duplicateTool.id }
          })
          
          // 删除工具记录
          await prisma.aiTool.delete({
            where: { id: duplicateTool.id }
          })
          
          totalDeleted++
        }
      } else {
        console.log(`✅ ${toolName} 没有重复记录`)
      }
    }

    console.log(`🎉 清理完成！删除了 ${totalDeleted} 个重复记录`)
    
    // 4. 显示清理后的统计信息
    const remainingTools = await prisma.aiTool.findMany({
      include: {
        reviews: true
      }
    })
    
    console.log(`📈 清理后统计:`)
    console.log(`   - 工具总数: ${remainingTools.length}`)
    console.log(`   - 评论总数: ${remainingTools.reduce((sum, tool) => sum + tool.reviews.length, 0)}`)
    
    // 5. 列出保留的工具
    console.log(`\n📋 保留的工具列表:`)
    for (const tool of remainingTools) {
      console.log(`   - ${tool.name} (ID: ${tool.id}, 评分: ${tool.rating})`)
    }

  } catch (error) {
    console.error('❌ 清理过程中出现错误:', error)
    throw error
  }
}

/**
 * 为种子脚本添加重复检查，防止重复插入
 */
export async function seedWithDuplicateCheck() {
  console.log('🌱 开始安全种子数据插入...')

  try {
    // 检查是否已有数据
    const existingToolsCount = await prisma.aiTool.count()
    
    if (existingToolsCount > 0) {
      console.log(`⚠️  数据库中已存在 ${existingToolsCount} 个工具记录`)
      console.log('如需重新种子，请先运行清理脚本或手动清空数据库')
      return
    }

    // 如果没有数据，则运行正常的种子脚本
    const { seedDatabase } = await import('./seed')
    await seedDatabase()
    
  } catch (error) {
    console.error('❌ 种子数据插入失败:', error)
    throw error
  }
}

// 如果直接运行此文件，执行清理操作
if (require.main === module) {
  const command = process.argv[2]
  
  if (command === 'cleanup') {
    cleanupDuplicateTools()
      .then(() => {
        console.log('✅ 清理完成')
        process.exit(0)
      })
      .catch((error) => {
        console.error('❌ 清理失败:', error)
        process.exit(1)
      })
  } else if (command === 'seed-safe') {
    seedWithDuplicateCheck()
      .then(() => {
        console.log('✅ 安全种子完成')
        process.exit(0)
      })
      .catch((error) => {
        console.error('❌ 安全种子失败:', error)
        process.exit(1)
      })
  } else {
    console.log('使用方法:')
    console.log('  npm run cleanup-duplicates cleanup  # 清理重复数据')
    console.log('  npm run cleanup-duplicates seed-safe # 安全种子数据')
    process.exit(1)
  }
}
