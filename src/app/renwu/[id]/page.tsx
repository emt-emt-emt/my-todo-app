import Link from "next/link";
import { Header } from "../../../components/Header";
import { notFound } from "next/navigation";
import { getCharacter, characters } from "../data";
import { CommentSection } from "../../../components/CommentSection";

export function generateStaticParams() {
  return characters.map((char) => ({ id: char.id }));
}

interface CharacterPageProps {
  params: Promise<{ id: string }>;
}

export default async function CharacterPage({ params }: CharacterPageProps) {
  const { id } = await params;
  const char = getCharacter(id);

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
