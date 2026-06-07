import { NextRequest, NextResponse } from "next/server";
import { db, imageSchema } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get("sectionId");
    if (sectionId) {
      const images = db.images.findBySectionId(Number(sectionId));
      return NextResponse.json({ images });
    }
    const images = db.images.findAll();
    return NextResponse.json({ images });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const user = db.users.findById(payload.userId);
    if (!user || user.banned) return NextResponse.json({ error: "账号已被禁言" }, { status: 403 });

    const body = await req.json();
    const result = imageSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: "输入格式错误" }, { status: 400 });

    const image = db.images.create({
      userId: payload.userId,
      username: payload.username,
      sectionId: result.data.sectionId,
      url: result.data.url,
      description: result.data.description,
    });
    return NextResponse.json({ success: true, image });
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

    db.images.delete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
