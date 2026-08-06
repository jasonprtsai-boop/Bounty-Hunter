import { Link } from "react-router-dom";
import { Bot, CalendarDays, ChevronRight, HandHeart, MapPin, MessageCircle, Sparkles, UsersRound } from "lucide-react";
import "../../styles/public.css";

const templeImage =
  "https://travel.taichung.gov.tw/content/images/attractions/60331/640x480_attractions-image-reeo_rka6kg04vfs2xyzmw.jpg";

const visitFacts = [
  ["地點", "台中市清水區鰲峰路 12 號"],
  ["主祀", "天上聖母"],
  ["開放時間", "平日 06:00-21:00，假日 05:00-21:00"],
  ["系統定位", "宮廟服務流程示範 Demo"]
];

const services = [
  {
    icon: Bot,
    title: "AI 信眾問答",
    body: "把活動、交通、服務與常見問題整理成可在 LINE 裡查詢的知識入口，降低志工重複回覆成本。"
  },
  {
    icon: CalendarDays,
    title: "活動與報名",
    body: "法會、導覽、志工服務可集中發布，信眾能從 LIFF 直接查看活動細節與報名狀態。"
  },
  {
    icon: MapPin,
    title: "參拜導覽",
    body: "以手機介面呈現參拜動線、周邊景點與導覽內容，讓第一次到訪的人更容易理解現場資訊。"
  },
  {
    icon: HandHeart,
    title: "服務單管理",
    body: "把信眾諮詢、祈福需求與行政待辦整理成後台可追蹤的紀錄，協助團隊維持回覆品質。"
  }
];

export function PublicSitePage() {
  return (
    <div className="public-shell">
      <header className="public-nav">
        <Link to="/site" className="brand">
          <span className="brand-mark">AI</span>
          <span>
            <strong>Temple AI OS</strong>
            <small>萬春宮示範官網</small>
          </span>
        </Link>
        <nav aria-label="官網導覽">
          <Link to="/community">LINE 社群</Link>
          <Link to="/">LIFF</Link>
          <Link to="/admin">後台</Link>
          <Link to="/privacy">隱私權</Link>
        </nav>
      </header>

      <main>
        <section
          className="site-hero"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(10, 28, 41, 0.78), rgba(10, 28, 41, 0.24)), url(${templeImage})`
          }}
        >
          <div className="site-hero-content">
            <span className="tag">競賽 Demo</span>
            <h1>Temple AI OS 萬春宮示範官網</h1>
            <p>
              將宮廟官網、LINE 社群、AI 問答、活動報名與後台管理整合成一個可展示的服務流程，
              讓信眾從手機就能完成查詢、報名與聯繫。
            </p>
            <div className="hero-actions">
              <Link className="button primary" to="/">
                進入 LINE LIFF <ChevronRight size={18} />
              </Link>
              <Link className="button light" to="/community">
                社群入口 <UsersRound size={18} />
              </Link>
            </div>
          </div>
        </section>

        <section className="public-section fact-strip" aria-label="廟宇資訊">
          {visitFacts.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </section>

        <section className="public-section">
          <div className="section-kicker">核心服務</div>
          <h2>從官網到 LINE 的一體化服務入口</h2>
          <div className="service-grid">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <article className="service-card" key={service.title}>
                  <Icon size={24} />
                  <h3>{service.title}</h3>
                  <p>{service.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="public-section public-band">
          <div>
            <div className="section-kicker">Demo 範圍</div>
            <h2>此頁面為競賽示範，不代表萬春宮官方正式營運</h2>
            <p>
              目前內容用於展示 Temple AI OS 的系統能力與服務流程。正式上線前，仍需由廟方確認文案、
              活動資料、隱私條款、客服流程與 LINE 官方帳號權限。
            </p>
          </div>
          <div className="band-actions">
            <Link className="button primary" to="/events">
              活動列表 <CalendarDays size={18} />
            </Link>
            <Link className="button" to="/support">
              服務單 <MessageCircle size={18} />
            </Link>
            <Link className="button" to="/fortune">
              AI 求籤 <Sparkles size={18} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="public-footer">
        <span>Temple AI OS 萬春宮示範官網，不代表萬春宮官方正式公告。</span>
        <nav aria-label="頁尾連結">
          <Link to="/privacy">隱私權政策</Link>
          <Link to="/terms">使用條款</Link>
        </nav>
      </footer>
    </div>
  );
}
