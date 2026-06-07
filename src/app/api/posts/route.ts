import { NextRequest, NextResponse } from "next/server";
import { db, postSchema } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const posts = await db.posts.findAll();
    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const user = await db.users.findById(payload.userId);
    if (!user || user.banned) return NextResponse.json({ error: "账号已被禁言" }, { status: 403 });

    const body = await req.json();
    const result = postSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: "输入格式错误" }, { status: 400 });

    const post = await db.posts.create({
      userId: payload.userId,
      username: payload.username,
      title: result.data.title,
      content: result.data.content,
    });
    return NextResponse.json({ success: true, post });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "未登录" }, { status: 401 });
    if (payload.role !== "admin") return NextResponse.json({ error: "无权限" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "缺少参数" }, { status: 400 });

    await db.posts.delete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
