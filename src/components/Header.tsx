"use client";

import Link from "next/link";
import { AuthBar } from "./AuthBar";
import { useAuth } from "./AuthProvider";

export function Header({ active }: { active?: "home" | "renwu" | "tupian" | "forum" }) {
  const { user } = useAuth();
  return (
    <header className="clearfix">
      <Link href="/" className="logo">
        从零开始的异世界生活
      </Link>
      <ul className="nav">
        <li>
          <Link href="/">
            {active === "home" ? <strong>首页</strong> : "首页"}
          </Link>
        </li>
        <li>
          <Link href="/renwu">
            {active === "renwu" ? <strong>人物介绍</strong> : "人物介绍"}
          </Link>
        </li>
        <li>
          <Link href="/tupian">
            {active === "tupian" ? <strong>图片鉴赏</strong> : "图片鉴赏"}
          </Link>
        </li>
        <li>
          <Link href="/forum">
            {active === "forum" ? <strong>💬 论坛</strong> : "💬 论坛"}
          </Link>
        </li>
        {user?.role === "admin" && (
          <li>
            <Link href="/admin">
              🛠️ 管理后台
            </Link>
          </li>
        )}
      </ul>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
        <AuthBar />
      </div>
    </header>
  );
}
