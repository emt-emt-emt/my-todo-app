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
            <span style={{ fontSize: 14 }}>{user.username} {user.role === "admin" && <span style={{ color: "#e8913a", fontSize: 12 }}>[管理员]</span>}</span>
          </Link>
          <button
            onClick={logout}
            style={{
              padding: "4px 12px",
              border: "1px solid rgba(255,255,255,0.4)",
              background: "transparent",
              color: "#fff",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 13,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            退出
          </button>
        </>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "6px 16px",
            border: "1px solid rgba(255,255,255,0.4)",
            background: "rgba(255,255,255,0.1)",
            color: "#fff",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
        >
          登录 / 注册
        </button>
      )}

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            animation: "fadeIn 0.3s ease",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              overflow: "hidden",
              width: 420,
              maxWidth: "90vw",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
              animation: "slideUp 0.3s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 顶部装饰条 */}
            <div style={{
              height: 4,
              background: "linear-gradient(90deg, #598bd2 0%, #7eb8da 50%, #e8913a 100%)",
            }} />

            {/* 关闭按钮 */}
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 16px 0" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  color: "#999",
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f0f0f0"; e.currentTarget.style.color = "#333"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#999"; }}
              >
                ✕
              </button>
            </div>

            {/* 标题区域 */}
            <div style={{ textAlign: "center", padding: "0 32px 24px" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🎭</div>
              <h2 style={{
                margin: 0,
                fontSize: 22,
                color: "#1a1a2e",
                fontWeight: 700,
                letterSpacing: 1,
              }}>
                {isLogin ? "欢迎回来" : "加入我们"}
              </h2>
              <p style={{
                margin: "8px 0 0",
                fontSize: 14,
                color: "#999",
              }}>
                {isLogin ? "登录以继续你的异世界之旅" : "创建账号，开启全新冒险"}
              </p>
            </div>

            {/* 登录/注册切换 */}
            <div style={{
              display: "flex",
              background: "#f5f7fa",
              borderRadius: 10,
              padding: 4,
              margin: "0 32px 24px",
            }}>
              <button
                onClick={() => { setIsLogin(true); setError(""); }}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  border: "none",
                  borderRadius: 8,
                  background: isLogin ? "#fff" : "transparent",
                  color: isLogin ? "#598bd2" : "#999",
                  fontWeight: isLogin ? 600 : 400,
                  fontSize: 14,
                  cursor: "pointer",
                  boxShadow: isLogin ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  transition: "all 0.2s",
                }}
              >
                登录
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(""); }}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  border: "none",
                  borderRadius: 8,
                  background: !isLogin ? "#fff" : "transparent",
                  color: !isLogin ? "#598bd2" : "#999",
                  fontWeight: !isLogin ? 600 : 400,
                  fontSize: 14,
                  cursor: "pointer",
                  boxShadow: !isLogin ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  transition: "all 0.2s",
                }}
              >
                注册
              </button>
            </div>

            {/* 表单 */}
            <form onSubmit={handleSubmit} style={{ padding: "0 32px 32px" }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#333",
                  marginBottom: 6,
                }}>
                  用户名
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 16,
                    color: "#bbb",
                  }}>👤</span>
                  <input
                    type="text"
                    placeholder="请输入用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={2}
                    style={{
                      width: "100%",
                      padding: "12px 12px 12px 40px",
                      border: "2px solid #f0f0f0",
                      borderRadius: 10,
                      fontSize: 14,
                      background: "#fafbfc",
                      transition: "all 0.2s",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#598bd2"; e.currentTarget.style.background = "#fff"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#f0f0f0"; e.currentTarget.style.background = "#fafbfc"; }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#333",
                  marginBottom: 6,
                }}>
                  密码
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 16,
                    color: "#bbb",
                  }}>🔒</span>
                  <input
                    type="password"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={4}
                    style={{
                      width: "100%",
                      padding: "12px 12px 12px 40px",
                      border: "2px solid #f0f0f0",
                      borderRadius: 10,
                      fontSize: 14,
                      background: "#fafbfc",
                      transition: "all 0.2s",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#598bd2"; e.currentTarget.style.background = "#fff"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#f0f0f0"; e.currentTarget.style.background = "#fafbfc"; }}
                  />
                </div>
              </div>

              {/* 错误提示 */}
              {error && (
                <div style={{
                  padding: "12px 16px",
                  borderRadius: 8,
                  background: error.includes("成功") ? "#f0fdf4" : "#fef2f2",
                  border: `1px solid ${error.includes("成功") ? "#bbf7d0" : "#fecaca"}`,
                  color: error.includes("成功") ? "#16a34a" : "#e74c3c",
                  fontSize: 13,
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}>
                  <span>{error.includes("成功") ? "✅" : "⚠️"}</span>
                  {error}
                </div>
              )}

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px 0",
                  background: "linear-gradient(135deg, #598bd2 0%, #7eb8da 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  transition: "all 0.2s",
                  boxShadow: "0 4px 14px rgba(89,139,210,0.35)",
                }}
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <span style={{
                      width: 16,
                      height: 16,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                      display: "inline-block",
                    }} />
                    处理中...
                  </span>
                ) : (
                  isLogin ? "立即登录" : "立即注册"
                )}
              </button>
            </form>

            {/* 底部提示 */}
            <div style={{
              padding: "16px 32px",
              borderTop: "1px solid #f0f0f0",
              textAlign: "center",
              fontSize: 13,
              color: "#999",
              background: "#fafbfc",
            }}>
              {isLogin ? "还没有账号？" : "已有账号？"}
              <button
                onClick={() => { setIsLogin(!isLogin); setError(""); }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#598bd2",
                  cursor: "pointer",
                  fontWeight: 600,
                  marginLeft: 4,
                  fontSize: 13,
                }}
              >
                {isLogin ? "去注册" : "去登录"}
              </button>
            </div>
          </div>

          <style jsx>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
