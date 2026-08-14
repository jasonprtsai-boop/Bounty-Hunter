import { ExternalLink, Image, Rocket, Store } from "lucide-react";
import { useState } from "react";
import { Shell } from "../../components/Shell";
import { apiFetch } from "../../lib/api";

type RichMenuPublishResult = {
  published: boolean;
  rich_menu_id?: string;
  reason?: string;
};

const profileImageUrl = "/assets/brand/line-oa-profile-v1.png";
const stickerPreviewUrl = "/stickers";
const lineManagerUrl = "https://manager.line.biz/account/@983zhzni";

export function AdminRelease() {
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
            <h2>大頭貼</h2>
          </div>
          <img className="release-avatar" src={profileImageUrl} alt="Temple AI OS LINE 官方帳號大頭貼" />
          <div className="inline-actions">
            <a className="button" href={profileImageUrl} target="_blank" rel="noreferrer">
              <Image size={18} />
              開啟 PNG
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
