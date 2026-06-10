import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isSupabase } from "@/lib/supabase";

export async function GET() {
  try {
    // 尝试查询用户列表，触发底层自动初始化（Postgres / Memory）
    const users = await db.users.findAll();

    const backend = isSupabase()
      ? "supabase"
      : process.env.POSTGRES_URL
        ? "postgres"
        : "memory";

    return NextResponse.json({
      success: true,
      backend,
      usersCount: users.length,
      message:
        backend === "supabase"
          ? "已连接到 Supabase，请确保已在 SQL Editor 中执行 supabase-init.sql"
          : "数据库已初始化并正常工作",
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const isMissingTable =
      msg.includes("表未创建") ||
      msg.includes("does not exist") ||
      msg.includes("relation");

    return NextResponse.json(
      {
        success: false,
        error: msg,
        hint: isMissingTable
          ? "Supabase 表未创建。请在 Supabase Dashboard → SQL Editor 中执行 supabase-init.sql 文件中的内容，或切换到 Vercel Postgres / 内存模式。"
          : "请检查数据库连接配置（SUPABASE_URL / POSTGRES_URL）",
      },
      { status: 500 }
    );
  }
}
