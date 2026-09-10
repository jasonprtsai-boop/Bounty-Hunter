import { Link } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Headphones,
  MessageCircle,
  Search,
  ScrollText,
  ShieldCheck,
  Sparkles,
  UsersRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { visualAssets } from "../../lib/visualAssets";
import "../../styles/public.css";

const lineAddFriendUrl = import.meta.env.VITE_LINE_ADD_FRIEND_URL || "https://line.me/R/ti/p/%40983zhzni";
const lineOpenChatUrl = import.meta.env.VITE_LINE_OPENCHAT_URL || "";

const communityFlows: Array<{ title: string; body: string; to: string; icon: LucideIcon; mark: string }> = [
  { title: "看活動", body: "活動、名額與報名入口。", to: "/events", icon: CalendarDays, mark: "歷" },
  { title: "查進度", body: "手機或報名編號查詢。", to: "/events?lookup=1", icon: Search, mark: "查" },
  { title: "抽籤", body: "抽一支文化提醒。", to: "/fortune", icon: ScrollText, mark: "籤" },
  { title: "擲筊", body: "先問一句再擲杯。", to: "/jiao", icon: Sparkles, mark: "筊" },
  { title: "聯絡客服", body: "找不到資訊時留下問題。", to: "/support", icon: Headphones, mark: "聊" }
];

const guardrails = [
  "正式活動與開放時間以廟方公告為準",
  "不在聊天室處理正式交易或敏感個資",
  "重大廟務問題請再向正式窗口確認"
];

function ExternalAction({ href, children }: { href: string; children: React.ReactNode }) {
  if (!href) {
    return <span className="button muted">{children}</span>;
  }
  return (
    <a className="button primary" href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

export function CommunityPage() {
  return (
    <div className="public-shell community-page">
      <header className="public-nav">
        <Link to="/site" className="brand">
          <span className="brand-mark">宮</span>
          <span>
            <strong>萬春宮線上服務</strong>
            <small>LINE 操作入口</small>
          </span>
        </Link>
        <nav aria-label="社群導覽">
          <Link to="/site">官網</Link>
          <Link to="/">線上服務</Link>
          <Link to="/events">活動</Link>
          <Link to="/privacy">隱私權</Link>
        </nav>
      </header>

      <main>
        <section className="community-hero community-ops-hero">
          <div className="community-action-copy">
            <span className="tag">LINE 服務台</span>
            <h1>聊天室裡直接點選服務</h1>
            <p>加入後從底部選單進入活動、查詢、抽籤、導覽與客服；擲筊從線上服務入口進入。</p>
            <div className="hero-actions">
              <ExternalAction href={lineAddFriendUrl}>
                加入官方帳號 <ExternalLink size={18} />
              </ExternalAction>
              <ExternalAction href={lineOpenChatUrl}>
                加入 OpenChat <UsersRound size={18} />
              </ExternalAction>
            </div>
            <p className="notice">主要入口：LINE 帳號 @983zhzni</p>
            <div className="community-entry-strip" aria-label="LINE 常用服務符號">
              <span>活</span>
              <span>查</span>
              <span>籤</span>
              <span>筊</span>
              <span>聊</span>
            </div>
          </div>

          <div className="community-phone" aria-label="LINE 對話示意">
            <div className="phone-bar" />
            <div className="chat-bubble bot">
              <MessageCircle size={16} />
              歡迎使用萬春宮線上服務
            </div>
            <div className="chat-bubble user">我要查活動報名</div>
            <div className="chat-bubble bot">
              <CalendarDays size={16} />
              點下方活動或查詢就能進入
            </div>
            <div className="chat-bubble user">想抽籤或擲筊</div>
            <div className="chat-bubble bot">
              <ScrollText size={16} />
              抽籤在底部選單，擲筊在服務入口，正式事項仍以公告為準
            </div>
            <figure className="phone-rich-menu-preview">
              <img
                src={visualAssets.richMenu}
                alt="LINE 底部選單示意：詢問參拜方式、查看活動報名、抽文化籤、看主殿導覽、查報名進度、聯絡客服。"
              />
            </figure>
          </div>

        </section>

        <section className="public-section community-service-section">
          <div className="section-kicker">常用動作</div>
          <h2>進 LINE 後最常點這些</h2>
          <div className="community-flow-grid">
            {communityFlows.map((item) => {
              const Icon = item.icon;
              return (
                <Link className="flow-card community-flow-link" key={item.title} to={item.to}>
                  <span>{item.mark}</span>
                  <Icon size={20} />
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="public-section community-guardrails">
          <div>
            <div className="section-kicker">使用提醒</div>
            <h2>簡單界線</h2>
          </div>
          <div className="guardrail-list">
            {guardrails.map((item) => (
              <div key={item}>
                <ShieldCheck size={18} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="public-section public-band community-action-band">
          <div>
            <div className="section-kicker">開始使用</div>
            <h2>選一個入口就能開始</h2>
            <p>活動、報名查詢、擲筊與客服分開進入。</p>
          </div>
          <div className="band-actions">
            <Link className="button primary" to="/events">
              活動列表 <CalendarDays size={18} />
            </Link>
            <Link className="button" to="/jiao">
              擲筊問事 <Sparkles size={18} />
            </Link>
            <Link className="button" to="/events?lookup=1">
              報名查詢 <CheckCircle2 size={18} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="public-footer">
        <span>LINE 帳號：@983zhzni</span>
        <nav aria-label="頁尾連結">
          <Link to="/privacy">隱私權政策</Link>
          <Link to="/terms">使用條款</Link>
        </nav>
      </footer>
    </div>
  );
}
