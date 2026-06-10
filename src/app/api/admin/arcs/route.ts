import { NextRequest, NextResponse } from "next/server";
import { db, Arc } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

async function checkAdmin(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "未登录" }, { status: 401 });
  if (payload.role !== "admin") return NextResponse.json({ error: "无权限" }, { status: 403 });
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const denied = await checkAdmin(req);
    if (denied) return denied;

    const arcs = await db.arcs.findAll();
    return NextResponse.json({ arcs });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const denied = await checkAdmin(req);
    if (denied) return denied;

    const body = await req.json();
    const arc = await db.arcs.create(body);
    return NextResponse.json({ success: true, arc });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const denied = await checkAdmin(req);
    if (denied) return denied;

    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: "缺少ID" }, { status: 400 });

    await db.arcs.update(id, data);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const denied = await checkAdmin(req);
    if (denied) return denied;

    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "缺少ID" }, { status: 400 });

    await db.arcs.delete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
