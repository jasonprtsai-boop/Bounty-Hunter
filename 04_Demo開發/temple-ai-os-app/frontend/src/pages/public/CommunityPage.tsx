import { Link } from "react-router-dom";
import { BellRing, Bot, CalendarDays, CheckCircle2, ExternalLink, MessageCircle, ShieldCheck, UsersRound } from "lucide-react";
import "../../styles/public.css";

const lineAddFriendUrl = import.meta.env.VITE_LINE_ADD_FRIEND_URL || "https://line.me/R/ti/p/%40983zhzni";
const lineOpenChatUrl = import.meta.env.VITE_LINE_OPENCHAT_URL || "";

const communityFlows = [
  ["加入好友", "信眾先加入 LINE 官方帳號，從 Rich Menu 進入 AI 問答、活動列表與服務單。"],
  ["查看活動", "法會、導覽與志工活動集中在 LIFF 呈現，減少公告分散與人工重複通知。"],
  ["後台追蹤", "管理者可在後台檢視報名、客服與推播紀錄，確保每一筆需求都有狀態。"]
];

const guardrails = [
  "此帳號為 Temple AI OS 示範用官方帳號",
  "不代表萬春宮官方正式營運",
  "不處理正式捐款、交易或敏感個資",
  "Channel secret 與 access token 僅能放在部署平台 secret"
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
          <span className="brand-mark">AI</span>
          <span>
            <strong>Temple AI OS</strong>
            <small>LINE 社群入口</small>
          </span>
        </Link>
        <nav aria-label="社群導覽">
          <Link to="/site">官網</Link>
          <Link to="/">LIFF</Link>
          <Link to="/admin">後台</Link>
          <Link to="/privacy">隱私權</Link>
        </nav>
      </header>

      <main>
        <section className="community-hero">
          <div>
            <span className="tag">LINE-first</span>
            <h1>LINE 官方帳號與社群入口</h1>
            <p>
              以 LINE 作為信眾服務入口，串接 AI 問答、活動報名、客服紀錄與管理後台，
              讓宮廟團隊可以用熟悉的通訊工具維持服務品質。
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
              OpenChat 尚未設定時按鈕會停用；目前主要入口為 LINE 官方帳號 @983zhzni。
            </p>
          </div>

          <div className="community-phone" aria-label="LINE 對話示意">
            <div className="phone-bar" />
            <div className="chat-bubble bot">
              <Bot size={16} />
              歡迎使用 Temple AI OS 示範服務
            </div>
            <div className="chat-bubble user">最近有什麼活動？</div>
            <div className="chat-bubble bot">
              <CalendarDays size={16} />
              可查看近期活動、報名狀態與參拜資訊
            </div>
            <Link className="button primary" to="/events">
              查看活動列表
            </Link>
          </div>
        </section>

        <section className="public-section">
          <div className="section-kicker">社群流程</div>
          <h2>把信眾互動收斂到 LINE 與後台</h2>
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
            <div className="section-kicker">安全邊界</div>
            <h2>Demo 社群保留清楚的服務界線</h2>
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
            <div className="section-kicker">後續設定</div>
            <h2>LINE 官方帳號已建立，下一步是綁定公開網址</h2>
            <p>
              官網部署完成後，可在 LINE Login 建立 LIFF app，並把後端 webhook URL 設到 Messaging API。
              敏感 token 不會寫入 repo。
            </p>
          </div>
          <div className="band-actions">
            <Link className="button primary" to="/admin/notifications">
              推播後台 <BellRing size={18} />
            </Link>
            <Link className="button" to="/support">
              服務單 <MessageCircle size={18} />
            </Link>
            <Link className="button" to="/member">
              會員資料 <CheckCircle2 size={18} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="public-footer">
        <span>LINE 官方帳號：Temple AI OS示範 / @983zhzni</span>
        <nav aria-label="頁尾連結">
          <Link to="/privacy">隱私權政策</Link>
          <Link to="/terms">使用條款</Link>
        </nav>
      </footer>
    </div>
  );
}
