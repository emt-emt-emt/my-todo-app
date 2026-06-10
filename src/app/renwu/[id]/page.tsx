"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Header } from "../../../components/Header";
import { useAuth } from "../../../components/AuthProvider";
import { CommentSection } from "../../../components/CommentSection";
import { notFound } from "next/navigation";

interface Character {
  id: string;
  name: string;
  nameJp: string;
  alias: string;
  image: string;
  intro: string;
  info: Record<string, string>;
  sections: { title: string; content: string }[];
  trivias: string[];
}

interface CharacterPageProps {
  params: Promise<{ id: string }>;
}

export default function CharacterPage({ params }: CharacterPageProps) {
  const { id } = React.use(params);
  const { user } = useAuth();
  const [char, setChar] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editIntro, setEditIntro] = useState("");
  const [editInfo, setEditInfo] = useState("");
  const [editSections, setEditSections] = useState("");
  const [editTrivias, setEditTrivias] = useState("");
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role === "admin";

  const fetchCharacter = useCallback(async () => {
    try {
      const res = await fetch(`/api/characters/${id}`);
      if (res.ok) {
        const data = await res.json();
        setChar(data.character || null);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCharacter();
  }, [fetchCharacter]);

  function startEdit() {
    if (!char) return;
    setEditIntro(char.intro);
    setEditInfo(JSON.stringify(char.info, null, 2));
    setEditSections(JSON.stringify(char.sections, null, 2));
    setEditTrivias(JSON.stringify(char.trivias, null, 2));
    setEditing(true);
  }

  async function saveEdit() {
    if (!char) return;
    setSaving(true);
    try {
      let info: Record<string, string> = {};
      let sections: { title: string; content: string }[] = [];
      let trivias: string[] = [];
      try {
        info = JSON.parse(editInfo);
      } catch {
        alert("info JSON 格式错误");
        setSaving(false);
        return;
      }
      try {
        sections = JSON.parse(editSections);
      } catch {
        alert("sections JSON 格式错误");
        setSaving(false);
        return;
      }
      try {
        trivias = JSON.parse(editTrivias);
      } catch {
        alert("trivias JSON 格式错误");
        setSaving(false);
        return;
      }
      const res = await fetch(`/api/admin/characters/${char.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intro: editIntro, info, sections, trivias }),
        credentials: "include",
      });
      if (res.ok) {
        setEditing(false);
        fetchCharacter();
      } else {
        alert("保存失败");
      }
    } catch {
      alert("保存失败");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="wrapin">
        <Header active="renwu" />
        <div className="in_com">
          <p style={{ textAlign: "center", padding: 40 }}>加载中...</p>
        </div>
      </div>
    );
  }

  if (!char) {
    notFound();
  }

  return (
    <div className="wrapin">
      <Header active="renwu" />

      <div className="banner">
        <img src={char.image} alt={char.name} />
      </div>

      <div className="in_com">
        <div className="title">
          <h2>{char.name} {char.nameJp}</h2>
          {isAdmin && (
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
                marginLeft: 10,
              }}
            >
              {editing ? "取消" : "✏️ 编辑"}
            </button>
          )}
        </div>

        <div className="char_detail clearfix">
          <div className="char_info">
            <div className="info_pic">
              <img src={char.image} alt={char.name} />
            </div>
            <div className="info_table">
              <h3>角色信息</h3>
              <table>
                <tbody>
                  {Object.entries(char.info).map(([key, val]) => (
                    <tr key={key}>
                      <th>{key}</th>
                      <td>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="char_main">
            {editing ? (
              <div className="edit-form-wrap" style={{ flex: 1 }}>
                <div className="edit-form-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid #598bd2" }}>
                  <h3 style={{ margin: 0, fontSize: 18, color: "#333" }}>✏️ 编辑角色</h3>
                  <span style={{ fontSize: 12, color: "#999" }}>admin 专用</span>
                </div>

                <div className="edit-group" style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", fontWeight: "bold", color: "#333", marginBottom: 6, fontSize: 14 }}>📝 简介</label>
                  <textarea
                    value={editIntro}
                    onChange={(e) => setEditIntro(e.target.value)}
                    rows={5}
                    style={{ width: "100%", padding: 12, borderRadius: 6, border: "1px solid #ddd", fontSize: 14, lineHeight: 1.6, resize: "vertical" }}
                    placeholder="角色简介..."
                  />
                </div>

                <div className="edit-group" style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", fontWeight: "bold", color: "#333", marginBottom: 6, fontSize: 14 }}>📋 角色信息（JSON）</label>
                  <div style={{ fontSize: 12, color: "#999", marginBottom: 6 }}>{"格式：{\"年龄\": \"17岁\", \"生日\": \"4月1日\"}"}</div>
                  <textarea
                    value={editInfo}
                    onChange={(e) => setEditInfo(e.target.value)}
                    rows={8}
                    style={{ width: "100%", padding: 12, borderRadius: 6, border: "1px solid #ddd", fontSize: 13, fontFamily: "monospace", lineHeight: 1.5, resize: "vertical", background: "#fafbfc" }}
                  />
                </div>

                <div className="edit-group" style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", fontWeight: "bold", color: "#333", marginBottom: 6, fontSize: 14 }}>📖 章节（JSON 数组）</label>
                  <div style={{ fontSize: 12, color: "#999", marginBottom: 6 }}>{"格式：[{\"title\":\"...\",\"content\":\"...\"}]"}</div>
                  <textarea
                    value={editSections}
                    onChange={(e) => setEditSections(e.target.value)}
                    rows={8}
                    style={{ width: "100%", padding: 12, borderRadius: 6, border: "1px solid #ddd", fontSize: 13, fontFamily: "monospace", lineHeight: 1.5, resize: "vertical", background: "#fafbfc" }}
                  />
                </div>

                <div className="edit-group" style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", fontWeight: "bold", color: "#333", marginBottom: 6, fontSize: 14 }}>🎓 趣闻（JSON 数组）</label>
                  <div style={{ fontSize: 12, color: "#999", marginBottom: 6 }}>格式：["趣闻1", "趣闻2"]</div>
                  <textarea
                    value={editTrivias}
                    onChange={(e) => setEditTrivias(e.target.value)}
                    rows={6}
                    style={{ width: "100%", padding: 12, borderRadius: 6, border: "1px solid #ddd", fontSize: 13, fontFamily: "monospace", lineHeight: 1.5, resize: "vertical", background: "#fafbfc" }}
                  />
                </div>

                <div className="edit-actions" style={{ display: "flex", gap: 12, paddingTop: 12, borderTop: "1px solid #eee" }}>
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    style={{
                      padding: "10px 24px",
                      background: "#27ae60",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      cursor: saving ? "not-allowed" : "pointer",
                      fontSize: 14,
                      fontWeight: "bold",
                    }}
                  >
                    {saving ? "💾 保存中..." : "💾 保存修改"}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    style={{
                      padding: "10px 24px",
                      background: "#f0f0f0",
                      color: "#666",
                      border: "1px solid #ddd",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 14,
                    }}
                  >
                    ❌ 取消
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="intro">
                  <h3>简介</h3>
                  <p>{char.intro}</p>
                </div>

                {char.sections.map((section) => (
                  <div className="section" key={section.title}>
                    <h3>{section.title}</h3>
                    {section.content.split("\n\n").map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>
                ))}

                {char.trivias.length > 0 && (
                  <div className="section trivias">
                    <h3>🎓 你知道吗</h3>
                    <ul>
                      {char.trivias.map((trivia, idx) => (
                        <li key={idx}>{trivia}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            <div className="back">
              <Link href="/renwu">← 返回人物列表</Link>
            </div>
          </div>
        </div>

        <CommentSection characterId={id} />
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
