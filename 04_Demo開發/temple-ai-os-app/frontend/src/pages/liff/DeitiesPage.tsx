import { useEffect, useMemo, useState } from "react";
import { BookOpen, MapPin } from "lucide-react";
import { Shell } from "../../components/Shell";
import { StatePanel } from "../../components/StatePanel";
import { apiFetch, type Deity } from "../../lib/api";

export function DeitiesPage() {
  const [deities, setDeities] = useState<Deity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Deity[]>("/api/deities")
      .then(setDeities)
      .catch((err) => setError(err instanceof Error ? err.message : "神佛資料暫時無法讀取"))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => deities.reduce<Record<string, Deity[]>>((groups, deity) => {
    (groups[deity.category] ||= []).push(deity);
    return groups;
  }, {}), [deities]);

  return (
    <Shell title="神佛介紹">
      <section className="event-page-hero">
        <div><span className="tag">萬春宮奉祀資料</span><h2>主配祀神、客座神明與護法神明</h2><p>依公開資料整理神佛分類、奉祀位置與文化介紹；正式參拜安排仍請以廟方公告與現場指示為準。</p></div>
        <BookOpen size={42} />
      </section>
      {loading ? <StatePanel variant="loading" title="正在讀取神佛資料" body="請稍候，系統正在整理公開介紹。" /> : error ? <StatePanel variant="error" title="神佛資料暫時無法讀取" body={error} /> : Object.entries(grouped).map(([category, items]) => <section className="tool-panel" key={category}><div className="section-title"><BookOpen size={20} /><h2>{category}</h2></div><div className="event-list-grid">{items.map((deity) => <article className="card" key={deity.deity_id}><span className="tag">{deity.category}</span><h2>{deity.name}</h2><div className="meta-line"><MapPin size={16} /><span>{deity.enshrined_area || "奉祀位置待公告"}</span></div><p>{deity.description}</p>{deity.birthday_lunar ? <p className="notice">聖誕：{deity.birthday_lunar}</p> : null}{deity.service_notes ? <p className="notice">{deity.service_notes}</p> : null}</article>)}</div></section>)}
      {!loading && !error && deities.length === 0 ? <StatePanel variant="empty" title="目前沒有公開神佛資料" body="資料整理完成後會在此顯示。" /> : null}
    </Shell>
  );
}
