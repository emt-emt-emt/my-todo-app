import Link from "next/link";
import { Header } from "../components/Header";

export default function Home() {
  return (
    <div className="wrapin">
      <Header active="home" />

      <div className="banner">
        <img src="/images/emilia.jpg" alt="从零开始的异世界生活" />
      </div>

      <div className="in_com">
        <div className="con_top clearfix">
          <div className="pic">
            <img src="/images/emilia.jpg" alt="Re:Zero封面" />
          </div>
          <div className="text">
            <b>《Re:从零开始的异世界生活》</b>是由日本作家<strong>长月达平</strong>创作的轻小说系列。
            <br />
            <br />
            《Re:从零开始的异世界生活》（Re:Zero − Starting Life in Another
            World）是长月达平创作、大冢真一郎插画的日本轻小说系列。2012年4月开始在&quot;成为小说家吧&quot;网站上连载，2014年1月由MF文库J出版实体书。2016年4月由WHITE
            FOX改编为电视动画播出，获得极高人气。2020年7月第二季播出。故事讲述了普通高中生菜月昴突然被召唤到异世界，并获得了&quot;死亡回归&quot;的能力，每次死亡后时间会回溯到某个&quot;存档点&quot;。他在异世界中与爱蜜莉雅相遇，并决心用无数次死亡来拯救她。
            <br />
            <br />
          </div>
        </div>

        <div className="title">
          <h2>创作背景</h2>
        </div>
        <div className="text_a clearfix">
          《Re:从零开始的异世界生活》的创作灵感来源于作者长月达平对"时间循环"题材的热爱，以及他对"在异世界获得普通人能力"这一设定的独特诠释。不同于常见的异世界作品主角获得强大能力，本作的主角菜月昴除了"死亡回归"外没有任何特殊能力，必须在一次次死亡中积累经验和信息来克服困难。长月达平希望通过这部作品探讨死亡、绝望、意志与爱的主题。作品中的"魔女教"和"大罪司教"等设定，以及"死亡回归"的诅咒，都展现了作者对命运与抗争的深刻思考。整部作品通过紧张刺激的剧情和细腻的人物情感，展现了长月达平独特的叙事风格和对角色心理的极致刻画。
          <img src="/images/subaru.png" alt="封面" width="200" />
        </div>

        <div className="title">
          <h2>剧情简介</h2>
        </div>
        <div className="text_a clearfix">
          《Re:从零开始的异世界生活》讲述了普通高中生菜月昴在从便利店回家的路上，突然被召唤到了异世界。在这个异世界中，他遇到了银发半精灵少女爱蜜莉雅，并决心帮助她。然而，昴发现自己除了&quot;死亡回归&quot;——即死亡后时间会回溯到某个特定时间点——之外，没有任何特殊能力。
          <br />
          <br />
          每一次死亡都是真实的痛苦体验，但昴凭借坚强的意志和对爱蜜莉雅的感情，一次次克服绝望，从死亡中学习，改变命运。故事涉及王选、魔女教、大罪司教等多条复杂的故事线，展现了昴在拯救爱蜜莉雅和她的朋友们的过程中所经历的无数磨难与成长。
          <br />
          <br />
          <img src="/images/ram.png" alt="剧情图片" className="full" />
        </div>
      </div>

      <footer>
        <p>
          <a
            href="https://www.bilibili.com/bangumi/media/md28224394"
            target="_blank"
          >
            <strong>【B站】Re:从零开始的异世界生活 在线观看</strong>
          </a>
        </p>
      </footer>
    </div>
  );
}
