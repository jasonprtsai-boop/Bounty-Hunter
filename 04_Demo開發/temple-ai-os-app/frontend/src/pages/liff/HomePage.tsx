import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  ChevronRight,
  Globe2,
  Headphones,
  Map,
  MessageCircle,
  ScrollText,
  Sparkles,
  UsersRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { apiFetch, type ChatReply } from "../../lib/api";
import { canUsePreviewFallback, isLocalPreview } from "../../lib/localPreviewData";
import { hasStoredLiffToken } from "../../lib/liff";
import { getLiffSession } from "../../lib/session";
import { templePhotoGallery, visualAssets } from "../../lib/visualAssets";
import { Shell } from "../../components/Shell";

const suggestedQuestions = [
  "第一次來萬春宮，怎麼參拜？",
  "近期有什麼活動可以報名？",
  "萬春宮在哪裡？交通怎麼去？"
];

const visualActions: Array<{
  to: string;
  icon: LucideIcon;
  title: string;
  label: string;
}> = [
  { to: "/events", icon: CalendarDays, title: "活動報名", label: "活動、名額、查詢" },
  { to: "/fortune", icon: ScrollText, title: "文化抽籤", label: "抽一支提醒" },
  { to: "/jiao", icon: Sparkles, title: "擲筊問事", label: "先問一句再擲" },
  { to: "/support", icon: Headphones, title: "客服中心", label: "留下問題" }
];

const secondaryActions: Array<{ to: string; icon: LucideIcon; label: string }> = [
  { to: "/tour/main-hall", icon: Map, label: "主殿導覽" },
  { to: "/site", icon: Globe2, label: "萬春宮介紹" },
  { to: "/community", icon: UsersRound, label: "LINE 入口" }
];

const homeFeatureItems: Array<{
  to: string;
  image: string;
  label: string;
  title: string;
  body: string;
  icon: LucideIcon;
  large?: boolean;
}> = [
  {
    to: "/site",
    image: templePhotoGallery[1].src,
    label: "官網首頁",
    title: "萬春宮介紹",
    body: "照片、地址與參拜資訊。",
    icon: Globe2,
    large: true
  },
  {
    to: "/events",
    image: templePhotoGallery[0].src,
    label: "近期活動",
    title: "活動消息",
    body: "報名與查詢放在活動頁。",
    icon: CalendarDays
  },
  {
    to: "/community",
    image: visualAssets.richMenu,
    label: "LINE 快捷",
    title: "聊天選單入口",
    body: "服務收在選單裡，需要再展開。",
    icon: MessageCircle
  }
];

const serviceSymbols = ["香", "籤", "筊", "燈"];

export function HomePage() {
  const [question, setQuestion] = useState("我第一次來萬春宮，怎麼參拜？");
  const [reply, setReply] = useState<ChatReply | null>(null);
  const [asking, setAsking] = useState(false);

  async function ask(nextQuestion = question) {
    setAsking(true);
    setQuestion(nextQuestion);
    if (isLocalPreview() || (canUsePreviewFallback() && !hasStoredLiffToken())) {
      setReply({
        intent: "local_preview",
        reply: "第一次參拜可先看主殿導覽；想參加活動可到活動中心，找不到資訊再到客服中心留下問題。",
        sources: [],
        events: [],
        demo_notice: "目前為網站展示回覆；正式互動請從 LINE 開啟。"
      });
      setAsking(false);
      return;
    }
    try {
      const session = await getLiffSession();
      const result = await apiFetch<ChatReply>("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: nextQuestion, user_id: session.user_id, source: "liff" })
      });
      setReply(result);
    } catch {
      setReply({
        intent: "service_unavailable",
        reply: "參拜問答暫時無法連線。你仍可先查看活動、導覽，或從 LINE 開啟後再送出問題。",
        sources: [],
        events: [],
        demo_notice: "正式活動與廟務資訊仍以廟方公告為準。"
      });
    } finally {
      setAsking(false);
    }
  }

  return (
    <Shell title="線上服務">
      <section className="service-launch-panel">
        <div className="service-launch-copy">
          <span className="tag">常用服務</span>
          <h2>今天想辦哪件事？</h2>
          <p>首頁只留常用入口，細節進到各頁處理。</p>
          <div className="service-symbol-strip" aria-label="宮廟元素">
            {serviceSymbols.map((symbol) => (
              <span key={symbol}>{symbol}</span>
            ))}
          </div>
          <div className="primary-route-row" aria-label="建議下一步">
            <Link className="button primary" to="/events">
              查看活動 <ChevronRight size={18} />
            </Link>
            <Link className="button" to="/jiao">
              擲筊問事
            </Link>
            <Link className="button" to="/fortune">
              文化抽籤
            </Link>
          </div>
        </div>
        <figure className="service-launch-sticker service-launch-photo-card">
          <img src={templePhotoGallery[2].src} alt="萬春宮老城廟景" />
          <figcaption>
            <MessageCircle size={18} />
            服務收在選單，需要時再展開
          </figcaption>
        </figure>
      </section>

      <section className="home-feature-board" aria-label="今日服務看板">
        {homeFeatureItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              className={`home-feature-card${item.large ? " large" : ""}${item.image === visualAssets.richMenu ? " contain" : ""}`}
              key={item.to}
              to={item.to}
            >
              <img src={item.image} alt={item.title} />
              <span>
                <Icon size={17} />
                {item.label}
              </span>
              <strong>{item.title}</strong>
              <small>{item.body}</small>
            </Link>
          );
        })}
      </section>

      <section className="home-service-capsules" aria-label="常用服務入口">
        {visualActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.to} to={action.to}>
              <Icon size={21} />
              <span>
                <strong>{action.title}</strong>
                <small>{action.label}</small>
              </span>
              <ChevronRight size={18} />
            </Link>
          );
        })}
      </section>

      <section className="secondary-link-row liff-secondary-links" aria-label="更多服務">
        {secondaryActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.to} to={action.to}>
              <Icon size={17} />
              <span>{action.label}</span>
            </Link>
          );
        })}
      </section>

      <details className="home-ask-drawer">
        <summary>
          <MessageCircle size={20} />
          <span>
            <strong>參拜問答</strong>
            <small>需要文字協助時再展開</small>
          </span>
          <ChevronRight size={18} />
        </summary>
        <div className="home-ask-content">
          <div className="question-chip-row" aria-label="常用問題">
            {suggestedQuestions.map((item) => (
              <button className="question-chip" key={item} type="button" onClick={() => ask(item)}>
                {item}
              </button>
            ))}
          </div>
          <label className="question-input-label">
            想詢問的內容
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} />
          </label>
          <button className="button primary" type="button" disabled={asking} onClick={() => ask()}>
            {asking ? "回覆中" : "送出問題"}
          </button>
          {reply ? (
            <div className="answer">
              <strong>回覆</strong>
              <p>{reply.reply}</p>
              <small>{reply.demo_notice}</small>
            </div>
          ) : null}
        </div>
      </details>
    </Shell>
  );
}
