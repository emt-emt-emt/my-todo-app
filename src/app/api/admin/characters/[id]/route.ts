import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get("token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "未登录" }, { status: 401 });
    if (payload.role !== "admin") return NextResponse.json({ error: "无权限" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    await db.characters.update(id, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin characters PATCH]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get("token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "未登录" }, { status: 401 });
    if (payload.role !== "admin") return NextResponse.json({ error: "无权限" }, { status: 403 });

    const { id } = await params;
    await db.characters.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin characters DELETE]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
