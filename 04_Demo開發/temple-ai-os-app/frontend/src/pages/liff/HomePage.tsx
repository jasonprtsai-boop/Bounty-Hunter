import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BellRing,
  Bot,
  CalendarDays,
  ChevronRight,
  Gift,
  Globe2,
  Map,
  MessageCircle,
  ScrollText,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UsersRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { apiFetch, type ChatReply, type TempleProfile } from "../../lib/api";
import { getLiffSession } from "../../lib/session";
import { Shell } from "../../components/Shell";

const suggestedQuestions = [
  "第一次來萬春宮，怎麼參拜？",
  "近期有什麼活動可以報名？",
  "萬春宮在哪裡？交通怎麼去？"
];

const serviceSteps = [
  ["查詢", "AI 回答參拜、交通與活動資訊"],
  ["導覽", "掃 QR 看正殿與文化故事"],
  ["報名", "在 LINE 內完成活動報名示範"],
  ["追蹤", "後台整理客服、推播與知識缺口"]
];

const primaryActions: Array<{
  to: string;
  icon: LucideIcon;
  title: string;
  body: string;
  label: string;
  featured?: boolean;
}> = [
  {
    to: "/events",
    icon: CalendarDays,
    title: "活動報名",
    body: "查看近期活動、名額與報名狀態。",
    label: "查看活動",
    featured: true
  },
  {
    to: "/tour/main-hall",
    icon: Map,
    title: "宮廟導覽",
    body: "第一次到訪可先看主殿故事與參拜動線。",
    label: "開啟導覽",
    featured: true
  },
  {
    to: "/fortune",
    icon: Sparkles,
    title: "文化抽籤",
    body: "用籤詩語感獲得一句平安提醒。",
    label: "抽一支籤"
  },
  {
    to: "/support",
    icon: MessageCircle,
    title: "客服協助",
    body: "找不到資訊時留下問題，後續由人員接續。",
    label: "留下問題"
  }
];

const secondaryActions: Array<{ to: string; icon: LucideIcon; label: string }> = [
  { to: "/member", icon: UserCheck, label: "我的紀錄" },
  { to: "/site", icon: Globe2, label: "示範官網" },
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
  demo_positioning: "LINE 智慧服務示範入口，可查看活動、導覽、AI 問答與客服流程。",
  image: {
    url: "https://travel.taichung.gov.tw/content/images/attractions/60331/640x480_attractions-image-reeo_rka6kg04vfs2xyzmw.jpg",
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
        reply: "AI 問答服務暫時無法連線。你仍可先查看活動、導覽，或到客服中心留下問題。",
        sources: [],
        events: [],
        demo_notice: "此為示範離線狀態提示，不代表正式服務。"
      });
    } finally {
      setAsking(false);
    }
  }

  const templeProfile = temple || fallbackTemple;

  return (
    <Shell title="萬春宮智慧服務入口">
      <section className="hero-panel liff-hero-panel">
        <div>
          <span className="tag">主祀 {templeProfile.main_deity}</span>
          <h2>{templeProfile.name}</h2>
          <p>{templeProfile.demo_positioning}</p>
          <div className="hero-facts" aria-label="廟宇資訊">
            <span>{templeProfile.address}</span>
            <span>{templeProfile.phone}</span>
          </div>
          <div className="primary-route-row" aria-label="建議下一步">
            <Link className="button primary" to="/events">
              查看活動
            </Link>
            <Link className="button" to="/tour/main-hall">
              開啟導覽
            </Link>
            <Link className="button" to="/member">
              我的紀錄
            </Link>
          </div>
        </div>
        {templeProfile.image?.url ? <img src={templeProfile.image.url} alt="萬春宮開放資料圖片" /> : null}
      </section>

      <section className="temple-service-strip" aria-label="服務狀態">
        <div>
          <BellRing size={18} />
          <span>活動提醒</span>
          <strong>可示範</strong>
        </div>
        <div>
          <ScrollText size={18} />
          <span>文化問答</span>
          <strong>固定安全回覆</strong>
        </div>
        <div>
          <ShieldCheck size={18} />
          <span>示範提醒</span>
          <strong>非官方資料</strong>
        </div>
      </section>

      <section className="service-hub" aria-label="常用服務入口">
        <div className="service-hub-heading">
          <span className="tag">常用入口</span>
          <h2>今天想做什麼？</h2>
          <p>把最常用的服務放在第一層，進入 LINE 後不用反覆點選才找得到。</p>
        </div>
        <div className="service-hub-grid">
          {primaryActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                className={`service-hub-card${action.featured ? " featured" : ""}`}
                key={action.to}
                to={action.to}
              >
                <Icon size={22} />
                <strong>{action.title}</strong>
                <p>{action.body}</p>
                <span>
                  {action.label}
                  <ChevronRight size={16} />
                </span>
              </Link>
            );
          })}
        </div>
        <div className="secondary-link-row" aria-label="更多服務">
          {secondaryActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.to} to={action.to}>
                <Icon size={17} />
                <span>{action.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="tool-panel">
        <div className="section-title">
          <Map size={20} />
          <h2>廟埕服務流程</h2>
        </div>
        <div className="service-step-grid">
          {serviceSteps.map(([title, body], index) => (
            <div key={title} className="service-step">
              <span>{index + 1}</span>
              <strong>{title}</strong>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="tool-panel">
        <div className="section-title">
          <Bot size={20} />
          <h2>AI 文化助手</h2>
        </div>
        <div className="question-chip-row" aria-label="常用問題">
          {suggestedQuestions.map((item) => (
            <button className="question-chip" key={item} type="button" onClick={() => ask(item)}>
              {item}
            </button>
          ))}
        </div>
        <textarea value={question} onChange={(event) => setQuestion(event.target.value)} />
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
      </section>
    </Shell>
  );
}
