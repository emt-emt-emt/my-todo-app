import Link from "next/link";
import { characters } from "./data";

export default function Renwu() {
  return (
    <div className="wrapin">
      {/* 顶部 */}
      <header className="clearfix">
        <Link href="/" className="logo">
          从零开始的异世界生活
        </Link>
        <ul className="nav">
          <li><Link href="/">首页</Link></li>
          <li><Link href="/renwu"><strong>人物介绍</strong></Link></li>
          <li><Link href="/tupian">图片鉴赏</Link></li>
        </ul>
      </header>

      <div className="banner">
        <img src="/images/character2.jpg" alt="人物介绍" />
      </div>

      <div className="in_com">
        <div className="title">
          <h2>人物介绍</h2>
        </div>
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
            </li>
          ))}
        </ul>
      </div>

      <footer>
        <p>
          <a href="https://www.bilibili.com/bangumi/media/md28229617" target="_blank">
            <strong>【B站】Re:从零开始的异世界生活 在线观看</strong>
          </a>
        </p>
      </footer>
    </div>
  );
}
