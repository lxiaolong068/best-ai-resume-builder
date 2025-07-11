# 部署指南

本指南详细说明了如何将 Best AI Resume Builder 项目部署到生产环境，并提供运维建议。项目主要使用 Vercel 作为部署平台，结合 PostgreSQL 数据库和其他服务。

## 📋 先决条件

- Vercel 账户（免费或付费）
- GitHub 仓库（项目已推送）
- 数据库服务（如 Neon 或 Supabase）
- 必要的 API 密钥（Jobscan、ConvertKit 等）
- Node.js 18+（本地测试用）

## 🛠️ 生产环境配置

### 1. 环境变量设置

在 Vercel 中配置以下环境变量（基于 .env.production）：

```bash
# 数据库
DATABASE_URL="postgresql://user:pass@prod-db:5432/airesume_prod"

# 认证
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.com"

# 第三方 API
JOBSCAN_API_KEY="your-jobscan-key"
CONVERTKIT_API_KEY="your-convertkit-key"
GOOGLE_ANALYTICS_ID="GA_MEASUREMENT_ID"

# 可选服务
REDIS_URL="redis://prod-redis:6379"
SENTRY_DSN="your-sentry-dsn"
```

**注意**：使用 Vercel 的环境变量管理界面添加这些变量，并选择适用于 Production 分支。

### 2. 数据库配置

- **使用 Neon 或 Supabase**：创建生产数据库实例，并获取连接字符串。
- 运行迁移：
```bash
npx prisma migrate deploy
```
- 种子数据：仅在首次部署时运行 `npx prisma db seed`。

## 🚀 部署到 Vercel

1. **连接 GitHub**：在 Vercel 仪表板中导入你的 GitHub 仓库。
2. **配置项目**：
   - 框架预设：Next.js
   - 构建命令：npm run build
   - 输出目录：.next
   - 安装命令：npm install
3. **自定义域名**：添加域名并配置 DNS（使用 Vercel 的 DNS 或外部）。
4. **部署**：推送代码到 main 分支，Vercel 会自动构建和部署。

**分支部署**：为 staging 分支配置预览部署，用于测试。

## 📊 监控和日志

- **Vercel Analytics**：启用内置分析，监控性能指标。
- **Sentry**：集成错误监控，配置 DSN 以捕获异常。
- **日志**：使用 Vercel 的实时日志查看部署和运行时日志。
- **健康检查**：添加 /api/health 端点用于监控。

## 🔄 数据备份与恢复

- **自动化备份**：使用数据库服务的内置备份功能（每日备份）。
- **恢复流程**：从备份点恢复数据库，并重新部署应用。
- **数据保留**：保留 7 天滚动备份。

## ⚙️ CI/CD 配置

使用 GitHub Actions：

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Vercel CLI
        run: npm install --global vercel
      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      - name: Deploy Project Artifacts
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

添加 Vercel Token 到 GitHub Secrets。

## ❓ 常见问题

- **部署失败**：检查环境变量和 Prisma 连接。
- **性能问题**：优化图片和使用 CDN。
- **安全**：确保所有密钥不暴露在客户端代码中。

如果遇到问题，请参考 Vercel 文档或联系支持。 