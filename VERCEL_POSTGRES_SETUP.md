# 自动配置 Vercel Postgres

## 前提条件

1. 已有 Vercel 账号: https://vercel.com/signup
2. 项目已部署到 Vercel

## 快速配置步骤

### 步骤 1: 登录 Vercel CLI

```bash
npx vercel login
# 按提示完成浏览器授权
```

### 步骤 2: 运行自动配置脚本

```bash
chmod +x setup-vercel-postgres.sh
./setup-vercel-postgres.sh
```

如果脚本提示需要在 Dashboard 创建数据库，请继续步骤 3。

### 步骤 3: 在 Vercel Dashboard 创建 Postgres 数据库 (必须手动)

1. 打开 https://vercel.com/dashboard
2. 选择你的项目 `my-todo-app`
3. 点击顶部 **Storage** 标签
4. 点击 **Create Database**
5. 选择 **Postgres** (由 Neon 提供)
6. 选择区域: **Singapore** (离你最近)
7. 点击 **Create**
8. 创建后点击 **Connect** → **Connect to Project** → 选择你的项目

### 步骤 4: 重新部署

数据库连接后，环境变量 `POSTGRES_URL` 会自动添加。重新部署使配置生效：

```bash
npx vercel --prod
```

或在 Vercel Dashboard 中点击 **Redeploy**。

---

## 使用 GitHub Actions 自动部署 (推荐)

### 配置 GitHub Secrets

在 GitHub 仓库 → Settings → Secrets and variables → Actions 中添加:

| Secret Name | 获取方式 |
|------------|---------|
| `VERCEL_TOKEN` | Vercel Dashboard → Settings → Tokens → Create |
| `VERCEL_ORG_ID` | 运行 `npx vercel whoami` 或从项目设置获取 |
| `VERCEL_PROJECT_ID` | 项目设置 → General → Project ID |

### 配置完成后

每次 push 到 `main` 分支会自动部署到 Vercel。

---

## 验证数据库是否工作

部署完成后，访问以下页面测试:

1. 注册一个新用户: 点击右上角 **登录/注册** → 选择 **注册**
2. 刷新页面，检查是否还能登录 (验证数据已持久化)
3. 访问 `/admin` 用 `admin/admin123` 登录查看用户列表

---

## 故障排除

### 问题: 注册仍然显示 "服务器错误"

**原因**: `POSTGRES_URL` 环境变量未设置

**解决**: 
```bash
# 检查环境变量
npx vercel env ls

# 如果没有 POSTGRES_URL，手动添加:
npx vercel env add POSTGRES_URL
# 输入你的数据库连接字符串
```

### 问题: 如何获取数据库连接字符串?

1. Vercel Dashboard → Storage → 你的 Postgres 数据库
2. 点击 **.env.local** 标签
3. 复制 `POSTGRES_URL` 的值

### 问题: 本地开发时数据不保存

本地开发使用内存模式，数据不持久化。如需本地持久化，在 `.env.local` 中添加:
```
POSTGRES_URL="你的数据库连接字符串"
```
