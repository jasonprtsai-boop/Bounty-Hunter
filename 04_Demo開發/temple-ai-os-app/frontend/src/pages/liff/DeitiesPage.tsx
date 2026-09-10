import { useEffect, useMemo, useState } from "react";
import { BookOpen, MapPin } from "lucide-react";
import { Shell } from "../../components/Shell";
import { StatePanel } from "../../components/StatePanel";
import { apiFetch, type Deity } from "../../lib/api";
import { canUsePreviewFallback, isLocalPreview, localPreviewDeities } from "../../lib/localPreviewData";
import { templeExteriorImage } from "../../lib/visualAssets";

function deityMark(name: string) {
  if (name.includes("觀音")) return "觀";
  if (name.includes("註生")) return "註";
  if (name.includes("三官")) return "官";
  if (name.includes("文昌")) return "文";
  if (name.includes("千里眼")) return "眼";
  if (name.includes("順風耳")) return "耳";
  if (name.includes("媽祖")) return "媽";
  return "福";
}

export function DeitiesPage() {
  const [deities, setDeities] = useState<Deity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLocalPreview()) {
      setDeities(localPreviewDeities);
      setLoading(false);
      return;
    }
    apiFetch<Deity[]>("/api/deities")
      .then(setDeities)
      .catch((err) => {
        if (canUsePreviewFallback()) {
          setDeities(localPreviewDeities);
          return;
        }
        setError(err instanceof Error ? err.message : "神佛資料暫時無法讀取");
      })
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => deities.reduce<Record<string, Deity[]>>((groups, deity) => {
    (groups[deity.category] ||= []).push(deity);
    return groups;
  }, {}), [deities]);

  return (
    <Shell title="神佛介紹">
      <section className="event-page-hero visual-page-hero deities-visual-hero">
        <figure>
          <img src={templeExteriorImage} alt="萬春宮實景" />
        </figure>
        <div>
          <span className="tag">奉祀介紹</span>
          <h2>主祀與配祀神明</h2>
          <p>看位置、分類與簡介；參拜安排以現場公告為準。</p>
        </div>
      </section>
      {loading ? (
        <StatePanel variant="loading" title="正在讀取神佛資料" body="請稍候，系統正在整理公開介紹。" />
      ) : error ? (
        <StatePanel variant="error" title="神佛資料暫時無法讀取" body={error} />
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <section className="tool-panel deity-section" key={category}>
            <div className="section-title">
              <BookOpen size={20} />
              <h2>{category}</h2>
            </div>
            <div className="deity-grid">
              {items.map((deity) => (
                <article className="card deity-card" key={deity.deity_id}>
                  <figure className="deity-card-media">
                    <div className="deity-symbol-badge" aria-hidden="true">{deityMark(deity.name)}</div>
                    <figcaption>{deity.category}</figcaption>
                  </figure>
                  <div className="deity-card-body">
                    <h2>{deity.name}</h2>
                    <div className="meta-line">
                      <MapPin size={16} />
                      <span>{deity.enshrined_area || "奉祀位置待公告"}</span>
                    </div>
                    <p>{deity.description}</p>
                    {deity.birthday_lunar ? <p className="notice">聖誕：{deity.birthday_lunar}</p> : null}
                    {deity.service_notes ? <p className="notice">{deity.service_notes}</p> : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))
      )}
      {!loading && !error && deities.length === 0 ? <StatePanel variant="empty" title="目前沒有公開神佛資料" body="資料整理完成後會在此顯示。" /> : null}
    </Shell>
  );
}
