import { promises as fs } from "fs";
import { join } from "path";
import { z } from "zod";

const DATA_DIR = join(process.cwd(), "data");

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

async function readJson<T>(file: string): Promise<T> {
  try {
    const data = await fs.readFile(join(DATA_DIR, file), "utf-8");
    return JSON.parse(data) as T;
  } catch {
    return [] as unknown as T;
  }
}

async function writeJson<T>(file: string, data: T): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(join(DATA_DIR, file), JSON.stringify(data, null, 2), "utf-8");
}

async function getNextId(file: string): Promise<number> {
  const data = await readJson<unknown[]>(file);
  if (data.length === 0) return 1;
  const maxId = Math.max(...(data as { id: number }[]).map((item) => item.id));
  return maxId + 1;
}

export const db = {
  users: {
    findAll: async () => {
      const users = await readJson<User[]>("users.json");
      return users.filter((u) => !u.banned);
    },
    findById: async (id: number) => {
      const users = await readJson<User[]>("users.json");
      return users.find((u) => u.id === id && !u.banned);
    },
    findByUsername: async (username: string) => {
      const users = await readJson<User[]>("users.json");
      return users.find((u) => u.username === username);
    },
    create: async (data: Omit<User, "id" | "createdAt">) => {
      const users = await readJson<User[]>("users.json");
      const id = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
      const user: User = { ...data, id, createdAt: new Date().toISOString() };
      users.push(user);
      await writeJson("users.json", users);
      return user;
    },
    update: async (id: number, data: Partial<User>) => {
      const users = await readJson<User[]>("users.json");
      const idx = users.findIndex((u) => u.id === id);
      if (idx >= 0) {
        users[idx] = { ...users[idx], ...data };
        await writeJson("users.json", users);
      }
      return users[idx];
    },
    delete: async (id: number) => {
      const users = await readJson<User[]>("users.json");
      const filtered = users.filter((u) => u.id !== id);
      await writeJson("users.json", filtered);
    },
  },
  comments: {
    findAll: async () => readJson<Comment[]>("comments.json"),
    findByCharacterId: async (characterId: string) => {
      const comments = await readJson<Comment[]>("comments.json");
      return comments.filter((c) => c.characterId === characterId).reverse();
    },
    create: async (data: Omit<Comment, "id" | "createdAt">) => {
      const comments = await readJson<Comment[]>("comments.json");
      const id = comments.length > 0 ? Math.max(...comments.map((c) => c.id)) + 1 : 1;
      const comment: Comment = { ...data, id, createdAt: new Date().toISOString() };
      comments.push(comment);
      await writeJson("comments.json", comments);
      return comment;
    },
    delete: async (id: number) => {
      const comments = await readJson<Comment[]>("comments.json");
      const filtered = comments.filter((c) => c.id !== id);
      await writeJson("comments.json", filtered);
    },
  },
  sections: {
    findAll: async () => readJson<ImageSection[]>("sections.json"),
    create: async (data: Omit<ImageSection, "id">) => {
      const sections = await readJson<ImageSection[]>("sections.json");
      const id = sections.length > 0 ? Math.max(...sections.map((s) => s.id)) + 1 : 1;
      const section: ImageSection = { ...data, id };
      sections.push(section);
      await writeJson("sections.json", sections);
      return section;
    },
    delete: async (id: number) => {
      const sections = await readJson<ImageSection[]>("sections.json");
      const filtered = sections.filter((s) => s.id !== id);
      await writeJson("sections.json", filtered);
    },
  },
  images: {
    findAll: async () => readJson<Image[]>("images.json"),
    findBySectionId: async (sectionId: number) => {
      const images = await readJson<Image[]>("images.json");
      return images.filter((i) => i.sectionId === sectionId);
    },
    create: async (data: Omit<Image, "id" | "createdAt">) => {
      const images = await readJson<Image[]>("images.json");
      const id = images.length > 0 ? Math.max(...images.map((i) => i.id)) + 1 : 1;
      const image: Image = { ...data, id, createdAt: new Date().toISOString() };
      images.push(image);
      await writeJson("images.json", images);
      return image;
    },
    delete: async (id: number) => {
      const images = await readJson<Image[]>("images.json");
      const filtered = images.filter((i) => i.id !== id);
      await writeJson("images.json", filtered);
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
