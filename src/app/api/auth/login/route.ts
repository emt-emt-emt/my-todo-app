import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db, loginSchema, registerSchema } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "输入格式错误" }, { status: 400 });
    }

    const user = db.users.findByUsername(result.data.username);
    if (!user) {
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
    }

    if (user.banned) {
      return NextResponse.json({ error: "账号已被禁言" }, { status: 403 });
    }

    const valid = await bcrypt.compare(result.data.password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
    }

    const token = await signToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    const res = NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, role: user.role },
    });
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
