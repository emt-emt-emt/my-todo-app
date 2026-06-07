import { z } from "zod";

// 内存数据库（演示用，Vercel 重启后数据会重置）
// 生产环境建议替换为 PostgreSQL / Turso / Supabase

export interface User {
  id: number;
  username: string;
  password: string;
  role: "admin" | "user";
  banned: boolean;
  createdAt: string;
}

export interface Comment {
  id: number;
  userId: number;
  username: string;
  characterId: string;
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

let users: User[] = [
  {
    id: 1,
    username: "admin",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password: admin123
    role: "admin",
    banned: false,
    createdAt: new Date().toISOString(),
  },
];
let comments: Comment[] = [];
let sections: ImageSection[] = [
  { id: 1, name: "角色美图", description: "主要角色精美插画" },
  { id: 2, name: "场景截图", description: "动画经典场景截图" },
  { id: 3, name: "粉丝创作", description: "粉丝投稿的同人作品" },
];
let images: Image[] = [
  { id: 1, userId: 1, username: "admin", sectionId: 1, url: "/images/emilia.jpg", description: "爱蜜莉雅", createdAt: new Date().toISOString() },
  { id: 2, userId: 1, username: "admin", sectionId: 1, url: "/images/subaru.png", description: "菜月昴", createdAt: new Date().toISOString() },
  { id: 3, userId: 1, username: "admin", sectionId: 1, url: "/images/rem.png", description: "雷姆", createdAt: new Date().toISOString() },
  { id: 4, userId: 1, username: "admin", sectionId: 1, url: "/images/ram.png", description: "拉姆", createdAt: new Date().toISOString() },
  { id: 5, userId: 1, username: "admin", sectionId: 1, url: "/images/puck.png", description: "帕克", createdAt: new Date().toISOString() },
  { id: 6, userId: 1, username: "admin", sectionId: 1, url: "/images/reinhard.png", description: "莱茵哈鲁特", createdAt: new Date().toISOString() },
];

let idCounters = { user: 1, comment: 0, section: 3, image: 6 };

export const db = {
  users: {
    findAll: () => users.filter(u => !u.banned),
    findById: (id: number) => users.find(u => u.id === id && !u.banned),
    findByUsername: (username: string) => users.find(u => u.username === username),
    create: (data: Omit<User, "id" | "createdAt">) => {
      idCounters.user++;
      const user: User = { ...data, id: idCounters.user, createdAt: new Date().toISOString() };
      users.push(user);
      return user;
    },
    update: (id: number, data: Partial<User>) => {
      const idx = users.findIndex(u => u.id === id);
      if (idx >= 0) users[idx] = { ...users[idx], ...data };
      return users[idx];
    },
    delete: (id: number) => { users = users.filter(u => u.id !== id); },
  },
  comments: {
    findAll: () => comments,
    findByCharacterId: (characterId: string) => comments.filter(c => c.characterId === characterId).reverse(),
    create: (data: Omit<Comment, "id" | "createdAt">) => {
      idCounters.comment++;
      const comment: Comment = { ...data, id: idCounters.comment, createdAt: new Date().toISOString() };
      comments.push(comment);
      return comment;
    },
    delete: (id: number) => { comments = comments.filter(c => c.id !== id); },
  },
  sections: {
    findAll: () => sections,
    create: (data: Omit<ImageSection, "id">) => {
      idCounters.section++;
      const section: ImageSection = { ...data, id: idCounters.section };
      sections.push(section);
      return section;
    },
    delete: (id: number) => { sections = sections.filter(s => s.id !== id); },
  },
  images: {
    findAll: () => images,
    findBySectionId: (sectionId: number) => images.filter(i => i.sectionId === sectionId),
    create: (data: Omit<Image, "id" | "createdAt">) => {
      idCounters.image++;
      const image: Image = { ...data, id: idCounters.image, createdAt: new Date().toISOString() };
      images.push(image);
      return image;
    },
    delete: (id: number) => { images = images.filter(i => i.id !== id); },
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
