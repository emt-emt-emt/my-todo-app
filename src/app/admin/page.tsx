"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../components/AuthProvider";
import Link from "next/link";

interface User {
  id: number;
  username: string;
  role: string;
  banned: boolean;
  createdAt: string;
}

interface Comment {
  id: number;
  username: string;
  characterId: string;
  content: string;
  createdAt: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "comments">("users");

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") {
      setError("无权限访问");
      setLoading(false);
      return;
    }
    fetchData();
  }, [user]);

  async function fetchData() {
    try {
      const [usersRes, commentsRes] = await Promise.all([
        fetch("/api/admin/users", { credentials: "include" }),
        fetch("/api/admin/comments", { credentials: "include" }),
      ]);
      if (usersRes.ok) setUsers((await usersRes.json()).users || []);
      if (commentsRes.ok) setComments((await commentsRes.json()).comments || []);
    } catch {
      setError("加载失败");
    } finally {
      setLoading(false);
    }
  }

  async function toggleBan(id: number, banned: boolean) {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, banned: !banned }),
        credentials: "include",
      });
      if (res.ok) fetchData();
    } catch {
      alert("操作失败");
    }
  }

  async function deleteUser(id: number) {
    if (!confirm("确定删除该用户？")) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) fetchData();
    } catch {
      alert("删除失败");
    }
  }

  async function deleteComment(id: number) {
    if (!confirm("确定删除这条评论？")) return;
    try {
      const res = await fetch(`/api/comments?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) fetchData();
    } catch {
      alert("删除失败");
    }
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="wrapin">
        <header className="clearfix">
          <Link href="/" className="logo">从零开始的异世界生活</Link>
        </header>
        <div style={{ padding: 40, textAlign: "center" }}>
          <h2>🚫 无权访问</h2>
          <p>此页面需要管理员权限</p>
          <Link href="/" style={{ color: "#598bd2" }}>返回首页</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wrapin">
      <header className="clearfix">
        <Link href="/" className="logo">从零开始的异世界生活</Link>
        <ul className="nav">
          <li><Link href="/">首页</Link></li>
          <li><Link href="/renwu">人物介绍</Link></li>
          <li><Link href="/tupian">图片鉴赏</Link></li>
        </ul>
      </header>

      <div className="in_com">
        <div className="title"><h2>🛠️ 管理后台</h2></div>

        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <button
            onClick={() => setActiveTab("users")}
            style={{
              padding: "8px 20px",
              background: activeTab === "users" ? "#598bd2" : "#eee",
              color: activeTab === "users" ? "#fff" : "#333",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            👥 用户管理 ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            style={{
              padding: "8px 20px",
              background: activeTab === "comments" ? "#598bd2" : "#eee",
              color: activeTab === "comments" ? "#fff" : "#333",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            💬 评论管理 ({comments.length})
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", padding: 40 }}>加载中...</p>
        ) : error ? (
          <p style={{ textAlign: "center", color: "red" }}>{error}</p>
        ) : activeTab === "users" ? (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#598bd2", color: "#fff" }}>
                <th style={{ padding: 10, textAlign: "left" }}>ID</th>
                <th style={{ padding: 10, textAlign: "left" }}>用户名</th>
                <th style={{ padding: 10, textAlign: "left" }}>角色</th>
                <th style={{ padding: 10, textAlign: "left" }}>状态</th>
                <th style={{ padding: 10, textAlign: "left" }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: 10 }}>{u.id}</td>
                  <td style={{ padding: 10 }}>{u.username}</td>
                  <td style={{ padding: 10 }}>
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: 10,
                      fontSize: 12,
                      background: u.role === "admin" ? "#e74c3c" : "#598bd2",
                      color: "#fff",
                    }}>
                      {u.role === "admin" ? "管理员" : "普通用户"}
                    </span>
                  </td>
                  <td style={{ padding: 10 }}>
                    <span style={{ color: u.banned ? "#e74c3c" : "#27ae60" }}>
                      {u.banned ? "🚫 已禁言" : "✅ 正常"}
                    </span>
                  </td>
                  <td style={{ padding: 10 }}>
                    <button
                      onClick={() => toggleBan(u.id, u.banned)}
                      style={{
                        padding: "4px 10px",
                        background: u.banned ? "#27ae60" : "#e74c3c",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 12,
                        marginRight: 5,
                      }}
                    >
                      {u.banned ? "解除禁言" : "禁言"}
                    </button>
                    {u.role !== "admin" && (
                      <button
                        onClick={() => deleteUser(u.id)}
                        style={{
                          padding: "4px 10px",
                          background: "#999",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                      >
                        删除
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>
            {comments.map((c) => (
              <div key={c.id} style={{ borderBottom: "1px solid #eee", padding: "10px 0" }}>
                <div style={{ fontSize: 14, color: "#598bd2", fontWeight: "bold" }}>
                  {c.username} 
                  <span style={{ fontSize: 12, color: "#999", fontWeight: "normal" }}>
                    在 {c.characterId} 
                    {new Date(c.createdAt).toLocaleString("zh-CN")}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: "#333", margin: "5px 0" }}>{c.content}</p>
                <button
                  onClick={() => deleteComment(c.id)}
                  style={{
                    padding: "4px 10px",
                    background: "#e74c3c",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  删除评论
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
