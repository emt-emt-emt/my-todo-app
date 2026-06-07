"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "../../../components/Header";
import { useAuth } from "../../../components/AuthProvider";

interface Post {
  id: number;
  username: string;
  title: string;
  content: string;
  createdAt: string;
}

interface Reply {
  id: number;
  username: string;
  content: string;
  createdAt: string;
}

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = React.use(params);
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const postId = Number(id);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  async function fetchPost() {
    try {
      const res = await fetch(`/api/posts/${postId}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data.post || null);
        setReplies(data.replies || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content }),
        credentials: "include",
      });
      if (res.ok) {
        setContent("");
        fetchPost();
      } else {
        const data = await res.json();
        alert(data.error || "回复失败");
      }
    } catch {
      alert("网络错误");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteReply(replyId: number) {
    if (!confirm("确定删除此回复？")) return;
    try {
      const res = await fetch(`/api/replies?id=${replyId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) fetchPost();
    } catch {
      alert("删除失败");
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

  if (!post) {
    return (
      <div className="wrapin">
        <Header />
        <div className="in_com">
          <div style={{ textAlign: "center", padding: 60 }}>
            <h2>帖子不存在或已被删除</h2>
            <Link href="/forum" style={{ color: "#598bd2" }}>
              ← 返回论坛
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
          <Link href="/forum" style={{ color: "#598bd2", fontSize: 14 }}>
            ← 返回论坛
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
          <h1 style={{ fontSize: 22, color: "#333", marginBottom: 15 }}>{post.title}</h1>
          <div
            style={{
              fontSize: 12,
              color: "#999",
              marginBottom: 20,
              paddingBottom: 15,
              borderBottom: "1px solid #eee",
            }}
          >
            <span style={{ color: "#598bd2", fontWeight: "bold" }}>@{post.username}</span>
            <span style={{ marginLeft: 10 }}>
              {new Date(post.createdAt).toLocaleString("zh-CN")}
            </span>
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.8, color: "#444", whiteSpace: "pre-wrap" }}>
            {post.content}
          </div>
        </div>

        <div className="title">
          <h2>💬 回复 ({replies.length})</h2>
        </div>

        {user && (
          <form
            onSubmit={handleSubmit}
            style={{ background: "#f9f9f9", padding: 15, borderRadius: 4, marginBottom: 20 }}
          >
            <textarea
              placeholder="写下你的回复..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              maxLength={1000}
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
              <span style={{ fontSize: 12, color: "#999" }}>{content.length}/1000</span>
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
                {submitting ? "发送中..." : "回复"}
              </button>
            </div>
          </form>
        )}

        {replies.length === 0 ? (
          <p style={{ color: "#999", textAlign: "center", padding: 30 }}>
            还没有回复，快来抢沙发吧！
          </p>
        ) : (
          <div>
            {replies.map((reply) => (
              <div
                key={reply.id}
                style={{
                  background: "#fff",
                  borderRadius: 4,
                  padding: 15,
                  marginBottom: 10,
                  border: "1px solid #eee",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: "#598bd2", fontWeight: "bold", marginBottom: 4 }}>
                      @{reply.username}
                      <span style={{ fontSize: 12, color: "#999", fontWeight: "normal", marginLeft: 8 }}>
                        {new Date(reply.createdAt).toLocaleString("zh-CN")}
                      </span>
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: "#333" }}>
                      {reply.content}
                    </p>
                  </div>
                  {user?.role === "admin" && (
                    <button
                      onClick={() => handleDeleteReply(reply.id)}
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
