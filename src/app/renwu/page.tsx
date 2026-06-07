"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "../../components/Header";
import { useAuth } from "../../components/AuthProvider";

interface Character {
  id: string;
  name: string;
  image: string;
  intro: string;
}

export default function Renwu() {
  const { user } = useAuth();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    nameJp: "",
    alias: "",
    image: "",
    intro: "",
  });

  useEffect(() => {
    fetchCharacters();
  }, []);

  async function fetchCharacters() {
    try {
      const res = await fetch("/api/characters");
      if (res.ok) {
        const data = await res.json();
        setCharacters(data.characters || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.id || !formData.name || !formData.image || !formData.intro) {
      alert("请填写必填字段：ID、名称、图片URL、简介");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          info: {},
          sections: [],
          trivias: [],
        }),
        credentials: "include",
      });
      if (res.ok) {
        setFormData({ id: "", name: "", nameJp: "", alias: "", image: "", intro: "" });
        setShowForm(false);
        fetchCharacters();
      } else {
        const data = await res.json();
        alert(data.error || "添加失败");
      }
    } catch {
      alert("网络错误");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定删除此角色？")) return;
    try {
      const res = await fetch(`/api/characters?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) fetchCharacters();
    } catch {
      alert("删除失败");
    }
  }

  return (
    <div className="wrapin">
      <Header active="renwu" />

      <div className="banner">
        <img src="/images/character2.jpg" alt="人物介绍" />
      </div>

      <div className="in_com">
        <div className="title">
          <h2>人物介绍</h2>
        </div>

        <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ color: "#666" }}>Re:从零开始的异世界生活 主要角色介绍</p>
          {user && (
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
              {showForm ? "取消" : "➕ 新增人物"}
            </button>
          )}
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            style={{ background: "#f9f9f9", padding: 20, borderRadius: 4, marginBottom: 20 }}
          >
            <h3 style={{ marginBottom: 15, color: "#333" }}>新增角色</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <input
                type="text"
                placeholder="角色ID（英文，如 beatrice）"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                required
                style={{ padding: 8, border: "1px solid #ddd", borderRadius: 4 }}
              />
              <input
                type="text"
                placeholder="角色名称"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{ padding: 8, border: "1px solid #ddd", borderRadius: 4 }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <input
                type="text"
                placeholder="日文名（可选）"
                value={formData.nameJp}
                onChange={(e) => setFormData({ ...formData, nameJp: e.target.value })}
                style={{ padding: 8, border: "1px solid #ddd", borderRadius: 4 }}
              />
              <input
                type="text"
                placeholder="英文名/别名（可选）"
                value={formData.alias}
                onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                style={{ padding: 8, border: "1px solid #ddd", borderRadius: 4 }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <input
                type="url"
                placeholder="图片URL（如 /images/xxx.png 或外部链接）"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                required
                style={{ width: "100%", padding: 8, border: "1px solid #ddd", borderRadius: 4 }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <textarea
                placeholder="角色简介"
                value={formData.intro}
                onChange={(e) => setFormData({ ...formData, intro: e.target.value })}
                required
                rows={3}
                style={{ width: "100%", padding: 8, border: "1px solid #ddd", borderRadius: 4, resize: "vertical" }}
              />
            </div>
            <div style={{ fontSize: 12, color: "#999", marginBottom: 10 }}>
              提示：详细的人物信息（属性表、章节、趣闻）请在添加后到角色详情页编辑
            </div>
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
              {submitting ? "添加中..." : "添加角色"}
            </button>
          </form>
        )}

        {loading ? (
          <p style={{ textAlign: "center", padding: 40 }}>加载中...</p>
        ) : characters.length === 0 ? (
          <p style={{ textAlign: "center", padding: 40, color: "#999" }}>暂无角色数据</p>
        ) : (
          <ul className="renwu_box">
            {characters.map((char) => (
              <li key={char.id}>
                <Link href={`/renwu/${char.id}`} className="card_link">
                  <div className="pic">
                    <img src={char.image} alt={char.name} />
                  </div>
                  <div className="text">
                    <p><b>{char.name}</b><br />
                      {char.intro.substring(0, 80)}...<br />
                    </p>
                    <p><span className="more">点击查看详情 →</span></p>
                  </div>
                </Link>
                {user?.role === "admin" && (
                  <button
                    onClick={(e) => { e.preventDefault(); handleDelete(char.id); }}
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      background: "#e74c3c",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      padding: "4px 10px",
                      fontSize: 12,
                      cursor: "pointer",
                      zIndex: 10,
                    }}
                  >
                    删除
                  </button>
                )}
              </li>
            ))}
          </ul>
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
