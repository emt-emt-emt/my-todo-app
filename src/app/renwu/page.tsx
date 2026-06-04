import Link from "next/link";

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
        <img
          src="https://images.unsplash.com/photo-1541562232579-512a21360020?w=1000&h=300&fit=crop"
          alt="人物介绍"
        />
      </div>

      <div className="in_com">
        <div className="title">
          <h2>人物介绍</h2>
        </div>
        <ul className="renwu_box">
          <li>
            <div className="pic">
              <img src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=260&h=260&fit=crop" alt="菜月昴" />
            </div>
            <div className="text">
              <p><b>菜月昴</b><br />
                动画《Re:从零开始的异世界生活》的男主角<br />
              </p>
              <p>住在现代日本的普通高中生，在从便利店回家的路上突然被召唤到异世界。没有特殊能力，只有"死亡回归"的能力——死亡后时间会回溯到某个存档点。性格乐观但内心脆弱，在经历无数次死亡后逐渐坚强。深爱着爱蜜莉雅，愿意为她无数次死亡和重生。</p>
            </div>
          </li>
          <li>
            <div className="pic">
              <img src="https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=260&h=260&fit=crop" alt="爱蜜莉雅" />
            </div>
            <div className="text">
              <b>爱蜜莉雅</b><br />
              动画《Re:从零开始的异世界生活》的女主角。<br />
              银发半精灵少女，外貌酷似传说中的嫉妒魔女莎缇拉，因此受到人们的歧视和恐惧。性格善良温柔，内心坚强。与精灵帕克缔结契约，在王选中被推举为候选人。是菜月昴来到异世界后第一个帮助他的人，也是昴深爱的对象。
            </div>
          </li>
          <li>
            <div className="pic">
              <img src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=260&h=260&fit=crop" alt="雷姆" />
            </div>
            <div className="text">
              <b>雷姆</b><br />
              罗兹瓦尔宅邸的女仆，拉姆的妹妹。<br />
              蓝发蓝眼的鬼族少女，拥有鬼族强大的战斗力。由于小时候姐姐拉姆为了保护她而失去力量，所以对姐姐怀有愧疚和感激之情。在昴经历多次死亡后，逐渐被昴的坚强和温柔打动，深爱着昴。是作品中人气极高的角色。
            </div>
          </li>
          <li>
            <div className="pic">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=260&h=260&fit=crop" alt="拉姆" />
            </div>
            <div className="text">
              <b>拉姆</b><br />
                  罗兹瓦尔宅邸的女仆，雷姆的姐姐。<br />
                  粉发粉眼的鬼族少女，曾经拥有强大的力量，但在保护妹妹雷姆时失去了角和大部分力量。性格傲娇毒舌，但内心关心妹妹和昴。虽然失去了战斗力，但凭借丰富的经验和敏锐的观察力辅助昴和罗兹瓦尔。
            </div>
          </li>
          <li>
            <div className="pic">
              <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=260&h=260&fit=crop" alt="帕克" />
            </div>
            <div className="text">
              <b>帕克</b><br />
                  爱蜜莉雅缔结契约的精灵，被称为"永久冻土的终焉之兽"。<br />
                  平时以可爱的猫型精灵形态出现，与爱蜜莉雅关系亲密如父女。真实形态是巨大而强大的冰之兽，拥有毁灭世界的力量。性格温和友善，但非常保护爱蜜莉雅，不允许任何人伤害她。
            </div>
          </li>
        </ul>
      </div>

      <footer>
        <p>
          <a href="https://www.bilibili.com/bangumi/media/md28229617" target="_blank">
            <strong>Re:从零开始的异世界生活在线观看</strong>
          </a>
        </p>
      </footer>
    </div>
  );
}
