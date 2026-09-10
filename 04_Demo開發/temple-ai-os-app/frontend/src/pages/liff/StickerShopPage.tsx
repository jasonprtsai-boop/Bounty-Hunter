import { ExternalLink, Sparkles, ShoppingBag } from "lucide-react";
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
      <section className="sticker-hero sticker-hero-compact">
        <div>
          <span className="tag">萬春宮原創角色</span>
          <h2>春福小使 ‧ 日常平安祝福</h2>
          <p>以萬春宮媽祖文化為意象設計之原創吉祥角色，陪伴善信在日常對話中互道平安吉祥。</p>
          <div className="inline-actions">
            {canBuy ? (
              <a className="button primary" href={stickerStoreUrl} target="_blank" rel="noreferrer">
                <ShoppingBag size={18} />
                <span>前往 LINE 貼圖小舖購買</span>
                <ExternalLink size={16} />
              </a>
            ) : (
              <button className="button muted" type="button" disabled>
                <ShoppingBag size={18} />
                <span>即將正式上架 敬請期待</span>
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="tool-panel">
        <div className="section-title">
          <Sparkles size={20} />
          <h2>貼圖特色</h2>
        </div>
        <div className="sticker-status-grid">
          <div>
            <strong>日常問候</strong>
            <span>早安與平安祝福</span>
          </div>
          <div>
            <strong>廟務互動</strong>
            <span>報名與即時通知</span>
          </div>
          <div>
            <strong>文化意象</strong>
            <span>傳遞媽祖福氣</span>
          </div>
          <div>
            <strong>即將上架</strong>
            <span>LINE 貼圖小舖</span>
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
