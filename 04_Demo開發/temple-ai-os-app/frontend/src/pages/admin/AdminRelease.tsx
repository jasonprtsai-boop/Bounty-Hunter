import { CheckCircle, Copy, ExternalLink, Image, Rocket, Store } from "lucide-react";
import { useState } from "react";
import { Shell } from "../../components/Shell";
import { apiFetch } from "../../lib/api";

type RichMenuPublishResult = {
  published: boolean;
  rich_menu_id?: string;
  reason?: string;
};

const profileImageUrl = "/assets/brand/line-oa-profile-v2.png";
const profileBackgroundUrl = "/assets/brand/line-oa-profile-background-v1.png";
const stickerPreviewUrl = "/stickers";
const lineManagerUrl = "https://manager.line.biz/account/@983zhzni";
const businessProfileUrl = "https://page.line.biz/account-page/2010643275365275/profile";

const businessProfileFields = [
  {
    label: "商業簡介短標",
    value: "Temple AI OS示範｜LINE × AI 智慧宮廟服務入口"
  },
  {
    label: "商業簡介",
    value:
      "Temple AI OS 是智慧宮廟服務 Demo，示範如何把 LINE 官方帳號、AI 問答、活動報名、會員服務與管理後台整合為一個入口。本帳號以萬春宮公開資料建立展示場景，用於競賽與系統測試，不代表萬春宮官方正式營運。正式活動、開放時間與服務內容請以廟方公告為準。"
  },
  {
    label: "網站",
    value: "https://temple-ai-os-demo.jasonprtsai.chatgpt.site"
  },
  {
    label: "隱私權政策",
    value: "https://temple-ai-os-demo.jasonprtsai.chatgpt.site/privacy"
  },
  {
    label: "服務條款",
    value: "https://temple-ai-os-demo.jasonprtsai.chatgpt.site/terms"
  },
  {
    label: "示範場景地址",
    value: "臺中市中區成功路212號"
  },
  {
    label: "公開資料電話",
    value: "04-22245964"
  },
  {
    label: "營業時間說明",
    value: "此帳號為競賽 Demo，不提供正式營業時間；參拜與活動資訊請以廟方公告為準。"
  }
];

const businessProfileChecklist = [
  "進入 LINE 後台的 Profile / 商業簡介頁面設定。",
  "先上傳大頭貼與背景圖，再編輯商業簡介文字。",
  "網站、隱私權政策、服務條款填入已部署的公開網址。",
  "電話與地址屬於萬春宮公開資料；若未取得廟方正式授權，建議只放在簡介文字中作為示範說明，不要讓帳號看起來像正式客服入口。",
  "完成後按下 Publish changes / 發布變更。"
];

export function AdminRelease() {
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  async function copyText(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
  }

  async function publishRichMenu() {
    if (!window.confirm("發布後會更新 LINE 官方帳號所有好友看到的 Rich Menu。確認發布？")) {
      return;
    }
    setPublishing(true);
    setMessage("");
    setError("");
    try {
      const result = await apiFetch<RichMenuPublishResult>(
        "/api/admin/rich-menu/publish",
        { method: "POST", body: "{}" },
        true
      );
      setMessage(result.rich_menu_id ? `Rich Menu 已發布：${result.rich_menu_id}` : "Rich Menu 已發布");
    } catch (err) {
      setError(err instanceof Error ? err.message : "發布失敗");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <Shell title="正式發布" mode="admin">
      <section className="release-grid">
        <article className="tool-panel release-card">
          <div className="section-title">
            <Rocket size={20} />
            <h2>Rich Menu</h2>
          </div>
          <p>目前版本已連到貼圖小舖，發布後 LINE 底部選單會更新為正式展示版。</p>
          <button className="button primary" type="button" disabled={publishing} onClick={publishRichMenu}>
            <Rocket size={18} />
            {publishing ? "發布中" : "發布 Rich Menu"}
          </button>
          {message && <p className="notice">{message}</p>}
          {error && <p className="error-text">{error}</p>}
        </article>

        <article className="tool-panel release-card">
          <div className="section-title">
            <Image size={20} />
            <h2>大頭貼與背景</h2>
          </div>
          <img className="release-avatar" src={profileImageUrl} alt="Temple AI OS LINE 官方帳號大頭貼" />
          <img className="release-cover" src={profileBackgroundUrl} alt="Temple AI OS LINE 官方帳號背景圖" />
          <div className="inline-actions">
            <a className="button" href={profileImageUrl} target="_blank" rel="noreferrer">
              <Image size={18} />
              大頭貼
            </a>
            <a className="button" href={profileBackgroundUrl} target="_blank" rel="noreferrer">
              <Image size={18} />
              背景圖
            </a>
            <a className="button" href={lineManagerUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={18} />
              LINE 後台
            </a>
          </div>
        </article>

        <article className="tool-panel release-card release-wide-card">
          <div className="section-title">
            <CheckCircle size={20} />
            <h2>商業簡介設定稿</h2>
          </div>
          <p>
            這份文案用於 LINE Profile / 商業簡介頁面。帳號仍定位為 Demo，避免誤導使用者以為是萬春宮官方客服。
          </p>
          <div className="profile-copy-list">
            {businessProfileFields.map((field) => (
              <div className="profile-copy-row" key={field.label}>
                <div>
                  <strong>{field.label}</strong>
                  <p>{field.value}</p>
                </div>
                <button className="button icon-button" type="button" onClick={() => copyText(field.label, field.value)}>
                  <Copy size={17} />
                  <span>{copied === field.label ? "已複製" : "複製"}</span>
                </button>
              </div>
            ))}
          </div>
          <div className="setting-steps">
            {businessProfileChecklist.map((step, index) => (
              <div key={step}>
                <span>{index + 1}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
          <div className="inline-actions">
            <a className="button primary" href={businessProfileUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={18} />
              開啟商業簡介
            </a>
            <a className="button" href={lineManagerUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={18} />
              LINE 後台
            </a>
          </div>
        </article>

        <article className="tool-panel release-card">
          <div className="section-title">
            <Store size={20} />
            <h2>貼圖素材</h2>
          </div>
          <p>第一套 8 張靜態貼圖已放在貼圖小舖頁，後續可送 LINE Creators Market 審核。</p>
          <a className="button" href={stickerPreviewUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={18} />
            檢視貼圖小舖
          </a>
        </article>
      </section>
    </Shell>
  );
}
