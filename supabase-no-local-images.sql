-- ============================================
-- Supabase 数据库初始化（无本地图片依赖版）
-- 所有图片 URL 使用在线占位图，无需本地文件
-- 在 Supabase Dashboard → SQL Editor 中执行
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

-- 9. 剧情篇章讨论表
CREATE TABLE IF NOT EXISTS arc_comments (
  id SERIAL PRIMARY KEY,
  arc_id INTEGER NOT NULL REFERENCES arcs(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 插入默认数据（无需本地图片文件）
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
('序章', '序章', 1, 1, '菜月昴在便利店回家的路上突然被召唤到异世界。遇到了被小混混纠缠的银发半精灵少女爱蜜莉雅，决定帮助她寻找失物。然而昴在魔女教大罪司教「猎肠者」艾尔莎的袭击中死亡，第一次体验到「死亡回归」。', '["菜月昴", "爱蜜莉雅", "帕克", "菲鲁特", "莱茵哈鲁特", "艾尔莎"]'),
('王选篇', '王選編', 2, 3, '昴来到罗兹瓦尔宅邸，遇到双胞胎女仆雷姆和拉姆。经历多次死亡轮回，昴终于赢得了雷姆和拉姆的信任。随后爱蜜莉雅被召回露格尼卡王城参加王选，昴陪同前往，遇到其他王选候选人。', '["菜月昴", "爱蜜莉雅", "雷姆", "拉姆", "罗兹瓦尔", "碧翠丝", "安娜塔西亚", "库珥修", "普莉希拉", "菲鲁特"]'),
('白鲸篇', '白鯨編', 4, 6, '昴与爱蜜莉雅因误会而关系破裂，陷入绝望的昴在雷姆的告白和鼓励下重新振作。决定前往梅札斯领地，与库珥修阵营联手讨伐白鲸，并对抗魔女教大罪司教「怠惰」培提尔其乌斯。', '["菜月昴", "爱蜜莉雅", "雷姆", "库珥修", "威尔海姆", "尤里乌斯", "培提尔其乌斯", "奥托"]'),
('圣域篇', '聖域編', 7, 11, '昴等人前往「圣域」——罗兹瓦尔领地内的禁区，一个由强欲魔女艾姬多娜创造的特殊空间。在这里昴被迫面对嫉妒魔女的试炼，同时「大兔」袭击圣域，雷姆被「暴食」大罪司教夺走了存在。', '["菜月昴", "爱蜜莉雅", "罗兹瓦尔", "碧翠丝", "艾姬多娜", "加菲尔", "琉兹", "雷古勒斯", "莱伊"]'),
('贤者之塔篇', '賢者の塔編', 12, 15, '为了拯救被「暴食」夺走的记忆和存在，昴一行人前往普利斯提拉附近的「贤者之塔」。在那里遇到「贤者」夏乌拉和「死者之书」——可以读取死者记忆的书。昴借此探索了其他世界的「IF线」可能性。', '["菜月昴", "爱蜜莉雅", "安娜塔西亚", "尤里乌斯", "梅莉", "夏乌拉", "艾姬多娜", "雷姆"]'),
('帝国篇', '帝国編', 16, 18, '昴在一次死亡回归后意外被传送到了露格尼卡邻国「佛拉基亚帝国」。与爱蜜莉雅等人失散，昴在帝国中与雷姆重逢（雷姆虽然醒了但失去了记忆），卷入帝国皇位继承斗争。', '["菜月昴", "雷姆", "文森特", "阿贝尔", "普莉希拉", "梅佐蕾娅", "雅尔塔"]'),
('大罪司教讨伐篇', '大罪司教討伐編', 19, 22, '昴等人回到王国，开始对抗剩余的魔女教大罪司教。面对「色欲」卡培拉、「暴食」莱伊和罗伊、「强欲」雷古勒斯等强敌。各阵营联合，展开魔女教全面讨伐战。', '["菜月昴", "爱蜜莉雅", "雷姆", "库珥修", "安娜塔西亚", "菲鲁特", "莱茵哈鲁特", "威尔海姆", "尤里乌斯"]'),
('最新篇章', '最新篇章', 23, 26, '小说最新章节（截至当前），昴和同伴们面对新的威胁和挑战，继续探索异世界的秘密，以及嫉妒魔女莎缇拉的真相。', '["菜月昴", "爱蜜莉雅", "雷姆", "碧翠丝", "罗兹瓦尔", "安娜塔西亚", "库珥修", "菲鲁特", "普莉希拉"]')
ON CONFLICT DO NOTHING;

-- 默认分类
INSERT INTO sections (name, description) VALUES
  ('角色美图', '主要角色精美插画'),
  ('场景截图', '动画经典场景截图'),
  ('粉丝创作', '粉丝投稿的同人作品')
ON CONFLICT DO NOTHING;

-- 默认图片（使用占位图，无需本地文件）
INSERT INTO images (user_id, username, section_id, url, description) VALUES
  (1, 'admin', 1, 'https://placehold.co/400x400/9b59b6/ffffff?text=Emilia', '爱蜜莉雅'),
  (1, 'admin', 1, 'https://placehold.co/400x400/e74c3c/ffffff?text=Subaru', '菜月昴'),
  (1, 'admin', 1, 'https://placehold.co/400x400/3498db/ffffff?text=Rem', '雷姆'),
  (1, 'admin', 1, 'https://placehold.co/400x400/e91e63/ffffff?text=Ram', '拉姆'),
  (1, 'admin', 1, 'https://placehold.co/400x400/00bcd4/ffffff?text=Puck', '帕克'),
  (1, 'admin', 1, 'https://placehold.co/400x400/f39c12/ffffff?text=Reinhard', '莱茵哈鲁特')
ON CONFLICT DO NOTHING;

-- 默认角色数据（图片也使用占位图 URL）
INSERT INTO characters (id, name, name_jp, alias, image, intro, info, sections, trivias) VALUES
('subaru', '菜月昴', 'ナツキ・スバル', 'Subaru Natsuki', 'https://placehold.co/400x400/e74c3c/ffffff?text=Subaru',
 '动画《Re:从零开始的异世界生活》的男主角。住在现代日本的普通高中生，在从便利店回家的路上突然被召唤到异世界。没有特殊能力，只有「死亡回归」的能力——死亡后时间会回溯到某个存档点。',
 '{"年龄":"17岁","生日":"4月1日","种族":"人类","所属":"爱蜜莉雅阵营","职业":"高中生 / 骑士","武器":"鞭剑","加护":"死亡回归","声优":"小林裕介"}',
 '[]',
 '["名字「昴（Subaru）」取自昴宿星团（Pleiades）","生日4月1日是愚人节","作者长月达平曾表示昴是全书最难写的角色","昴是作品中死亡次数最多的角色","动画中昴竖大拇指被称为「昴pose」"]'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO characters (id, name, name_jp, alias, image, intro, info, sections, trivias) VALUES
('emilia', '爱蜜莉雅', 'エミリア', 'Emilia', 'https://placehold.co/400x400/9b59b6/ffffff?text=Emilia',
 '动画《Re:从零开始的异世界生活》的女主角。银发半精灵少女，外貌酷似传说中的嫉妒魔女莎缇拉，因此受到人们的歧视和恐惧。',
 '{"年龄":"107岁（外表约17岁）","生日":"9月23日","种族":"半精灵","所属":"露格尼卡王国 / 王选候选人","职业":"王选候选人","武器":"精灵魔法（冰系）","契约精灵":"帕克","声优":"高桥李依"}',
 '[]',
 '["虽然外表17岁，实际年龄已超过107岁","银发和紫瞳与嫉妒魔女莎缇拉几乎一样","声优高桥李依表示配音时「压力山大」","标志性台词「EMT」是昴发明的","在粉丝投票中人气一度被雷姆超越"]'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO characters (id, name, name_jp, alias, image, intro, info, sections, trivias) VALUES
('rem', '雷姆', 'レム', 'Rem', 'https://placehold.co/400x400/3498db/ffffff?text=Rem',
 '罗兹瓦尔宅邸的女仆，拉姆的妹妹。蓝发蓝眼的鬼族少女，拥有鬼族强大的战斗力。在昴经历多次死亡后，逐渐被昴的坚强和温柔打动，深爱着昴。',
 '{"年龄":"17岁","生日":"2月2日","种族":"鬼族","所属":"罗兹瓦尔宅邸","职业":"女仆","武器":"流星锤","加护":"鬼族之力（可展开角）","声优":"水濑祈"}',
 '[]',
 '["雷姆和拉姆的生日2月2日是日本的「双子之日」","2016年动画播出后「雷姆蓝」成为流行文化现象","声优水濑祈和村川梨衣（拉姆）现实中是好友","雷姆在原作WEB版戏份比文库版更多","雷姆的告白场景在NHK「日本动画100」中被选为经典"]'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO characters (id, name, name_jp, alias, image, intro, info, sections, trivias) VALUES
('ram', '拉姆', 'ラム', 'Ram', 'https://placehold.co/400x400/e91e63/ffffff?text=Ram',
 '罗兹瓦尔宅邸的女仆，雷姆的姐姐。粉发粉眼的鬼族少女，曾经拥有强大的力量，但在保护妹妹雷姆时失去了角和大部分力量。',
 '{"年龄":"17岁","生日":"2月2日","种族":"鬼族","所属":"罗兹瓦尔宅邸","职业":"女仆","武器":"风魔法","加护":"共感（与雷姆共享感官）","声优":"村川梨衣"}',
 '[]',
 '["拉姆在失去角之前被称为「鬼族的天才」","粉发与雷姆的蓝发形成互补","即使失去角，观察力仍是作品中最敏锐的角色之一","对罗兹瓦尔有近乎盲目的忠诚","声优村川梨衣表示毒舌台词念起来很爽快"]'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO characters (id, name, name_jp, alias, image, intro, info, sections, trivias) VALUES
('puck', '帕克', 'パック', 'Puck', 'https://placehold.co/400x400/00bcd4/ffffff?text=Puck',
 '爱蜜莉雅缔结契约的精灵，被称为「永久冻土的终焉之兽」。平时以可爱的猫型精灵形态出现，与爱蜜莉雅关系亲密如父女。',
 '{"年龄":"400年以上","种族":"人工精灵（大精灵）","所属":"爱蜜莉雅","职业":"契约精灵","真名":"永久冻土的终焉之兽（Beast of the End）","属性":"冰系","声优":"内山夕实"}',
 '[]',
 '["真名「永久冻土的终焉之兽」暗示拥有毁灭世界的力量","每天特定时间陷入沉睡是契约限制","平时猫型形态与《魔法少女小圆》丘比有些相似","声优内山夕实也曾配音《史莱姆》利姆鲁","粉丝中帕克有时被称为「岳父」"]'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO characters (id, name, name_jp, alias, image, intro, info, sections, trivias) VALUES
('reinhard', '莱茵哈鲁特·范·阿斯特雷亚', 'ラインハルト・ヴァン・アストレア', 'Reinhard van Astrea', 'https://placehold.co/400x400/f39c12/ffffff?text=Reinhard',
 '王国骑士团所属的近卫骑士，被称为「剑圣」。拥有剑圣的加护，是当代最强的剑士。出身于剑圣世家阿斯特雷亚家，继承了代代相传的龙剑雷德。',
 '{"年龄":"19岁","生日":"1月1日","种族":"人类","所属":"露格尼卡王国骑士团","职业":"近卫骑士 / 剑圣","武器":"龙剑雷德（龙剣レイド）","加护":"剑圣加护（历代最强）","声优":"中村悠一"}',
 '[]',
 '["被公认为作品中的战力天花板","名字Reinhard源自德语，意为「勇敢的顾问」","龙剑雷德通常不会出鞘，因为很少有对手值得它出鞘","拥有多种加护，包括「初见的加护」「再临的加护」等","声优中村悠一曾在《咒术回战》中配音五条悟"]'
) ON CONFLICT (id) DO NOTHING;

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
ALTER TABLE arcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE arc_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "users_all" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "posts_all" ON posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "comments_all" ON comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "replies_all" ON replies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "sections_all" ON sections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "images_all" ON images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "characters_all" ON characters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "arcs_all" ON arcs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "arc_comments_all" ON arc_comments FOR ALL USING (true) WITH CHECK (true);

-- 验证
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'posts', COUNT(*) FROM posts
UNION ALL SELECT 'comments', COUNT(*) FROM comments
UNION ALL SELECT 'replies', COUNT(*) FROM replies
UNION ALL SELECT 'sections', COUNT(*) FROM sections
UNION ALL SELECT 'images', COUNT(*) FROM images
UNION ALL SELECT 'characters', COUNT(*) FROM characters
UNION ALL SELECT 'arcs', COUNT(*) FROM arcs
UNION ALL SELECT 'arc_comments', COUNT(*) FROM arc_comments;
