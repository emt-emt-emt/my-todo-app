import { z } from "zod";
import { supabase, isSupabase } from "@/lib/supabase";

async function initSupabase() {
  if (!isSupabase()) return;
  // 检查 users 表是否存在
  const { data, error } = await supabase!
    .from("users")
    .select("id")
    .limit(1);
  if (error && error.message.includes("does not exist")) {
    throw new Error(
      "Supabase 表未创建。请在 Supabase Dashboard → SQL Editor 中执行 supabase-init.sql 文件中的内容，然后重新部署。"
    );
  }
}

// ========== Postgres 支持 ==========
let sql: any = null;
let pgReady = false;

async function getSql() {
  if (!sql && process.env.POSTGRES_URL) {
    const { sql: sqlFn } = await import("@vercel/postgres");
    sql = sqlFn;
  }
  return sql;
}

async function initPg() {
  if (pgReady || !process.env.POSTGRES_URL) return;

  const s = await getSql();
  if (!s) throw new Error("Failed to load Postgres");

  await s`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(10) DEFAULT 'user',
    banned BOOLEAN DEFAULT FALSE,
    avatar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;

  await s`CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    username VARCHAR(20) NOT NULL,
    character_id VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;

  await s`CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    username VARCHAR(20) NOT NULL,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;

  await s`CREATE TABLE IF NOT EXISTS replies (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    username VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;

  await s`CREATE TABLE IF NOT EXISTS images (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    username VARCHAR(20) NOT NULL,
    section_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    description VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;

  await s`CREATE TABLE IF NOT EXISTS sections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(200)
  )`;

  await s`CREATE TABLE IF NOT EXISTS characters (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    name_jp VARCHAR(50),
    alias VARCHAR(50),
    image TEXT NOT NULL,
    intro TEXT NOT NULL,
    info JSONB DEFAULT '{}',
    sections JSONB DEFAULT '[]',
    trivias JSONB DEFAULT '[]'
  )`;

  await s`CREATE TABLE IF NOT EXISTS arcs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_jp VARCHAR(100),
    volume_start INTEGER,
    volume_end INTEGER,
    summary TEXT NOT NULL,
    characters JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;

  // 检查是否需要插入默认数据
  const { rows } = await s`SELECT COUNT(*) as count FROM users`;
  if (Number(rows[0].count) === 0) {
    const bcrypt = await import("bcryptjs");
    const adminHash = bcrypt.hashSync("admin123", 10);

    await s`INSERT INTO users (username, password, role, banned) VALUES ('admin', ${adminHash}, 'admin', false)`;

    await s`INSERT INTO sections (name, description) VALUES
      ('角色美图', '主要角色精美插画'),
      ('场景截图', '动画经典场景截图'),
      ('粉丝创作', '粉丝投稿的同人作品')`;

    await s`INSERT INTO images (user_id, username, section_id, url, description) VALUES
      (1, 'admin', 1, '/images/emilia.jpg', '爱蜜莉雅'),
      (1, 'admin', 1, '/images/subaru.png', '菜月昴'),
      (1, 'admin', 1, '/images/rem.png', '雷姆'),
      (1, 'admin', 1, '/images/ram.png', '拉姆'),
      (1, 'admin', 1, '/images/puck.png', '帕克'),
      (1, 'admin', 1, '/images/reinhard.png', '莱茵哈鲁特')`;
  }

  pgReady = true;
}

function isPg() {
  return !!process.env.POSTGRES_URL;
}

// ========== 内存存储 ==========
let memoryUsers: User[] = [];
let memoryComments: Comment[] = [];
let memoryPosts: Post[] = [];
let memoryReplies: Reply[] = [];
let memoryImages: Image[] = [];
let memorySections: ImageSection[] = [];
let memoryIdCounters = { user: 1, comment: 0, post: 0, reply: 0, image: 6, section: 3 };
let memoryCharacters: Character[] = [];

function initMemory() {
  if (memoryUsers.length > 0) return;

  memoryUsers = [
    {
      id: 1,
      username: "admin",
      password: "$2b$10$1tyv7b4fYxe8amh1VzbsOuOfrusFPZFsYUWcbJZGswgv9bSx.mVvG",
      role: "admin",
      banned: false,
      avatar: undefined,
      createdAt: new Date().toISOString(),
    },
  ];

  memorySections = [
    { id: 1, name: "角色美图", description: "主要角色精美插画" },
    { id: 2, name: "场景截图", description: "动画经典场景截图" },
    { id: 3, name: "粉丝创作", description: "粉丝投稿的同人作品" },
  ];

  memoryImages = [
    { id: 1, userId: 1, username: "admin", sectionId: 1, url: "/images/emilia.jpg", description: "爱蜜莉雅", createdAt: new Date().toISOString() },
    { id: 2, userId: 1, username: "admin", sectionId: 1, url: "/images/subaru.png", description: "菜月昴", createdAt: new Date().toISOString() },
    { id: 3, userId: 1, username: "admin", sectionId: 1, url: "/images/rem.png", description: "雷姆", createdAt: new Date().toISOString() },
    { id: 4, userId: 1, username: "admin", sectionId: 1, url: "/images/ram.png", description: "拉姆", createdAt: new Date().toISOString() },
    { id: 5, userId: 1, username: "admin", sectionId: 1, url: "/images/puck.png", description: "帕克", createdAt: new Date().toISOString() },
    { id: 6, userId: 1, username: "admin", sectionId: 1, url: "/images/reinhard.png", description: "莱茵哈鲁特", createdAt: new Date().toISOString() },
  ];

  memoryCharacters = [
    {
      id: "subaru",
      name: "菜月昴",
      nameJp: "ナツキ・スバル",
      alias: "Subaru Natsuki",
      image: "/images/subaru.png",
      intro: "动画《Re:从零开始的异世界生活》的男主角。住在现代日本的普通高中生，在从便利店回家的路上突然被召唤到异世界。没有特殊能力，只有「死亡回归」的能力——死亡后时间会回溯到某个存档点。",
      info: {
        年龄: "17岁",
        生日: "4月1日",
        种族: "人类",
        所属: "爱蜜莉雅阵营",
        职业: "高中生 / 骑士（自称）",
        武器: "鞭剑（后期获得）",
        加护: "死亡回归（嫉妒魔女给予的权能）",
        声优: "小林裕介",
      },
      sections: [
        { title: "角色介绍", content: "菜月昴是《Re:从零开始的异世界生活》的主人公。在便利店购物后回家的路上，突然被召唤到了异世界。在异世界中，他遇到了被小混混纠缠的银发半精灵少女爱蜜莉雅，并决定帮助她。然而，昴发现自己没有任何战斗能力或魔法天赋，只有一项被称为「死亡回归」的特殊能力——每次死亡后，时间都会回溯到某个固定的「存档点」。\n\n性格上，昴表面上非常乐观、话多、有点轻浮和中二，经常自称「爱蜜莉雅骑士」并竖起大拇指。但在内心深处，他其实非常脆弱和自卑。随着故事的发展，他经历了无数次痛苦的死亡，每一次都是真实的死亡体验，这些经历让他逐渐坚强起来，但同时也给他带来了严重的心理创伤。" },
        { title: "死亡回归", content: "「死亡回归」是嫉妒魔女莎缇拉赋予昴的特殊能力。当昴死亡后，时间会自动回溯到某个特定的「存档点」，这个存档点通常设置在故事的关键节点。每次死亡回归后，只有昴自己保留记忆，其他人都会回到之前的状态。\n\n这个能力给昴带来了极大的心理负担，因为每次死亡都是真实的痛苦体验，而且他无法向任何人倾诉自己的经历。在一次次轮回中，昴利用记忆优势积累情报、改变选择，试图找到拯救所有人的完美路线。" },
        { title: "人际关系", content: "爱蜜莉雅：昴深爱的对象，是他来到异世界后第一个帮助的人。昴愿意为她无数次死亡和重生。\n\n雷姆：罗兹瓦尔宅邸的女仆，在昴经历多次死亡后成为最理解和支持他的人。\n\n拉姆：雷姆的双胞胎姐姐，与雷姆一起在罗兹瓦尔宅邸工作。\n\n帕克：爱蜜莉雅的契约精灵，平时以猫型精灵形态出现。\n\n莱茵哈鲁特：王国最强骑士，昴的朋友。在昴刚来到异世界时曾帮助他。" },
      ],
      trivias: [
        "名字「昴（Subaru）」取自昴宿星团（Pleiades），即著名的七姐妹星团。",
        "生日4月1日是愚人节，与角色在剧中不断遭遇悲剧的设定形成了讽刺性的对比。",
        "作者长月达平曾在访谈中表示，昴是全书最难写的角色，因为他的心理状态极其复杂微妙。",
        "昴是作品中死亡次数最多的角色，截至小说最新卷已死亡超过数十次。",
        "动画中昴竖大拇指的经典动作，被称为「昴pose」，在漫展上经常被coser模仿。",
      ],
    },
    {
      id: "emilia",
      name: "爱蜜莉雅",
      nameJp: "エミリア",
      alias: "Emilia",
      image: "/images/emilia.jpg",
      intro: "动画《Re:从零开始的异世界生活》的女主角。银发半精灵少女，外貌酷似传说中的嫉妒魔女莎缇拉，因此受到人们的歧视和恐惧。",
      info: {
        年龄: "107岁（外表约17岁）",
        生日: "9月23日",
        种族: "半精灵",
        所属: "露格尼卡王国 / 王选候选人",
        职业: "王选候选人",
        武器: "精灵魔法（冰系）",
        契约精灵: "帕克",
        声优: "高桥李依",
      },
      sections: [
        { title: "角色介绍", content: "爱蜜莉雅是《Re:从零开始的异世界生活》的女主角。她是银发紫瞳的半精灵少女，拥有银白色的长发和标志性的白色玫瑰发饰。由于外貌与传说中的嫉妒魔女莎缇拉极其相似，她长期受到人们的歧视和恐惧。\n\n性格善良温柔、内心坚强，虽然因外貌被排斥，但她从未怨恨过他人，而是努力与人们建立联系。她带着精灵帕克在森林中独自生活，不与人交往。在王选中被推举为候选人，希望建立一个平等对待所有人的王国。" },
        { title: "王选", content: "在露格尼卡王国的王选（国王选举）中，爱蜜莉雅被推举为五位候选人之一。她希望在王国中建立一个不再有歧视、所有人都能平等生活的世界。然而，由于她与嫉妒魔女相似的外貌，她面临着来自其他候选人和民众的偏见与敌视。\n\n在王选的过程中，菜月昴成为了她的坚定支持者，愿意为她面对无数次死亡和绝望。" },
        { title: "人际关系", content: "菜月昴：对爱蜜莉雅来说，昴是第一个不求回报地帮助她、接受她真实面貌的人。昴是她在异世界中遇到的第一个朋友，也是她最重要的人。\n\n帕克：爱蜜莉雅缔结契约的精灵，两人关系亲密如父女。帕克以保护爱蜜莉雅为最高使命。\n\n罗兹瓦尔：宅邸的主人，表面上支持爱蜜莉雅参加王选，但似乎有着自己的目的。" },
      ],
      trivias: [
        "虽然外表看起来是17岁的少女，但爱蜜莉雅的实际年龄已超过107岁，这是半精灵种族长寿特性的体现。",
        "她的银发和紫瞳与嫉妒魔女莎缇拉几乎一模一样，这也是她被歧视的根本原因。",
        "声优高桥李依曾在采访中表示，爱蜜莉雅太过纯洁无瑕，配音时「压力山大」。",
        "爱蜜莉雅的标志性台词「EMT」是昴发明的，意思是「爱蜜莉雅真是天使（Emilia Maji Tenshi）」。",
        "在粉丝投票中，爱蜜莉雅的人气一度被雷姆超越，但随着剧情发展逐渐回升。",
      ],
    },
    {
      id: "rem",
      name: "雷姆",
      nameJp: "レム",
      alias: "Rem",
      image: "/images/rem.png",
      intro: "罗兹瓦尔宅邸的女仆，拉姆的妹妹。蓝发蓝眼的鬼族少女，拥有鬼族强大的战斗力。在昴经历多次死亡后，逐渐被昴的坚强和温柔打动，深爱着昴。",
      info: {
        年龄: "17岁",
        生日: "2月2日",
        种族: "鬼族",
        所属: "罗兹瓦尔宅邸",
        职业: "女仆",
        武器: "流星锤",
        加护: "鬼族之力（可展开角）",
        声优: "水濑祈",
      },
      sections: [
        { title: "角色介绍", content: "雷姆是《Re:从零开始的异世界生活》中人气极高的角色。她是罗兹瓦尔宅邸的女仆，与双胞胎姐姐拉姆一同工作。蓝发蓝眼的鬼族少女，额头上平时隐藏着一只角，展开后可以获得强大的战斗力。\n\n由于小时候姐姐为了保护她而失去力量，雷姆对姐姐怀有深深的愧疚和感激。初期对昴态度冷淡甚至敌对，但在昴经历多次死亡轮回后，她逐渐被昴的坚强和温柔所打动，最终深爱上了昴。她愿意为了昴做任何事，甚至牺牲自己的生命。" },
        { title: "名场面", content: "「雷姆的告白」是动画史上最经典的场景之一。在昴陷入绝望、想要放弃一切时，雷姆坚定地陪伴在他身边，说出了感人至深的告白：「昴无论多么痛苦、多么艰难，就算快放弃了，就算没人相信你了，我也会相信你。因为你是拯救了我的人，是我英雄。\n\n这段告白不仅拯救了昴的心灵，也让雷姆成为了动漫界最具人气的角色之一。「雷姆蓝」一度成为流行文化符号。" },
        { title: "人际关系", content: "菜月昴：雷姆深爱的人。在昴最绝望的时刻给予了他最大的支持和鼓励。\n\n拉姆：雷姆的双胞胎姐姐，雷姆对她怀有深深的愧疚和敬仰。\n\n罗兹瓦尔：宅邸的主人，雷姆和拉姆的主人。\n\n爱蜜莉雅：宅邸的客人，雷姆尊重但初期对其态度冷淡。" },
      ],
      trivias: [
        "雷姆和拉姆的生日2月2日是日本的「双子之日」，这是作者有意设定的。",
        "2016年动画播出后，「雷姆蓝」一度成为日本流行文化现象，许多商品都推出了蓝色限定版。",
        "声优水濑祈（雷姆）和村川梨衣（拉姆）在现实中也是关系很好的朋友，经常在广播节目中互动。",
        "雷姆在原作小说WEB版中的戏份比文库版更多，后期剧情中她有相当长一段时间处于沉睡状态。",
        "雷姆的告白场景在NHK「日本动画100」评选中被选为经典动画场景之一。",
      ],
    },
    {
      id: "ram",
      name: "拉姆",
      nameJp: "ラム",
      alias: "Ram",
      image: "/images/ram.png",
      intro: "罗兹瓦尔宅邸的女仆，雷姆的姐姐。粉发粉眼的鬼族少女，曾经拥有强大的力量，但在保护妹妹雷姆时失去了角和大部分力量。",
      info: {
        年龄: "17岁",
        生日: "2月2日",
        种族: "鬼族",
        所属: "罗兹瓦尔宅邸",
        职业: "女仆",
        武器: "风魔法",
        加护: "共感（与雷姆共享感官）",
        声优: "村川梨衣",
      },
      sections: [
        { title: "角色介绍", content: "拉姆是罗兹瓦尔宅邸的女仆，雷姆的双胞胎姐姐。粉发粉眼的鬼族少女，性格傲娇毒舌，说话毫不留情。在鬼族中，她曾是被誉为天才的存在，拥有极其强大的力量。\n\n然而在魔女教袭击鬼族村庄时，为了保护妹妹雷姆，她失去了自己的角和大部分力量。失去力量后，她凭借丰富的经验和敏锐的观察力继续辅助罗兹瓦尔，并与妹妹一起在宅邸工作。虽然嘴巴很毒，但内心深处非常关心雷姆和昴。" },
        { title: "能力", content: "失去角之前的拉姆曾是鬼族中的天才，拥有强大的力量。失去角后，虽然大部分力量丧失，但她仍然可以运用风魔法和精准的判断力辅助战斗。\n\n此外，她与妹妹雷姆拥有「共感」能力，可以共享感官，这在战斗中是非常有利的情报优势。" },
        { title: "人际关系", content: "雷姆：拉姆的双胞胎妹妹，拉姆愿意为她牺牲一切。\n\n罗兹瓦尔：宅邸的主人，拉姆对他绝对忠诚。\n\n菜月昴：拉姆虽然经常毒舌讽刺昴，但内心认可并关心他。" },
      ],
      trivias: [
        "拉姆在失去角之前被称为「鬼族的天才」，其力量远超妹妹雷姆。",
        "她的粉发与雷姆的蓝发形成互补，两人的发色设计是姐妹对称的。",
        "即使失去了角，拉姆仍然是作品中观察力最敏锐的角色之一，经常能看穿昴的心理状态。",
        "拉姆对罗兹瓦尔有着近乎盲目的忠诚，但背后似乎有着更深层的原因。",
        "声优村川梨衣曾在广播节目中表示，拉姆的毒舌台词念起来非常爽快。",
      ],
    },
    {
      id: "puck",
      name: "帕克",
      nameJp: "パック",
      alias: "Puck",
      image: "/images/puck.png",
      intro: "爱蜜莉雅缔结契约的精灵，被称为「永久冻土的终焉之兽」。平时以可爱的猫型精灵形态出现，与爱蜜莉雅关系亲密如父女。",
      info: {
        年龄: "400年以上",
        种族: "人工精灵（大精灵）",
        所属: "爱蜜莉雅",
        职业: "契约精灵",
        真名: "永久冻土的终焉之兽（Beast of the End）",
        属性: "冰系",
        声优: "内山夕实",
      },
      sections: [
        { title: "角色介绍", content: "帕克是爱蜜莉雅缔结契约的精灵，平时以可爱的猫型精灵形态出现，看起来就像一只小猫咪。他与爱蜜莉雅关系亲密如父女，自称「莉雅的爸爸」，非常疼爱爱蜜莉雅。\n\n然而，他的真实身份是被称为「永久冻土的终焉之兽」的大精灵，拥有极其强大的冰之力量。在真实形态下，他是巨大而强大的冰之兽，据说拥有毁灭世界的力量。他以控制爱蜜莉雅的魔力为条件维持契约，每天会在特定时间陷入沉睡。" },
        { title: "能力", content: "帕克作为大精灵，拥有极其强大的冰之魔法。他可以使用多种冰系魔法，包括制造冰壁、冻结敌人、控制温度等。\n\n在真实形态下，他的力量更是惊人，被认为是世界上最强的存在之一。然而，他平时并不轻易展现真实形态，只有在爱蜜莉雅遭遇危险时才会动用全力。" },
        { title: "人际关系", content: "爱蜜莉雅：帕克最重要的人，他把爱蜜莉雅当作女儿一样疼爱，以保护她为自己存在的最高使命。\n\n菜月昴：帕克认可昴对爱蜜莉雅的感情，但也会警告昴不要伤害爱蜜莉雅。\n\n罗兹瓦尔：帕克与罗兹瓦尔之间似乎有着某种微妙的关系。" },
      ],
      trivias: [
        "帕克的真名「永久冻土的终焉之兽（Beast of the End）」暗示了他拥有毁灭世界的力量。",
        "每天特定时间陷入沉睡是契约的限制条件，这个时间点也是爱蜜莉雅最脆弱的时候。",
        "帕克平时以猫型精灵形态出现，这个设计与《魔法少女小圆》中的丘比有些相似，但性格完全不同。",
        "帕克的声优内山夕实也曾配音《关于我转生变成史莱姆这档事》中的利姆鲁。",
        "在粉丝中，帕克有时被称为「岳父」，因为他自称是爱蜜莉雅的爸爸。",
      ],
    },
    {
      id: "reinhard",
      name: "莱茵哈鲁特·范·阿斯特雷亚",
      nameJp: "ラインハルト・ヴァン・アストレア",
      alias: "Reinhard van Astrea",
      image: "/images/reinhard.png",
      intro: "王国骑士团所属的近卫骑士，被称为「剑圣」。拥有剑圣的加护，是当代最强的剑士。出身于剑圣世家阿斯特雷亚家，继承了代代相传的龙剑雷德。",
      info: {
        年龄: "19岁",
        生日: "1月1日",
        种族: "人类",
        所属: "露格尼卡王国骑士团",
        职业: "近卫骑士 / 剑圣",
        武器: "龙剑雷德（龙剣レイド）",
        加护: "剑圣加护（历代最强）",
        声优: "中村悠一",
      },
      sections: [
        { title: "角色介绍", content: "莱茵哈鲁特·范·阿斯特雷亚是《Re:从零开始的异世界生活》中战力天花板的角色。他是王国骑士团所属的近卫骑士，被称为「剑圣」，是当代最强的剑士。出身于剑圣世家阿斯特雷亚家，继承了代代相传的龙剑雷德。\n\n尽管拥有压倒性的实力，莱茵哈鲁特从不傲慢，对所有人都保持谦逊和友善的态度。他性格正直善良，正义感极强，深受王国民众的爱戴。在王选中，他支持菲鲁特成为国王候选人，并与菲鲁特建立了亲密的关系。" },
        { title: "能力", content: "莱茵哈鲁特拥有「剑圣」的加护，这是阿斯特雷亚家代代相传的至高加护。除了剑圣加护外，他还能获得多种其他加护，使他几乎无所不能。\n\n他持有的龙剑雷德是传说中的武器，据说只有面对「足以切开世界」的对手时才会出鞘。在一般情况下，他甚至不需要拔出龙剑就能战胜绝大多数敌人。\n\n在作品中，莱茵哈鲁特被公认为「世界最强」的存在，即使是魔女教的大罪司教也对他畏惧三分。" },
        { title: "人际关系", content: "菲鲁特：莱茵哈鲁特在王选中的支持对象，一位来自贫民窟的少女。莱茵哈鲁特对她非常关心，两人关系亲密。\n\n菜月昴：莱茵哈鲁特是昴在异世界遇到的第一个人之一，曾帮助过昴。两人是朋友关系。\n\n威尔海姆：前代剑圣，莱茵哈鲁特的祖父。\n\n特蕾西亚：前代剑圣，莱茵哈鲁特的祖母。" },
      ],
      trivias: [
        "莱茵哈鲁特被公认为作品中的战力天花板，作者长月达平曾坦言他「太强了，安排剧情很头疼」。",
        "他的名字Reinhard源自德语，意为「勇敢的顾问」；姓氏Astrea源自希腊神话中的正义女神阿斯特蕾亚。",
        "龙剑雷德通常不会出鞘，因为很少有对手值得它出鞘。目前能让龙剑出鞘的对手屈指可数。",
        "莱茵哈鲁特拥有多种加护，包括「初见的加护」「再临的加护」「辨药的加护」等，几乎无所不能。",
        "声优中村悠一曾在《咒术回战》中配音五条悟，两位都是「最强」角色，粉丝常将两者比较。",
      ],
    },
  ];
}

// ========== 接口 ==========
export interface User {
  id: number;
  username: string;
  password: string;
  role: "admin" | "user";
  banned: boolean;
  createdAt: string;
  avatar?: string;
}
export interface Comment {
  id: number;
  userId: number;
  username: string;
  characterId: string;
  content: string;
  createdAt: string;
}
export interface Post {
  id: number;
  userId: number;
  username: string;
  title: string;
  content: string;
  createdAt: string;
}
export interface Reply {
  id: number;
  postId: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
}
export interface ImageSection {
  id: number;
  name: string;
  description: string;
}
export interface Image {
  id: number;
  userId: number;
  username: string;
  sectionId: number;
  url: string;
  description: string;
  createdAt: string;
}

export interface Character {
  id: string;
  name: string;
  nameJp: string;
  alias: string;
  image: string;
  intro: string;
  info: Record<string, string>;
  sections: { title: string; content: string }[];
  trivias: string[];
}

// 映射函数
function mapUser(r: any): User {
  return {
    id: r.id,
    username: r.username,
    password: r.password,
    role: r.role,
    banned: r.banned,
    avatar: r.avatar,
    createdAt: r.created_at || r.createdAt,
  };
}
function mapComment(r: any): Comment {
  return {
    id: r.id,
    userId: r.user_id || r.userId,
    username: r.username,
    characterId: r.character_id || r.characterId,
    content: r.content,
    createdAt: r.created_at || r.createdAt,
  };
}
function mapPost(r: any): Post {
  return {
    id: r.id,
    userId: r.user_id || r.userId,
    username: r.username,
    title: r.title,
    content: r.content,
    createdAt: r.created_at || r.createdAt,
  };
}
function mapReply(r: any): Reply {
  return {
    id: r.id,
    postId: r.post_id || r.postId,
    userId: r.user_id || r.userId,
    username: r.username,
    content: r.content,
    createdAt: r.created_at || r.createdAt,
  };
}
function mapImage(r: any): Image {
  return {
    id: r.id,
    userId: r.user_id || r.userId,
    username: r.username,
    sectionId: r.section_id || r.sectionId,
    url: r.url,
    description: r.description,
    createdAt: r.created_at || r.createdAt,
  };
}
function mapSection(r: any): ImageSection {
  return { id: r.id, name: r.name, description: r.description };
}

function mapCharacter(r: any): Character {
  return {
    id: r.id,
    name: r.name,
    nameJp: r.name_jp || r.nameJp,
    alias: r.alias,
    image: r.image,
    intro: r.intro,
    info: typeof r.info === "string" ? JSON.parse(r.info) : (r.info || {}),
    sections: typeof r.sections === "string" ? JSON.parse(r.sections) : (r.sections || []),
    trivias: typeof r.trivias === "string" ? JSON.parse(r.trivias) : (r.trivias || []),
  };
}
export interface Arc {
  id: number;
  name: string;
  name_jp: string;
  volume_start: number;
  volume_end: number;
  summary: string;
  characters: string[];
  created_at: string;
}

function mapArc(r: any): Arc {
  return {
    id: r.id,
    name: r.name,
    name_jp: r.name_jp || r.nameJp,
    volume_start: r.volume_start || r.volumeStart,
    volume_end: r.volume_end || r.volumeEnd,
    summary: r.summary,
    characters: typeof r.characters === "string" ? JSON.parse(r.characters) : (r.characters || []),
    created_at: r.created_at || r.createdAt,
  };
}

export const db = {
  users: {
    findAll: async () => {
      if (isSupabase()) {
        await initSupabase();
        const { data, error } = await supabase!.from("users").select("*").eq("banned", false);
        if (error) throw error;
        return (data || []).map(mapUser);
      }
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`SELECT * FROM users WHERE banned = false`;
        return rows.map(mapUser);
      }
      initMemory();
      return memoryUsers.filter((u) => !u.banned);
    },
    findById: async (id: number) => {
      if (isSupabase()) {
        await initSupabase();
        const { data, error } = await supabase!.from("users").select("*").eq("id", id).eq("banned", false).single();
        if (error) return undefined;
        return data ? mapUser(data) : undefined;
      }
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`SELECT * FROM users WHERE id = ${id} AND banned = false`;
        return rows.length ? mapUser(rows[0]) : undefined;
      }
      initMemory();
      return memoryUsers.find((u) => u.id === id && !u.banned);
    },
    findByUsername: async (username: string) => {
      if (isSupabase()) {
        await initSupabase();
        const { data, error } = await supabase!.from("users").select("*").eq("username", username).single();
        if (error) return undefined;
        return data ? mapUser(data) : undefined;
      }
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`SELECT * FROM users WHERE username = ${username}`;
        return rows.length ? mapUser(rows[0]) : undefined;
      }
      initMemory();
      return memoryUsers.find((u) => u.username === username);
    },
    create: async (data: Omit<User, "id" | "createdAt">) => {
      if (isSupabase()) {
        await initSupabase();
        const { data: inserted, error } = await supabase!
          .from("users")
          .insert({ username: data.username, password: data.password, role: data.role, banned: data.banned, avatar: data.avatar || null })
          .select("id, created_at")
          .single();
        if (error) throw error;
        return { ...data, id: inserted!.id, createdAt: inserted!.created_at } as User;
      }
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`
          INSERT INTO users (username, password, role, banned)
          VALUES (${data.username}, ${data.password}, ${data.role}, ${data.banned})
          RETURNING id, created_at
        `;
        return { ...data, id: rows[0].id, createdAt: rows[0].created_at } as User;
      }
      initMemory();
      memoryIdCounters.user++;
      const user = { ...data, id: memoryIdCounters.user, createdAt: new Date().toISOString() };
      memoryUsers.push(user);
      return user as User;
    },
    update: async (id: number, data: Partial<User>) => {
      if (isSupabase()) {
        await initSupabase();
        const updateData: any = {};
        if (data.banned !== undefined) updateData.banned = data.banned;
        if (data.password !== undefined) updateData.password = data.password;
        if (data.role !== undefined) updateData.role = data.role;
        if (data.avatar !== undefined) updateData.avatar = data.avatar;
        const { data: updated, error } = await supabase!.from("users").update(updateData).eq("id", id).select("*").single();
        if (error) throw error;
        return updated ? mapUser(updated) : undefined;
      }
      if (isPg()) {
        await initPg();
        if (data.banned !== undefined)
          await (await getSql())`UPDATE users SET banned = ${data.banned} WHERE id = ${id}`;
        if (data.password !== undefined)
          await (await getSql())`UPDATE users SET password = ${data.password} WHERE id = ${id}`;
        if (data.role !== undefined)
          await (await getSql())`UPDATE users SET role = ${data.role} WHERE id = ${id}`;
        const { rows } = await (await getSql())`SELECT * FROM users WHERE id = ${id}`;
        return rows.length ? mapUser(rows[0]) : undefined;
      }
      initMemory();
      const idx = memoryUsers.findIndex((u) => u.id === id);
      if (idx >= 0) memoryUsers[idx] = { ...memoryUsers[idx], ...data };
      return memoryUsers[idx];
    },
    delete: async (id: number) => {
      if (isSupabase()) {
        await initSupabase();
        await supabase!.from("users").delete().eq("id", id);
        return;
      }
      if (isPg()) {
        await initPg();
        await (await getSql())`DELETE FROM users WHERE id = ${id}`;
        return;
      }
      initMemory();
      memoryUsers = memoryUsers.filter((u) => u.id !== id);
    },
  },
  comments: {
    findAll: async () => {
      if (isSupabase()) {
        await initSupabase();
        const { data, error } = await supabase!.from("comments").select("*");
        if (error) throw error;
        return (data || []).map(mapComment);
      }
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`SELECT * FROM comments`;
        return rows.map(mapComment);
      }
      initMemory();
      return memoryComments;
    },
    findByCharacterId: async (characterId: string) => {
      if (isSupabase()) {
        await initSupabase();
        const { data, error } = await supabase!.from("comments").select("*").eq("character_id", characterId).order("created_at", { ascending: false });
        if (error) throw error;
        return (data || []).map(mapComment);
      }
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`SELECT * FROM comments WHERE character_id = ${characterId} ORDER BY created_at DESC`;
        return rows.map(mapComment);
      }
      initMemory();
      return memoryComments.filter((c) => c.characterId === characterId).reverse();
    },
    create: async (data: Omit<Comment, "id" | "createdAt">) => {
      if (isSupabase()) {
        await initSupabase();
        const { data: inserted, error } = await supabase!
          .from("comments")
          .insert({ user_id: data.userId, username: data.username, character_id: data.characterId, content: data.content })
          .select("id, created_at")
          .single();
        if (error) throw error;
        return { ...data, id: inserted!.id, createdAt: inserted!.created_at } as Comment;
      }
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`
          INSERT INTO comments (user_id, username, character_id, content)
          VALUES (${data.userId}, ${data.username}, ${data.characterId}, ${data.content})
          RETURNING id, created_at
        `;
        return { ...data, id: rows[0].id, createdAt: rows[0].created_at } as Comment;
      }
      initMemory();
      memoryIdCounters.comment++;
      const comment = { ...data, id: memoryIdCounters.comment, createdAt: new Date().toISOString() };
      memoryComments.push(comment);
      return comment as Comment;
    },
    delete: async (id: number) => {
      if (isSupabase()) {
        await initSupabase();
        await supabase!.from("comments").delete().eq("id", id);
        return;
      }
      if (isPg()) {
        await initPg();
        await (await getSql())`DELETE FROM comments WHERE id = ${id}`;
        return;
      }
      initMemory();
      memoryComments = memoryComments.filter((c) => c.id !== id);
    },
  },
  posts: {
    findAll: async () => {
      if (isSupabase()) {
        await initSupabase();
        const { data, error } = await supabase!.from("posts").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return (data || []).map(mapPost);
      }
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`SELECT * FROM posts ORDER BY created_at DESC`;
        return rows.map(mapPost);
      }
      initMemory();
      return [...memoryPosts].reverse();
    },
    findById: async (id: number) => {
      if (isSupabase()) {
        await initSupabase();
        const { data, error } = await supabase!.from("posts").select("*").eq("id", id).single();
        if (error) return undefined;
        return data ? mapPost(data) : undefined;
      }
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`SELECT * FROM posts WHERE id = ${id}`;
        return rows.length ? mapPost(rows[0]) : undefined;
      }
      initMemory();
      return memoryPosts.find((p) => p.id === id);
    },
    create: async (data: Omit<Post, "id" | "createdAt">) => {
      if (isSupabase()) {
        await initSupabase();
        const { data: inserted, error } = await supabase!
          .from("posts")
          .insert({ user_id: data.userId, username: data.username, title: data.title, content: data.content })
          .select("id, created_at")
          .single();
        if (error) throw error;
        return { ...data, id: inserted!.id, createdAt: inserted!.created_at } as Post;
      }
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`
          INSERT INTO posts (user_id, username, title, content)
          VALUES (${data.userId}, ${data.username}, ${data.title}, ${data.content})
          RETURNING id, created_at
        `;
        return { ...data, id: rows[0].id, createdAt: rows[0].created_at } as Post;
      }
      initMemory();
      memoryIdCounters.post++;
      const post = { ...data, id: memoryIdCounters.post, createdAt: new Date().toISOString() };
      memoryPosts.push(post);
      return post as Post;
    },
    delete: async (id: number) => {
      if (isSupabase()) {
        await initSupabase();
        await supabase!.from("replies").delete().eq("post_id", id);
        await supabase!.from("posts").delete().eq("id", id);
        return;
      }
      if (isPg()) {
        await initPg();
        await (await getSql())`DELETE FROM posts WHERE id = ${id}`;
        await (await getSql())`DELETE FROM replies WHERE post_id = ${id}`;
        return;
      }
      initMemory();
      memoryPosts = memoryPosts.filter((p) => p.id !== id);
      memoryReplies = memoryReplies.filter((r) => r.postId !== id);
    },
  },
  replies: {
    findByPostId: async (postId: number) => {
      if (isSupabase()) {
        await initSupabase();
        const { data, error } = await supabase!.from("replies").select("*").eq("post_id", postId).order("created_at");
        if (error) throw error;
        return (data || []).map(mapReply);
      }
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`SELECT * FROM replies WHERE post_id = ${postId} ORDER BY created_at`;
        return rows.map(mapReply);
      }
      initMemory();
      return memoryReplies.filter((r) => r.postId === postId);
    },
    create: async (data: Omit<Reply, "id" | "createdAt">) => {
      if (isSupabase()) {
        await initSupabase();
        const { data: inserted, error } = await supabase!
          .from("replies")
          .insert({ post_id: data.postId, user_id: data.userId, username: data.username, content: data.content })
          .select("id, created_at")
          .single();
        if (error) throw error;
        return { ...data, id: inserted!.id, createdAt: inserted!.created_at } as Reply;
      }
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`
          INSERT INTO replies (post_id, user_id, username, content)
          VALUES (${data.postId}, ${data.userId}, ${data.username}, ${data.content})
          RETURNING id, created_at
        `;
        return { ...data, id: rows[0].id, createdAt: rows[0].created_at } as Reply;
      }
      initMemory();
      memoryIdCounters.reply++;
      const reply = { ...data, id: memoryIdCounters.reply, createdAt: new Date().toISOString() };
      memoryReplies.push(reply);
      return reply as Reply;
    },
    delete: async (id: number) => {
      if (isSupabase()) {
        await initSupabase();
        await supabase!.from("replies").delete().eq("id", id);
        return;
      }
      if (isPg()) {
        await initPg();
        await (await getSql())`DELETE FROM replies WHERE id = ${id}`;
        return;
      }
      initMemory();
      memoryReplies = memoryReplies.filter((r) => r.id !== id);
    },
  },
  sections: {
    findAll: async () => {
      if (isSupabase()) {
        await initSupabase();
        const { data, error } = await supabase!.from("sections").select("*");
        if (error) throw error;
        return (data || []).map(mapSection);
      }
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`SELECT * FROM sections`;
        return rows.map(mapSection);
      }
      initMemory();
      return memorySections;
    },
    create: async (data: Omit<ImageSection, "id">) => {
      if (isSupabase()) {
        await initSupabase();
        const { data: inserted, error } = await supabase!
          .from("sections")
          .insert({ name: data.name, description: data.description })
          .select("id")
          .single();
        if (error) throw error;
        return { ...data, id: inserted!.id } as ImageSection;
      }
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`
          INSERT INTO sections (name, description)
          VALUES (${data.name}, ${data.description})
          RETURNING id
        `;
        return { ...data, id: rows[0].id } as ImageSection;
      }
      initMemory();
      memoryIdCounters.section++;
      const section = { ...data, id: memoryIdCounters.section };
      memorySections.push(section);
      return section as ImageSection;
    },
    delete: async (id: number) => {
      if (isSupabase()) {
        await initSupabase();
        await supabase!.from("sections").delete().eq("id", id);
        return;
      }
      if (isPg()) {
        await initPg();
        await (await getSql())`DELETE FROM sections WHERE id = ${id}`;
        return;
      }
      initMemory();
      memorySections = memorySections.filter((s) => s.id !== id);
    },
  },
  images: {
    findAll: async () => {
      if (isSupabase()) {
        await initSupabase();
        const { data, error } = await supabase!.from("images").select("*");
        if (error) throw error;
        return (data || []).map(mapImage);
      }
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`SELECT * FROM images`;
        return rows.map(mapImage);
      }
      initMemory();
      return memoryImages;
    },
    findBySectionId: async (sectionId: number) => {
      if (isSupabase()) {
        await initSupabase();
        const { data, error } = await supabase!.from("images").select("*").eq("section_id", sectionId);
        if (error) throw error;
        return (data || []).map(mapImage);
      }
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`SELECT * FROM images WHERE section_id = ${sectionId}`;
        return rows.map(mapImage);
      }
      initMemory();
      return memoryImages.filter((i) => i.sectionId === sectionId);
    },
    create: async (data: Omit<Image, "id" | "createdAt">) => {
      if (isSupabase()) {
        await initSupabase();
        const { data: inserted, error } = await supabase!
          .from("images")
          .insert({ user_id: data.userId, username: data.username, section_id: data.sectionId, url: data.url, description: data.description })
          .select("id, created_at")
          .single();
        if (error) throw error;
        return { ...data, id: inserted!.id, createdAt: inserted!.created_at } as Image;
      }
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`
          INSERT INTO images (user_id, username, section_id, url, description)
          VALUES (${data.userId}, ${data.username}, ${data.sectionId}, ${data.url}, ${data.description})
          RETURNING id, created_at
        `;
        return { ...data, id: rows[0].id, createdAt: rows[0].created_at } as Image;
      }
      initMemory();
      memoryIdCounters.image++;
      const image = { ...data, id: memoryIdCounters.image, createdAt: new Date().toISOString() };
      memoryImages.push(image);
      return image as Image;
    },
    delete: async (id: number) => {
      if (isSupabase()) {
        await initSupabase();
        await supabase!.from("images").delete().eq("id", id);
        return;
      }
      if (isPg()) {
        await initPg();
        await (await getSql())`DELETE FROM images WHERE id = ${id}`;
        return;
      }
      initMemory();
      memoryImages = memoryImages.filter((i) => i.id !== id);
    },
  },
  characters: {
    findAll: async () => {
      if (isSupabase()) {
        await initSupabase();
        const { data, error } = await supabase!.from("characters").select("*");
        if (error) throw error;
        return (data || []).map(mapCharacter);
      }
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`SELECT * FROM characters`;
        return rows.map(mapCharacter);
      }
      initMemory();
      return memoryCharacters;
    },
    findById: async (id: string) => {
      if (isSupabase()) {
        await initSupabase();
        const { data, error } = await supabase!.from("characters").select("*").eq("id", id).single();
        if (error) return undefined;
        return data ? mapCharacter(data) : undefined;
      }
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`SELECT * FROM characters WHERE id = ${id}`;
        return rows.length ? mapCharacter(rows[0]) : undefined;
      }
      initMemory();
      return memoryCharacters.find((c) => c.id === id);
    },
    create: async (data: Omit<Character, "id"> & { id: string }) => {
      if (isSupabase()) {
        await initSupabase();
        const { error } = await supabase!
          .from("characters")
          .insert({
            id: data.id,
            name: data.name,
            name_jp: data.nameJp,
            alias: data.alias,
            image: data.image,
            intro: data.intro,
            info: data.info,
            sections: data.sections,
            trivias: data.trivias,
          });
        if (error) throw error;
        return data as Character;
      }
      if (isPg()) {
        await initPg();
        await (await getSql())`
          INSERT INTO characters (id, name, name_jp, alias, image, intro, info, sections, trivias)
          VALUES (${data.id}, ${data.name}, ${data.nameJp}, ${data.alias}, ${data.image}, ${data.intro}, ${JSON.stringify(data.info)}, ${JSON.stringify(data.sections)}, ${JSON.stringify(data.trivias)})
        `;
        return data as Character;
      }
      initMemory();
      memoryCharacters.push(data as Character);
      return data as Character;
    },
    delete: async (id: string) => {
      if (isSupabase()) {
        await initSupabase();
        await supabase!.from("characters").delete().eq("id", id);
        return;
      }
      if (isPg()) {
        await initPg();
        await (await getSql())`DELETE FROM characters WHERE id = ${id}`;
        return;
      }
      initMemory();
      memoryCharacters = memoryCharacters.filter((c) => c.id !== id);
    },
  },
  arcs: {
    findAll: async () => {
      if (isSupabase()) {
        await initSupabase();
        const { data, error } = await supabase!.from("arcs").select("*").order("volume_start");
        if (error) throw error;
        return (data || []).map(mapArc);
      }
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`SELECT * FROM arcs ORDER BY volume_start`;
        return rows.map(mapArc);
      }
      return [];
    },
    findById: async (id: number) => {
      if (isSupabase()) {
        await initSupabase();
        const { data, error } = await supabase!.from("arcs").select("*").eq("id", id).single();
        if (error) return undefined;
        return data ? mapArc(data) : undefined;
      }
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`SELECT * FROM arcs WHERE id = ${id}`;
        return rows.length ? mapArc(rows[0]) : undefined;
      }
      return undefined;
    },
    create: async (data: Omit<Arc, "id" | "created_at">) => {
      if (isSupabase()) {
        await initSupabase();
        const { data: inserted, error } = await supabase!
          .from("arcs")
          .insert({
            name: data.name,
            name_jp: data.name_jp,
            volume_start: data.volume_start,
            volume_end: data.volume_end,
            summary: data.summary,
            characters: data.characters,
          })
          .select("id, created_at")
          .single();
        if (error) throw error;
        return { ...data, id: inserted!.id, created_at: inserted!.created_at } as Arc;
      }
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`
          INSERT INTO arcs (name, name_jp, volume_start, volume_end, summary, characters)
          VALUES (${data.name}, ${data.name_jp}, ${data.volume_start}, ${data.volume_end}, ${data.summary}, ${JSON.stringify(data.characters)})
          RETURNING id, created_at
        `;
        return { ...data, id: rows[0].id, created_at: rows[0].created_at } as Arc;
      }
      return { ...data, id: 1, created_at: new Date().toISOString() } as Arc;
    },
    delete: async (id: number) => {
      if (isSupabase()) {
        await initSupabase();
        await supabase!.from("arcs").delete().eq("id", id);
        return;
      }
      if (isPg()) {
        await initPg();
        await (await getSql())`DELETE FROM arcs WHERE id = ${id}`;
        return;
      }
      return;
    },
  },
};

export const loginSchema = z.object({
  username: z.string().min(2).max(20),
  password: z.string().min(4).max(100),
});

export const registerSchema = z.object({
  username: z.string().min(2).max(20),
  password: z.string().min(4).max(100),
});

export const commentSchema = z.object({
  characterId: z.string(),
  content: z.string().min(1).max(500),
});

export const imageSchema = z.object({
  sectionId: z.number().int(),
  url: z.string().url(),
  description: z.string().max(200),
});

export const postSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(5000),
});

export const replySchema = z.object({
  postId: z.number().int(),
  content: z.string().min(1).max(1000),
});
