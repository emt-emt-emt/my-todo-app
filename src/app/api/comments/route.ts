import { NextRequest, NextResponse } from "next/server";
import { db, commentSchema } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const characterId = searchParams.get("characterId");
    if (!characterId) return NextResponse.json({ error: "缺少参数" }, { status: 400 });
    const comments = await db.comments.findByCharacterId(characterId);
    return NextResponse.json({ comments });
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
    const result = commentSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: "输入格式错误" }, { status: 400 });

    const comment = await db.comments.create({
      userId: payload.userId,
      username: payload.username,
      characterId: result.data.characterId,
      content: result.data.content,
    });
    return NextResponse.json({ success: true, comment });
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

    await db.comments.delete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
