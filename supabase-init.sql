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

-- 8. 剧情篇章表
CREATE TABLE IF NOT EXISTS arcs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_jp VARCHAR(100),
  volume_start INTEGER,
  volume_end INTEGER,
  summary TEXT NOT NULL,
  characters JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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

-- 默认剧情篇章
INSERT INTO arcs (name, name_jp, volume_start, volume_end, summary, characters) VALUES
('序章', '序章', 1, 1, '菜月昴在便利店回家的路上突然被召唤到异世界。遇到了被小混混纠缠的银发半精灵少女爱蜜莉雅，决定帮助她寻找失物。然而昴在魔女教大罪司教「猎肠者」艾尔莎的袭击中死亡，第一次体验到「死亡回归」。', '["菜月昴", "爱蜜莉雅", "帕克", "菲鲁特", "莱茵哈鲁特", "艾尔莎"]')
ON CONFLICT DO NOTHING;

INSERT INTO arcs (name, name_jp, volume_start, volume_end, summary, characters) VALUES
('王选篇', '王選編', 2, 3, '昴来到罗兹瓦尔宅邸，遇到双胞胎女仆雷姆和拉姆。经历多次死亡轮回，昴终于赢得了雷姆和拉姆的信任。随后爱蜜莉雅被召回露格尼卡王城参加王选，昴陪同前往，遇到其他王选候选人。', '["菜月昴", "爱蜜莉雅", "雷姆", "拉姆", "罗兹瓦尔", "碧翠丝", "安娜塔西亚", "库珥修", "普莉希拉", "菲鲁特"]')
ON CONFLICT DO NOTHING;

INSERT INTO arcs (name, name_jp, volume_start, volume_end, summary, characters) VALUES
('白鲸篇', '白鯨編', 4, 6, '昴与爱蜜莉雅因误会而关系破裂，陷入绝望的昴在雷姆的告白和鼓励下重新振作。决定前往梅札斯领地，与库珥修阵营联手讨伐白鲸，并对抗魔女教大罪司教「怠惰」培提尔其乌斯。', '["菜月昴", "爱蜜莉雅", "雷姆", "库珥修", "威尔海姆", "尤里乌斯", "培提尔其乌斯", "奥托"]')
ON CONFLICT DO NOTHING;

INSERT INTO arcs (name, name_jp, volume_start, volume_end, summary, characters) VALUES
('圣域篇', '聖域編', 7, 11, '昴等人前往「圣域」——罗兹瓦尔领地内的禁区，一个由强欲魔女艾姬多娜创造的特殊空间。在这里昴被迫面对嫉妒魔女的试炼，同时「大兔」袭击圣域，雷姆被「暴食」大罪司教夺走了存在。', '["菜月昴", "爱蜜莉雅", "罗兹瓦尔", "碧翠丝", "艾姬多娜", "加菲尔", "琉兹", "雷古勒斯", "莱伊"]')
ON CONFLICT DO NOTHING;

INSERT INTO arcs (name, name_jp, volume_start, volume_end, summary, characters) VALUES
('贤者之塔篇', '賢者の塔編', 12, 15, '为了拯救被「暴食」夺走的记忆和存在，昴一行人前往普利斯提拉附近的「贤者之塔」。在那里遇到「贤者」夏乌拉和「死者之书」——可以读取死者记忆的书。昴借此探索了其他世界的「IF线」可能性。', '["菜月昴", "爱蜜莉雅", "安娜塔西亚", "尤里乌斯", "梅莉", "夏乌拉", "艾姬多娜", "雷姆"]')
ON CONFLICT DO NOTHING;

INSERT INTO arcs (name, name_jp, volume_start, volume_end, summary, characters) VALUES
('帝国篇', '帝国編', 16, 18, '昴在一次死亡回归后意外被传送到了露格尼卡邻国「佛拉基亚帝国」。与爱蜜莉雅等人失散，昴在帝国中与雷姆重逢（雷姆虽然醒了但失去了记忆），卷入帝国皇位继承斗争。', '["菜月昴", "雷姆", "文森特", "阿贝尔", "普莉希拉", "梅佐蕾娅", "雅尔塔"]')
ON CONFLICT DO NOTHING;

INSERT INTO arcs (name, name_jp, volume_start, volume_end, summary, characters) VALUES
('大罪司教讨伐篇', '大罪司教討伐編', 19, 22, '昴等人回到王国，开始对抗剩余的魔女教大罪司教。面对「色欲」卡培拉、「暴食」莱伊和罗伊、「强欲」雷古勒斯等强敌。各阵营联合，展开魔女教全面讨伐战。', '["菜月昴", "爱蜜莉雅", "雷姆", "库珥修", "安娜塔西亚", "菲鲁特", "莱茵哈鲁特", "威尔海姆", "尤里乌斯"]')
ON CONFLICT DO NOTHING;

INSERT INTO arcs (name, name_jp, volume_start, volume_end, summary, characters) VALUES
('最新篇章', '最新篇章', 23, 26, '小说最新章节（截至当前），昴和同伴们面对新的威胁和挑战，继续探索异世界的秘密，以及嫉妒魔女莎缇拉的真相。', '["菜月昴", "爱蜜莉雅", "雷姆", "碧翠丝", "罗兹瓦尔", "安娜塔西亚", "库珥修", "菲鲁特", "普莉希拉"]')
ON CONFLICT DO NOTHING;

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
ALTER TABLE arcs ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "arcs_all" ON arcs FOR ALL USING (true) WITH CHECK (true);

-- 验证
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
