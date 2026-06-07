import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const postId = Number(id);
    if (isNaN(postId)) return NextResponse.json({ error: "无效ID" }, { status: 400 });

    const post = await db.posts.findById(postId);
    if (!post) return NextResponse.json({ error: "帖子不存在" }, { status: 404 });

    const replies = await db.replies.findByPostId(postId);
    return NextResponse.json({ post, replies });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
