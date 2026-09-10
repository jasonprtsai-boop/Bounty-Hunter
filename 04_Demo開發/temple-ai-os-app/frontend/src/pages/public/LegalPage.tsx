import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import "../../styles/public.css";

type LegalPageProps = {
  kind: "privacy" | "terms";
};

const privacySections = [
  {
    title: "資料使用目的",
    body: "本政策適用於臺中萬春宮線上便民服務（包含官方網站、LINE 官方服務、活動報名、參拜諮詢與信眾服務）。我們致力於維護信眾個人資料與隱私安全，僅於特定服務目的必要範圍內進行處理與利用。"
  },
  {
    title: "蒐集之資料類別",
    body: "當您使用活動線上報名或客服諮詢時，系統可能依功能需要蒐集您的姓名、聯絡電話、LINE 帳號識別資訊、報名內容或留言諮詢事項。所蒐集之資訊僅供該活動確認、報到聯繫或客服回覆之用。"
  },
  {
    title: "資料保存與安全維護",
    body: "信眾提供之報名與諮詢紀錄，廟方將採取合理之資訊安全措施進行防護，防範未經授權之存取或外洩。各項活動資料於該次法會或活動執行完畢且無後續查驗需求後，將妥善封存或安全刪除。"
  },
  {
    title: "第三方通訊與技術支援",
    body: "本服務結合 LINE 官方平台技術與雲端資料庫維運，以提供信眾即時訊息與便捷查驗。使用相關平台功能時，亦同時適用各該通訊服務商之隱私政策與安全規範。"
  },
  {
    title: "服務諮詢與信仰本質",
    body: "線上各項功能（包含問答、導覽與文化抽籤）旨在提供宮廟歷史文化介紹與參拜便利，不涉及任何商業金融交易；重要廟務、正式祈安祭典仍以廟方現場公告與服務人員說明為準。"
  },
  {
    title: "信眾權益與權利行使",
    body: "信眾就其所提供之個人資料，依法得向萬春宮服務台或線上客服請求查詢、更正或請求停止利用。若有任何疑問，歡迎隨時洽詢萬春宮服務中心。"
  }
];

const termsSections = [
  {
    title: "服務範圍與宗旨",
    body: "本服務由臺中萬春宮提供，包含廟宇官網、LINE 官方服務、活動資訊公布、線上登記、參拜導覽及文化互動功能，旨在服務十方信眾與推廣媽祖信仰文化。"
  },
  {
    title: "正式活動資訊公告",
    body: "各項法會、宮慶祭典、講座與祈福活動之確切辦理時間、儀軌動線、名額與現場配合事項，均以萬春宮官方正式公告及現場服務人員引導為準。"
  },
  {
    title: "線上登記與報名規範",
    body: "信眾透過線上系統填寫活動登記時，請確保所填資料之真實與正確性，以便廟方建立名冊與聯繫通知。若有名額限制或候補規則，敬請配合現場作業辦理。"
  },
  {
    title: "文化互動與內容參考",
    body: "本系統提供之文化抽籤、擲筊問事與參拜問答，係基於傳統民俗文化解說與生活提醒設計，內容僅供信眾調和身心之文化參考，不作命運斷言或重大決策保證。"
  },
  {
    title: "系統維護與服務穩定",
    body: "為提供信眾良好之數位體驗，本系統將定期進行功能維護與安全升級。如遇天災、不可抗力或電信網路異常致服務暫停，廟方將盡速協同技術團隊排除恢復。"
  },
  {
    title: "條款修訂與生效",
    body: "萬春宮得因應廟務發展、法規變更或數位服務升級需要，適時修訂本服務條款與隱私權規範。修訂後之內容自公告於官方網站時起生效。"
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
            <strong>萬春宮線上服務</strong>
            <small>{title}</small>
          </span>
        </Link>
        <nav aria-label="法務頁導覽">
          <Link to="/site">官網首頁</Link>
          <Link to="/community">LINE 服務</Link>
          <Link to={isPrivacy ? "/terms" : "/privacy"}>{isPrivacy ? "使用條款" : "隱私權"}</Link>
        </nav>
      </header>

      <main className="legal-main">
        <section className="legal-hero">
          <span className="tag">服務規範</span>
          <h1>{title}</h1>
          <p>
            感謝十方善信護持。本規範旨在維護信眾權益，並說明萬春宮線上便民服務之各項使用原則。
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
        <span>臺中萬春宮（藍興媽祖） ‧ 線上便民服務 ‧ 服務內容以現場公告為準</span>
        <nav aria-label="頁尾連結">
          <Link to="/site">官網首頁</Link>
          <Link to="/community">LINE 服務</Link>
        </nav>
      </footer>
    </div>
  );
}
