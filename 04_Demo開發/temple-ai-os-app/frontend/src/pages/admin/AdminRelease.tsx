import {
  CheckCircle,
  Copy,
  ExternalLink,
  Image,
  Megaphone,
  MessageSquareText,
  Rocket,
  Settings,
  ShieldCheck,
  Store
} from "lucide-react";
import { useState } from "react";
import { useConfirmDialog } from "../../components/ConfirmDialog";
import { Shell } from "../../components/AdminShell";
import { StatePanel } from "../../components/StatePanel";
import { apiFetch } from "../../lib/api";
import { canPublishRelease, getStoredAdminRole } from "../../lib/adminPermissions";
import { hasConfiguredLiffId, liffEntryUrl } from "../../lib/liff";
import { PUBLIC_SITE_BASE_URL } from "../../lib/siteLinks";

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
const publicSiteBaseUrl = PUBLIC_SITE_BASE_URL;
const lineServiceEntryUrl = liffEntryUrl("/");
const eventLookupUrl = liffEntryUrl("/events?lookup=1");
const supportEntryUrl = liffEntryUrl("/support");
const releaseChecklistStorageKey = "templeReleaseChecklist";

const businessProfileFields = [
  {
    label: "商業簡介短標",
    value: "萬春宮線上服務｜LINE 宮廟服務入口"
  },
  {
    label: "商業簡介",
    value:
      "萬春宮線上服務把 LINE 帳號、參拜問答、活動報名、報名進度查詢、文化抽籤、擲筊問事與管理後台整合為一個入口。本帳號以萬春宮公開資料整理服務情境；正式活動、開放時間與服務內容請以廟方公告為準。"
  },
  {
    label: "網站",
    value: publicSiteBaseUrl
  },
  {
    label: "隱私權政策",
    value: `${publicSiteBaseUrl}/privacy`
  },
  {
    label: "服務條款",
    value: `${publicSiteBaseUrl}/terms`
  },
  {
    label: "萬春宮地址",
    value: "臺中市中區成功路212號"
  },
  {
    label: "公開資料電話",
    value: "04-22245964"
  },
  {
    label: "營業時間說明",
    value: "參拜與活動資訊請以廟方公告為準；重要廟務建議再向廟方或服務人員確認。"
  }
];

const businessProfileChecklist = [
  "進入 LINE 後台的 Profile / 商業簡介頁面設定。",
  "到 LINE 後台上傳品牌頭像與背景圖，再編輯商業簡介文字。",
  "網站、隱私權政策、服務條款填入已部署的公開網址。",
  "電話與地址屬於萬春宮公開資料；若未取得廟方正式授權，建議在簡介文字中清楚保留「正式資訊以廟方公告為準」的提醒。",
  "完成後按下 Publish changes / 發布變更。"
];

const accountSettingFields = [
  {
    label: "帳號名稱",
    value: "萬春宮線上服務"
  },
  {
    label: "狀態訊息",
    value: "LINE 宮廟服務入口｜參拜・活動・抽籤・擲筊"
  },
  {
    label: "歡迎訊息",
    value:
      "歡迎加入萬春宮線上服務。你可以點選下方選單使用參拜問答、活動報名、抽文化籤、主殿導覽、報名進度或聯絡客服；擲筊問事可從線上服務入口進入。正式活動、開放時間與服務內容請以廟方公告為準。"
  },
  {
    label: "聊天回覆模式",
    value: "Webhook 啟用；自動回應保持關閉或只保留服務提醒，避免和問答 webhook 重複回覆。"
  },
  {
    label: "LINE VOOM 互動",
    value: "可開放按讚；留言建議先關閉或每日人工檢查，避免未授權服務詢問被誤認為正式客服。"
  },
  {
    label: "禁止放入內容",
    value: "不要放正式捐款帳號、LINE Pay、官方客服承諾、未授權廟方公告或任何私人憑證。"
  }
];

const publicLinks = [
  ["公開官網", `${publicSiteBaseUrl}/site`],
  ["LINE 社群入口", `${publicSiteBaseUrl}/community`],
  [hasConfiguredLiffId() ? "LIFF 入口" : "LINE 入口（公開頁備援）", lineServiceEntryUrl],
  ["擲筊問事", `${publicSiteBaseUrl}/jiao`],
  ["加入好友", "https://line.me/R/ti/p/%40983zhzni"],
  ["貼圖小舖", `${publicSiteBaseUrl}/stickers`],
  ["隱私權政策", `${publicSiteBaseUrl}/privacy`],
  ["服務條款", `${publicSiteBaseUrl}/terms`]
] as const;

const voomPostExamples = [
  {
    title: "線上服務介紹",
    asset: "assets/banners/home.png",
    value:
      `臺中萬春宮線上便民服務正式上線。\n\n這是一個以 LINE 為核心的宮廟服務平台，將參拜導覽、活動報名、報名進度查詢、文化抽籤、擲筊問事與信眾客服整合為一體。\n\n歡迎十方善信多加利用，共沐媽祖神恩。\n\n服務入口：${publicSiteBaseUrl}/site\n\n#萬春宮 #藍興媽祖 #線上服務 #參拜導覽 #文化傳承`
  },
  {
    title: "活動報名服務",
    asset: "assets/banners/events.png",
    value:
      `萬春宮各項法會與文化講座開放線上報名。\n\n信眾在 LINE 收到活動消息後，可直接於手機完成線上登記，並隨時查詢登記狀態與接收活動提醒。\n\n提醒：各項活動名額與時間請以廟方最新公告為準。\n\n活動中心：${publicSiteBaseUrl}/events\n\n#萬春宮 #法會報名 #文化講座 #線上便民服務`
  },
  {
    title: "貼圖小舖預告",
    asset: "assets/flex/fortune-card.png",
    value:
      `萬春宮原創角色「春福小使」貼圖即將登場。\n\n以「日常問候、心存感謝、平安祈福」為主題設計，讓信眾在日常對話中也能傳遞媽祖福氣與溫暖祝福。\n\n貼圖專區：${publicSiteBaseUrl}/stickers\n\n即將於 LINE 貼圖小舖正式推出，敬請期待。\n\n#春福小使 #萬春宮 #LINE貼圖 #日常問候 #平安祝福`
  },
  {
    title: "文化導覽服務",
    asset: "assets/banners/tour.png",
    value:
      `走進老城廟埕，開啟萬春宮文化導覽。\n\n信眾透過手機即可閱覽宮廟歷史、正殿動線與殿堂建築特色。現場亦備有文史導覽解說，歡迎蒞臨參拜。\n\n導覽入口：${publicSiteBaseUrl}/tour/main-hall\n\n參拜動線與開放區域請依現場志工與公告引導。\n\n#萬春宮 #文化導覽 #正殿參拜 #臺中媽祖`
  }
];

const broadcastExamples = [
  {
    title: "活動前一天提醒",
    value:
      `【萬春宮活動提醒】\n你報名的活動將於明天開始。\n\n地點：萬春宮\n請以活動頁與廟方公告為準。\n\n查詢報名進度：\n${eventLookupUrl}\n\n正式活動、時間與服務內容請以廟方公告為準。`
  },
  {
    title: "客服回覆追蹤",
    value:
      `【萬春宮客服回覆】\n你先前留下的問題已有回覆。\n\n請開啟客服頁查看：\n${supportEntryUrl}\n\n廟務、活動與捐款問題仍請以廟方公告或服務人員說明為準。`
  },
  {
    title: "服務發布前檢查",
    value:
      `萬春宮線上服務今日檢查重點：\n1. LINE Rich Menu 服務入口\n2. 參拜問答與活動卡片\n3. 活動報名入口\n4. 抽籤與擲筊文化互動\n5. 後台管理與通知任務\n\n公開服務頁：\n${publicSiteBaseUrl}/site`
  }
];

const releaseChecklist = [
  "LINE 商業簡介已貼上服務提醒與公開網址",
  "帳號名稱、狀態訊息、歡迎訊息與 VOOM 互動設定已確認",
  "LINE 品牌頭像圖檔已更新為 line-oa-profile-v2.png",
  "LINE 背景圖檔已更新為 line-oa-profile-background-v1.png",
  "Messaging API Webhook 驗證成功",
  "Rich Menu 已發布，詢問、活動、抽籤、導覽、查詢與客服入口可開啟；擲筊可從線上服務入口進入",
  "至少一篇 LINE VOOM 服務貼文已建立草稿或排程",
  "手機 LINE 實測可開有效 LIFF 或公開頁備援入口與活動頁",
  "貼圖素材已確認，等待 LINE Creators Market 送審或審核",
  "發布前已暖機 Render 後端"
];

const setupSequence = [
  ["1", "公開頁面", "確認官網、活動、隱私權與條款都可正常開啟。"],
  ["2", "LINE 帳號", "更新品牌頭像、背景圖、商業簡介與歡迎訊息。"],
  ["3", "Rich Menu", "發布 LINE 底部選單，確認每個入口的圖像、文案與實際動作一致。"],
  ["4", "實機驗收", "用手機 LINE 確認加入好友、活動、客服、推播與貼圖入口。"]
];

function readChecklistState() {
  try {
    return JSON.parse(localStorage.getItem(releaseChecklistStorageKey) || "{}") as Record<string, boolean>;
  } catch {
    return {};
  }
}

export function AdminRelease() {
  const currentRole = getStoredAdminRole();
  const canPublish = canPublishRelease(currentRole);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>(readChecklistState);
  const { requestConfirmation, confirmDialog } = useConfirmDialog();

  async function copyText(label: string, value: string) {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.setAttribute("readonly", "true");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      setCopied(label);
      setError("");
    } catch {
      setError("複製失敗，請手動選取文字。");
    }
  }

  function toggleChecklist(item: string) {
    const next = { ...checked, [item]: !checked[item] };
    setChecked(next);
    localStorage.setItem(releaseChecklistStorageKey, JSON.stringify(next));
  }

  async function publishRichMenu() {
    if (
      !(await requestConfirmation({
        title: "發布 Rich Menu",
        body: "發布後 LINE 帳號所有好友看到的底部選單會更新，請確認公開網址、有效 LIFF 或公開頁備援入口與服務提醒已完成檢查。",
        confirmLabel: "發布選單",
        tone: "primary"
      }))
    ) {
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

  const copiedProfileText = businessProfileFields.map((field) => `${field.label}：${field.value}`).join("\n");
  const copiedAccountText = accountSettingFields.map((field) => `${field.label}：${field.value}`).join("\n");
  const doneCount = releaseChecklist.filter((item) => checked[item]).length;
  const nextChecklistItems = releaseChecklist.filter((item) => !checked[item]).slice(0, 3);

  return (
    <Shell title="設定與發布中心" mode="admin">
      {!canPublish ? (
        <StatePanel
          variant="error"
          title="權限不足"
          body="LINE 帳號設定與 Rich Menu 發布會影響所有使用者，只有最高權限帳號可以操作。"
        />
      ) : (
      <>
      <section className="admin-setup-flow" aria-label="設定順序">
        {setupSequence.map(([step, title, body]) => (
          <article key={title}>
            <span>{step}</span>
            <strong>{title}</strong>
            <p>{body}</p>
          </article>
        ))}
      </section>

      <section className="release-next-panel" aria-label="下一步設定">
        <div>
          <span className="panel-kicker">下一步</span>
          <h2>先完成最會影響上線的設定</h2>
        </div>
        <div className="release-next-list">
          {(nextChecklistItems.length ? nextChecklistItems : ["所有設定已勾選，請用手機 LINE 做最後實機驗收。"]).map((item) => (
            <span key={item}>
              <CheckCircle size={17} />
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="release-grid">
        <article className="tool-panel release-card release-status-card">
          <div className="section-title">
            <ShieldCheck size={20} />
            <h2>發布狀態總覽</h2>
          </div>
          <div className="release-status-grid">
            <div>
              <strong>{doneCount}/{releaseChecklist.length}</strong>
              <span>人工設定完成</span>
            </div>
            <div>
              <strong>已驗證</strong>
              <span>後端檢查通過</span>
            </div>
            <div>
              <strong>已發布</strong>
              <span>公開網站狀態</span>
            </div>
            <div>
              <strong>服務</strong>
              <span>商業簡介定位</span>
            </div>
          </div>
          <p className="notice">這裡記錄的是你在 LINE 後台手動設定的進度，勾選狀態只存在這台電腦的瀏覽器。</p>
        </article>

        <article className="tool-panel release-card release-action-card">
          <div className="section-title">
            <Rocket size={20} />
            <h2>Rich Menu</h2>
          </div>
          <p>目前版本採用民眾常用服務入口，發布後 LINE 底部選單會更新為新版活動、導覽、查詢與客服動線。</p>
          <button className="button primary" type="button" disabled={publishing} onClick={publishRichMenu}>
            <Rocket size={18} />
            {publishing ? "發布中" : "發布 Rich Menu"}
          </button>
          {message && <p className="notice">{message}</p>}
          {error && <p className="error-text" role="alert">{error}</p>}
        </article>

        <article className="tool-panel release-card release-media-card">
          <div className="section-title">
            <Image size={20} />
            <h2>品牌圖檔</h2>
          </div>
          <p>控制台不再放大型頭像預覽；這裡只保留圖檔連結，實際更換到 LINE 後台操作。</p>
          <div className="inline-actions">
            <a className="button" href={profileImageUrl} target="_blank" rel="noreferrer">
              <Image size={18} />
              品牌頭像圖檔
            </a>
            <a className="button" href={profileBackgroundUrl} target="_blank" rel="noreferrer">
              <Image size={18} />
              背景圖檔
            </a>
            <a className="button" href={lineManagerUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={18} />
              LINE 後台
            </a>
          </div>
        </article>

        <article className="tool-panel release-card release-copy-card">
          <div className="section-title">
            <CheckCircle size={20} />
            <h2>商業簡介設定稿</h2>
          </div>
          <p>
            這份文案用於 LINE Profile / 商業簡介頁面。未取得正式授權前，仍需保留「正式資訊以廟方公告為準」的提醒。
          </p>
          <button className="button" type="button" onClick={() => copyText("全部商業簡介", copiedProfileText)}>
            <Copy size={17} />
            {copied === "全部商業簡介" ? "已複製全部欄位" : "複製全部欄位"}
          </button>
          <div className="profile-copy-list compact">
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

        <article className="tool-panel release-card release-copy-card">
          <div className="section-title">
            <Settings size={20} />
            <h2>帳號設定稿</h2>
          </div>
          <p>這組內容用於 LINE Official Account Manager 的帳號、歡迎訊息、回覆模式與 VOOM 互動設定。</p>
          <button className="button" type="button" onClick={() => copyText("全部帳號設定", copiedAccountText)}>
            <Copy size={17} />
            {copied === "全部帳號設定" ? "已複製全部設定" : "複製全部設定"}
          </button>
          <div className="profile-copy-list compact">
            {accountSettingFields.map((field) => (
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
        </article>

        <article className="tool-panel release-card release-links-card">
          <div className="section-title">
            <ExternalLink size={20} />
            <h2>公開連結檢查</h2>
          </div>
          <div className="profile-copy-list compact">
            {publicLinks.map(([label, href]) => (
              <div className="profile-copy-row" key={label}>
                <div>
                  <strong>{label}</strong>
                  <p>{href}</p>
                </div>
                <div className="inline-actions">
                  <button className="button icon-button" type="button" onClick={() => copyText(label, href)}>
                    <Copy size={17} />
                    <span>{copied === label ? "已複製" : "複製"}</span>
                  </button>
                  <a className="button icon-button" href={href} target="_blank" rel="noreferrer">
                    <ExternalLink size={17} />
                    <span>開啟</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="tool-panel release-card release-wide-card">
          <div className="section-title">
            <MessageSquareText size={20} />
            <h2>LINE VOOM 貼文範例</h2>
          </div>
          <p>VOOM 可作為公開內容入口；每篇都保留服務提醒，避免被理解成正式廟方公告。</p>
          <div className="post-template-grid">
            {voomPostExamples.map((post) => (
              <div className="post-template-card" key={post.title}>
                <div>
                  <strong>{post.title}</strong>
                  <small>建議素材：{post.asset}</small>
                </div>
                <pre>{post.value}</pre>
                <button className="button icon-button" type="button" onClick={() => copyText(post.title, post.value)}>
                  <Copy size={17} />
                  <span>{copied === post.title ? "已複製" : "複製貼文"}</span>
                </button>
              </div>
            ))}
          </div>
        </article>

        <article className="tool-panel release-card release-wide-card">
          <div className="section-title">
            <Megaphone size={20} />
            <h2>廣播訊息範例</h2>
          </div>
          <p>這些文字用於少量人工補發或核對；正式大量推播前要確認好友同意、訊息用量與內容審稿。</p>
          <div className="post-template-grid compact">
            {broadcastExamples.map((post) => (
              <div className="post-template-card" key={post.title}>
                <strong>{post.title}</strong>
                <pre>{post.value}</pre>
                <button className="button icon-button" type="button" onClick={() => copyText(post.title, post.value)}>
                  <Copy size={17} />
                  <span>{copied === post.title ? "已複製" : "複製訊息"}</span>
                </button>
              </div>
            ))}
          </div>
        </article>

        <article className="tool-panel release-card release-checklist-card">
          <div className="section-title">
            <CheckCircle size={20} />
            <h2>正式發布清單</h2>
          </div>
          <div className="release-checklist">
            {releaseChecklist.map((item) => (
              <label className="check-row release-check-row" key={item}>
                <input type="checkbox" checked={Boolean(checked[item])} onChange={() => toggleChecklist(item)} />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </article>

        <article className="tool-panel release-card release-sticker-card">
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
      </>
      )}
      {confirmDialog}
    </Shell>
  );
}
