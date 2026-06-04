import Link from "next/link";

export default function Tupian() {
  return (
    <div className="wrapin">
      {/* 顶部 */}
      <header className="clearfix">
        <Link href="/" className="logo">
          从零开始的异世界生活
        </Link>
        <ul className="nav">
          <li><Link href="/">首页</Link></li>
          <li><Link href="/renwu">人物介绍</Link></li>
          <li><Link href="/tupian"><strong>图片鉴赏</strong></Link></li>
        </ul>
      </header>

      <div className="banner">
        <img src="/images/emilia.jpg" alt="图片鉴赏" />
      </div>

      <div className="in_com">
        <div className="title">
          <h2>图片鉴赏</h2>
        </div>
        <ul className="pic_con clearfix">
          <li><div className="box"><img src="/images/emilia.jpg" alt="爱蜜莉雅1" /></div></li>
          <li><div className="box"><img src="/images/character2.jpg" alt="角色2" /></div></li>
          <li><div className="box"><img src="/images/emilia2.jpg" alt="爱蜜莉雅2" /></div></li>
          <li><div className="box"><img src="/images/character4.jpg" alt="角色4" /></div></li>
          <li><div className="box"><img src="/images/character5.jpg" alt="角色5" /></div></li>
          <li><div className="box"><img src="/images/character6.jpg" alt="角色6" /></div></li>
          <li><div className="box"><img src="/images/character7.jpg" alt="角色7" /></div></li>
          <li><div className="box"><img src="/images/character8.jpg" alt="角色8" /></div></li>
          <li><div className="box"><img src="/images/emilia.jpg" alt="爱蜜莉雅3" /></div></li>
        </ul>
      </div>

      <footer>
        <p>
          <a href="https://search.bilibili.com/all?keyword=Re%3A%E4%BB%8E%E9%9B%B6%E5%BC%80%E5%A7%8B%E7%9A%84%E5%BC%82%E4%B8%96%E7%95%8C%E7%94%9F%E6%B4%BB" target="_blank">
            <strong>Re:从零开始的异世界生活</strong>
          </a>
        </p>
      </footer>
    </div>
  );
}
