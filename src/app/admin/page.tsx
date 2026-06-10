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

interface Arc {
  id: number;
  name: string;
  name_jp: string;
  volume_start: number;
  volume_end: number;
  summary: string;
  characters: string[];
  created_at: string;
}

const emptyArcForm = {
  id: 0,
  name: "",
  name_jp: "",
  volume_start: 1,
  volume_end: 1,
  summary: "",
  characters: "" as string,
};

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [arcs, setArcs] = useState<Arc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "comments" | "arcs">("users");
  const [editingArc, setEditingArc] = useState<typeof emptyArcForm | null>(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") return;
    fetchData();
    fetchArcs();
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

  async function fetchArcs() {
    try {
      const res = await fetch("/api/admin/arcs", { credentials: "include" });
      if (res.ok) setArcs((await res.json()).arcs || []);
    } catch {
      setError("加载剧情失败");
    }
  }

  async function saveArc() {
    if (!editingArc) return;
    const body = {
      ...editingArc,
      characters: editingArc.characters.split(",").map((s) => s.trim()).filter(Boolean),
    };
    try {
      const url = "/api/admin/arcs";
      const method = editingArc.id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
      if (res.ok) {
        setEditingArc(null);
        fetchArcs();
      } else {
        alert("保存失败");
      }
    } catch {
      alert("保存失败");
    }
  }

  async function deleteArc(id: number) {
    if (!confirm("确定删除该剧情篇章？")) return;
    try {
      const res = await fetch(`/api/admin/arcs?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) fetchArcs();
      else alert("删除失败");
    } catch {
      alert("删除失败");
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

  if (user && user.role !== "admin") {
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
          <button
            onClick={() => setActiveTab("arcs")}
            style={{
              padding: "8px 20px",
              background: activeTab === "arcs" ? "#598bd2" : "#eee",
              color: activeTab === "arcs" ? "#fff" : "#333",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            📖 剧情管理 ({arcs.length})
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
        ) : activeTab === "comments" ? (
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
        ) : (
          <div>
            <div style={{ marginBottom: 20 }}>
              <button
                onClick={() => setEditingArc({ ...emptyArcForm })}
                style={{
                  padding: "8px 20px",
                  background: "#27ae60",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                ➕ 新增剧情
              </button>
            </div>

            {editingArc && (
              <div style={{ background: "#f8f9fa", padding: 20, borderRadius: 8, marginBottom: 20, border: "1px solid #e0e0e0" }}>
                <div className="edit-form-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid #598bd2" }}>
                  <h3 style={{ margin: 0, fontSize: 18, color: "#333" }}>{editingArc.id ? "✏️ 编辑剧情" : "➕ 新增剧情"}</h3>
                  <button
                    onClick={() => setEditingArc(null)}
                    style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#999" }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginBottom: 18 }}>
                  <div>
                    <label style={{ display: "block", fontWeight: "bold", color: "#333", marginBottom: 6, fontSize: 14 }}>📛 中文名</label>
                    <input
                      type="text"
                      value={editingArc.name}
                      onChange={(e) => setEditingArc({ ...editingArc, name: e.target.value })}
                      style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ddd", fontSize: 14 }}
                      placeholder="如：王选篇"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: "bold", color: "#333", marginBottom: 6, fontSize: 14 }}>🇯🇵 日文名</label>
                    <input
                      type="text"
                      value={editingArc.name_jp}
                      onChange={(e) => setEditingArc({ ...editingArc, name_jp: e.target.value })}
                      style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ddd", fontSize: 14 }}
                      placeholder="如：王選編"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: "bold", color: "#333", marginBottom: 6, fontSize: 14 }}>📖 起始卷</label>
                    <input
                      type="number"
                      value={editingArc.volume_start}
                      onChange={(e) => setEditingArc({ ...editingArc, volume_start: Number(e.target.value) })}
                      style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ddd", fontSize: 14 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: "bold", color: "#333", marginBottom: 6, fontSize: 14 }}>📖 结束卷</label>
                    <input
                      type="number"
                      value={editingArc.volume_end}
                      onChange={(e) => setEditingArc({ ...editingArc, volume_end: Number(e.target.value) })}
                      style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ddd", fontSize: 14 }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", fontWeight: "bold", color: "#333", marginBottom: 6, fontSize: 14 }}>📝 简介</label>
                  <textarea
                    value={editingArc.summary}
                    onChange={(e) => setEditingArc({ ...editingArc, summary: e.target.value })}
                    style={{ width: "100%", padding: 12, borderRadius: 6, border: "1px solid #ddd", fontSize: 14, lineHeight: 1.6, minHeight: 80, resize: "vertical" }}
                    placeholder="剧情简介..."
                  />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", fontWeight: "bold", color: "#333", marginBottom: 6, fontSize: 14 }}>👥 出场角色（逗号分隔）</label>
                  <div style={{ fontSize: 12, color: "#999", marginBottom: 6 }}>输入角色名，用逗号分隔，如：菜月昴, 爱蜜莉雅, 雷姆</div>
                  <input
                    type="text"
                    value={editingArc.characters}
                    onChange={(e) => setEditingArc({ ...editingArc, characters: e.target.value })}
                    style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ddd", fontSize: 14 }}
                    placeholder="菜月昴, 爱蜜莉雅, 雷姆..."
                  />
                </div>
                <div style={{ display: "flex", gap: 12, paddingTop: 12, borderTop: "1px solid #eee" }}>
                  <button
                    onClick={saveArc}
                    style={{
                      padding: "10px 24px",
                      background: "#27ae60",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: "bold",
                    }}
                  >
                    💾 保存
                  </button>
                  <button
                    onClick={() => setEditingArc(null)}
                    style={{
                      padding: "10px 24px",
                      background: "#f0f0f0",
                      color: "#666",
                      border: "1px solid #ddd",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 14,
                    }}
                  >
                    ❌ 取消
                  </button>
                </div>
              </div>
            )}

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#598bd2", color: "#fff" }}>
                  <th style={{ padding: 10, textAlign: "left" }}>ID</th>
                  <th style={{ padding: 10, textAlign: "left" }}>中文名</th>
                  <th style={{ padding: 10, textAlign: "left" }}>日文名</th>
                  <th style={{ padding: 10, textAlign: "left" }}>卷数</th>
                  <th style={{ padding: 10, textAlign: "left" }}>简介</th>
                  <th style={{ padding: 10, textAlign: "left" }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {arcs.map((a) => (
                  <tr key={a.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: 10 }}>{a.id}</td>
                    <td style={{ padding: 10 }}>{a.name}</td>
                    <td style={{ padding: 10 }}>{a.name_jp}</td>
                    <td style={{ padding: 10 }}>第 {a.volume_start} - {a.volume_end} 卷</td>
                    <td style={{ padding: 10, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {a.summary}
                    </td>
                    <td style={{ padding: 10 }}>
                      <button
                        onClick={() => setEditingArc({
                          id: a.id,
                          name: a.name,
                          name_jp: a.name_jp,
                          volume_start: a.volume_start,
                          volume_end: a.volume_end,
                          summary: a.summary,
                          characters: Array.isArray(a.characters) ? a.characters.join(", ") : String(a.characters),
                        })}
                        style={{
                          padding: "4px 10px",
                          background: "#598bd2",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                          fontSize: 12,
                          marginRight: 5,
                        }}
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => deleteArc(a.id)}
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
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
