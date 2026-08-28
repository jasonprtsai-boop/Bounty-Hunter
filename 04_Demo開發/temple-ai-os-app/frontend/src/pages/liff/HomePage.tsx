import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BellRing,
  Bot,
  CalendarDays,
  Gift,
  Globe2,
  Map,
  MessageCircle,
  ScrollText,
  ShieldCheck,
  Sparkles,
  UsersRound
} from "lucide-react";
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
  ["報名", "在 LINE 內完成 Demo 活動報名"],
  ["追蹤", "後台整理客服、推播與知識缺口"]
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
        demo_notice: "此為 Demo 離線狀態提示，不代表正式服務。"
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
          <span>Demo 邊界</span>
          <strong>非官方資料</strong>
        </div>
      </section>

      <section className="quick-grid">
        <Link to="/site" className="quick-action">
          <Globe2 />
          <span>示範官網</span>
        </Link>
        <Link to="/community" className="quick-action">
          <UsersRound />
          <span>社群入口</span>
        </Link>
        <Link to="/events" className="quick-action">
          <CalendarDays />
          <span>活動中心</span>
        </Link>
        <Link to="/fortune" className="quick-action">
          <Sparkles />
          <span>文化抽籤</span>
        </Link>
        <Link to="/stickers" className="quick-action">
          <Gift />
          <span>貼圖小舖</span>
        </Link>
        <Link to="/tour/main-hall" className="quick-action">
          <Map />
          <span>宮廟導覽</span>
        </Link>
        <Link to="/support" className="quick-action">
          <MessageCircle />
          <span>客服中心</span>
        </Link>
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
            <strong>{reply.intent}</strong>
            <p>{reply.reply}</p>
            <small>{reply.demo_notice}</small>
          </div>
        ) : null}
      </section>
    </Shell>
  );
}
