import { z } from "zod";

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

// ========== DB 实现 ==========
export const db = {
  users: {
    findAll: async () => {
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`SELECT * FROM users WHERE banned = false`;
        return rows.map(mapUser);
      }
      initMemory();
      return memoryUsers.filter((u) => !u.banned);
    },
    findById: async (id: number) => {
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`SELECT * FROM users WHERE id = ${id} AND banned = false`;
        return rows.length ? mapUser(rows[0]) : undefined;
      }
      initMemory();
      return memoryUsers.find((u) => u.id === id && !u.banned);
    },
    findByUsername: async (username: string) => {
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`SELECT * FROM users WHERE username = ${username}`;
        return rows.length ? mapUser(rows[0]) : undefined;
      }
      initMemory();
      return memoryUsers.find((u) => u.username === username);
    },
    create: async (data: Omit<User, "id" | "createdAt">) => {
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
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`SELECT * FROM comments`;
        return rows.map(mapComment);
      }
      initMemory();
      return memoryComments;
    },
    findByCharacterId: async (characterId: string) => {
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`SELECT * FROM comments WHERE character_id = ${characterId} ORDER BY created_at DESC`;
        return rows.map(mapComment);
      }
      initMemory();
      return memoryComments.filter((c) => c.characterId === characterId).reverse();
    },
    create: async (data: Omit<Comment, "id" | "createdAt">) => {
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
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`SELECT * FROM posts ORDER BY created_at DESC`;
        return rows.map(mapPost);
      }
      initMemory();
      return [...memoryPosts].reverse();
    },
    findById: async (id: number) => {
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`SELECT * FROM posts WHERE id = ${id}`;
        return rows.length ? mapPost(rows[0]) : undefined;
      }
      initMemory();
      return memoryPosts.find((p) => p.id === id);
    },
    create: async (data: Omit<Post, "id" | "createdAt">) => {
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
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`SELECT * FROM replies WHERE post_id = ${postId} ORDER BY created_at`;
        return rows.map(mapReply);
      }
      initMemory();
      return memoryReplies.filter((r) => r.postId === postId);
    },
    create: async (data: Omit<Reply, "id" | "createdAt">) => {
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
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`SELECT * FROM sections`;
        return rows.map(mapSection);
      }
      initMemory();
      return memorySections;
    },
    create: async (data: Omit<ImageSection, "id">) => {
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
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`SELECT * FROM images`;
        return rows.map(mapImage);
      }
      initMemory();
      return memoryImages;
    },
    findBySectionId: async (sectionId: number) => {
      if (isPg()) {
        await initPg();
        const { rows } = await (await getSql())`SELECT * FROM images WHERE section_id = ${sectionId}`;
        return rows.map(mapImage);
      }
      initMemory();
      return memoryImages.filter((i) => i.sectionId === sectionId);
    },
    create: async (data: Omit<Image, "id" | "createdAt">) => {
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
      if (isPg()) {
        await initPg();
        await (await getSql())`DELETE FROM images WHERE id = ${id}`;
        return;
      }
      initMemory();
      memoryImages = memoryImages.filter((i) => i.id !== id);
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
