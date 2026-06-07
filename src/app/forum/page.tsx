"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Header } from "../../components/Header";
import { useAuth } from "../../components/AuthProvider";

interface Post {
  id: number;
  username: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function ForumPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
        credentials: "include",
      });
      if (res.ok) {
        setTitle("");
        setContent("");
        setShowForm(false);
        fetchPosts();
      } else {
        const data = await res.json();
        alert(data.error || "发帖失败");
      }
    } catch {
      alert("网络错误");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("确定删除此帖子？")) return;
    try {
      const res = await fetch(`/api/posts?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) fetchPosts();
    } catch {
      alert("删除失败");
    }
  }

  return (
    <div className="wrapin">
      <Header active="forum" />

      <div className="in_com">
        <div className="title">
          <h2>💬 论坛</h2>
        </div>

        <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ color: "#666" }}>和大家一起讨论 Re:从零开始的异世界生活！</p>
          {user ? (
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                padding: "8px 20px",
                background: "#598bd2",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              {showForm ? "取消" : "📝 发布帖子"}
            </button>
          ) : (
            <p style={{ color: "#999", fontSize: 14 }}>请登录后发帖</p>
          )}
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            style={{ background: "#f9f9f9", padding: 20, borderRadius: 4, marginBottom: 20 }}
          >
            <div style={{ marginBottom: 10 }}>
              <input
                type="text"
                placeholder="帖子标题"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={100}
                style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 4, fontSize: 16 }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <textarea
                placeholder="帖子内容..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={6}
                maxLength={5000}
                style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 4, resize: "vertical" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#999" }}>{content.length}/5000</span>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "8px 24px",
                  background: "#598bd2",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? "发布中..." : "发布"}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p style={{ textAlign: "center", padding: 40 }}>加载中...</p>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, background: "#f9f9f9", borderRadius: 4 }}>
            <p style={{ fontSize: 18, color: "#999", marginBottom: 10 }}>还没有帖子</p>
            <p style={{ fontSize: 14, color: "#bbb" }}>快来发布第一个帖子吧！</p>
          </div>
        ) : (
          <div>
            {posts.map((post) => (
              <div
                key={post.id}
                style={{
                  background: "#fff",
                  borderRadius: 4,
                  padding: 20,
                  marginBottom: 15,
                  border: "1px solid #eee",
                  transition: "box-shadow 0.2s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Link
                    href={`/forum/${post.id}`}
                    style={{ textDecoration: "none", color: "inherit", flex: 1 }}
                  >
                    <h3 style={{ fontSize: 18, color: "#333", marginBottom: 8 }}>{post.title}</h3>
                    <p
                      style={{
                        fontSize: 14,
                        color: "#666",
                        lineHeight: 1.6,
                        marginBottom: 10,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {post.content}
                    </p>
                    <div style={{ fontSize: 12, color: "#999" }}>
                      <span style={{ color: "#598bd2", fontWeight: "bold" }}>@{post.username}</span>
                      <span style={{ marginLeft: 10 }}>
                        {new Date(post.createdAt).toLocaleString("zh-CN")}
                      </span>
                    </div>
                  </Link>
                  {user?.role === "admin" && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#e74c3c",
                        fontSize: 12,
                        cursor: "pointer",
                        marginLeft: 10,
                        whiteSpace: "nowrap",
                      }}
                    >
                      删除
                    </button>
                  )}
                </div>
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
