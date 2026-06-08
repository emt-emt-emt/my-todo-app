import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db, registerSchema } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "输入格式错误" }, { status: 400 });
    }

    const existing = await db.users.findByUsername(result.data.username);
    if (existing) {
      return NextResponse.json({ error: "用户名已存在" }, { status: 409 });
    }

    const hash = await bcrypt.hash(result.data.password, 10);
    const user = await db.users.create({
      username: result.data.username,
      password: hash,
      role: "user",
      banned: false,
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (e: any) {
    console.error("[register error]", e);
    return NextResponse.json({ error: "服务器错误: " + (e.message || e) }, { status: 500 });
  }
}
