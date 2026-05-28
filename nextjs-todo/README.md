# Next.js + Supabase 待办清单应用

## 功能
- ✅ 添加任务
- ✅ 标记完成（复选框）
- ✅ 删除任务
- ✅ 数据持久化（Supabase 数据库）
- ✅ 实时同步
- ✅ 响应式设计

## 快速开始

### 1. 安装依赖
```bash
cd nextjs-todo
npm install
```

### 2. 配置环境变量
复制 `.env.local.example` 为 `.env.local`，填入你的 Supabase 信息：

```env
NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon_key
```

### 3. 创建数据库表
在 Supabase SQL Editor 执行：

```sql
CREATE TABLE todos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    is_complete BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON todos FOR ALL USING (true);
```

### 4. 本地运行
```bash
npm run dev
```
访问 http://localhost:3000

### 5. 部署到 Vercel
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel

# 或连接 GitHub 自动部署
```

## 项目结构
```
nextjs-todo/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # 根布局
│   │   ├── page.tsx        # 首页
│   │   └── globals.css     # 全局样式
│   ├── components/
│   │   └── TodoList.tsx    # 待办组件
│   └── lib/
│       └── supabase.ts     # Supabase 客户端
├── .env.local.example      # 环境变量模板
├── next.config.js          # Next.js 配置
└── package.json
```

## Vercel 部署注意事项
1. 在 Vercel 项目设置中添加环境变量
2. 确保 Supabase RLS 策略已配置
3. 如果使用 GitHub 集成，推送自动部署
