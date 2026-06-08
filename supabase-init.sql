-- ============================================
-- Supabase 数据库初始化脚本（完整版）
-- ============================================

-- 1. 用户表
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

-- 3. 评论表
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(20) NOT NULL,
  character_id VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. 回复表
CREATE TABLE IF NOT EXISTS replies (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. 图片分类表
CREATE TABLE IF NOT EXISTS sections (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description VARCHAR(200)
);

-- 6. 图片表
CREATE TABLE IF NOT EXISTS images (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(20) NOT NULL,
  section_id INTEGER NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  description VARCHAR(200),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. 角色表
CREATE TABLE IF NOT EXISTS characters (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  name_jp VARCHAR(50),
  alias VARCHAR(50),
  image TEXT NOT NULL,
  intro TEXT NOT NULL,
  info JSONB DEFAULT '{}',
  sections JSONB DEFAULT '[]',
  trivias JSONB DEFAULT '[]'
);

-- ============================================
-- 插入默认数据
-- ============================================

-- 默认管理员
INSERT INTO users (username, password, role, banned)
VALUES (
  'admin',
  '$2b$10$1tyv7b4fYxe8amh1VzbsOuOfrusFPZFsYUWcbJZGswgv9bSx.mVvG',
  'admin',
  false
)
ON CONFLICT (username) DO NOTHING;

-- 默认分类
INSERT INTO sections (name, description) VALUES
  ('角色美图', '主要角色精美插画'),
  ('场景截图', '动画经典场景截图'),
  ('粉丝创作', '粉丝投稿的同人作品')
ON CONFLICT DO NOTHING;

-- 默认图片
INSERT INTO images (user_id, username, section_id, url, description) VALUES
  (1, 'admin', 1, '/images/emilia.jpg', '爱蜜莉雅'),
  (1, 'admin', 1, '/images/subaru.png', '菜月昴'),
  (1, 'admin', 1, '/images/rem.png', '雷姆'),
  (1, 'admin', 1, '/images/ram.png', '拉姆'),
  (1, 'admin', 1, '/images/puck.png', '帕克'),
  (1, 'admin', 1, '/images/reinhard.png', '莱茵哈鲁特')
ON CONFLICT DO NOTHING;

-- 默认角色数据
INSERT INTO characters (id, name, name_jp, alias, image, intro, info, sections, trivias) VALUES
(
  'subaru',
  '菜月昴',
  'ナツキ・スバル',
  'Subaru Natsuki',
  '/images/subaru.png',
  '动画《Re:从零开始的异世界生活》的男主角。',
  '{"年龄":"17岁","生日":"4月1日","种族":"人类","所属":"爱蜜莉雅阵营","职业":"高中生 / 骑士","武器":"鞭剑","加护":"死亡回归","声优":"小林裕介"}',
  '[]',
  '["名字取自昴宿星团","生日是愚人节","作者是长月达平"]
')
ON CONFLICT (id) DO NOTHING;

INSERT INTO characters (id, name, name_jp, alias, image, intro, info, sections, trivias) VALUES
(
  'emilia',
  '爱蜜莉雅',
  'エミリア',
  'Emilia',
  '/images/emilia.jpg',
  '动画《Re:从零开始的异世界生活》的女主角。',
  '{"年龄":"107岁（外表17岁）","生日":"9月23日","种族":"半精灵","所属":"露格尼卡王国","职业":"王选候选人","武器":"精灵魔法","契约精灵":"帕克","声优":"高桥李依"}',
  '[]',
  '["实际年龄超过107岁","银发和嫉妒魔女相似","声优是高桥李依"]
')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- RLS 权限
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "users_all" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "posts_all" ON posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "comments_all" ON comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "replies_all" ON replies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "sections_all" ON sections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "images_all" ON images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "characters_all" ON characters FOR ALL USING (true) WITH CHECK (true);

-- 验证
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
