import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const arcId = Number(searchParams.get("arcId"));
    if (isNaN(arcId)) return NextResponse.json({ error: "无效参数" }, { status: 400 });

    const comments = await db.arc_comments.findByArcId(arcId);
    return NextResponse.json({ comments });
  } catch (error) {
    console.error("[arc-comments GET]", error);
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
    if (!body.arcId || !body.content?.trim()) return NextResponse.json({ error: "缺少参数" }, { status: 400 });

    const comment = await db.arc_comments.create({
      arcId: body.arcId,
      userId: payload.userId,
      username: payload.username,
      content: body.content.trim(),
    });
    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error("[arc-comments POST]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
