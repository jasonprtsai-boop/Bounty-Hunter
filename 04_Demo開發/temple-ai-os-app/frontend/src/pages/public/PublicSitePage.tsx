import { Link } from "react-router-dom";
import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  MapPin,
  MessageCircle,
  ScrollText,
  ShieldCheck,
  Sparkles,
  UserCheck
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ADMIN_SITE_BASE_URL } from "../../lib/siteLinks";
import { templePhotoGallery, visualAssets } from "../../lib/visualAssets";
import "../../styles/public.css";

const imageAssets = {
  events: visualAssets.banners.events,
  jiao: visualAssets.banners.jiao,
  richMenu: visualAssets.richMenu
};

const publicNavItems = [
  { label: "首頁", to: "#temple" },
  { label: "照片", to: "#photos" },
  { label: "活動", to: "/events" },
  { label: "LINE", to: "/community" }
];

const quickAccessItems: Array<{ label: string; title: string; body: string; icon: LucideIcon; to: string }> = [
  { label: "活動", title: "活動消息", body: "報名、名額與查詢", icon: CalendarDays, to: "/events" },
  { label: "導覽", title: "宮廟導覽", body: "地址與參拜動線", icon: MapPin, to: "/tour/main-hall" },
  { label: "抽籤", title: "文化抽籤", body: "一支平安提醒", icon: Sparkles, to: "/fortune" },
  { label: "擲筊", title: "擲筊問事", body: "一句話再擲杯", icon: ScrollText, to: "/jiao" },
  { label: "客服", title: "信眾客服", body: "諮詢與便民服務", icon: MessageCircle, to: "/support" }
];

const templeServiceDockItems: Array<{
  title: string;
  body: string;
  image: string;
  icon: LucideIcon;
  to: string;
}> = [
  { title: "廟宇導覽", body: "照片、地址與主殿動線", image: templePhotoGallery[0].src, icon: MapPin, to: "/tour/main-hall" },
  { title: "活動消息", body: "法會、講堂與報名", image: imageAssets.events, icon: CalendarDays, to: "/events" },
  { title: "線上互動", body: "文化抽籤與擲筊", image: imageAssets.jiao, icon: Sparkles, to: "/fortune" },
  { title: "LINE 服務", body: "選單與客服入口", image: imageAssets.richMenu, icon: UserCheck, to: "/community" }
];

const visitFacts = [
  ["地點", "臺中市中區成功路212號"],
  ["主祀", "天上聖母（開基藍興媽祖）"],
  ["歷史沿革", "康熙六十年（1721）渡臺 ‧ 雍正元年建廟立基"],
  ["奉祀神明", "主祀聖母、觀音、文昌、關聖等11尊神明"],
  ["珍貴文物", "道光雕花龍柱、光緒御匾「海晏河清」、青斗石獅"],
  ["服務項目", "參拜動線導覽、四季法會、文化抽籤、信眾客服"]
];

const introLinks = [
  ["參拜導覽", "6大景點參拜動線", "/tour/spots/main-hall"],
  ["神佛體系", "11尊主配祀神明介紹", "/deities"],
  ["法會活動", "四季慶典與線上報名", "/events"],
  ["心靈啟發", "文化抽籤與生活提醒", "/fortune"]
];

export function PublicSitePage() {
  return (
    <div className="public-shell">
      <header className="public-nav">
        <Link to="/site" className="brand" aria-label="回到萬春宮首頁">
          <span className="brand-mark">宮</span>
          <span>
            <strong>萬春宮</strong>
            <small>線上服務入口</small>
          </span>
        </Link>
        <nav className="public-nav-links" aria-label="官網導覽">
          {publicNavItems.map((item) =>
            item.to.startsWith("#") ? (
              <a key={item.to} href={item.to}>
                {item.label}
              </a>
            ) : (
              <Link key={item.to} to={item.to}>
                {item.label}
              </Link>
            )
          )}
        </nav>
        <details className="public-service-menu">
          <summary>
            服務選單 <ChevronDown size={16} />
          </summary>
          <div className="public-menu-panel">
            {quickAccessItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.to} to={item.to}>
                  <Icon size={19} />
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.body}</small>
                  </span>
                </Link>
              );
            })}
          </div>
        </details>
      </header>

      <div className="public-announcement-strip" aria-label="本期提醒">
        <span>最新公告</span>
        <Link to="/events">近期活動</Link>
        <Link to="/community">LINE 服務</Link>
      </div>

      <nav className="public-side-menu" aria-label="側邊快速服務">
        <span className="side-menu-label">服務</span>
        {quickAccessItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.to} to={item.to} aria-label={item.title}>
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <main>
        <section
            className="site-hero site-hero-clean"
            id="temple"
            style={{
              backgroundImage: `url(${templePhotoGallery[1].src})`
            }}
        >
          <div className="site-hero-layout">
            <div className="site-hero-content">
              <span className="tag">臺中中區</span>
              <h1>萬春宮</h1>
              <p>天上聖母信仰、老城區廟埕與線上服務入口。</p>
              <div className="hero-actions">
                <Link className="button primary" to="/tour/main-hall">
                  看導覽 <ChevronRight size={18} />
                </Link>
                <Link className="hero-secondary-link" to="/events">
                  查看活動
                </Link>
                <Link className="hero-secondary-link" to="/community">
                  LINE 服務
                </Link>
              </div>
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

        <section className="public-section temple-service-dock" aria-label="信眾服務分類">
          <div className="temple-service-heading">
            <div className="section-kicker">服務分類</div>
            <h2>
              參拜、活動
              <br />
              與 LINE 服務
            </h2>
            <p>先看廟宇資訊，再依需求前往導覽、活動、抽籤或客服。</p>
          </div>
          <div className="temple-service-grid">
            {templeServiceDockItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  className={`temple-service-tile${item.image === imageAssets.richMenu ? " contain" : ""}`}
                  key={item.title}
                  to={item.to}
                >
                  <img src={item.image} alt={item.title} />
                  <span>
                    <Icon size={17} />
                    {item.title}
                  </span>
                  <small>{item.body}</small>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="public-section homepage-showcase photo-story-section" id="photos" aria-label="萬春宮照片">
          <div className="showcase-heading">
            <div className="section-kicker">照片故事</div>
            <h2>先看廟，再選服務</h2>
            <p>從廟埕、外觀與在地街區認識萬春宮。</p>
          </div>
          <div className="photo-story-grid">
            {templePhotoGallery.map((photo, index) => (
              <figure className={index === 0 ? "large" : ""} key={photo.src}>
                <img src={photo.src} alt={photo.title} />
                <figcaption>
                  <strong>{photo.title}</strong>
                  <a href={photo.sourceUrl} target="_blank" rel="noreferrer">
                    {photo.label}
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="public-section public-line-preview" aria-label="LINE 服務預覽">
          <figure>
            <img src={imageAssets.richMenu} alt="LINE 服務選單預覽" />
          </figure>
          <div>
            <div className="section-kicker">LINE 官方服務</div>
            <h2>LINE 服務快速入口</h2>
            <p>加入後可查活動、看導覽，也能留下問題給服務人員。</p>
            <div className="hero-actions">
              <Link className="button primary" to="/community">
                前往 LINE 服務
              </Link>
              <Link className="button" to="/events">
                活動中心
              </Link>
            </div>
          </div>
        </section>

        <section className="public-section compact-service-links" aria-label="常用超連結">
          {introLinks.map(([title, body, to]) => (
            <Link key={title} to={to}>
              <span>{title}</span>
              <strong>{body}</strong>
              <ChevronRight size={18} />
            </Link>
          ))}
        </section>

        <section className="public-section source-note compact-source-note">
          <ShieldCheck size={22} />
          <p>
            圖片採用臺中觀光開放資料與 Wikimedia Commons 授權素材；公開資訊與活動仍以廟方正式公告為準。
          </p>
        </section>
      </main>

      <footer className="public-footer">
        <span>臺中萬春宮（藍興媽祖） ‧ 線上便民服務</span>
        <nav aria-label="頁尾連結">
          <Link to="/privacy">隱私權政策</Link>
          <Link to="/terms">使用條款</Link>
          <a href={`${ADMIN_SITE_BASE_URL}/admin`} target="_blank" rel="noreferrer">
            工作人員登入
          </a>
        </nav>
      </footer>

      <nav className="public-mobile-menu" aria-label="手機快速服務選單">
        {quickAccessItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.to} to={item.to}>
              <Icon size={19} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
