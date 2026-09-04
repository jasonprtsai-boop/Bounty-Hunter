import { useState } from "react";
import { ChevronRight, RefreshCw, ScrollText, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Shell } from "../../components/Shell";
import { StatePanel } from "../../components/StatePanel";
import { apiFetch } from "../../lib/api";

type FortuneSlip = {
  slip_id: string;
  title: string;
  poem: string;
  plain_language: string;
  cultural_note: string;
  reminder: string;
};

const previewNotes = [
  ["文化解說", "只做典故與語感整理"],
  ["平安提醒", "用一句話帶出今日方向"],
  ["不做斷言", "正式事項仍以廟方公告為準"]
];

export function FortunePage() {
  const [slip, setSlip] = useState<FortuneSlip | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [error, setError] = useState("");

  async function draw() {
    setDrawing(true);
    setError("");
    try {
      const result = await apiFetch<FortuneSlip>("/api/fortune/draw", { method: "POST", body: "{}" });
      setSlip(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "抽籤服務暫時無法使用");
    } finally {
      setDrawing(false);
    }
  }

  return (
    <Shell title="文化抽籤">
      <section className={`fortune-landing${drawing ? " is-drawing" : ""}`}>
        <div className="fortune-copy">
          <span className="tag">文化提醒</span>
          <h2>抽一支平安提醒</h2>
          <p>以籤詩語感做文化解說，不做命運斷言。</p>
          <div className="fortune-actions">
            <button className="button primary" disabled={drawing} onClick={draw}>
              {drawing ? <RefreshCw size={18} /> : <Sparkles size={18} />}
              {drawing ? "抽籤中" : "抽一支文化籤"}
            </button>
            <Link className="button" to="/tour/main-hall">
              先看主殿導覽
            </Link>
          </div>
        </div>
        <div className="fortune-visual-stage" aria-label="文化抽籤視覺">
          <img src="/assets/banners/fortune.png" alt="文化抽籤" />
          <div className="fortune-stick-bundle" aria-hidden="true">
            {Array.from({ length: 9 }).map((_, index) => (
              <span key={index} style={{ transform: `rotate(${(index - 4) * 6}deg)` }} />
            ))}
          </div>
        </div>
      </section>

      {error ? (
        <StatePanel
          variant="error"
          title="抽籤服務暫時無法使用"
          body={error}
          actions={
            <button className="button primary" type="button" onClick={draw}>
              再試一次
            </button>
          }
        />
      ) : null}

      {!slip ? (
        <section className="fortune-preview-grid" aria-label="抽籤說明">
          {previewNotes.map(([title, body]) => (
            <article key={title}>
              <ScrollText size={20} />
              <strong>{title}</strong>
              <span>{body}</span>
            </article>
          ))}
        </section>
      ) : (
        <section className="fortune-result-layout" aria-live="polite">
          <div className="fortune-card-preview">
            <img src="/assets/flex/fortune-card.png" alt="文化抽籤卡片" />
          </div>
          <article className="detail-panel fortune-result-card">
            <span className="tag">{slip.slip_id}</span>
            <h2>{slip.title}</h2>
            <p className="poem">{slip.poem}</p>
            <div className="fortune-result-section">
              <strong>白話提醒</strong>
              <p>{slip.plain_language}</p>
            </div>
            <div className="fortune-result-section">
              <strong>文化解說</strong>
              <p>{slip.cultural_note}</p>
            </div>
            <p className="notice">{slip.reminder}</p>
            <button className="button primary" disabled={drawing} onClick={draw}>
              再抽一支 <ChevronRight size={18} />
            </button>
          </article>
        </section>
      )}
    </Shell>
  );
}
