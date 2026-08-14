import { ExternalLink, ShieldCheck, ShoppingBag } from "lucide-react";
import { Shell } from "../../components/Shell";

const stickerBase = "/assets/stickers/spring-fortune-messenger";
const stickerStoreUrl = import.meta.env.VITE_LINE_STICKER_STORE_URL as string | undefined;

const stickers = [
  ["早安平安", "sticker_01_good_morning.png"],
  ["收到", "sticker_02_received.png"],
  ["謝謝你", "sticker_03_thanks.png"],
  ["辛苦了", "sticker_04_hard_work.png"],
  ["祝福滿滿", "sticker_05_blessings.png"],
  ["等我一下", "sticker_06_wait.png"],
  ["已報名", "sticker_07_registered.png"],
  ["保持平安", "sticker_08_safe.png"]
];

export function StickerShopPage() {
  const canBuy = Boolean(stickerStoreUrl);

  return (
    <Shell title="貼圖小舖">
      <section className="sticker-hero">
        <div>
          <span className="tag">春福小使</span>
          <h2>日常問候、回覆與平安祝福</h2>
          <p>
            原創貼圖角色已準備第一套 8 張靜態 PNG，可送 LINE Creators Market
            審核。通過後這裡會直接導向 LINE 貼圖購買頁。
          </p>
          <div className="inline-actions">
            {canBuy ? (
              <a className="button primary" href={stickerStoreUrl} target="_blank" rel="noreferrer">
                <ShoppingBag size={18} />
                <span>前往購買</span>
                <ExternalLink size={16} />
              </a>
            ) : (
              <button className="button muted" type="button" disabled>
                <ShoppingBag size={18} />
                <span>審核後開放購買</span>
              </button>
            )}
          </div>
        </div>
        <img src={`${stickerBase}/main.png`} alt="春福小使貼圖主圖" />
      </section>

      <section className="tool-panel">
        <div className="section-title">
          <ShieldCheck size={20} />
          <h2>送審狀態</h2>
        </div>
        <div className="sticker-status-grid">
          <div>
            <strong>8</strong>
            <span>靜態貼圖</span>
          </div>
          <div>
            <strong>PNG</strong>
            <span>透明背景</span>
          </div>
          <div>
            <strong>370×320</strong>
            <span>貼圖尺寸</span>
          </div>
          <div>
            <strong>待審核</strong>
            <span>LINE Creators Market</span>
          </div>
        </div>
      </section>

      <section className="sticker-grid" aria-label="春福小使貼圖預覽">
        {stickers.map(([label, file]) => (
          <article className="sticker-card" key={file}>
            <img src={`${stickerBase}/${file}`} alt={`春福小使：${label}`} />
            <span>{label}</span>
          </article>
        ))}
      </section>
    </Shell>
  );
}
