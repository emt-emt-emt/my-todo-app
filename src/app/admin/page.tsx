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
  userId: number;
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

  const [userBannedMap, setUserBannedMap] = useState<Map<number, boolean>>(new Map());

  useEffect(() => {
    const map = new Map<number, boolean>();
    users.forEach(u => map.set(u.id, u.banned));
    setUserBannedMap(map);
  }, [users]);

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

  async function banUserFromComment(userId: number) {
    const banned = userBannedMap.get(userId) || false;
    await toggleBan(userId, banned);
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
        <header className="clearfix" style={{ background: "#1a1a2e" }}>
          <Link href="/" className="logo" style={{ color: "#fff" }}>从零开始的异世界生活</Link>
        </header>
        <div style={{ padding: 40, textAlign: "center" }}>
          <h2>🚫 无权访问</h2>
          <p>此页面需要管理员权限</p>
          <Link href="/" style={{ color: "#598bd2" }}>返回首页</Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "users" as const, label: "用户管理", icon: "👥", count: users.length, color: "#4a90d9" },
    { id: "comments" as const, label: "评论管理", icon: "💬", count: comments.length, color: "#e8913a" },
    { id: "arcs" as const, label: "剧情管理", icon: "📖", count: arcs.length, color: "#27ae60" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      {/* 顶部导航栏 */}
      <header style={{
        background: "#1a1a2e",
        color: "#fff",
        padding: "0 24px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ color: "#fff", textDecoration: "none", fontSize: 16, fontWeight: "bold" }}>
            🏠 从零开始的异世界生活
          </Link>
          <span style={{ color: "#666", fontSize: 14 }}>|</span>
          <span style={{ color: "#e8913a", fontSize: 14, fontWeight: "bold" }}>🛠️ 管理后台</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14 }}>
          {user && (
            <span style={{ color: "#aaa" }}>
              👤 {user.username} <span style={{ color: "#e8913a", fontSize: 12 }}>[管理员]</span>
            </span>
          )}
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
        {/* 统计卡片 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? tab.color : "#fff",
                color: activeTab === tab.id ? "#fff" : "#333",
                padding: "20px 24px",
                borderRadius: 12,
                cursor: "pointer",
                boxShadow: activeTab === tab.id
                  ? `0 4px 12px ${tab.color}40`
                  : "0 2px 8px rgba(0,0,0,0.06)",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: activeTab === tab.id ? "none" : "1px solid #e8e8e8",
              }}
            >
              <div>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{tab.icon}</div>
                <div style={{ fontSize: 14, opacity: 0.9 }}>{tab.label}</div>
              </div>
              <div style={{ fontSize: 32, fontWeight: "bold" }}>{tab.count}</div>
            </div>
          ))}
        </div>

        {/* 内容区域 */}
        <div style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}>
          {/* 标题栏 */}
          <div style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <h2 style={{ margin: 0, fontSize: 18, color: "#333" }}>
              {tabs.find(t => t.id === activeTab)?.icon} {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            {activeTab === "arcs" && (
              <button
                onClick={() => setEditingArc({ ...emptyArcForm })}
                style={{
                  padding: "8px 16px",
                  background: "#27ae60",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                ➕ 新增剧情
              </button>
            )}
          </div>

          <div style={{ padding: "0 24px 24px" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: 60, color: "#999" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                <div>加载中...</div>
              </div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: 40, color: "#e74c3c" }}>⚠️ {error}</div>
            ) : activeTab === "users" ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                      <th style={{ padding: "14px 12px", textAlign: "left", color: "#666", fontWeight: 600, fontSize: 13 }}>ID</th>
                      <th style={{ padding: "14px 12px", textAlign: "left", color: "#666", fontWeight: 600, fontSize: 13 }}>用户名</th>
                      <th style={{ padding: "14px 12px", textAlign: "left", color: "#666", fontWeight: 600, fontSize: 13 }}>角色</th>
                      <th style={{ padding: "14px 12px", textAlign: "left", color: "#666", fontWeight: 600, fontSize: 13 }}>状态</th>
                      <th style={{ padding: "14px 12px", textAlign: "left", color: "#666", fontWeight: 600, fontSize: 13 }}>注册时间</th>
                      <th style={{ padding: "14px 12px", textAlign: "left", color: "#666", fontWeight: 600, fontSize: 13 }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, idx) => (
                      <tr
                        key={u.id}
                        style={{
                          borderBottom: "1px solid #f5f5f5",
                          background: idx % 2 === 0 ? "#fff" : "#fafbfc",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f5ff")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fafbfc")}
                      >
                        <td style={{ padding: "14px 12px", color: "#999" }}>#{u.id}</td>
                        <td style={{ padding: "14px 12px", fontWeight: 500, color: "#333" }}>{u.username}</td>
                        <td style={{ padding: "14px 12px" }}>
                          <span style={{
                            padding: "4px 10px",
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 500,
                            background: u.role === "admin" ? "#fef2f2" : "#eff6ff",
                            color: u.role === "admin" ? "#e74c3c" : "#4a90d9",
                            border: `1px solid ${u.role === "admin" ? "#fecaca" : "#dbeafe"}`,
                          }}>
                            {u.role === "admin" ? "🔴 管理员" : "🔵 普通用户"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            color: u.banned ? "#e74c3c" : "#27ae60",
                            fontWeight: 500,
                          }}>
                            <span style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: u.banned ? "#e74c3c" : "#27ae60",
                              display: "inline-block",
                            }} />
                            {u.banned ? "已禁言" : "正常"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 12px", color: "#999", fontSize: 13 }}>
                          {new Date(u.createdAt).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          <button
                            onClick={() => toggleBan(u.id, u.banned)}
                            style={{
                              padding: "6px 12px",
                              background: u.banned ? "#dcfce7" : "#fef2f2",
                              color: u.banned ? "#16a34a" : "#e74c3c",
                              border: "none",
                              borderRadius: 6,
                              cursor: "pointer",
                              fontSize: 12,
                              fontWeight: 500,
                              marginRight: 8,
                              transition: "all 0.2s",
                            }}
                          >
                            {u.banned ? "✅ 解除" : "🚫 禁言"}
                          </button>
                          {u.role !== "admin" && (
                            <button
                              onClick={() => deleteUser(u.id)}
                              style={{
                                padding: "6px 12px",
                                background: "#f3f4f6",
                                color: "#666",
                                border: "none",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontSize: 12,
                                transition: "all 0.2s",
                              }}
                            >
                              🗑️ 删除
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : activeTab === "comments" ? (
              <div>
                {comments.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 60, color: "#999" }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
                    <div>暂无评论</div>
                  </div>
                ) : (
                  comments.map((c, idx) => (
                    <div
                      key={c.id}
                      style={{
                        padding: "16px 20px",
                        borderBottom: "1px solid #f5f5f5",
                        background: idx % 2 === 0 ? "#fff" : "#fafbfc",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f5ff")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fafbfc")}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "#4a90d9" }}>@{c.username}</span>
                            <span style={{ fontSize: 12, color: "#999" }}>
                              在 <span style={{ color: "#666" }}>{c.characterId}</span>
                            </span>
                            <span style={{ fontSize: 12, color: "#ccc" }}>•</span>
                            <span style={{ fontSize: 12, color: "#999" }}>
                              {new Date(c.createdAt).toLocaleString("zh-CN")}
                            </span>
                          </div>
                          <p style={{ fontSize: 14, color: "#444", lineHeight: 1.6, margin: 0 }}>{c.content}</p>
                        </div>
                        <button
                          onClick={() => deleteComment(c.id)}
                          style={{
                            padding: "6px 12px",
                            background: "#fef2f2",
                            color: "#e74c3c",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#e74c3c";
                            e.currentTarget.style.color = "#fff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#fef2f2";
                            e.currentTarget.style.color = "#e74c3c";
                          }}
                        >
                          🗑️ 删除
                        </button>
                        <button
                          onClick={() => banUserFromComment(c.userId)}
                          style={{
                            padding: "6px 12px",
                            background: userBannedMap.get(c.userId) ? "#dcfce7" : "#fef2f2",
                            color: userBannedMap.get(c.userId) ? "#16a34a" : "#e74c3c",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                            transition: "all 0.2s",
                            marginTop: 6,
                          }}
                          onMouseEnter={(e) => {
                            if (userBannedMap.get(c.userId)) {
                              e.currentTarget.style.background = "#16a34a";
                            } else {
                              e.currentTarget.style.background = "#e74c3c";
                            }
                            e.currentTarget.style.color = "#fff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = userBannedMap.get(c.userId) ? "#dcfce7" : "#fef2f2";
                            e.currentTarget.style.color = userBannedMap.get(c.userId) ? "#16a34a" : "#e74c3c";
                          }}
                        >
                          {userBannedMap.get(c.userId) ? "✅ 解除禁言" : "🚫 禁言用户"}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div>
                {editingArc && (
                  <div style={{
                    background: "#fafbfc",
                    padding: 24,
                    borderRadius: 12,
                    margin: "20px 0",
                    border: "1px solid #e8e8e8",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid #27ae60" }}>
                      <h3 style={{ margin: 0, fontSize: 18, color: "#333" }}>
                        {editingArc.id ? "✏️ 编辑剧情" : "➕ 新增剧情"}
                      </h3>
                      <button
                        onClick={() => setEditingArc(null)}
                        style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#999" }}
                      >
                        ✕
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 18 }}>
                      <div>
                        <label style={{ display: "block", fontWeight: 600, color: "#333", marginBottom: 6, fontSize: 13 }}>📛 中文名</label>
                        <input
                          type="text"
                          value={editingArc.name}
                          onChange={(e) => setEditingArc({ ...editingArc, name: e.target.value })}
                          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 14, background: "#fff" }}
                          placeholder="如：王选篇"
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontWeight: 600, color: "#333", marginBottom: 6, fontSize: 13 }}>🇯🇵 日文名</label>
                        <input
                          type="text"
                          value={editingArc.name_jp}
                          onChange={(e) => setEditingArc({ ...editingArc, name_jp: e.target.value })}
                          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 14, background: "#fff" }}
                          placeholder="如：王選編"
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontWeight: 600, color: "#333", marginBottom: 6, fontSize: 13 }}>📖 起始卷</label>
                        <input
                          type="number"
                          value={editingArc.volume_start}
                          onChange={(e) => setEditingArc({ ...editingArc, volume_start: Number(e.target.value) })}
                          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 14, background: "#fff" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontWeight: 600, color: "#333", marginBottom: 6, fontSize: 13 }}>📖 结束卷</label>
                        <input
                          type="number"
                          value={editingArc.volume_end}
                          onChange={(e) => setEditingArc({ ...editingArc, volume_end: Number(e.target.value) })}
                          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 14, background: "#fff" }}
                        />
                      </div>
                    </div>
                    <div style={{ marginBottom: 18 }}>
                      <label style={{ display: "block", fontWeight: 600, color: "#333", marginBottom: 6, fontSize: 13 }}>📝 简介</label>
                      <textarea
                        value={editingArc.summary}
                        onChange={(e) => setEditingArc({ ...editingArc, summary: e.target.value })}
                        style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ddd", fontSize: 14, lineHeight: 1.6, minHeight: 100, resize: "vertical", background: "#fff" }}
                        placeholder="剧情简介..."
                      />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                      <label style={{ display: "block", fontWeight: 600, color: "#333", marginBottom: 6, fontSize: 13 }}>👥 出场角色（逗号分隔）</label>
                      <div style={{ fontSize: 12, color: "#999", marginBottom: 6 }}>输入角色名，用逗号分隔，如：菜月昴, 爱蜜莉雅, 雷姆</div>
                      <input
                        type="text"
                        value={editingArc.characters}
                        onChange={(e) => setEditingArc({ ...editingArc, characters: e.target.value })}
                        style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 14, background: "#fff" }}
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
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: 14,
                          fontWeight: 600,
                          boxShadow: "0 2px 8px rgba(39,174,96,0.3)",
                        }}
                      >
                        💾 保存
                      </button>
                      <button
                        onClick={() => setEditingArc(null)}
                        style={{
                          padding: "10px 24px",
                          background: "#fff",
                          color: "#666",
                          border: "1px solid #ddd",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: 14,
                        }}
                      >
                        ❌ 取消
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                        <th style={{ padding: "14px 12px", textAlign: "left", color: "#666", fontWeight: 600, fontSize: 13 }}>ID</th>
                        <th style={{ padding: "14px 12px", textAlign: "left", color: "#666", fontWeight: 600, fontSize: 13 }}>中文名</th>
                        <th style={{ padding: "14px 12px", textAlign: "left", color: "#666", fontWeight: 600, fontSize: 13 }}>日文名</th>
                        <th style={{ padding: "14px 12px", textAlign: "left", color: "#666", fontWeight: 600, fontSize: 13 }}>卷数</th>
                        <th style={{ padding: "14px 12px", textAlign: "left", color: "#666", fontWeight: 600, fontSize: 13 }}>简介</th>
                        <th style={{ padding: "14px 12px", textAlign: "left", color: "#666", fontWeight: 600, fontSize: 13 }}>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {arcs.map((a, idx) => (
                        <tr
                          key={a.id}
                          style={{
                            borderBottom: "1px solid #f5f5f5",
                            background: idx % 2 === 0 ? "#fff" : "#fafbfc",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f5ff")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fafbfc")}
                        >
                          <td style={{ padding: "14px 12px", color: "#999" }}>#{a.id}</td>
                          <td style={{ padding: "14px 12px", fontWeight: 500, color: "#333" }}>{a.name}</td>
                          <td style={{ padding: "14px 12px", color: "#666", fontSize: 13 }}>{a.name_jp}</td>
                          <td style={{ padding: "14px 12px" }}>
                            <span style={{
                              padding: "4px 8px",
                              background: "#eff6ff",
                              color: "#4a90d9",
                              borderRadius: 4,
                              fontSize: 12,
                              fontWeight: 500,
                            }}>
                              第{a.volume_start}-{a.volume_end}卷
                            </span>
                          </td>
                          <td style={{ padding: "14px 12px", color: "#666", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13 }}>
                            {a.summary}
                          </td>
                          <td style={{ padding: "14px 12px" }}>
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
                                padding: "6px 12px",
                                background: "#eff6ff",
                                color: "#4a90d9",
                                border: "none",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 500,
                                marginRight: 8,
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#4a90d9";
                                e.currentTarget.style.color = "#fff";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#eff6ff";
                                e.currentTarget.style.color = "#4a90d9";
                              }}
                            >
                              ✏️ 编辑
                            </button>
                            <button
                              onClick={() => deleteArc(a.id)}
                              style={{
                                padding: "6px 12px",
                                background: "#fef2f2",
                                color: "#e74c3c",
                                border: "none",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 500,
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#e74c3c";
                                e.currentTarget.style.color = "#fff";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#fef2f2";
                                e.currentTarget.style.color = "#e74c3c";
                              }}
                            >
                              🗑️ 删除
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
