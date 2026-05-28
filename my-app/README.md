# 📝 待办清单 - Todo List

基于 Next.js + Supabase + Vercel 的待办清单应用。

## 功能

- ✅ 添加任务
- ✅ 标记完成/未完成
- ✅ 删除任务
- ✅ 数据持久化（Supabase 数据库，刷新不丢失）

## 技术栈

- **框架:** Next.js 16 (App Router)
- **样式:** Tailwind CSS
- **数据库:** Supabase (PostgreSQL)
- **部署:** Vercel

---

## 部署步骤

### 1. 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com) 并注册/登录
2. 点击 **New Project**，填写项目名称和密码
3. 等待项目创建完成

### 2. 创建数据库表

1. 进入项目的 **SQL Editor**
2. 新建查询，粘贴 `supabase-setup.sql` 中的内容
3. 点击 **Run** 执行

### 3. 获取 API 密钥

1. 进入 **Project Settings → API**
2. 复制以下信息：
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`（在 Settings → Data API 底部）

### 4. 部署到 Vercel

**方式一：通过 GitHub（推荐）**

1. 将代码推送到 GitHub 仓库
2. 访问 [vercel.com](https://vercel.com)，点击 **Add New Project**
3. 选择 GitHub 仓库，点击 **Import**
4. 在 **Environment Variables** 中添加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. 点击 **Deploy**

**方式二：通过 Vercel CLI**

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 设置环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# 部署
vercel --prod
```

---

## 本地开发

```bash
# 1. 复制环境变量文件
cp .env.local.example .env.local

# 2. 填入你的 Supabase 配置

# 3. 安装依赖并启动
npm install
npm run dev
```

访问 http://localhost:3000

---

## 项目结构

```
my-app/
├── src/
│   ├── app/
│   │   ├── actions.ts       # Server Actions（增删改）
│   │   ├── layout.tsx       # 根布局
│   │   └── page.tsx         # 主页面
│   ├── components/
│   │   ├── TodoForm.tsx     # 添加任务表单
│   │   ├── TodoItem.tsx     # 单个任务项
│   │   └── TodoList.tsx     # 任务列表（Server Component）
│   └── lib/
│       └── supabase.ts      # Supabase 客户端
├── supabase-setup.sql       # 数据库初始化 SQL
├── next.config.ts
└── package.json
```
