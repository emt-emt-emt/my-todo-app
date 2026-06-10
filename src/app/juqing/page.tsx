"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "../../components/Header";

interface Arc {
  id: number;
  name: string;
  name_jp: string;
  volume_start: number;
  volume_end: number;
  summary: string;
  characters: string[];
}

export default function JuqingPage() {
  const [arcs, setArcs] = useState<Arc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/arcs")
      .then(res => {
        if (!res.ok || cancelled) return null;
        return res.json();
      })
      .then(data => {
        if (data && !cancelled) setArcs(data.arcs || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <div className="wrapin">
      <Header active="juqing" />

      <div className="in_com">
        <div className="title">
          <h2>📖 剧情篇章</h2>
        </div>

        <p style={{ color: "#666", marginBottom: 20 }}>
          Re:从零开始的异世界生活 各篇章剧情概要（截至最新小说）
        </p>

        {loading ? (
          <p style={{ textAlign: "center", padding: 40 }}>加载中...</p>
        ) : arcs.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, background: "#f9f9f9", borderRadius: 4 }}>
            <p style={{ fontSize: 18, color: "#999" }}>暂无剧情数据</p>
          </div>
        ) : (
          <div>
            {arcs.map((arc) => (
              <div
                key={arc.id}
                style={{
                  background: "#fff",
                  borderRadius: 4,
                  padding: 20,
                  marginBottom: 15,
                  border: "1px solid #eee",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Link href={`/juqing/${arc.id}`} style={{ textDecoration: "none", color: "inherit", flex: 1 }}>
                    <h3 style={{ fontSize: 18, color: "#333", marginBottom: 4 }}>
                      {arc.name}
                      <span style={{ fontSize: 14, color: "#999", marginLeft: 10 }}>{arc.name_jp}</span>
                    </h3>
                    <div style={{ fontSize: 12, color: "#598bd2", marginBottom: 10 }}>
                      小说卷数: {arc.volume_start} ~ {arc.volume_end}
                    </div>
                    <p
                      style={{
                        fontSize: 14,
                        color: "#666",
                        lineHeight: 1.6,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {arc.summary}
                    </p>
                    <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {arc.characters?.map((c) => (
                        <span
                          key={c}
                          style={{
                            fontSize: 12,
                            padding: "2px 8px",
                            background: "#f0f4fa",
                            color: "#598bd2",
                            borderRadius: 12,
                          }}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 讨论区 */}
        <div className="title" style={{ marginTop: 40 }}>
          <h2>💬 讨论区</h2>
        </div>

        <div style={{ background: "#f9f9f9", padding: 20, borderRadius: 4 }}>
          <p style={{ color: "#666", marginBottom: 10 }}>
            对所有篇章的剧情进行讨论：
          </p>
          <Link
            href="/forum"
            style={{
              display: "inline-block",
              padding: "8px 20px",
              background: "#598bd2",
              color: "#fff",
              borderRadius: 4,
              textDecoration: "none",
            }}
          >
            前往论坛讨论 →
          </Link>
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
// build trigger 1780930168
