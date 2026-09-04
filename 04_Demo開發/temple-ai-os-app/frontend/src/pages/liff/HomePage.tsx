import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  Gift,
  Globe2,
  Map,
  MessageCircle,
  Search,
  Sparkles,
  UsersRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { apiFetch, type ChatReply, type TempleProfile } from "../../lib/api";
import { getLiffSession } from "../../lib/session";
import { Shell } from "../../components/Shell";

const templeImage =
  "https://travel.taichung.gov.tw/content/images/attractions/60331/640x480_attractions-image-reeo_rka6kg04vfs2xyzmw.jpg";

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
  image: string;
  featured?: boolean;
}> = [
  { to: "/events", icon: CalendarDays, title: "活動中心", label: "查看活動與報名", image: "/assets/banners/events.png", featured: true },
  { to: "/tour/main-hall", icon: Map, title: "宮廟導覽", label: "主殿與現場動線", image: "/assets/banners/tour.png", featured: true },
  { to: "/fortune", icon: Sparkles, title: "文化抽籤", label: "抽一支平安提醒", image: "/assets/banners/fortune.png" },
  { to: "/support", icon: MessageCircle, title: "客服中心", label: "留下問題", image: "/assets/banners/support.png" }
];

const secondaryActions: Array<{ to: string; icon: LucideIcon; label: string }> = [
  { to: "/events?lookup=1", icon: Search, label: "查報名進度" },
  { to: "/deities", icon: BookOpen, label: "神佛介紹" },
  { to: "/site", icon: Globe2, label: "線上官網" },
  { to: "/community", icon: UsersRound, label: "LINE 社群" },
  { to: "/stickers", icon: Gift, label: "貼圖小舖" }
];

const fallbackTemple: TempleProfile = {
  temple_id: "wanchun-demo",
  name: "萬春宮",
  aliases: ["台中媽祖", "藍興媽祖"],
  main_deity: "天上聖母",
  address: "臺中市中區成功路212號",
  phone: "04-22245964",
  demo_positioning: "臺中中區的宮廟服務入口，可查看活動、導覽、抽籤與客服流程。",
  image: {
    url: templeImage,
    source: "臺中市觀光旅遊局",
    license: "open data"
  }
};

export function HomePage() {
  const [temple, setTemple] = useState<TempleProfile | null>(null);
  const [question, setQuestion] = useState("我第一次來萬春宮，怎麼參拜？");
  const [reply, setReply] = useState<ChatReply | null>(null);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    getLiffSession().catch(() => undefined);
    apiFetch<TempleProfile>("/api/temple/profile")
      .then(setTemple)
      .catch(() => undefined);
  }, []);

  async function ask(nextQuestion = question) {
    setAsking(true);
    setQuestion(nextQuestion);
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
        reply: "參拜問答服務暫時無法連線。你仍可先查看活動、導覽，或到客服中心留下問題。",
        sources: [],
        events: [],
        demo_notice: "正式活動與廟務資訊仍以廟方公告為準。"
      });
    } finally {
      setAsking(false);
    }
  }

  const templeProfile = temple || fallbackTemple;

  return (
    <Shell title="萬春宮">
      <section className="liff-visual-hero">
        <div className="liff-hero-copy">
          <span className="tag">主祀 {templeProfile.main_deity}</span>
          <h2>{templeProfile.name}線上服務</h2>
          <p>{templeProfile.demo_positioning}</p>
          <div className="hero-facts" aria-label="廟宇資訊">
            <span>{templeProfile.address}</span>
            <span>{templeProfile.phone}</span>
          </div>
          <div className="primary-route-row" aria-label="建議下一步">
            <Link className="button primary" to="/events">
              查看活動 <ChevronRight size={18} />
            </Link>
            <Link className="button" to="/fortune">
              抽文化籤
            </Link>
            <Link className="button" to="/tour/main-hall">
              主殿導覽
            </Link>
          </div>
        </div>
        <div className="liff-hero-gallery" aria-label="萬春宮服務圖片">
          {templeProfile.image?.url ? <img className="liff-hero-photo" src={templeProfile.image.url} alt="萬春宮實景照片" /> : null}
          <img className="liff-hero-banner" src="/assets/banners/home.png" alt="宮廟線上服務入口" />
        </div>
      </section>

      <section className="line-visual-links" aria-label="常用服務入口">
        {visualActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link className={`line-visual-card${action.featured ? " featured" : ""}`} key={action.to} to={action.to}>
              <img src={action.image} alt={action.title} />
              <span>
                <Icon size={17} />
                {action.label}
              </span>
              <strong>{action.title}</strong>
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
          <button className="button primary" disabled={asking} onClick={() => ask()}>
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
