import { Link } from "react-router-dom";
import {
  Bot,
  CalendarDays,
  ChevronRight,
  HandHeart,
  MapPin,
  MessageCircle,
  ScrollText,
  ShieldCheck,
  Sparkles,
  UsersRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import "../../styles/public.css";

const templeImage =
  "https://travel.taichung.gov.tw/content/images/attractions/60331/640x480_attractions-image-reeo_rka6kg04vfs2xyzmw.jpg";

const publicNavItems = [
  ["線上服務", "#services"],
  ["參拜導覽", "#visit-guide"],
  ["近期活動", "#events-entry"],
  ["聯絡資訊", "#contact-info"]
];

const visitFacts = [
  ["地點", "臺中市中區成功路212號"],
  ["主祀", "天上聖母，台中媽祖"],
  ["電話", "04-22245964"],
  ["服務", "活動、導覽、客服"]
];

const services = [
  {
    icon: Bot,
    title: "LINE 問答",
    body: "查地址、參拜流程、活動資訊與常見問題，先把民眾最常需要的內容整理成好懂的答案。"
  },
  {
    icon: CalendarDays,
    title: "活動資訊",
    body: "近期法會、導覽、講座與服務活動集中呈現，讓民眾快速知道時間、地點與參加方式。"
  },
  {
    icon: MapPin,
    title: "參拜導覽",
    body: "用手機查看主殿、參拜動線、周邊地點與文化故事，第一次到訪也能知道下一步。"
  },
  {
    icon: HandHeart,
    title: "客服聯繫",
    body: "需要協助時留下問題與聯絡方式，讓廟方或服務人員可以接續處理。"
  }
];

const worshipRoute = [
  ["進廟前", "從 LINE 查交通、開放資訊與第一次參拜提醒。"],
  ["廟埕中", "掃 QR 看主殿、神明與文化故事，不必等現場人員逐一說明。"],
  ["活動時", "查看法會、導覽與講座，從手機完成活動資訊確認。"],
  ["回家後", "保留活動紀錄與客服入口，有問題時可以再回來查詢。"]
];

const templeElements = [
  ["媽祖信仰", "以萬春宮、天上聖母與在地故事作為導覽主軸，讓內容保留宮廟本身的文化感。"],
  ["現場服務", "把交通、活動、導覽與客服整理成手機入口，減少民眾到現場才找不到資訊的情況。"],
  ["安心提醒", "抽籤與文化內容以典故解說、參拜提醒為主，避免把文化服務說成命運斷言。"]
];

const serviceHighlights = [
  ["查", "參拜資訊"],
  ["看", "近期活動"],
  ["走", "宮廟導覽"],
  ["問", "客服聯繫"]
];

const visitorNeeds: Array<{ title: string; body: string; icon: LucideIcon }> = [
  { title: "怎麼去", body: "地址、電話與基本聯絡資訊放在清楚的位置。", icon: MapPin },
  { title: "有什麼活動", body: "近期活動入口直接可見，不需要翻找公告。", icon: CalendarDays },
  { title: "怎麼參拜", body: "用簡短步驟整理進廟前、中、後的常見需求。", icon: ScrollText },
  { title: "需要協助", body: "留下問題後可以銜接客服，不讓民眾卡在原地。", icon: MessageCircle }
];

export function PublicSitePage() {
  return (
    <div className="public-shell">
      <header className="public-nav">
        <Link to="/site" className="brand">
          <span className="brand-mark">宮</span>
          <span>
            <strong>萬春宮智慧服務</strong>
            <small>LINE 智慧服務示範</small>
          </span>
        </Link>
        <nav aria-label="官網導覽">
          {publicNavItems.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
          <Link to="/community">LINE 社群</Link>
        </nav>
        <Link className="public-nav-cta" to="/">
          開啟服務 <ChevronRight size={16} />
        </Link>
      </header>

      <main>
        <section
          className="site-hero"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(10, 28, 41, 0.78), rgba(10, 28, 41, 0.24)), url(${templeImage})`
          }}
        >
          <div className="site-hero-content">
            <span className="tag">萬春宮線上服務</span>
            <h1>萬春宮智慧服務入口</h1>
            <p>
              從 LINE 開始查詢參拜資訊、查看近期活動、開啟宮廟導覽，或透過客服留下需要協助的問題。
            </p>
            <div className="hero-blessing-strip" aria-label="宮廟識別">
              <span>參拜資訊</span>
              <span>活動查詢</span>
              <span>QR 導覽</span>
              <span>客服聯繫</span>
            </div>
            <div className="hero-actions">
              <Link className="button primary" to="/">
                開啟 LINE 服務 <ChevronRight size={18} />
              </Link>
              <a className="hero-secondary-link" href="#events-entry">
                查看近期活動 <ChevronRight size={16} />
              </a>
            </div>
            <div className="hero-metrics" aria-label="服務模組摘要">
              {serviceHighlights.map(([value, label]) => (
                <div key={label}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="public-section fact-strip" id="contact-info" aria-label="廟宇資訊">
          {visitFacts.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </section>

        <section className="public-section temple-intro" id="temple-story">
          <div>
            <div className="section-kicker">服務重點</div>
            <h2>常用資訊集中在第一層</h2>
            <p>
              進入頁面後可以先確認地點、近期活動、參拜導覽與客服入口；
              需要更多內容時，再開啟 LINE 服務頁接續查詢。
            </p>
            <div className="intro-checklist" aria-label="服務設計重點">
              <span>
                <ShieldCheck size={17} />
                官方公告與示範提醒分開
              </span>
              <span>
                <UsersRound size={17} />
                民眾入口保持簡單清楚
              </span>
              <span>
                <Bot size={17} />
                問答內容以公開資訊為主
              </span>
            </div>
          </div>
          <div className="temple-symbol-panel" aria-label="宮廟視覺元素">
            <div className="lantern-row">
              <span />
              <span />
              <span />
            </div>
            <strong>萬春宮</strong>
            <small>參拜導覽、活動報名、文化問答、服務追蹤</small>
          </div>
        </section>

        <section className="public-section service-section" id="services">
          <div className="section-kicker">核心服務</div>
          <h2>民眾進來後，能直接完成下一步</h2>
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

        <section className="public-section visitor-section" id="visitor-help">
          <div className="visitor-copy">
            <div className="section-kicker">常見需求</div>
            <h2>第一次來，也能很快找到需要的資訊</h2>
            <p>
              依照常見問題整理入口：怎麼去、有什麼活動、怎麼參拜、需要協助時找誰。
              每個入口都對應到清楚的下一步。
            </p>
          </div>
          <div className="visitor-board" aria-label="常見服務入口">
            <div className="visitor-board-header">
              <span>Visit Help</span>
              <strong>常用入口</strong>
            </div>
            {visitorNeeds.map(({ title, body, icon: Icon }) => (
              <article className="visitor-row" key={title}>
                <Icon size={20} />
                <div>
                  <strong>{title}</strong>
                  <p>{body}</p>
                </div>
                <ChevronRight size={16} />
              </article>
            ))}
          </div>
        </section>

        <section className="public-section worship-route-section" id="visit-guide">
          <div className="section-kicker">參拜導覽</div>
          <h2>參拜前、中、後都有清楚入口</h2>
          <div className="route-timeline">
            {worshipRoute.map(([title, body], index) => (
              <article className="route-step" key={title}>
                <span>{index + 1}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="public-section culture-grid" aria-label="文化與安全邊界">
          {templeElements.map(([title, body]) => (
            <article className="culture-card" key={title}>
              <ScrollText size={22} />
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </section>

        <section className="public-section action-dock" aria-label="快速入口">
          <Link className="dock-item" to="/events">
            <CalendarDays size={21} />
            <span>活動中心</span>
          </Link>
          <Link className="dock-item" to="/fortune">
            <Sparkles size={21} />
            <span>文化抽籤</span>
          </Link>
          <Link className="dock-item" to="/tour/main-hall">
            <MapPin size={21} />
            <span>QR 導覽</span>
          </Link>
          <Link className="dock-item" to="/support">
            <MessageCircle size={21} />
            <span>客服中心</span>
          </Link>
          <Link className="dock-item" to="/community">
            <UsersRound size={21} />
            <span>LINE 社群</span>
          </Link>
        </section>

        <section className="public-section public-band" id="events-entry">
          <div>
            <div className="section-kicker">近期活動</div>
            <h2>活動、導覽與客服都可以從手機開始</h2>
            <p>
              查看近期活動、打開宮廟導覽，或留下需要協助的問題；手機上就能先完成基本查詢。
            </p>
          </div>
          <div className="band-actions">
            <Link className="button primary" to="/events">
              活動列表 <CalendarDays size={18} />
            </Link>
            <Link className="button" to="/support">
              聯絡客服 <MessageCircle size={18} />
            </Link>
          </div>
        </section>

        <section className="public-section source-note">
          <ShieldCheck size={22} />
          <p>
            本作品使用政府開放資料與臺中市觀光多媒體開放資料建立示範場景；
            示範活動、報名與 LINE 社群設定不代表萬春宮官方公告，正式資訊仍以廟方公告為準。
          </p>
        </section>
      </main>

      <footer className="public-footer">
        <span>萬春宮智慧服務示範頁，不代表萬春宮官方正式公告。</span>
        <nav aria-label="頁尾連結">
          <Link to="/privacy">隱私權政策</Link>
          <Link to="/terms">使用條款</Link>
        </nav>
      </footer>
    </div>
  );
}
