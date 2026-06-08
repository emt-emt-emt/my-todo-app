import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const arcId = Number(id);
    if (isNaN(arcId)) return NextResponse.json({ error: "无效ID" }, { status: 400 });

    const arc = await db.arcs.findById(arcId);
    if (!arc) return NextResponse.json({ error: "篇章不存在" }, { status: 404 });

    return NextResponse.json({ arc });
  } catch (error) {
    console.error("[arcs/[id] GET]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
