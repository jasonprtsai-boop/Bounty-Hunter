import { Link } from "react-router-dom";
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Gift,
  MapPin,
  MessageCircle,
  ScrollText,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UsersRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ADMIN_SITE_BASE_URL } from "../../lib/siteLinks";
import "../../styles/public.css";

const templeImage =
  "https://travel.taichung.gov.tw/content/images/attractions/60331/640x480_attractions-image-reeo_rka6kg04vfs2xyzmw.jpg";

const imageAssets = {
  home: "/assets/banners/home.png",
  events: "/assets/banners/events.png",
  fortune: "/assets/banners/fortune.png",
  tour: "/assets/banners/tour.png",
  support: "/assets/banners/support.png",
  richMenu: "/assets/rich-menu/main-2500x1686.png",
  sticker: "/assets/stickers/spring-fortune-messenger/main.png"
};

const publicNavItems = [
  { label: "萬春宮", to: "#temple" },
  { label: "展示", to: "#showcase" },
  { label: "LINE", to: "/community" },
  { label: "活動", to: "/events" }
];

const quickAccessItems: Array<{ label: string; title: string; body: string; icon: LucideIcon; to: string }> = [
  { label: "活動", title: "查看活動報名", body: "法會、導覽與服務活動", icon: CalendarDays, to: "/events" },
  { label: "導覽", title: "看主殿導覽", body: "主殿故事與現場動線", icon: MapPin, to: "/tour/main-hall" },
  { label: "抽籤", title: "抽文化籤", body: "一支平安提醒", icon: Sparkles, to: "/fortune" },
  { label: "查詢", title: "查報名進度", body: "手機或編號查詢", icon: UserCheck, to: "/events?lookup=1" },
  { label: "客服", title: "聯絡客服", body: "找不到資訊時提問", icon: MessageCircle, to: "/support" }
];

const showcaseItems: Array<{
  title: string;
  label: string;
  image: string;
  icon: LucideIcon;
  to: string;
  large?: boolean;
}> = [
  { title: "萬春宮實景", label: "認識地點", image: templeImage, icon: MapPin, to: "/tour/main-hall", large: true },
  { title: "活動中心", label: "查看活動", image: imageAssets.events, icon: CalendarDays, to: "/events" },
  { title: "文化抽籤", label: "抽一支籤", image: imageAssets.fortune, icon: Sparkles, to: "/fortune" },
  { title: "宮廟導覽", label: "開啟導覽", image: imageAssets.tour, icon: ScrollText, to: "/tour/main-hall" },
  { title: "LINE 服務選單", label: "看聊天室入口", image: imageAssets.richMenu, icon: UsersRound, to: "/community", large: true },
  { title: "神佛介紹", label: "認識奉祀", image: imageAssets.home, icon: BookOpen, to: "/deities" },
  { title: "客服中心", label: "留下問題", image: imageAssets.support, icon: MessageCircle, to: "/support" },
  { title: "貼圖小舖", label: "查看貼圖", image: imageAssets.sticker, icon: Gift, to: "/stickers" }
];

const visitFacts = [
  ["地點", "臺中市中區成功路212號"],
  ["主祀", "天上聖母"],
  ["電話", "04-22245964"],
  ["入口", "LINE、活動、導覽、客服"]
];

const introLinks = [
  ["參拜前", "先確認地址與主殿位置", "/tour/main-hall"],
  ["活動前", "查看近期活動與報名狀態", "/events"],
  ["需要協助", "直接留下問題給服務人員", "/support"]
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
          <a href={`${ADMIN_SITE_BASE_URL}/admin`} target="_blank" rel="noreferrer">
            後台
          </a>
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
            backgroundImage: `url(${templeImage})`
          }}
        >
          <div className="site-hero-layout">
            <div className="site-hero-content">
              <span className="tag">臺中中區</span>
              <h1>萬春宮</h1>
              <p>天上聖母信仰、老城區故事與線上服務入口。</p>
              <div className="hero-actions">
                <Link className="button primary" to="/community">
                  LINE 服務 <ChevronRight size={18} />
                </Link>
                <Link className="hero-secondary-link" to="/events">
                  查看活動
                </Link>
                <Link className="hero-secondary-link" to="/tour/main-hall">
                  主殿導覽
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

        <section className="public-section homepage-showcase" id="showcase" aria-label="展示入口">
          <div className="showcase-heading">
            <div className="section-kicker">展示入口</div>
            <h2>先看見內容，再選服務</h2>
            <p>首頁保留介紹與超連結；報名、查詢、客服與抽籤都到各自頁面操作。</p>
          </div>
          <div className="showcase-grid">
            {showcaseItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  className={`showcase-card${item.large ? " large" : ""}${item.image === imageAssets.richMenu || item.image === imageAssets.sticker ? " contain" : ""}`}
                  key={`${item.title}-${item.to}`}
                  to={item.to}
                >
                  <img src={item.image} alt={item.title} />
                  <span>
                    <Icon size={18} />
                    {item.label}
                  </span>
                  <strong>{item.title}</strong>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="public-section intro-link-section" aria-label="常用超連結">
          <div className="intro-link-copy">
            <div className="section-kicker">快速前往</div>
            <h2>把真正的操作留給功能頁</h2>
          </div>
          <div className="intro-link-list">
            {introLinks.map(([title, body, to]) => (
              <Link key={title} to={to}>
                <span>{title}</span>
                <strong>{body}</strong>
                <ChevronRight size={18} />
              </Link>
            ))}
          </div>
        </section>

        <section className="public-section source-note compact-source-note">
          <ShieldCheck size={22} />
          <p>公開資訊、活動與 LINE 服務內容仍以廟方正式公告為準。</p>
        </section>
      </main>

      <footer className="public-footer">
        <span>萬春宮線上服務頁</span>
        <nav aria-label="頁尾連結">
          <Link to="/privacy">隱私權政策</Link>
          <Link to="/terms">使用條款</Link>
          <a href={`${ADMIN_SITE_BASE_URL}/admin`} target="_blank" rel="noreferrer">
            後台管理
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
