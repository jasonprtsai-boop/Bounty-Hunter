import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Shell } from "../../components/Shell";
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

  async function draw() {
    const result = await apiFetch<FortuneSlip>("/api/fortune/draw", { method: "POST", body: "{}" });
    setSlip(result);
  }

  return (
    <Shell title="文化抽籤">
      <section className="fortune-stage">
        <Sparkles size={42} />
        <button className="button primary" onClick={draw}>
          抽一支文化籤
        </button>
      </section>
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

