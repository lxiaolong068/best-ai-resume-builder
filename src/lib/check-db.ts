import { prisma } from './prisma'

/**
 * 检查数据库中的工具数据状态
 */
export async function checkDatabaseStatus() {
  console.log('🔍 检查数据库状态...')

  try {
    // 1. 获取所有工具
    const allTools = await prisma.aiTool.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        reviews: true
      }
    })

    console.log(`📊 数据库中总共有 ${allTools.length} 个工具记录`)

    // 2. 按名称分组统计
    const toolsByName = new Map<string, typeof allTools>()
    
    for (const tool of allTools) {
      if (!toolsByName.has(tool.name)) {
        toolsByName.set(tool.name, [])
      }
      toolsByName.get(tool.name)!.push(tool)
    }

    console.log(`\n📋 工具名称统计:`)
    for (const [toolName, tools] of toolsByName) {
      console.log(`   - ${toolName}: ${tools.length} 个记录`)
      if (tools.length > 1) {
        console.log(`     ⚠️  发现重复记录:`)
        for (const tool of tools) {
          console.log(`       - ID: ${tool.id}, 创建时间: ${tool.createdAt}`)
        }
      }
    }

    // 3. 检查评论数据
    const allReviews = await prisma.toolReview.findMany()
    console.log(`\n⭐ 评论总数: ${allReviews.length}`)

    // 4. 检查是否有孤立的评论（对应的工具不存在）
    const toolIds = new Set(allTools.map(t => t.id))
    const orphanedReviews = allReviews.filter(review => !toolIds.has(review.toolId))
    
    if (orphanedReviews.length > 0) {
      console.log(`⚠️  发现 ${orphanedReviews.length} 个孤立评论（对应工具不存在）:`)
      for (const review of orphanedReviews) {
        console.log(`   - 评论ID: ${review.id}, 工具ID: ${review.toolId}`)
      }
    }

    return {
      totalTools: allTools.length,
      uniqueTools: toolsByName.size,
      duplicateTools: Array.from(toolsByName.entries()).filter(([_, tools]) => tools.length > 1),
      totalReviews: allReviews.length,
      orphanedReviews: orphanedReviews.length
    }

  } catch (error) {
    console.error('❌ 检查数据库状态时出错:', error)
    throw error
  }
}

/**
 * 强制清理所有数据并重新种子
 */
export async function forceCleanAndReseed() {
  console.log('🧹 强制清理所有数据...')

  try {
    // 1. 删除所有评论
    const deletedReviews = await prisma.toolReview.deleteMany()
    console.log(`🗑️  删除了 ${deletedReviews.count} 个评论`)

    // 2. 删除所有工具
    const deletedTools = await prisma.aiTool.deleteMany()
    console.log(`🗑️  删除了 ${deletedTools.count} 个工具`)

    // 3. 删除所有博客文章
    const deletedPosts = await prisma.blogPost.deleteMany()
    console.log(`🗑️  删除了 ${deletedPosts.count} 个博客文章`)

    // 4. 删除所有用户事件
    const deletedEvents = await prisma.userEvent.deleteMany()
    console.log(`🗑️  删除了 ${deletedEvents.count} 个用户事件`)

    console.log('✅ 数据库清理完成')

    // 5. 重新种子
    console.log('🌱 开始重新种子...')
    const { seedDatabase } = await import('./seed')
    await seedDatabase()

    console.log('🎉 强制清理和重新种子完成！')

  } catch (error) {
    console.error('❌ 强制清理过程中出错:', error)
    throw error
  }
}

// 如果直接运行此文件
if (require.main === module) {
  const command = process.argv[2]
  
  if (command === 'check') {
    checkDatabaseStatus()
      .then((status) => {
        console.log('\n📈 数据库状态总结:')
        console.log(`   - 工具总数: ${status.totalTools}`)
        console.log(`   - 唯一工具: ${status.uniqueTools}`)
        console.log(`   - 重复工具: ${status.duplicateTools.length}`)
        console.log(`   - 评论总数: ${status.totalReviews}`)
        console.log(`   - 孤立评论: ${status.orphanedReviews}`)
        
        if (status.duplicateTools.length > 0) {
          console.log('\n⚠️  建议运行清理脚本解决重复数据问题')
          process.exit(1)
        } else {
          console.log('\n✅ 数据库状态正常')
          process.exit(0)
        }
      })
      .catch((error) => {
        console.error('❌ 检查失败:', error)
        process.exit(1)
      })
  } else if (command === 'force-clean') {
    forceCleanAndReseed()
      .then(() => {
        console.log('✅ 强制清理完成')
        process.exit(0)
      })
      .catch((error) => {
        console.error('❌ 强制清理失败:', error)
        process.exit(1)
      })
  } else {
    console.log('使用方法:')
    console.log('  npm run db:check check        # 检查数据库状态')
    console.log('  npm run db:check force-clean  # 强制清理并重新种子')
    process.exit(1)
  }
}
