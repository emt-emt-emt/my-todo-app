import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const arcs = await db.arcs.findAll();
    return NextResponse.json({ arcs });
  } catch (error) {
    console.error("[arcs GET]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const arc = await db.arcs.create(body);
    return NextResponse.json({ success: true, arc });
  } catch (error) {
    console.error("[arcs POST]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
