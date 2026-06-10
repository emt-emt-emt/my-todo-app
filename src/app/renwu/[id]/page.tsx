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
              <div style={{ background: "#f8f9fa", padding: 20, borderRadius: 8, marginBottom: 20 }}>
                <h3>编辑角色</h3>
                <div style={{ marginBottom: 10 }}>
                  <label>简介</label>
                  <textarea
                    value={editIntro}
                    onChange={(e) => setEditIntro(e.target.value)}
                    rows={6}
                    style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #ccc" }}
                  />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label>信息（info JSON）</label>
                  <textarea
                    value={editInfo}
                    onChange={(e) => setEditInfo(e.target.value)}
                    rows={8}
                    style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #ccc", fontFamily: "monospace" }}
                  />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label>章节（sections JSON 数组）</label>
                  <textarea
                    value={editSections}
                    onChange={(e) => setEditSections(e.target.value)}
                    rows={8}
                    style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #ccc", fontFamily: "monospace" }}
                  />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label>趣闻（trivias JSON 数组）</label>
                  <textarea
                    value={editTrivias}
                    onChange={(e) => setEditTrivias(e.target.value)}
                    rows={6}
                    style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #ccc", fontFamily: "monospace" }}
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
