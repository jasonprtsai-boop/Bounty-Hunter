import { useState } from "react";
import { ChevronRight, MessageCircle, RefreshCw, ScrollText, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Shell } from "../../components/Shell";
import { StatePanel } from "../../components/StatePanel";
import { apiFetch } from "../../lib/api";
import { canUsePreviewFallback, isLocalPreview, pickLocalPreviewSlip } from "../../lib/localPreviewData";

type FortuneSlip = {
  slip_id: string;
  title: string;
  poem: string;
  plain_language: string;
  cultural_note: string;
  reminder: string;
};

const ritualSteps = [
  ["香", "先定題", "心裡留一個想被提醒的方向。"],
  ["籤", "抽一支", "取得籤詩、白話與文化解說。"],
  ["安", "看提醒", "只作今日提醒，不作命運斷言。"]
];

function FortuneFocusPanel() {
  return (
    <div className="fortune-focus-panel" aria-label="文化抽籤重點">
      <div className="fortune-slip-preview">
        <ScrollText size={30} />
        <span>今日文化籤</span>
        <strong>先問清楚，再看提醒</strong>
      </div>
      <div className="fortune-focus-points">
        <span>不判吉凶</span>
        <span>保留白話</span>
        <span>重要事回到正式窗口</span>
      </div>
    </div>
  );
}

export function FortunePage() {
  const [slip, setSlip] = useState<FortuneSlip | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [error, setError] = useState("");
  const [intention, setIntention] = useState("今天想得到一個平安提醒");
  const [askedIntention, setAskedIntention] = useState("");

  async function draw() {
    setDrawing(true);
    setError("");
    setAskedIntention(intention.trim() || "未填提醒方向");
    if (isLocalPreview()) {
      setSlip(pickLocalPreviewSlip());
      setDrawing(false);
      return;
    }
    try {
      const result = await apiFetch<FortuneSlip>("/api/fortune/draw", { method: "POST", body: "{}" });
      setSlip(result);
    } catch (err) {
      if (canUsePreviewFallback()) {
        setSlip(pickLocalPreviewSlip());
        return;
      }
      setError(err instanceof Error ? err.message : "抽籤服務暫時無法使用");
    } finally {
      setDrawing(false);
    }
  }

  return (
    <Shell title="文化抽籤">
      <section className={`fortune-landing fortune-refresh${drawing ? " is-drawing" : ""}`}>
        <div className="fortune-copy">
          <span className="tag">文化提醒</span>
          <h2>抽一支今日提醒</h2>
          <p>以籤詩語感做白話整理，正式事項仍以廟方公告與人工確認為準。</p>
          <label className="fortune-intention-label">
            想求的提醒
            <textarea value={intention} onChange={(event) => setIntention(event.target.value)} />
          </label>
          <div className="fortune-actions">
            <button className="button primary" type="button" disabled={drawing} onClick={draw}>
              {drawing ? <RefreshCw size={18} /> : <Sparkles size={18} />}
              {drawing ? "抽籤中" : "抽一支文化籤"}
            </button>
            <Link className="button" to="/jiao">
              改擲筊
            </Link>
          </div>
        </div>
        <FortuneFocusPanel />
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
        <section className="fortune-ritual-steps fortune-ritual-steps-compact" aria-label="抽籤說明">
          {ritualSteps.map(([symbol, title, body]) => (
            <article key={title}>
              <span>{symbol}</span>
              <strong>{title}</strong>
              <p>{body}</p>
            </article>
          ))}
        </section>
      ) : (
        <section className="fortune-result-layout fortune-result-refresh fortune-result-solo" aria-live="polite">
          <article className="detail-panel fortune-result-card">
            <span className="tag">{slip.slip_id}</span>
            <h2>{slip.title}</h2>
            {askedIntention ? (
              <p className="fortune-question-result">
                <MessageCircle size={18} />
                {askedIntention}
              </p>
            ) : null}
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
            <div className="fortune-result-actions">
              <button className="button primary" type="button" disabled={drawing} onClick={draw}>
                再抽一支 <ChevronRight size={18} />
              </button>
              <Link className="button" to="/jiao">
                擲筊確認
              </Link>
            </div>
          </article>
        </section>
      )}

      <section className="detail-panel fortune-note-panel">
        <ShieldCheck size={22} />
        <div>
          <strong>抽籤頁保留文化解說</strong>
          <p>籤詩結果不會替你做正式決定；若牽涉活動、捐款、服務或個資，請回到公告、客服或現場窗口確認。</p>
        </div>
        <Link className="button" to="/support">
          找客服
        </Link>
        <Link className="button" to="/tour/main-hall">
          看導覽
        </Link>
      </section>
    </Shell>
  );
}
