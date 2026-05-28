-- 在 Supabase Dashboard 的 SQL Editor 中执行以下语句

-- 创建 todos 表
CREATE TABLE IF NOT EXISTS todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 Row Level Security (推荐)
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 创建允许所有操作的策略（开发阶段用，生产环境请根据需求调整）
CREATE POLICY "Allow all" ON todos
  FOR ALL
  USING (true)
  WITH CHECK (true);
