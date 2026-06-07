import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ user: null });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ user: null });

    const user = await db.users.findById(payload.userId);
    if (!user || user.banned) return NextResponse.json({ user: null });

    return NextResponse.json({
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
