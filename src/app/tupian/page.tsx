import { Header } from "../../components/Header";
import { ImageGallery } from "../../components/ImageGallery";

export default function Tupian() {
  return (
    <div className="wrapin">
      <Header active="tupian" />

      <div className="banner">
        <img src="/images/emilia.jpg" alt="图片鉴赏" />
      </div>

      <div className="in_com">
        <div className="title">
          <h2>图片鉴赏</h2>
        </div>
        <ImageGallery />
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
