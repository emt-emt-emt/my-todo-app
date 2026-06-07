"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Header } from "../../components/Header";
import { useAuth } from "../../components/AuthProvider";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [avatar, setAvatar] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/user/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.user?.avatar) setAvatar(data.user.avatar);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (user) fetchUser();
  }, [user, fetchUser]);

  async function handleUpdateAvatar(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: avatar.trim() || null }),
        credentials: "include",
      });
      if (res.ok) {
        setMessage("头像更新成功！");
        refreshUser();
      } else {
        const data = await res.json();
        setError(data.error || "更新失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");
    if (password.length < 4) {
      setError("密码至少4位");
      return;
    }
    if (password !== confirmPassword) {
      setError("两次密码不一致");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include",
      });
      if (res.ok) {
        setMessage("密码修改成功！");
        setPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        setError(data.error || "修改失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="wrapin">
        <Header />
        <div className="in_com">
          <div style={{ textAlign: "center", padding: 60 }}>
            <h2>请先登录</h2>
            <p style={{ color: "#999" }}>登录后才能修改个人信息</p>
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
          <Link href="/" style={{ color: "#598bd2", fontSize: 14 }}>
            ← 返回首页
          </Link>
        </div>

        <div className="title">
          <h2>⚙️ 用户设置</h2>
        </div>

        {(message || error) && (
          <div
            style={{
              padding: 12,
              borderRadius: 4,
              marginBottom: 20,
              background: error ? "#ffe6e6" : "#e6f7ff",
              color: error ? "#c00" : "#0066cc",
              fontSize: 14,
            }}
          >
            {error || message}
          </div>
        )}

        <div
          style={{
            background: "#fff",
            borderRadius: 4,
            padding: 25,
            marginBottom: 20,
            border: "1px solid #eee",
          }}
        >
          <h3 style={{ marginBottom: 15, color: "#333" }}>头像设置</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 15 }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid #ddd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f5f5f5",
              }}
            >
              {avatar || user.avatar ? (
                <img
                  src={avatar || user.avatar}
                  alt="avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: 40 }}>👤</span>
              )}
            </div>
            <div>
              <p style={{ fontSize: 14, color: "#666" }}>
                输入图片URL作为头像，支持 jpg/png/gif
              </p>
            </div>
          </div>
          <form onSubmit={handleUpdateAvatar}>
            <input
              type="url"
              placeholder="https://example.com/avatar.jpg"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                border: "1px solid #ddd",
                borderRadius: 4,
                marginBottom: 10,
              }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "8px 20px",
                  background: "#598bd2",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "保存中..." : "更新头像"}
              </button>
              {avatar && (
                <button
                  type="button"
                  onClick={() => {
                    setAvatar("");
                    handleUpdateAvatar({ preventDefault: () => {} } as any);
                  }}
                  style={{
                    padding: "8px 20px",
                    background: "#eee",
                    color: "#666",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                >
                  清除头像
                </button>
              )}
            </div>
          </form>
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
          <h3 style={{ marginBottom: 15, color: "#333" }}>修改密码</h3>
          <form onSubmit={handleUpdatePassword}>
            <div style={{ marginBottom: 10 }}>
              <input
                type="password"
                placeholder="新密码（至少4位）"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={4}
                style={{
                  width: "100%",
                  padding: 10,
                  border: "1px solid #ddd",
                  borderRadius: 4,
                }}
              />
            </div>
            <div style={{ marginBottom: 15 }}>
              <input
                type="password"
                placeholder="确认新密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: 10,
                  border: "1px solid #ddd",
                  borderRadius: 4,
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "8px 20px",
                background: "#598bd2",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "修改中..." : "修改密码"}
            </button>
          </form>
        </div>
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
