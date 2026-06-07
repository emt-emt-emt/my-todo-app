import { NextRequest, NextResponse } from "next/server";
import { db, User } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "未登录" }, { status: 401 });
    if (payload.role !== "admin") return NextResponse.json({ error: "无权限" }, { status: 403 });

    const users = (await db.users.findAll()).map((u: User) => ({ id: u.id, username: u.username, role: u.role, banned: u.banned, createdAt: u.createdAt }));
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "未登录" }, { status: 401 });
    if (payload.role !== "admin") return NextResponse.json({ error: "无权限" }, { status: 403 });

    const body = await req.json();
    const { id, banned } = body;
    if (!id) return NextResponse.json({ error: "缺少参数" }, { status: 400 });

    await db.users.update(id, { banned });
    return NextResponse.json({ success: true });
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

    await db.users.delete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
