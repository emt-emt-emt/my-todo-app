import Link from "next/link";

export default function Home() {
  return (
    <div className="wrapin">
      {/* 顶部 */}
      <header className="clearfix">
        <Link href="/" className="logo">
          从零开始的异世界生活
        </Link>
        <ul className="nav">
          <li>
            <Link href="/">
              <strong>首页</strong>
            </Link>
          </li>
          <li>
            <Link href="/renwu">人物介绍</Link>
          </li>
          <li>
            <Link href="/tupian">图片鉴赏</Link>
          </li>
        </ul>
      </header>

      <div className="banner">
        <img
          src="https://images.unsplash.com/photo-1541562232579-512a21360020?w=1000&h=300&fit=crop"
          alt="从零开始的异世界生活"
        />
      </div>

      <div className="in_com">
        <div className="con_top clearfix">
          <div className="pic">
            <img
              src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&h=400&fit=crop"
              alt="Re:Zero封面"
            />
          </div>
          <div className="text">
            <b>《Re:从零开始的异世界生活》</b>是由日本作家<strong>长月达平</strong>创作的轻小说系列。
            <br />
            <br />
            《Re:从零开始的异世界生活》（Re:Zero − Starting Life in Another
            World）是长月达平创作、大冢真一郎插画的日本轻小说系列。2012年4月开始在"成为小说家吧"网站上连载，2014年1月由MF文库J出版实体书。2016年4月由WHITE
            FOX改编为电视动画播出，获得极高人气。2020年7月第二季播出。故事讲述了普通高中生菜月昴突然被召唤到异世界，并获得了"死亡回归"的能力，每次死亡后时间会回溯到某个"存档点"。他在异世界中与爱蜜莉雅相遇，并决心用无数次死亡来拯救她。
            <br />
            <br />
          </div>
        </div>

        <div className="title">
          <h2>创作背景</h2>
        </div>
        <div className="text_a clearfix">
          《Re:从零开始的异世界生活》的创作灵感来源于作者长月达平对"时间循环"题材的热爱，以及他对"在异世界获得普通人能力"这一设定的独特诠释。不同于常见的异世界作品主角获得强大能力，本作的主角菜月昴除了"死亡回归"外没有任何特殊能力，必须在一次次死亡中积累经验和信息来克服困难。长月达平希望通过这部作品探讨死亡、绝望、意志与爱的主题。作品中的"魔女教"和"大罪司教"等设定，以及"死亡回归"的诅咒，都展现了作者对命运与抗争的深刻思考。整部作品通过紧张刺激的剧情和细腻的人物情感，展现了长月达平独特的叙事风格和对角色心理的极致刻画。
          <img
            src="https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=200&h=300&fit=crop"
            alt="封面"
            width="200"
          />
        </div>

        <div className="title">
          <h2>剧情简介</h2>
        </div>
        <div className="text_a clearfix">
          《Re:从零开始的异世界生活》讲述了普通高中生菜月昴在从便利店回家的路上，突然被召唤到了异世界。在这个异世界中，他遇到了银发半精灵少女爱蜜莉雅，并决心帮助她。然而，昴发现自己除了"死亡回归"——即死亡后时间会回溯到某个特定时间点——之外，没有任何特殊能力。
          <br />
          <br />
          每一次死亡都是真实的痛苦体验，但昴凭借坚强的意志和对爱蜜莉雅的感情，一次次克服绝望，从死亡中学习，改变命运。故事涉及王选、魔女教、大罪司教等多条复杂的故事线，展现了昴在拯救爱蜜莉雅和她的朋友们的过程中所经历的无数磨难与成长。
          <br />
          <br />
          <img
            src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&h=400&fit=crop"
            alt="剧情图片"
            className="full"
          />
        </div>
      </div>

      <footer>
        <p>
          <a
            href="https://search.bilibili.com/all?keyword=Re%E4%BB%8E%E9%9B%B6%E5%BC%80%E5%A7%8B%E7%9A%84%E5%BC%82%E4%B8%96%E7%95%8C%E7%94%9F%E6%B4%BB"
            target="_blank"
          >
            <strong>Re:从零开始的异世界生活 (bilibili)</strong>
          </a>
        </p>
      </footer>
    </div>
  );
}
