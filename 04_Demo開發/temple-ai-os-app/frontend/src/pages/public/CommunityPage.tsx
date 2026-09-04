import { Link } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  UsersRound
} from "lucide-react";
import "../../styles/public.css";

const lineAddFriendUrl = import.meta.env.VITE_LINE_ADD_FRIEND_URL || "https://line.me/R/ti/p/%40983zhzni";
const lineOpenChatUrl = import.meta.env.VITE_LINE_OPENCHAT_URL || "";

const communityFlows = [
  ["加入好友", "加入 LINE 後，可詢問參拜方式、查看活動報名與打開導覽。"],
  ["查看活動報名", "法會、導覽與服務活動集中呈現，快速確認時間、地點與參加方式。"],
  ["查詢或客服", "用手機或報名編號查進度；遇到問題時可留下訊息接續處理。"]
];

const guardrails = [
  "此頁為萬春宮線上服務入口，正式公告請以廟方為準",
  "活動時間、名額與服務內容以正式公告為準",
  "不處理正式捐款、交易或敏感個資",
  "重要廟務問題請透過正式窗口再次確認"
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
            <small>LINE 社群入口</small>
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
        <section className="community-hero">
          <div>
            <span className="tag">LINE 入口</span>
            <h1>LINE 社群與服務入口</h1>
            <p>
              加入 LINE 後，可以查看近期活動、開啟參拜導覽，或留下需要協助的問題。
              常用服務集中在手機裡，比現場臨時找資訊更方便。
            </p>
            <div className="hero-actions">
              <ExternalAction href={lineAddFriendUrl}>
                加入官方帳號 <ExternalLink size={18} />
              </ExternalAction>
              <ExternalAction href={lineOpenChatUrl}>
                加入 OpenChat <UsersRound size={18} />
              </ExternalAction>
            </div>
            <p className="notice">
              OpenChat 尚未設定時按鈕會停用；目前主要入口為 LINE 帳號 @983zhzni。
            </p>
          </div>

          <div className="community-phone" aria-label="LINE 對話示意">
            <div className="phone-bar" />
            <div className="chat-bubble bot">
              <MessageCircle size={16} />
              歡迎使用萬春宮線上服務
            </div>
            <div className="chat-bubble user">最近有什麼活動？</div>
            <div className="chat-bubble bot">
              <CalendarDays size={16} />
              可先查看活動卡片，也可以查報名進度
            </div>
            <figure className="phone-rich-menu-preview">
              <img
                src="/assets/rich-menu/main-2500x1686.png"
                alt="LINE 底部選單示意：詢問參拜方式、查看活動報名、抽文化籤、看主殿導覽、查報名進度、聯絡客服。"
              />
            </figure>
          </div>
        </section>

        <section className="public-section">
          <div className="section-kicker">社群流程</div>
          <h2>把常用服務集中到 LINE</h2>
          <div className="community-flow-grid">
            {communityFlows.map(([title, body], index) => (
              <article className="flow-card" key={title}>
                <span>{index + 1}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="public-section community-guardrails">
          <div>
            <div className="section-kicker">使用提醒</div>
            <h2>線上服務仍需保留清楚界線</h2>
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

        <section className="public-section public-band">
          <div>
            <div className="section-kicker">開始使用</div>
            <h2>加入 LINE 後，活動與客服都能接著查</h2>
            <p>
              先從活動列表、報名查詢或客服中心開始；需要回到官網時，也能再查看參拜導覽與聯絡資訊。
            </p>
          </div>
          <div className="band-actions">
            <Link className="button primary" to="/events">
              活動列表 <CalendarDays size={18} />
            </Link>
            <Link className="button" to="/support">
              客服中心 <MessageCircle size={18} />
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
