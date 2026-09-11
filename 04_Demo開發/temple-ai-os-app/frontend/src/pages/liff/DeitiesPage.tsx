import { useEffect, useMemo, useState } from "react";
import { BookOpen, Calendar, MapPin, Sparkles } from "lucide-react";
import { Shell } from "../../components/Shell";
import { StatePanel } from "../../components/StatePanel";
import { apiFetch, type Deity } from "../../lib/api";
import { canUsePreviewFallback, isLocalPreview, localPreviewDeities } from "../../lib/localPreviewData";
import { templeExteriorImage } from "../../lib/visualAssets";

function deityMark(name: string) {
  if (name.includes("媽祖") || name.includes("聖母")) return "媽";
  if (name.includes("觀音")) return "觀";
  if (name.includes("註生")) return "註";
  if (name.includes("三官")) return "官";
  if (name.includes("文昌")) return "文";
  if (name.includes("關聖") || name.includes("關帝")) return "關";
  if (name.includes("呂仙祖") || name.includes("孚佑")) return "仙";
  if (name.includes("千里眼")) return "眼";
  if (name.includes("順風耳")) return "耳";
  if (name.includes("虎爺")) return "虎";
  if (name.includes("太歲")) return "歲";
  return "福";
}

export function DeitiesPage() {
  const [deities, setDeities] = useState<Deity[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
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

  const categories = useMemo(() => {
    const set = new Set<string>();
    deities.forEach((d) => {
      if (d.category) set.add(d.category);
    });
    return Array.from(set);
  }, [deities]);

  const mazuDeity = useMemo(() => {
    return deities.find((d) => d.deity_id === "deity_mazu" || d.name.includes("媽祖"));
  }, [deities]);

  const filteredDeities = useMemo(() => {
    if (selectedCategory === "all") return deities;
    return deities.filter((d) => d.category === selectedCategory);
  }, [deities, selectedCategory]);

  const grouped = useMemo(() => {
    return filteredDeities.reduce<Record<string, Deity[]>>((groups, deity) => {
      (groups[deity.category] ||= []).push(deity);
      return groups;
    }, {});
  }, [filteredDeities]);

  return (
    <Shell title="神佛介紹">
      <section className="event-page-hero visual-page-hero deities-visual-hero">
        <figure>
          <img src={templeExteriorImage} alt="萬春宮實景" />
        </figure>
        <div>
          <span className="tag">奉祀體系</span>
          <h2>萬春宮神佛介紹</h2>
          <p>開基三百年藍興媽祖慈悲護佑，主配祀神明莊嚴常駐。歡迎善信依動線虔敬參拜。</p>
        </div>
      </section>

      {mazuDeity && (selectedCategory === "all" || selectedCategory === "主祀神明") && (
        <section className="tool-panel deity-spotlight-panel" aria-label="開基主祀神明">
          <div className="deity-spotlight-card">
            <div className="deity-spotlight-seal" aria-hidden="true">
              <span>媽</span>
            </div>
            <div className="deity-spotlight-content">
              <div className="deity-spotlight-header">
                <span className="tag tag-gold">開基主神 ‧ 慈悲聖母</span>
                <h2>{mazuDeity.name}</h2>
              </div>
              <div className="deity-spotlight-meta">
                <div className="meta-pill">
                  <MapPin size={16} />
                  <span>奉祀空間：{mazuDeity.enshrined_area || "正殿神龕"}</span>
                </div>
                {mazuDeity.birthday_lunar && (
                  <div className="meta-pill">
                    <Calendar size={16} />
                    <span>聖誕佳辰：農曆{mazuDeity.birthday_lunar}</span>
                  </div>
                )}
              </div>
              <p className="deity-spotlight-desc">{mazuDeity.description}</p>
              {mazuDeity.service_notes && (
                <div className="deity-spotlight-notes">
                  <Sparkles size={16} />
                  <span>{mazuDeity.service_notes}</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {!loading && !error && deities.length > 0 && (
        <nav className="deity-category-nav" aria-label="神明分類篩選">
          <button
            type="button"
            className={`deity-cat-chip${selectedCategory === "all" ? " is-active" : ""}`}
            onClick={() => setSelectedCategory("all")}
          >
            全部奉祀 <span>{deities.length}</span>
          </button>
          {categories.map((cat) => {
            const count = deities.filter((d) => d.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                className={`deity-cat-chip${selectedCategory === cat ? " is-active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat} <span>{count}</span>
              </button>
            );
          })}
        </nav>
      )}

      {loading ? (
        <StatePanel variant="loading" title="正在讀取神佛資料" body="請稍候，系統正在整理公開介紹。" />
      ) : error ? (
        <StatePanel variant="error" title="神佛資料暫時無法讀取" body={error} />
      ) : (
        Object.entries(grouped).map(([category, items]) => {
          return (
            <section className="tool-panel deity-section" key={category}>
              <div className="section-title">
                <BookOpen size={20} />
                <h2>{category}</h2>
                <span className="section-count">共 {items.length} 尊</span>
              </div>
              <div className="deity-grid">
                {items.map((deity) => (
                  <article className="card deity-card" key={deity.deity_id}>
                    <figure className="deity-card-media">
                      <div className="deity-symbol-badge" aria-hidden="true">
                        {deityMark(deity.name)}
                      </div>
                      <figcaption>{deity.category}</figcaption>
                    </figure>
                    <div className="deity-card-body">
                      <h2>{deity.name}</h2>
                      <div className="meta-line">
                        <MapPin size={16} />
                        <span>{deity.enshrined_area || "奉祀位置待公告"}</span>
                      </div>
                      <p>{deity.description}</p>
                      {deity.birthday_lunar ? (
                        <p className="notice notice-calendar">
                          <Calendar size={14} /> 聖誕：{deity.birthday_lunar}
                        </p>
                      ) : null}
                      {deity.service_notes ? (
                        <p className="notice notice-service">
                          <Sparkles size={14} /> {deity.service_notes}
                        </p>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })
      )}
      {!loading && !error && filteredDeities.length === 0 ? (
        <StatePanel variant="empty" title="此分類目前無神佛資料" body="請切換其他分類查看萬春宮奉祀神明。" />
      ) : null}
    </Shell>
  );
}
