import { useState } from "react";
import { Check, ChevronRight, Copy, MessageCircle, RefreshCw, ScrollText, ShieldCheck, Sparkles } from "lucide-react";
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
  ["安", "看提醒", "作為今日提醒，不做命運判斷。"]
];

const intentionSuggestions = [
  "今日平安提醒",
  "工作事業指引",
  "學業功名指引",
  "家庭和睦祝福",
  "心神平靜安定"
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
        <span>文化解說</span>
        <span>白話整理</span>
        <span>以公告為準</span>
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
  const [copied, setCopied] = useState(false);

  async function draw() {
    setDrawing(true);
    setError("");
    setCopied(false);
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

  function handleCopy() {
    if (!slip) return;
    const text = [
      `【萬春宮文化籤詩 ‧ ${slip.title}】`,
      askedIntention ? `祈請方向：${askedIntention}` : "",
      `籤詩：${slip.poem}`,
      `白話提醒：${slip.plain_language}`,
      `文化解說：${slip.cultural_note}`,
      `溫馨提醒：${slip.reminder}`,
      `— 臺中萬春宮（藍興媽祖）線上便民服務`
    ].filter(Boolean).join("\n\n");

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      });
    }
  }

  return (
    <Shell title="文化抽籤">
      <section className={`fortune-landing fortune-refresh${drawing ? " is-drawing" : ""}`}>
        <div className="fortune-copy">
          <span className="tag">文化提醒</span>
          <h2>抽一支今日提醒</h2>
          <p>以籤詩語感做白話整理；活動與服務資訊請以廟方公告為準。</p>
          <label className="fortune-intention-label">
            想求的提醒
            <textarea value={intention} onChange={(event) => setIntention(event.target.value)} />
          </label>
          <div className="fortune-quick-intentions" aria-label="常見提醒方向快速選取">
            <span className="quick-label">快速選取：</span>
            {intentionSuggestions.map((sug) => (
              <button
                key={sug}
                type="button"
                className="intention-chip"
                onClick={() => setIntention(sug)}
              >
                {sug}
              </button>
            ))}
          </div>
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
            <div className="fortune-result-header">
              <span className="tag tag-gold">{slip.slip_id}</span>
              <h2>{slip.title}</h2>
              <button
                type="button"
                className={`fortune-copy-btn${copied ? " is-copied" : ""}`}
                onClick={handleCopy}
                aria-label="複製籤詩全文"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? "已複製籤詩！" : "複製籤詩"}</span>
              </button>
            </div>
            {askedIntention ? (
              <p className="fortune-question-result">
                <MessageCircle size={18} />
                <span>求籤方向：{askedIntention}</span>
              </p>
            ) : null}
            <div className="fortune-poem-container">
              <p className="poem">{slip.poem}</p>
            </div>
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
          <strong>文化提醒與使用說明</strong>
          <p>籤詩內容提供文化參考；若需要活動、報名或服務協助，請查看公告或詢問服務人員。</p>
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
