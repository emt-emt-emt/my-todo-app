import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "未登录" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: "无效Token" }, { status: 401 });

    const user = await db.users.findById(payload.userId);
    if (!user) return NextResponse.json({ error: "用户不存在" }, { status: 404 });

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "未登录" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: "无效Token" }, { status: 401 });

    const body = await req.json();
    const updates: any = {};

    if (body.avatar !== undefined) updates.avatar = body.avatar;

    if (body.password) {
      const bcrypt = await import("bcryptjs");
      updates.password = await bcrypt.hash(body.password, 10);
    }

    await db.users.update(payload.userId, updates);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
