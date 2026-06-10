"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "../../../components/Header";
import { useAuth } from "../../../components/AuthProvider";

interface Arc {
  id: number;
  name: string;
  name_jp: string;
  volume_start: number;
  volume_end: number;
  summary: string;
  characters: string[];
}

interface ArcComment {
  id: number;
  username: string;
  content: string;
  createdAt: string;
}

interface ArcDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ArcDetailPage({ params }: ArcDetailPageProps) {
  const { id } = React.use(params);
  const { user } = useAuth();
  const [arc, setArc] = useState<Arc | null>(null);
  const [comments, setComments] = useState<ArcComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editNameJp, setEditNameJp] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editCharacters, setEditCharacters] = useState("");
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role === "admin";
  const arcId = Number(id);

  useEffect(() => {
    fetchArc();
    fetchComments();
  }, [arcId]);

  async function fetchArc() {
    try {
      const res = await fetch(`/api/arcs/${arcId}`);
      if (res.ok) {
        const data = await res.json();
        setArc(data.arc || null);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function fetchComments() {
    try {
      const res = await fetch(`/api/arc-comments?arcId=${arcId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch {
      // ignore
    }
  }

  function startEdit() {
    if (!arc) return;
    setEditName(arc.name);
    setEditNameJp(arc.name_jp);
    setEditSummary(arc.summary);
    setEditCharacters(arc.characters?.join(", ") || "");
    setEditing(true);
  }

  async function saveEdit() {
    if (!arc) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/arcs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: arc.id,
          name: editName,
          name_jp: editNameJp,
          summary: editSummary,
          characters: editCharacters.split(",").map((s) => s.trim()).filter(Boolean),
        }),
        credentials: "include",
      });
      if (res.ok) {
        setEditing(false);
        fetchArc();
      } else {
        alert("保存失败");
      }
    } catch {
      alert("保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!arc) return;
    if (!confirm("确定删除该剧情篇章？此操作不可撤销。")) return;
    try {
      const res = await fetch(`/api/admin/arcs?id=${arc.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        window.location.href = "/juqing";
      } else {
        alert("删除失败");
      }
    } catch {
      alert("删除失败");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/arc-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ arcId, content }),
        credentials: "include",
      });
      if (res.ok) {
        setContent("");
        fetchComments();
      } else {
        const data = await res.json();
        alert(data.error || "发送失败");
      }
    } catch {
      alert("网络错误");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="wrapin">
        <Header />
        <div className="in_com">
          <p style={{ textAlign: "center", padding: 40 }}>加载中...</p>
        </div>
      </div>
    );
  }

  if (!arc) {
    return (
      <div className="wrapin">
        <Header />
        <div className="in_com">
          <div style={{ textAlign: "center", padding: 60 }}>
            <h2>篇章不存在</h2>
            <Link href="/juqing" style={{ color: "#598bd2" }}>
              ← 返回剧情列表
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrapin">
      <Header />

      <div className="in_com">
        <div style={{ marginBottom: 20 }}>
          <Link href="/juqing" style={{ color: "#598bd2", fontSize: 14 }}>
            ← 返回剧情列表
          </Link>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 4,
            padding: 25,
            marginBottom: 20,
            border: "1px solid #eee",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h1 style={{ fontSize: 24, color: "#333", marginBottom: 8 }}>
              {arc.name}
            </h1>
            {isAdmin && (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => editing ? setEditing(false) : startEdit()}
                  style={{
                    padding: "6px 16px",
                    background: editing ? "#999" : "#598bd2",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  {editing ? "取消" : "✏️ 编辑"}
                </button>
                {!editing && (
                  <button
                    onClick={handleDelete}
                    style={{
                      padding: "6px 16px",
                      background: "#e74c3c",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 14,
                    }}
                  >
                    🗑️ 删除
                  </button>
                )}
              </div>
            )}
          </div>

          {editing ? (
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div>
                  <label>中文名</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{ width: "100%", padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
                  />
                </div>
                <div>
                  <label>日文名</label>
                  <input
                    type="text"
                    value={editNameJp}
                    onChange={(e) => setEditNameJp(e.target.value)}
                    style={{ width: "100%", padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label>简介</label>
                <textarea
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  rows={8}
                  style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #ccc" }}
                />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label>出场角色（逗号分隔）</label>
                <input
                  type="text"
                  value={editCharacters}
                  onChange={(e) => setEditCharacters(e.target.value)}
                  style={{ width: "100%", padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  style={{
                    padding: "6px 16px",
                    background: "#27ae60",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  {saving ? "保存中..." : "💾 保存"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  style={{
                    padding: "6px 16px",
                    background: "#999",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 14, color: "#999", marginBottom: 20 }}>
                {arc.name_jp} | 小说卷数: {arc.volume_start} ~ {arc.volume_end}
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.8, color: "#444", whiteSpace: "pre-wrap" }}>
                {arc.summary}
              </div>
              <div style={{ marginTop: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {arc.characters?.map((c) => (
                  <span
                    key={c}
                    style={{
                      fontSize: 12,
                      padding: "4px 12px",
                      background: "#f0f4fa",
                      color: "#598bd2",
                      borderRadius: 12,
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="title">
          <h2>💬 讨论 ({comments.length})</h2>
        </div>

        {user && (
          <form
            onSubmit={handleSubmit}
            style={{ background: "#f9f9f9", padding: 15, borderRadius: 4, marginBottom: 20 }}
          >
            <textarea
              placeholder="写下你对这个篇章的看法..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              maxLength={500}
              required
              style={{
                width: "100%",
                padding: 10,
                border: "1px solid #ddd",
                borderRadius: 4,
                resize: "vertical",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 8,
              }}
            >
              <span style={{ fontSize: 12, color: "#999" }}>{content.length}/500</span>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "6px 18px",
                  background: "#598bd2",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? "发送中..." : "发表评论"}
              </button>
            </div>
          </form>
        )}

        {comments.length === 0 ? (
          <p style={{ color: "#999", textAlign: "center", padding: 30 }}>
            还没有讨论，快来发表第一个评论吧！
          </p>
        ) : (
          <div>
            {comments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  background: "#fff",
                  borderRadius: 4,
                  padding: 15,
                  marginBottom: 10,
                  border: "1px solid #eee",
                }}
              >
                <div style={{ fontSize: 14, color: "#598bd2", fontWeight: "bold", marginBottom: 4 }}>
                  @{comment.username}
                  <span style={{ fontSize: 12, color: "#999", fontWeight: "normal", marginLeft: 8 }}>
                    {new Date(comment.createdAt).toLocaleString("zh-CN")}
                  </span>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "#333" }}>
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer>
        <p>
          <a href="https://www.bilibili.com/bangumi/media/md28224394" target="_blank">
            <strong>【B站】Re:从零开始的异世界生活 在线观看</strong>
          </a>
        </p>
      </footer>
    </div>
  );
}
