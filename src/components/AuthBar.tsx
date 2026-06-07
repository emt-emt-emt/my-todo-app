"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";

export function AuthBar() {
  const { user, login, register, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        const ok = await login(username, password);
        if (!ok) setError("登录失败，用户名或密码错误");
        else setShowModal(false);
      } else {
        const result = await register(username, password);
        if (!result.ok) {
          setError(result.error || "注册失败，请重试");
        } else {
          setError("注册成功！请登录");
          setIsLogin(true);
        }
      }
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      {user ? (
        <>
          <Link
            href="/settings"
            style={{ color: "#fff", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="avatar"
                style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", border: "1px solid #fff" }}
              />
            ) : (
              <span style={{ fontSize: 20 }}>👤</span>
            )}
            <span>{user.username} {user.role === "admin" && "(管理员)"}</span>
          </Link>
          <button
            onClick={logout}
            style={{
              padding: "4px 12px",
              border: "1px solid #fff",
              background: "transparent",
              color: "#fff",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            退出
          </button>
        </>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "4px 12px",
            border: "1px solid #fff",
            background: "transparent",
            color: "#fff",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          登录 / 注册
        </button>
      )}

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{ background: "#fff", padding: 30, borderRadius: 8, minWidth: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: 15, color: "#333" }}>
              {isLogin ? "登录" : "注册"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 10 }}>
                <input
                  type="text"
                  placeholder="用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={2}
                  style={{ width: "100%", padding: 8, border: "1px solid #ddd", borderRadius: 4 }}
                />
              </div>
              <div style={{ marginBottom: 10 }}>
                <input
                  type="password"
                  placeholder="密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={4}
                  style={{ width: "100%", padding: 8, border: "1px solid #ddd", borderRadius: 4 }}
                />
              </div>
              {error && <p style={{ color: "red", fontSize: 12, marginBottom: 10 }}>{error}</p>}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: 10,
                  background: "#598bd2",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "处理中..." : isLogin ? "登录" : "注册"}
              </button>
            </form>
            <p style={{ marginTop: 10, textAlign: "center", fontSize: 12 }}>
              {isLogin ? "还没有账号？" : "已有账号？"}
              <button
                onClick={() => { setIsLogin(!isLogin); setError(""); }}
                style={{ background: "none", border: "none", color: "#598bd2", cursor: "pointer" }}
              >
                {isLogin ? "去注册" : "去登录"}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
