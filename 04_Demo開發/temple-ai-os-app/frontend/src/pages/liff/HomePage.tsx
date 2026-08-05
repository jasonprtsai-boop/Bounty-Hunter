import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, CalendarDays, Map, MessageCircle, Sparkles } from "lucide-react";
import { apiFetch, type ChatReply, type TempleProfile } from "../../lib/api";
import { Shell } from "../../components/Shell";

export function HomePage() {
  const [temple, setTemple] = useState<TempleProfile | null>(null);
  const [question, setQuestion] = useState("我第一次來萬春宮，怎麼參拜？");
  const [reply, setReply] = useState<ChatReply | null>(null);

  useEffect(() => {
    apiFetch<TempleProfile>("/api/temple/profile").then(setTemple).catch(console.error);
  }, []);

  async function ask() {
    const result = await apiFetch<ChatReply>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: question, user_id: "demo_u001", source: "liff" })
    });
    setReply(result);
  }

  return (
    <Shell title="萬春宮智慧服務入口">
      {temple ? (
        <section className="hero-panel">
          <div>
            <span className="tag">主祀 {temple.main_deity}</span>
            <h2>{temple.name}</h2>
            <p>{temple.demo_positioning}</p>
          </div>
          {temple.image?.url ? <img src={temple.image.url} alt="萬春宮開放資料圖片" /> : null}
        </section>
      ) : null}

      <section className="quick-grid">
        <Link to="/events" className="quick-action">
          <CalendarDays />
          <span>活動中心</span>
        </Link>
        <Link to="/fortune" className="quick-action">
          <Sparkles />
          <span>文化抽籤</span>
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
          <Bot size={20} />
          <h2>AI 文化助手</h2>
        </div>
        <textarea value={question} onChange={(event) => setQuestion(event.target.value)} />
        <button className="button primary" onClick={ask}>
          送出問題
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

