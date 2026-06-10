"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthProvider";

interface Comment {
  id: number;
  username: string;
  content: string;
  createdAt: string;
}

export function CommentSection({ characterId }: { characterId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/comments?characterId=${characterId}`)
      .then(res => {
        if (!res.ok || cancelled) return null;
        return res.json();
      })
      .then(data => {
        if (data && !cancelled) setComments(data.comments || []);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [characterId]);

  async function fetchComments() {
    try {
      const res = await fetch(`/api/comments?characterId=${characterId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch {
      // ignore
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId, content }),
        credentials: "include",
      });
      if (res.ok) {
        setContent("");
        fetchComments();
      } else {
        const data = await res.json();
        setError(data.error || "评论失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("确定删除这条评论？")) return;
    try {
      const res = await fetch(`/api/comments?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) fetchComments();
    } catch {
      alert("删除失败");
    }
  }

  return (
    <div className="section" style={{ background: "#fff", borderRadius: 4, padding: 20, marginTop: 15 }}>
      <h3>💬 评论</h3>

      {user ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: 15 }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的评论..."
            maxLength={500}
            rows={3}
            style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 4, resize: "vertical" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 5 }}>
            <span style={{ fontSize: 12, color: "#999" }}>{content.length}/500</span>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              style={{
                padding: "6px 16px",
                background: "#598bd2",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "发送中..." : "发表评论"}
            </button>
          </div>
          {error && <p style={{ color: "red", fontSize: 12, marginTop: 5 }}>{error}</p>}
        </form>
      ) : (
        <p style={{ color: "#999", marginBottom: 15 }}>请先登录后再发表评论</p>
      )}

      <div>
        {comments.length === 0 ? (
          <p style={{ color: "#999", textAlign: "center", padding: 20 }}>暂无评论，快来抢沙发吧！</p>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              style={{
                borderBottom: "1px solid #eee",
                padding: "10px 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: "#598bd2", fontWeight: "bold", marginBottom: 4 }}>
                  {c.username}
                  <span style={{ fontSize: 12, color: "#999", fontWeight: "normal", marginLeft: 8 }}>
                    {new Date(c.createdAt).toLocaleString("zh-CN")}
                  </span>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "#333" }}>{c.content}</p>
              </div>
              {user?.role === "admin" && (
                <button
                  onClick={() => handleDelete(c.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#e74c3c",
                    fontSize: 12,
                    cursor: "pointer",
                    marginLeft: 10,
                  }}
                >
                  删除
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
