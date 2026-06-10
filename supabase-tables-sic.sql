-- ============================================
-- Supabase 数据库代码：sections / images / characters
-- 在 Supabase Dashboard → SQL Editor 中执行
-- ============================================

-- 1. 图片分类表
CREATE TABLE IF NOT EXISTS sections (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description VARCHAR(200)
);

-- 2. 图片表
CREATE TABLE IF NOT EXISTS images (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(20) NOT NULL,
  section_id INTEGER NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  description VARCHAR(200),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. 角色表
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
-- 索引优化
-- ============================================
CREATE INDEX IF NOT EXISTS idx_images_section_id ON images(section_id);
CREATE INDEX IF NOT EXISTS idx_images_user_id ON images(user_id);

-- ============================================
-- 插入默认数据
-- ============================================

-- 默认分类
INSERT INTO sections (name, description) VALUES
  ('角色美图', '主要角色精美插画'),
  ('场景截图', '动画经典场景截图'),
  ('粉丝创作', '粉丝投稿的同人作品')
ON CONFLICT DO NOTHING;

-- 默认图片（需确保 users 表中有 id=1 的管理员）
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
  '动画《Re:从零开始的异世界生活》的男主角。住在现代日本的普通高中生，在从便利店回家的路上突然被召唤到异世界。没有特殊能力，只有「死亡回归」的能力——死亡后时间会回溯到某个存档点。',
  '{"年龄":"17岁","生日":"4月1日","种族":"人类","所属":"爱蜜莉雅阵营","职业":"高中生 / 骑士","武器":"鞭剑","加护":"死亡回归","声优":"小林裕介"}'::jsonb,
  '[]'::jsonb,
  '["名字「昴（Subaru）」取自昴宿星团（Pleiades）","生日4月1日是愚人节","作者长月达平曾表示昴是全书最难写的角色","昴是作品中死亡次数最多的角色","动画中昴竖大拇指被称为「昴pose」"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO characters (id, name, name_jp, alias, image, intro, info, sections, trivias) VALUES
(
  'emilia',
  '爱蜜莉雅',
  'エミリア',
  'Emilia',
  '/images/emilia.jpg',
  '动画《Re:从零开始的异世界生活》的女主角。银发半精灵少女，外貌酷似传说中的嫉妒魔女莎缇拉，因此受到人们的歧视和恐惧。',
  '{"年龄":"107岁（外表约17岁）","生日":"9月23日","种族":"半精灵","所属":"露格尼卡王国 / 王选候选人","职业":"王选候选人","武器":"精灵魔法（冰系）","契约精灵":"帕克","声优":"高桥李依"}'::jsonb,
  '[]'::jsonb,
  '["虽然外表17岁，实际年龄已超过107岁","银发和紫瞳与嫉妒魔女莎缇拉几乎一样","声优高桥李依表示配音时「压力山大」","标志性台词「EMT」是昴发明的","在粉丝投票中人气一度被雷姆超越"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO characters (id, name, name_jp, alias, image, intro, info, sections, trivias) VALUES
(
  'rem',
  '雷姆',
  'レム',
  'Rem',
  '/images/rem.png',
  '罗兹瓦尔宅邸的女仆，拉姆的妹妹。蓝发蓝眼的鬼族少女，拥有鬼族强大的战斗力。在昴经历多次死亡后，逐渐被昴的坚强和温柔打动，深爱着昴。',
  '{"年龄":"17岁","生日":"2月2日","种族":"鬼族","所属":"罗兹瓦尔宅邸","职业":"女仆","武器":"流星锤","加护":"鬼族之力（可展开角）","声优":"水濑祈"}'::jsonb,
  '[]'::jsonb,
  '["雷姆和拉姆的生日2月2日是日本的「双子之日」","2016年动画播出后「雷姆蓝」成为流行文化现象","声优水濑祈和村川梨衣（拉姆）现实中是好友","雷姆在原作WEB版戏份比文库版更多","雷姆的告白场景在NHK「日本动画100」中被选为经典"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO characters (id, name, name_jp, alias, image, intro, info, sections, trivias) VALUES
(
  'ram',
  '拉姆',
  'ラム',
  'Ram',
  '/images/ram.png',
  '罗兹瓦尔宅邸的女仆，雷姆的姐姐。粉发粉眼的鬼族少女，曾经拥有强大的力量，但在保护妹妹雷姆时失去了角和大部分力量。',
  '{"年龄":"17岁","生日":"2月2日","种族":"鬼族","所属":"罗兹瓦尔宅邸","职业":"女仆","武器":"风魔法","加护":"共感（与雷姆共享感官）","声优":"村川梨衣"}'::jsonb,
  '[]'::jsonb,
  '["拉姆在失去角之前被称为「鬼族的天才」","粉发与雷姆的蓝发形成互补","即使失去角，观察力仍是作品中最敏锐的角色之一","对罗兹瓦尔有近乎盲目的忠诚","声优村川梨衣表示毒舌台词念起来很爽快"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO characters (id, name, name_jp, alias, image, intro, info, sections, trivias) VALUES
(
  'puck',
  '帕克',
  'パック',
  'Puck',
  '/images/puck.png',
  '爱蜜莉雅缔结契约的精灵，被称为「永久冻土的终焉之兽」。平时以可爱的猫型精灵形态出现，与爱蜜莉雅关系亲密如父女。',
  '{"年龄":"400年以上","种族":"人工精灵（大精灵）","所属":"爱蜜莉雅","职业":"契约精灵","真名":"永久冻土的终焉之兽（Beast of the End）","属性":"冰系","声优":"内山夕实"}'::jsonb,
  '[]'::jsonb,
  '["真名「永久冻土的终焉之兽」暗示拥有毁灭世界的力量","每天特定时间陷入沉睡是契约限制","平时猫型形态与《魔法少女小圆》丘比有些相似","声优内山夕实也曾配音《史莱姆》利姆鲁","粉丝中帕克有时被称为「岳父」"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO characters (id, name, name_jp, alias, image, intro, info, sections, trivias) VALUES
(
  'reinhard',
  '莱茵哈鲁特·范·阿斯特雷亚',
  'ラインハルト・ヴァン・アストレア',
  'Reinhard van Astrea',
  '/images/reinhard.png',
  '王国骑士团所属的近卫骑士，被称为「剑圣」。拥有剑圣的加护，是当代最强的剑士。出身于剑圣世家阿斯特雷亚家，继承了代代相传的龙剑雷德。',
  '{"年龄":"19岁","生日":"1月1日","种族":"人类","所属":"露格尼卡王国骑士团","职业":"近卫骑士 / 剑圣","武器":"龙剑雷德（龙剣レイド）","加护":"剑圣加护（历代最强）","声优":"中村悠一"}'::jsonb,
  '[]'::jsonb,
  '["被公认为作品中的战力天花板","名字Reinhard源自德语，意为「勇敢的顾问」","龙剑雷德通常不会出鞘，因为很少有对手值得它出鞘","拥有多种加护，包括「初见的加护」「再临的加护」等","声优中村悠一曾在《咒术回战》中配音五条悟"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- RLS 权限（如需公开读取，请保留这些策略）
-- ============================================
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "sections_all" ON sections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "images_all" ON images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "characters_all" ON characters FOR ALL USING (true) WITH CHECK (true);

-- 验证
SELECT 'sections' as table_name, COUNT(*) as count FROM sections
UNION ALL
SELECT 'images', COUNT(*) FROM images
UNION ALL
SELECT 'characters', COUNT(*) FROM characters;
