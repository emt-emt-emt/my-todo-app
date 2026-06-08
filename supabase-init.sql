-- ============================================
-- Supabase 数据库初始化脚本（精简版）
-- 只包含：用户表 + 讨论信息表
-- ============================================

-- 1. 用户表（账号、密码、头像、权限）
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(20) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(10) DEFAULT 'user',
  banned BOOLEAN DEFAULT FALSE,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 论坛帖子表
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(20) NOT NULL,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. 评论表（角色评论/帖子评论通用）
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(20) NOT NULL,
  character_id VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. 回复表（帖子的回复）
CREATE TABLE IF NOT EXISTS replies (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 插入默认数据
-- ============================================

-- 默认管理员账号（密码: admin123）
INSERT INTO users (username, password, role, banned)
VALUES (
  'admin',
  '$2b$10$1tyv7b4fYxe8amh1VzbsOuOfrusFPZFsYUWcbJZGswgv9bSx.mVvG',
  'admin',
  false
)
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- 启用 RLS 权限（让服务端可以读写）
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "users_all" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "posts_all" ON posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "comments_all" ON comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "replies_all" ON replies FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 验证：查看创建的表
-- ============================================
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
