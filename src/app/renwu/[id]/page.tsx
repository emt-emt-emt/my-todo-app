"use client";

import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    fetchCharacter();
  }, [id]);

  async function fetchCharacter() {
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
