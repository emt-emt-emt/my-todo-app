import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const character = await db.characters.findById(id);
    if (!character) return NextResponse.json({ error: "角色不存在" }, { status: 404 });
    return NextResponse.json({ character });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
