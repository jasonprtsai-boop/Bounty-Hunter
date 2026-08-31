import { useState } from "react";
import { Sparkles } from "lucide-react";
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
      <section className="fortune-stage">
        <Sparkles size={42} />
        <button className="button primary" disabled={drawing} onClick={draw}>
          {drawing ? "抽籤中" : "抽一支文化籤"}
        </button>
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
      {slip ? (
        <section className="detail-panel">
          <h2>{slip.title}</h2>
          <p className="poem">{slip.poem}</p>
          <p>{slip.plain_language}</p>
          <p>{slip.cultural_note}</p>
          <p className="notice">{slip.reminder}</p>
        </section>
      ) : null}
    </Shell>
  );
}
