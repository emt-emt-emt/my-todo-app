#!/bin/bash
set -e

echo "🔧 Vercel Postgres 自动配置脚本"
echo "================================"

# 检查 vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装"
    echo "请运行: npm install -g vercel"
    exit 1
fi

# 检查登录状态
if ! vercel whoami &> /dev/null; then
    echo "🔑 请先登录 Vercel:"
    echo "   vercel login"
    exit 1
fi

# 获取项目信息
echo "📦 检查项目配置..."
PROJECT_ID=$(vercel project list 2>/dev/null | grep -oP 'my-todo-app' | head -1)

if [ -z "$PROJECT_ID" ]; then
    echo "⚠️ 未找到项目 'my-todo-app'"
    echo "请先运行: vercel link"
    exit 1
fi

echo "✅ 项目已找到: $PROJECT_ID"

# 检查是否已有 Postgres 数据库
echo "🗄️ 检查 Postgres 数据库..."
DB_LIST=$(vercel database list 2>/dev/null || echo "")

if echo "$DB_LIST" | grep -q "postgres"; then
    echo "✅ 已存在 Postgres 数据库"
    DB_NAME=$(echo "$DB_LIST" | grep "postgres" | head -1 | awk '{print $1}')
    echo "   数据库: $DB_NAME"
else
    echo "➕ 创建新的 Postgres 数据库..."
    echo "⚠️ 注意: 需要在 Vercel Dashboard 手动创建数据库"
    echo "   步骤:"
    echo "   1. 打开 https://vercel.com/dashboard"
    echo "   2. 进入你的项目"
    echo "   3. 点击 Storage → Create Database → Postgres"
    echo "   4. 选择区域 (推荐 Singapore)"
    echo "   5. 点击 Connect to Project 连接到你的项目"
    exit 1
fi

# 获取环境变量
echo "🔍 检查 POSTGRES_URL 环境变量..."
ENV_VARS=$(vercel env list 2>/dev/null || echo "")

if echo "$ENV_VARS" | grep -q "POSTGRES_URL"; then
    echo "✅ POSTGRES_URL 已配置"
else
    echo "⚠️ POSTGRES_URL 未配置"
    echo "请手动添加环境变量或在 Dashboard 中连接数据库"
fi

echo ""
echo "📋 配置检查完成"
echo "如果数据库已创建，请重新部署项目使配置生效:"
echo "   vercel --prod"
