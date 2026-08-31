import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Shell } from "../../components/Shell";
import { StatePanel } from "../../components/StatePanel";
import { apiFetch } from "../../lib/api";

type TourSpot = {
  code: string;
  title: string;
  category: string;
  summary: string;
  cultural_note: string;
  image_url?: string;
  source_type: string;
};

export function TourSpotPage() {
  const { code } = useParams();
  const [spot, setSpot] = useState<TourSpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    loadSpot();
  }, [code]);

  async function loadSpot() {
    setLoading(true);
    setLoadError("");
    try {
      setSpot(await apiFetch<TourSpot>(`/api/tour/spots/${code || "main-hall"}`));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "讀取導覽資料失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell title="宮廟導覽">
      {loading ? (
        <StatePanel variant="loading" title="正在讀取導覽" body="系統正在載入目前點位的文化說明。" />
      ) : loadError ? (
        <StatePanel
          variant="error"
          title="導覽資料暫時無法讀取"
          body={loadError}
          actions={
            <button className="button primary" type="button" onClick={loadSpot}>
              重新讀取
            </button>
          }
        />
      ) : spot ? (
        <section className="detail-panel">
          {spot.image_url ? <img className="wide-image" src={spot.image_url} alt={spot.title} /> : null}
          <span className="tag">{spot.category}</span>
          <h2>{spot.title}</h2>
          <p>{spot.summary}</p>
          <p>{spot.cultural_note}</p>
        </section>
      ) : (
        <StatePanel variant="empty" title="找不到導覽點" body="目前沒有這個導覽點資料，請回到主殿導覽重新查看。" />
      )}
    </Shell>
  );
}
