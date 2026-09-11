import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Clock,
  ExternalLink,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ScrollText,
  ShieldCheck,
  Sparkles,
  UserCheck
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ADMIN_SITE_BASE_URL } from "../../lib/siteLinks";
import { templePhotoGallery, visualAssets } from "../../lib/visualAssets";
import { defaultTempleSettings, getTempleSettings, type TempleSettings } from "../../lib/templeSettings";
import "../../styles/public.css";

const publicNavItems = [
  { label: "首頁", to: "#temple" },
  { label: "服務導覽", to: "#services" },
  { label: "古蹟看點", to: "#heritage" },
  { label: "參拜指南", to: "#guide" },
  { label: "法會活動", to: "/events" },
  { label: "神佛介紹", to: "/deities" }
];

const quickAccessItems: Array<{ label: string; title: string; body: string; icon: LucideIcon; to: string }> = [
  { label: "導覽", title: "參拜動線導覽", body: "6大景點循序參觀", icon: MapPin, to: "/tour/spots/main-hall" },
  { label: "神佛", title: "神佛體系介紹", body: "11尊主配祀神明", icon: BookOpen, to: "/deities" },
  { label: "活動", title: "四季法會活動", body: "慶典登記與查詢", icon: CalendarDays, to: "/events" },
  { label: "抽籤", title: "文化求籤提醒", body: "白話整理與生活啟發", icon: Sparkles, to: "/fortune" },
  { label: "擲筊", title: "擲筊問事祈請", body: "心誠祈請聖母指引", icon: ScrollText, to: "/jiao" },
  { label: "LINE", title: "LINE 官方服務", body: "即時推播與客服諮詢", icon: MessageCircle, to: "/community" }
];

const heritageHighlights = [
  {
    title: "天后閣牌樓山門",
    category: "建築山門",
    summary: "萬春宮成功路迎賓牌坊，三間四柱宮殿式造型，斗拱飛簷巍峨大器，為入廟第一道宏偉門戶。",
    image: templePhotoGallery[1].src,
    to: "/tour/spots/front-arch"
  },
  {
    title: "萬春宮青斗石獅",
    category: "清代石雕",
    summary: "廟埕一對青斗石古獅，公獅張口戲球、母獅撫幼，雕工細膩靈動，為萬春宮三百年鎮殿珍寶。",
    image: templePhotoGallery[3].src,
    to: "/tour/spots/stone-lions"
  },
  {
    title: "正殿開基媽祖殿",
    category: "參拜核心",
    summary: "開基三百年藍興媽祖神聖殿堂，康熙六十年隨總兵渡臺、雍正元年建廟立基，香火鼎盛祥和莊嚴。",
    image: visualAssets.culture.altar,
    to: "/tour/spots/main-hall"
  },
  {
    title: "道光年間雕花龍柱",
    category: "石雕文物",
    summary: "拜殿前保存之道光三年八角雕花龍柱，單龍蟠繞戲珠，柱身沉穩厚重，展現清中葉石雕巔峰工藝。",
    image: templePhotoGallery[2].src,
    to: "/tour/spots/dragon-pillars"
  }
];

export function PublicSitePage() {
  const [templeSettings, setTempleSettings] = useState<TempleSettings>(defaultTempleSettings);

  useEffect(() => {
    setTempleSettings(getTempleSettings());

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<TempleSettings>;
      if (customEvent.detail) {
        setTempleSettings(customEvent.detail);
      } else {
        setTempleSettings(getTempleSettings());
      }
    };

    window.addEventListener("temple-settings-updated", handleUpdate);
    return () => window.removeEventListener("temple-settings-updated", handleUpdate);
  }, []);

  const serviceDockCards = [
    {
      title: "參拜動線導覽",
      subtitle: "6大景點循序參觀",
      body: "牌樓山門、青斗石獅、正殿媽祖、道光龍柱、御匾與文史故事牆，隨走隨看。",
      image: templePhotoGallery[1].src,
      icon: MapPin,
      to: "/tour/spots/main-hall",
      tag: "動線指引"
    },
    {
      title: "四季法會活動",
      subtitle: "年度法會慶典線上報名",
      body: "中元普度、秋季禮斗、新春祈安點燈與安太歲，名額即時掌控。",
      image: visualAssets.culture.ceremony,
      icon: CalendarDays,
      to: "/events",
      tag: "祈福報名"
    },
    {
      title: "開基神佛體系",
      subtitle: "11 尊主配祀神明介紹",
      body: "開基天上聖母置頂尊崇，觀音、文昌、關聖、呂祖等神尊聖誕與奉祀指引。",
      image: visualAssets.culture.altar,
      icon: BookOpen,
      to: "/deities",
      tag: "奉祀神明"
    },
    {
      title: "文化抽籤生活提醒",
      subtitle: "籤詩絕句與白話整理",
      body: "沉澱心緒、5大方向一鍵選取，抽出籤詩附贈白話生活指引與一鍵複製全文。",
      image: visualAssets.culture.fortune,
      icon: Sparkles,
      to: "/fortune",
      tag: "心靈指引"
    },
    {
      title: "擲筊問事祈請",
      subtitle: "聖筊、笑筊、陰筊指引",
      body: "心誠一炷香，靜心默禱祈請開基媽祖賜筊指點迷津，感受心性安定。",
      image: templePhotoGallery[0].src,
      icon: ScrollText,
      to: "/jiao",
      tag: "誠敬祈請"
    },
    {
      title: "LINE 官方服務中心",
      subtitle: "行動選單與信眾諮詢",
      body: "綁定官方帳號隨時接收法會通知、報到核銷與線上便民客服諮詢。",
      image: visualAssets.richMenu,
      icon: MessageCircle,
      to: "/community",
      tag: "便民數位"
    }
  ];

  return (
    <div className="public-shell">
      {/* Top Navigation */}
      <header className="public-nav">
        <Link to="/" className="brand" aria-label="萬春宮首頁">
          <span className="brand-mark">宮</span>
          <span>
            <strong>{templeSettings.temple_name}</strong>
            <small>{templeSettings.sub_name}</small>
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
            便民服務 <ChevronDown size={16} />
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

      {/* Top Announcement Bar (Configurable in Admin) */}
      {templeSettings.announcement_enabled && (
        <aside className="public-announcement-strip" aria-label="最新即時公告">
          <span className="announcement-tag">
            <Bell size={14} /> {templeSettings.announcement_tag}
          </span>
          <p className="announcement-text">{templeSettings.announcement_text}</p>
          {templeSettings.announcement_link && (
            <Link to={templeSettings.announcement_link} className="announcement-link">
              詳情查看 <ChevronRight size={14} />
            </Link>
          )}
        </aside>
      )}

      {/* Floating Side Quick Navigation */}
      <nav className="public-side-menu" aria-label="側邊快捷服務">
        <span className="side-menu-label">快捷</span>
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
        {/* Flagship Hero Section: Clean Split, No Overlaps, No Avatars */}
        <section className="site-hero-flagship" id="temple">
          <div className="hero-flagship-container">
            <div className="hero-flagship-content">
              <div className="hero-meta-badges">
                <span className="tag tag-gold">{templeSettings.sub_name}</span>
                <span className="tag">臺中中區核心信仰</span>
              </div>
              <h1>{templeSettings.temple_name}</h1>
              <p className="hero-deity-title">主祀 {templeSettings.main_deity}</p>
              <p className="hero-intro-text">{templeSettings.intro_summary}</p>
              
              <div className="hero-open-hours-chip">
                <Clock size={16} />
                <span>參拜開放時間：{templeSettings.open_hours_weekday}</span>
              </div>

              <div className="hero-actions-primary">
                <Link className="button primary hero-btn" to="/events">
                  <CalendarDays size={18} /> 查看活動報名
                </Link>
                <Link className="button hero-btn" to="/tour/spots/main-hall">
                  <Navigation size={18} /> 參拜動線導覽
                </Link>
                <Link className="button hero-btn" to="/fortune">
                  <Sparkles size={18} /> 文化抽籤祈安
                </Link>
              </div>
            </div>

            <figure className="hero-flagship-visual">
              <img
                src={visualAssets.culture.altar}
                alt="萬春宮正殿金身神龕"
                className="hero-main-photo"
              />
              <figcaption className="hero-photo-caption">
                <span className="caption-tag">萬春宮正殿</span>
                <strong>開基三百年藍興媽祖神殿</strong>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* 6 Essential Services Grid (Unique Images, High Aesthetics) */}
        <section className="public-section flagship-services-section" id="services" aria-label="萬春宮便民服務">
          <div className="section-header-center">
            <span className="section-kicker">服務矩陣</span>
            <h2>線上便民 ‧ 敬神祈福六大服務</h2>
            <p>參拜導覽、法會登記、文化求籤與神佛體系，皆可直接線上體驗。</p>
          </div>

          <div className="flagship-services-grid">
            {serviceDockCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link className="flagship-service-card" key={card.title} to={card.to}>
                  <figure className="service-card-cover">
                    <img src={card.image} alt={card.title} />
                    <span className="service-card-tag">{card.tag}</span>
                  </figure>
                  <div className="service-card-info">
                    <div className="service-card-title-row">
                      <Icon size={20} className="service-icon" />
                      <h3>{card.title}</h3>
                    </div>
                    <strong>{card.subtitle}</strong>
                    <p>{card.body}</p>
                    <span className="service-card-arrow">
                      立即前往 <ChevronRight size={15} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Heritage & Historic Artifacts Showcase */}
        <section className="public-section heritage-showcase-section" id="heritage" aria-label="三百年文化看點">
          <div className="section-header-center">
            <span className="section-kicker">歷史文物</span>
            <h2>三百年老城歲月 ‧ 古蹟看點精選</h2>
            <p>清康熙年渡臺開基、道光仕紳重修、光緒皇帝御賜古匾，見證臺中大墩拓墾風華。</p>
          </div>

          <div className="heritage-grid">
            {heritageHighlights.map((item) => (
              <Link to={item.to} key={item.title} className="heritage-card">
                <figure className="heritage-cover">
                  <img src={item.image} alt={item.title} />
                  <span className="tag">{item.category}</span>
                </figure>
                <div className="heritage-body">
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <span className="heritage-link-text">
                    景點詳情 <ChevronRight size={15} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Visiting Practical Guide (Address, Hours, Transit) */}
        <section className="public-section practical-guide-section" id="guide" aria-label="參拜與交通指南">
          <div className="section-header-center">
            <span className="section-kicker">參拜指南</span>
            <h2>前來參拜 ‧ 交通與開放資訊</h2>
            <p>臺中市中區核心街區，歡迎十方大德蒞臨萬春宮敬香參拜。</p>
          </div>

          <div className="guide-info-grid">
            <article className="guide-card">
              <div className="guide-card-header">
                <Clock size={22} />
                <h3>開放參拜時段</h3>
              </div>
              <ul className="guide-list">
                <li>
                  <strong>平日時間：</strong>
                  <span>{templeSettings.open_hours_weekday}</span>
                </li>
                <li>
                  <strong>週末假日：</strong>
                  <span>{templeSettings.open_hours_weekend}</span>
                </li>
                <li>
                  <strong>重大慶典：</strong>
                  <span>{templeSettings.open_hours_special}</span>
                </li>
              </ul>
            </article>

            <article className="guide-card">
              <div className="guide-card-header">
                <MapPin size={22} />
                <h3>廟址與地理位置</h3>
              </div>
              <p className="guide-address-highlight">
                <strong>{templeSettings.address}</strong>
              </p>
              <p className="guide-phone-highlight">
                <Phone size={16} /> 服務電話：{templeSettings.phone}
              </p>
              <div className="guide-card-actions">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    templeSettings.address + " " + templeSettings.temple_name
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="button primary"
                >
                  <Navigation size={16} /> Google 地圖導航 <ExternalLink size={14} />
                </a>
              </div>
            </article>

            <article className="guide-card full-col">
              <div className="guide-card-header">
                <Navigation size={22} />
                <h3>交通路線與停車建議</h3>
              </div>
              <div className="transit-columns">
                <div className="transit-col">
                  <strong>🚌 大眾運輸指引</strong>
                  <p>{templeSettings.transit_bus}</p>
                </div>
                <div className="transit-col">
                  <strong>🚗 自行開車停車</strong>
                  <p>{templeSettings.transit_parking}</p>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* LINE Official Service Invitation */}
        <section className="public-section line-community-banner" aria-label="LINE 官方帳號">
          <div className="line-banner-container">
            <div className="line-banner-content">
              <span className="section-kicker">數位便民</span>
              <h2>加入萬春宮 LINE 官方服務</h2>
              <p>法會即時推播提醒、線上活動登記、參拜問答與信眾客服，隨手掌握萬春宮即時資訊。</p>
              <div className="line-banner-actions">
                <Link className="button primary" to="/community">
                  <MessageCircle size={18} /> 前往 LINE 服務中心
                </Link>
                <Link className="button" to="/events">
                  近期活動總覽
                </Link>
              </div>
            </div>
            <figure className="line-banner-media">
              <img src={visualAssets.richMenu} alt="萬春宮 LINE 圖文選單" />
            </figure>
          </div>
        </section>

        {/* Disclaimer Note */}
        <section className="public-section source-note compact-source-note">
          <ShieldCheck size={22} />
          <p>
            萬春宮線上服務平台之圖片與文史資料依政府觀光開放資料、文化資產檔案與廟方公開文宣整理；正式活動登記與服務細節請以現場公告為準。
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="public-footer">
        <div>
          <strong>{templeSettings.temple_name}</strong>
          <span>{templeSettings.sub_name} ‧ 線上便民服務</span>
        </div>
        <nav aria-label="頁尾連結">
          <Link to="/tour/spots/main-hall">宮廟導覽</Link>
          <Link to="/events">法會活動</Link>
          <Link to="/deities">神佛介紹</Link>
          <Link to="/privacy">隱私權政策</Link>
          <Link to="/terms">服務條款</Link>
          <a href={`${ADMIN_SITE_BASE_URL}/admin`} target="_blank" rel="noreferrer">
            工作人員登入
          </a>
        </nav>
      </footer>

      {/* Mobile Bottom Quick Dock */}
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
