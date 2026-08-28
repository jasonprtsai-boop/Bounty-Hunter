import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import "../../styles/public.css";

type LegalPageProps = {
  kind: "privacy" | "terms";
};

const privacySections = [
  {
    title: "資料使用目的",
    body: "本頁為萬春宮智慧服務示範頁，可能在體驗活動報名、LINE 服務、客服聯繫與問答功能時處理必要資料。正式營運前，需由實際營運單位確認資料處理政策。"
  },
  {
    title: "可能蒐集的資料",
    body: "示範服務可能使用 LINE 使用者識別碼、姓名或暱稱、活動報名內容、客服訊息與問答內容。除展示與測試外，不應用於正式商業用途。"
  },
  {
    title: "資料保存與刪除",
    body: "示範資料可依測試需要重設或刪除。若未來改為正式服務，應補齊保存期間、刪除流程、使用者查詢與更正方式。"
  },
  {
    title: "第三方服務",
    body: "本服務可能使用 LINE、OpenAI、Supabase 與網站部署服務。各服務仍適用其原廠條款與隱私政策。"
  },
  {
    title: "不處理的事項",
    body: "示範頁不處理正式捐款、交易、醫療、法律或其他高風險決策；重要廟務仍應以正式窗口確認。"
  },
  {
    title: "示範限制",
    body: "本頁僅供展示與測試，不代表萬春宮官方正式服務。正式活動、開放時間與服務內容仍以廟方公告為準。"
  }
];

const termsSections = [
  {
    title: "使用範圍",
    body: "使用者可體驗宮廟官網、LINE 服務頁、問答、活動報名、參拜導覽與客服流程。此服務目前定位為展示用途。"
  },
  {
    title: "非官方營運",
    body: "除非另有正式公告，本示範頁不代表萬春宮官方正式營運，也不構成宗教服務、活動名額、捐款或任何交易承諾。"
  },
  {
    title: "活動與內容",
    body: "示範頁中的活動、導覽、公告與客服內容可能為測試資料或示範資料，實際資訊仍應以廟方正式公告為準。"
  },
  {
    title: "問答內容限制",
    body: "自動問答內容可能受資料來源與模型限制影響，內容僅供參考。重要事項需由正式窗口確認。"
  },
  {
    title: "可用性",
    body: "示範頁可能因開發、測試、第三方服務限制或部署調整而中斷、重設或刪除資料，不保證持續可用。"
  },
  {
    title: "條款調整",
    body: "若本示範頁進入正式營運，需重新整理正式服務條款、隱私權政策、資料保存政策與管理責任。"
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
          <span className="brand-mark">宮</span>
          <span>
            <strong>萬春宮智慧服務</strong>
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
          <span className="tag">服務說明</span>
          <h1>{title}</h1>
          <p>
            最後更新：2026-08-06。此頁用於示範服務與測試說明，不是正式法律文件。
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
