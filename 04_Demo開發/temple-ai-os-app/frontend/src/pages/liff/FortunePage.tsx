import { useState } from "react";
import { Check, ChevronRight, Copy, MessageCircle, RefreshCw, RotateCcw, ScrollText, ShieldCheck, Sparkles } from "lucide-react";
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

type JiaoSide = "yin" | "yang";
type JiaoResult = {
  id: string;
  title: string;
  short: string;
  detail: string;
  tone: "holy" | "smile" | "quiet";
  blocks: [JiaoSide, JiaoSide];
};

const jiaoOutcomes: JiaoResult[] = [
  {
    id: "sheng",
    title: "聖筊",
    short: "一正一反",
    detail: "方向明確，媽祖允諾賜籤。",
    tone: "holy",
    blocks: ["yang", "yin"]
  },
  {
    id: "xiao",
    title: "笑筊",
    short: "兩面皆正",
    detail: "問題可能尚不夠聚焦，或需放平心境換個問法。",
    tone: "smile",
    blocks: ["yang", "yang"]
  },
  {
    id: "yin",
    title: "陰筊",
    short: "兩面皆反",
    detail: "心神暫緩，請稍作靜心再誠心請示一次。",
    tone: "quiet",
    blocks: ["yin", "yin"]
  }
];

function randomJiao(): JiaoResult {
  return jiaoOutcomes[Math.floor(Math.random() * jiaoOutcomes.length)];
}

const wizardSteps = [
  { step: 1, label: "定題稟報" },
  { step: 2, label: "擲筊求籤" },
  { step: 3, label: "搖筒取籤" },
  { step: 4, label: "擲筊確認" },
  { step: 5, label: "籤解開示" }
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
        <span>正統民俗儀軌</span>
        <strong>先問清楚，再看提醒</strong>
      </div>
      <div className="fortune-focus-points">
        <span>五步求籤</span>
        <span>正向賦能</span>
        <span>三不原則</span>
      </div>
    </div>
  );
}

export function FortunePage() {
  const [mode, setMode] = useState<"wizard" | "quick">("wizard");
  const [step, setStep] = useState<number>(1);
  const [intention, setIntention] = useState("今天想得到一個平安提醒");
  const [askedIntention, setAskedIntention] = useState("");
  const [slip, setSlip] = useState<FortuneSlip | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Wizard Jiao States
  const [jiao1Result, setJiao1Result] = useState<JiaoResult | null>(null);
  const [jiao1Rolling, setJiao1Rolling] = useState(false);
  const [jiao2Result, setJiao2Result] = useState<JiaoResult | null>(null);
  const [jiao2Rolling, setJiao2Rolling] = useState(false);

  async function fetchSlip() {
    setDrawing(true);
    setError("");
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

  function handleQuickDraw() {
    setCopied(false);
    setAskedIntention(intention.trim() || "未填提醒方向");
    fetchSlip();
  }

  function handleWizardStep1Next() {
    setAskedIntention(intention.trim() || "未填祈請方向");
    setJiao1Result(null);
    setStep(2);
  }

  function throwJiao1() {
    if (jiao1Rolling) return;
    setJiao1Rolling(true);
    window.setTimeout(() => {
      setJiao1Result(randomJiao());
      setJiao1Rolling(false);
    }, 550);
  }

  function handleWizardStep2Next() {
    setSlip(null);
    setStep(3);
  }

  function handleWizardStep3Draw() {
    fetchSlip();
  }

  function handleWizardStep3Next() {
    setJiao2Result(null);
    setStep(4);
  }

  function throwJiao2() {
    if (jiao2Rolling) return;
    setJiao2Rolling(true);
    window.setTimeout(() => {
      setJiao2Result(randomJiao());
      setJiao2Rolling(false);
    }, 550);
  }

  function handleWizardStep4Next() {
    setStep(5);
  }

  function handleWizardStep4Retry() {
    setSlip(null);
    setJiao2Result(null);
    setStep(3);
  }

  function resetWizard() {
    setStep(1);
    setSlip(null);
    setJiao1Result(null);
    setJiao2Result(null);
    setCopied(false);
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
        window.setTimeout(() => setCopied(false), 3000);
      });
    }
  }

  return (
    <Shell title="文化抽籤">
      {/* Mode Switcher */}
      <div className="fortune-mode-switch" aria-label="求籤模式切換">
        <span className="quick-label">求籤方式：</span>
        <div>
          <button
            type="button"
            className={`fortune-mode-btn${mode === "wizard" ? " is-active" : ""}`}
            onClick={() => setMode("wizard")}
          >
            <Sparkles size={14} />
            正統五步儀軌
          </button>
          <button
            type="button"
            className={`fortune-mode-btn${mode === "quick" ? " is-active" : ""}`}
            onClick={() => setMode("quick")}
          >
            快速抽籤
          </button>
        </div>
      </div>

      {mode === "wizard" ? (
        <>
          {/* 5-Step Stepper Progress Indicator */}
          <div className="fortune-wizard-stepper" aria-label="求籤步驟進度">
            {wizardSteps.map((ws) => {
              const isPassed = step > ws.step;
              const isActive = step === ws.step;
              return (
                <div
                  key={ws.step}
                  className={`wizard-step-node${isActive ? " is-active" : ""}${isPassed ? " is-passed" : ""}`}
                >
                  <div className="wizard-step-circle">{isPassed ? "✓" : ws.step}</div>
                  <span className="wizard-step-label">{ws.label}</span>
                </div>
              );
            })}
          </div>

          {/* STEP 1: 定題稟報 */}
          {step === 1 ? (
            <section className="wizard-stage-card">
              <span className="tag">步驟 1 / 5 ‧ 定題稟報</span>
              <h2>向媽祖誠心定題請示</h2>
              <p>心中默想姓名、現居地與想被提醒的生活方向。心誠則靈，問題愈聚焦，籤意指引愈具參考價值。</p>
              <label className="fortune-intention-label">
                想求的提醒方向
                <textarea
                  value={intention}
                  onChange={(event) => setIntention(event.target.value)}
                  placeholder="例如：近期轉換跑道求職指引、健康平安生活提醒..."
                />
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
              <div className="fortune-actions" style={{ marginTop: "20px" }}>
                <button className="button primary" type="button" onClick={handleWizardStep1Next}>
                  誠心稟報，前往擲筊請示 <ChevronRight size={18} />
                </button>
              </div>
            </section>
          ) : null}

          {/* STEP 2: 擲筊求籤 */}
          {step === 2 ? (
            <section className="wizard-stage-card">
              <span className="tag">步驟 2 / 5 ‧ 擲筊請示</span>
              <h2>第一擲：請示媽祖願否賜籤</h2>
              <p className="fortune-question-result">
                <MessageCircle size={18} />
                <span>求籤方向：{askedIntention}</span>
              </p>
              <p>傳統求籤需先向神明擲筊請示。若獲聖筊（一正一反），代表神明允諾賜籤。</p>

              <div className="wizard-jiao-stage">
                <div className="wizard-blocks">
                  {jiao1Result ? (
                    jiao1Result.blocks.map((side, i) => (
                      <span key={i} className={`jiao-block ${side}`}>
                        {side === "yang" ? "正" : "反"}
                      </span>
                    ))
                  ) : (
                    <>
                      <span className="jiao-block yang">正</span>
                      <span className="jiao-block yin">反</span>
                    </>
                  )}
                </div>

                {!jiao1Result ? (
                  <button className="button primary" type="button" disabled={jiao1Rolling} onClick={throwJiao1}>
                    {jiao1Rolling ? <RefreshCw size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    {jiao1Rolling ? "擲筊請示中..." : "開始擲筊請示"}
                  </button>
                ) : (
                  <div className={`wizard-result-box ${jiao1Result.tone}`}>
                    {jiao1Result.tone === "holy" ? (
                      <>
                        <strong>【聖筊允諾】媽祖慈悲應允！</strong>
                        <p>{jiao1Result.detail} 請前往籤筒抽取今日靈籤。</p>
                        <button
                          className="button primary"
                          type="button"
                          style={{ marginTop: "12px" }}
                          onClick={handleWizardStep2Next}
                        >
                          前往籤筒抽取靈籤 <ChevronRight size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <strong>【{jiao1Result.title}】{jiao1Result.short}</strong>
                        <p>{jiao1Result.detail}</p>
                        <button
                          className="button"
                          type="button"
                          style={{ marginTop: "12px" }}
                          disabled={jiao1Rolling}
                          onClick={throwJiao1}
                        >
                          {jiao1Rolling ? "擲筊中..." : "再誠心擲筊一次"}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {/* STEP 3: 搖筒取籤 */}
          {step === 3 ? (
            <section className="wizard-stage-card">
              <span className="tag">步驟 3 / 5 ‧ 搖筒取籤</span>
              <h2>自萬春宮靈籤筒抽取一支籤</h2>
              <p className="fortune-question-result">
                <MessageCircle size={18} />
                <span>求籤方向：{askedIntention}（已獲聖筊允籤）</span>
              </p>

              {!slip ? (
                <div style={{ textAlign: "center", padding: "30px 0" }}>
                  <p>請心存敬意，點擊下方按鈕自媽祖六十甲子靈籤中抽取籤支。</p>
                  <button className="button primary" type="button" disabled={drawing} onClick={handleWizardStep3Draw}>
                    {drawing ? <RefreshCw size={18} className="animate-spin" /> : <ScrollText size={18} />}
                    {drawing ? "搖筒抽取中..." : "搖籤筒取籤"}
                  </button>
                </div>
              ) : (
                <div className="wizard-result-box holy" style={{ marginTop: "16px" }}>
                  <span className="tag tag-gold">{slip.slip_id}</span>
                  <h3 style={{ fontSize: "1.4rem", margin: "8px 0" }}>抽得：{slip.title}</h3>
                  <p>依民間正統儀軌，抽得籤號後需再向媽祖擲筊確認是否為此籤。</p>
                  <button
                    className="button primary"
                    type="button"
                    style={{ marginTop: "12px" }}
                    onClick={handleWizardStep3Next}
                  >
                    前往擲筊確認此籤 <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </section>
          ) : null}

          {/* STEP 4: 擲筊確認 */}
          {step === 4 && slip ? (
            <section className="wizard-stage-card">
              <span className="tag">步驟 4 / 5 ‧ 擲筊確認</span>
              <h2>確認擲：請示神意是否指定此籤</h2>
              <p className="fortune-question-result">
                <ScrollText size={18} />
                <span>所抽籤號：{slip.slip_id} ‧ {slip.title}</span>
              </p>
              <p>請向媽祖默問：「弟子所抽此首籤詩，是否即為神聖指引？」擲得聖筊即告底定。</p>

              <div className="wizard-jiao-stage">
                <div className="wizard-blocks">
                  {jiao2Result ? (
                    jiao2Result.blocks.map((side, i) => (
                      <span key={i} className={`jiao-block ${side}`}>
                        {side === "yang" ? "正" : "反"}
                      </span>
                    ))
                  ) : (
                    <>
                      <span className="jiao-block yang">正</span>
                      <span className="jiao-block yin">反</span>
                    </>
                  )}
                </div>

                {!jiao2Result ? (
                  <button className="button primary" type="button" disabled={jiao2Rolling} onClick={throwJiao2}>
                    {jiao2Rolling ? <RefreshCw size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    {jiao2Rolling ? "擲筊確認中..." : "擲筊確認此籤"}
                  </button>
                ) : (
                  <div className={`wizard-result-box ${jiao2Result.tone}`}>
                    {jiao2Result.tone === "holy" ? (
                      <>
                        <strong>【聖筊確認】神意底定！</strong>
                        <p>連得聖筊應允！即刻為您開示籤詩白話意旨與生活文化指引。</p>
                        <button
                          className="button primary"
                          type="button"
                          style={{ marginTop: "12px" }}
                          onClick={handleWizardStep4Next}
                        >
                          恭讀籤詩與開示 <ChevronRight size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <strong>【{jiao2Result.title}】{jiao2Result.short}</strong>
                        <p>神意示意非此首籤詩，或時機條件需再釐清。請返回籤筒重新取籤。</p>
                        <button
                          className="button"
                          type="button"
                          style={{ marginTop: "12px" }}
                          onClick={handleWizardStep4Retry}
                        >
                          返回籤筒重抽靈籤
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {/* STEP 5: 籤解開示 (The Grand Reveal) */}
          {step === 5 && slip ? (
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
                    <span>求籤方向：{askedIntention}（正統儀軌圓滿完成）</span>
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
                  <button className="button primary" type="button" onClick={resetWizard}>
                    <RotateCcw size={18} /> 再求一事（重回儀軌）
                  </button>
                  <Link className="button" to="/tour/main-hall">
                    參拜指南
                  </Link>
                </div>
              </article>
            </section>
          ) : null}
        </>
      ) : (
        /* QUICK MODE (One-Click Drawing) */
        <>
          <section className={`fortune-landing fortune-refresh${drawing ? " is-drawing" : ""}`}>
            <div className="fortune-copy">
              <span className="tag">快速體驗</span>
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
                <button className="button primary" type="button" disabled={drawing} onClick={handleQuickDraw}>
                  {drawing ? <RefreshCw size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  {drawing ? "抽籤中..." : "抽一支文化籤"}
                </button>
                <Link className="button" to="/jiao">
                  單獨擲筊
                </Link>
              </div>
            </div>
            <FortuneFocusPanel />
          </section>

          {slip ? (
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
                  <button className="button primary" type="button" disabled={drawing} onClick={handleQuickDraw}>
                    再抽一支 <ChevronRight size={18} />
                  </button>
                  <Link className="button" to="/jiao">
                    擲筊確認
                  </Link>
                </div>
              </article>
            </section>
          ) : null}
        </>
      )}

      {error ? (
        <StatePanel
          variant="error"
          title="抽籤服務暫時無法使用"
          body={error}
          actions={
            <button className="button primary" type="button" onClick={handleQuickDraw}>
              再試一次
            </button>
          }
        />
      ) : null}

      <section className="detail-panel fortune-note-panel">
        <ShieldCheck size={22} />
        <div>
          <strong>文化提醒與三不原則</strong>
          <p>不判吉凶・保留白話・重要事回到正式窗口。籤詩內容提供調和身心之文化參考，不作命運斷言。</p>
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
