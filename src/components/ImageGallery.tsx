"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";

interface Section {
  id: number;
  name: string;
  description: string;
}

interface Image {
  id: number;
  username: string;
  url: string;
  description: string;
  createdAt: string;
}

export function ImageGallery() {
  const { user } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [activeSection, setActiveSection] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSections();
    fetchImages();
  }, []);

  useEffect(() => {
    fetchImages();
  }, [activeSection]);

  async function fetchSections() {
    const res = await fetch("/api/sections");
    if (res.ok) {
      const data = await res.json();
      setSections(data.sections || []);
    }
  }

  async function fetchImages() {
    const res = await fetch(`/api/images?sectionId=${activeSection}`);
    if (res.ok) {
      const data = await res.json();
      setImages(data.images || []);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId: activeSection, url, description }),
        credentials: "include",
      });
      if (res.ok) {
        setUrl("");
        setDescription("");
        setShowAdd(false);
        fetchImages();
      } else {
        alert("添加失败，请检查是否登录或被禁言");
      }
    } catch {
      alert("网络错误");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("确定删除这张图片？")) return;
    try {
      const res = await fetch(`/api/images?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) fetchImages();
    } catch {
      alert("删除失败");
    }
  }

  return (
    <div>
      {/* 分区标签 */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            style={{
              padding: "8px 16px",
              border: activeSection === s.id ? "2px solid #598bd2" : "1px solid #ddd",
              background: activeSection === s.id ? "#598bd2" : "#fff",
              color: activeSection === s.id ? "#fff" : "#333",
              borderRadius: 20,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
        <p style={{ color: "#666", fontSize: 14 }}>
          {sections.find((s) => s.id === activeSection)?.description}
        </p>
        {user && (
          <button
            onClick={() => setShowAdd(!showAdd)}
            style={{
              padding: "6px 14px",
              background: "#598bd2",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            {showAdd ? "取消" : "添加图片"}
          </button>
        )}
      </div>

      {/* 添加图片表单 */}
      {showAdd && (
        <form
          onSubmit={handleSubmit}
          style={{ background: "#f9f9f9", padding: 15, borderRadius: 4, marginBottom: 20 }}
        >
          <div style={{ marginBottom: 10 }}>
            <input
              type="url"
              placeholder="图片 URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              style={{ width: "100%", padding: 8, border: "1px solid #ddd", borderRadius: 4 }}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <input
              type="text"
              placeholder="图片描述（可选）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: "100%", padding: 8, border: "1px solid #ddd", borderRadius: 4 }}
            />
          </div>
          <div style={{ fontSize: 12, color: "#999", marginBottom: 10 }}>
            提示：请粘贴图片链接（如 imgur、图床等），暂不支持本地上传
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
            {loading ? "添加中..." : "添加"}
          </button>
        </form>
      )}

      {/* 图片网格 */}
      <ul className="pic_con clearfix">
        {images.map((img) => (
          <li key={img.id}>
            <div className="box" style={{ position: "relative" }}>
              <img src={img.url} alt={img.description} />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  padding: "4px 8px",
                  fontSize: 12,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>{img.description || "无描述"}</span>
                <span>by {img.username}</span>
              </div>
              {user?.role === "admin" && (
                <button
                  onClick={() => handleDelete(img.id)}
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    background: "#e74c3c",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    padding: "2px 8px",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  删除
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
