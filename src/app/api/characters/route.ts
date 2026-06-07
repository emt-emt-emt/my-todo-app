import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const characters = await db.characters.findAll();
    return NextResponse.json({ characters });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "未登录" }, { status: 401 });
    if (payload.role !== "admin") return NextResponse.json({ error: "无权限" }, { status: 403 });

    const body = await req.json();
    const { id, name, nameJp, alias, image, intro, info, sections, trivias } = body;
    if (!id || !name || !image || !intro) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    }

    const existing = await db.characters.findById(id);
    if (existing) return NextResponse.json({ error: "角色ID已存在" }, { status: 409 });

    const character = await db.characters.create({
      id,
      name,
      nameJp: nameJp || "",
      alias: alias || "",
      image,
      intro,
      info: info || {},
      sections: sections || [],
      trivias: trivias || [],
    });
    return NextResponse.json({ success: true, character });
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
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "缺少参数" }, { status: 400 });

    await db.characters.delete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
