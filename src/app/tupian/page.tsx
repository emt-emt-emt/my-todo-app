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
        <img
          src="https://images.unsplash.com/photo-1541562232579-512a21360020?w=1000&h=300&fit=crop"
          alt="图片鉴赏"
        />
      </div>

      <div className="in_com">
        <div className="title">
          <h2>图片鉴赏</h2>
        </div>
        <ul className="pic_con clearfix">
          <li>
            <div className="box">
              <img src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=240&fit=crop" />
            </div>
          </li>
          <li>
            <div className="box">
              <img src="https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400&h=240&fit=crop" />
            </div>
          </li>
          <li>
            <div className="box">
              <img src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=240&fit=crop" />
            </div>
          </li>
          <li>
            <div className="box">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=240&fit=crop" />
            </div>
          </li>
          <li>
            <div className="box">
              <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=240&fit=crop" />
            </div>
          </li>
          <li>
            <div className="box">
              <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=240&fit=crop" />
            </div>
          </li>
          <li>
            <div className="box">
              <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=240&fit=crop" />
            </div>
          </li>
          <li>
            <div className="box">
              <img src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=240&fit=crop" />
            </div>
          </li>
          <li>
            <div className="box">
              <img src="https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400&h=240&fit=crop" />
            </div>
          </li>
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
