import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import "../../styles/public.css";

type LegalPageProps = {
  kind: "privacy" | "terms";
};

const privacySections = [
  {
    title: "資料使用目的",
    body: "Temple AI OS 萬春宮示範官網用於競賽 Demo 與系統測試，可能處理活動報名、LINE 使用者識別、服務單與 AI 問答紀錄。正式營運前，需由實際營運單位確認資料處理政策。"
  },
  {
    title: "可能蒐集的資料",
    body: "Demo 可能使用 LINE userId、LIFF ID token、姓名或暱稱、活動報名內容、客服訊息、問答內容與管理後台操作紀錄。除系統展示與測試外，不應用於正式商業用途。"
  },
  {
    title: "資料保存與刪除",
    body: "Demo 資料可依測試需要重設或刪除。若未來改為正式服務，應補齊資料保存期間、刪除流程、使用者查詢與更正機制。"
  },
  {
    title: "第三方服務",
    body: "本 Demo 可能串接 LINE Messaging API、LINE Login、LIFF、OpenAI API、Supabase 與部署平台。各服務仍適用其原廠條款與隱私政策。"
  },
  {
    title: "敏感資訊",
    body: "Channel secret、access token、OpenAI API key、Supabase service key 等敏感資訊不得寫入公開 repo，應存放於本機 .env 或部署平台 secret。"
  },
  {
    title: "Demo 限制",
    body: "本頁僅供競賽與測試展示，不代表萬春宮官方正式服務，不處理正式捐款、交易、醫療、法律或其他高風險決策。"
  }
];

const termsSections = [
  {
    title: "使用範圍",
    body: "使用者可透過 Temple AI OS Demo 體驗宮廟官網、LINE 社群、LIFF、AI 問答、活動報名與後台流程。此服務目前定位為展示用途。"
  },
  {
    title: "非官方營運",
    body: "除非另有正式公告，本 Demo 不代表萬春宮官方正式營運，也不構成宗教服務、活動名額、捐款或任何交易承諾。"
  },
  {
    title: "活動與內容",
    body: "Demo 中的活動、導覽、公告與服務單內容可能為測試資料或示範資料，實際資訊仍應以廟方正式公告為準。"
  },
  {
    title: "AI 內容限制",
    body: "AI 回覆可能受資料來源、提示與模型限制影響，內容僅供參考。重要事項需由管理者或正式窗口確認。"
  },
  {
    title: "可用性",
    body: "Demo 可能因開發、測試、第三方服務限制或部署調整而中斷、重設或刪除資料，不保證持續可用。"
  },
  {
    title: "條款調整",
    body: "若本 Demo 進入正式營運，需重新整理正式服務條款、隱私權政策、資料保存政策與管理責任。"
  }
];

export function LegalPage({ kind }: LegalPageProps) {
  const isPrivacy = kind === "privacy";
  const title = isPrivacy ? "隱私權政策" : "使用條款";
  const sections = isPrivacy ? privacySections : termsSections;

  return (
    <div className="public-shell legal-page">
      <header className="public-nav">
        <Link to="/site" className="brand">
          <span className="brand-mark">AI</span>
          <span>
            <strong>Temple AI OS</strong>
            <small>{title}</small>
          </span>
        </Link>
        <nav aria-label="法務頁導覽">
          <Link to="/site">官網</Link>
          <Link to="/community">LINE 社群</Link>
          <Link to={isPrivacy ? "/terms" : "/privacy"}>{isPrivacy ? "使用條款" : "隱私權"}</Link>
        </nav>
      </header>

      <main className="legal-main">
        <section className="legal-hero">
          <span className="tag">Demo policy</span>
          <h1>{title}</h1>
          <p>
            最後更新：2026-08-06。此頁用於 Temple AI OS Demo 與 LINE Developers 設定，
            不是正式法律文件。
          </p>
        </section>

        <section className="legal-card">
          {sections.map((section) => (
            <article key={section.title}>
              <ShieldCheck size={20} />
              <div>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
              </div>
            </article>
          ))}
        </section>
      </main>

      <footer className="public-footer">
        <span>正式營運前，需由營運方確認法務、個資與資料保存責任。</span>
        <nav aria-label="頁尾連結">
          <Link to="/site">官網</Link>
          <Link to="/community">社群入口</Link>
        </nav>
      </footer>
    </div>
  );
}
