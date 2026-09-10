import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, MessageCircle, RefreshCw, ScrollText, ShieldCheck, Sparkles } from "lucide-react";
import { Shell } from "../../components/Shell";
import { visualAssets } from "../../lib/visualAssets";

type JiaoSide = "yin" | "yang";
type JiaoResult = {
  id: string;
  title: string;
  short: string;
  detail: string;
  next: string;
  tone: "holy" | "smile" | "quiet";
  blocks: [JiaoSide, JiaoSide];
};

const results: JiaoResult[] = [
  {
    id: "sheng",
    title: "聖筊",
    short: "一正一反",
    detail: "可以把它理解為方向較明確，可往下一步確認。",
    next: "若是重要事項，建議再向廟方或服務人員確認。",
    tone: "holy",
    blocks: ["yang", "yin"]
  },
  {
    id: "xiao",
    title: "笑筊",
    short: "兩面皆正",
    detail: "問題可能還不夠清楚，或需要換個問法再確認。",
    next: "把問題縮短成一句話，再擲一次會更好判讀。",
    tone: "smile",
    blocks: ["yang", "yang"]
  },
  {
    id: "yin",
    title: "陰筊",
    short: "兩面皆反",
    detail: "可以先暫緩，或重新確認時機、條件與資訊是否齊全。",
    next: "請先看現場公告、活動規則，或再向服務人員確認。",
    tone: "quiet",
    blocks: ["yin", "yin"]
  }
];

const meaningCards = [
  ["聖", "聖筊", "一正一反，方向較明確。"],
  ["笑", "笑筊", "兩面皆正，問題可再說清楚。"],
  ["陰", "陰筊", "兩面皆反，先停一下再確認。"]
];

function randomResult() {
  return results[Math.floor(Math.random() * results.length)];
}

export function JiaoPage() {
  const [question, setQuestion] = useState("今天適合先查看活動報名嗎？");
  const [result, setResult] = useState<JiaoResult | null>(null);
  const [rolling, setRolling] = useState(false);
  const [askedQuestion, setAskedQuestion] = useState("");
  const [rollCount, setRollCount] = useState(0);

  const activeBlocks = useMemo<[JiaoSide, JiaoSide]>(
    () => result?.blocks || (rolling ? ["yang", "yin"] : ["yin", "yang"]),
    [result, rolling]
  );

  function throwJiao() {
    if (rolling) return;
    setRolling(true);
    setAskedQuestion(question.trim() || "未填問題");
    window.setTimeout(() => {
      setResult(randomResult());
      setRollCount((current) => current + 1);
      setRolling(false);
    }, 620);
  }

  return (
    <Shell title="擲筊問事">
      <section className={`jiao-landing${rolling ? " is-rolling" : ""}`}>
        <div className="jiao-copy">
          <span className="tag">文化互動</span>
          <h2>先問一句，再擲一對筊</h2>
          <p>用聖筊、笑筊、陰筊做簡短文化解說，不取代正式請示或廟方公告。</p>
          <label className="jiao-question-label">
            想問的事
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} />
          </label>
          <div className="fortune-actions">
            <button className="button primary" type="button" disabled={rolling} onClick={throwJiao}>
              {rolling ? <RefreshCw size={18} /> : <Sparkles size={18} />}
              {rolling ? "擲筊中" : "開始擲筊"}
            </button>
            <Link className="button" to="/fortune">
              改抽文化籤
            </Link>
          </div>
        </div>

        <div className="jiao-visual-stage" aria-label="擲筊視覺">
          <img src={visualAssets.banners.jiao} alt="擲筊問事" />
          <div className={`jiao-blocks ${result?.tone || "ready"}`} aria-hidden="true">
            {activeBlocks.map((side, index) => (
              <span className={`jiao-block ${side}`} key={`${side}-${index}`}>
                {side === "yang" ? "正" : "反"}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="jiao-result-layout jiao-result-layout-compact" aria-live="polite">
        <article className={`detail-panel jiao-result-card ${result?.tone || "ready"}`}>
          {result ? (
            <>
              <span className="tag">第 {rollCount} 次</span>
              <h2>{result.title}</h2>
              <p className="jiao-question-result">
                <MessageCircle size={18} />
                {askedQuestion}
              </p>
              <div className="jiao-result-mark">{result.short}</div>
              <p>{result.detail}</p>
              <p className="notice">{result.next}</p>
              <button className="button primary" type="button" disabled={rolling} onClick={throwJiao}>
                再擲一次 <ChevronRight size={18} />
              </button>
            </>
          ) : (
            <>
              <span className="tag">準備中</span>
              <h2>把問題縮短成一句話</h2>
              <p>例如「今天是否先報名導覽？」或「這件事是否需要再確認？」</p>
              <button className="button primary" type="button" disabled={rolling} onClick={throwJiao}>
                開始擲筊 <ChevronRight size={18} />
              </button>
            </>
          )}
        </article>
      </section>

      <section className="jiao-meaning-grid" aria-label="擲筊結果說明">
        {meaningCards.map(([symbol, title, body]) => (
          <article key={title}>
            <span>{symbol}</span>
            <strong>{title}</strong>
            <p>{body}</p>
          </article>
        ))}
      </section>

      <section className="detail-panel jiao-note-panel">
        <ShieldCheck size={22} />
        <div>
          <strong>文化互動提醒</strong>
          <p>本頁提供文化解說；活動、捐款或重要廟務，請以廟方公告與現場服務人員說明為準。</p>
        </div>
        <Link className="button" to="/support">
          找服務人員
        </Link>
        <Link className="button" to="/tour/main-hall">
          看參拜導覽
        </Link>
      </section>
    </Shell>
  );
}
