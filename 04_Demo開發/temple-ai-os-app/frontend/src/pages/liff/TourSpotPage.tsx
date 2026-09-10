import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Shell } from "../../components/Shell";
import { StatePanel } from "../../components/StatePanel";
import { apiFetch } from "../../lib/api";
import { canUsePreviewFallback, findLocalPreviewTourSpot, isLocalPreview, type LocalTourSpot } from "../../lib/localPreviewData";
import { templeExteriorImage, templePhotoGallery } from "../../lib/visualAssets";

export function TourSpotPage() {
  const { code } = useParams();
  const [spot, setSpot] = useState<LocalTourSpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    loadSpot();
  }, [code]);

  async function loadSpot() {
    setLoading(true);
    setLoadError("");
    if (isLocalPreview()) {
      setSpot(findLocalPreviewTourSpot(code || "main-hall"));
      setLoading(false);
      return;
    }
    try {
      setSpot(await apiFetch<LocalTourSpot>(`/api/tour/spots/${code || "main-hall"}`));
    } catch (err) {
      if (canUsePreviewFallback()) {
        setSpot(findLocalPreviewTourSpot(code || "main-hall"));
        return;
      }
      setLoadError(err instanceof Error ? err.message : "讀取導覽資料失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell title="宮廟導覽">
      {loading ? (
        <section className="detail-panel tour-detail-layout tour-loading-layout">
          <figure className="tour-cover">
            <img src={templeExteriorImage} alt="萬春宮實景" />
            <figcaption>
              <span className="tag">主殿導覽</span>
              <strong>宮廟導覽</strong>
            </figcaption>
          </figure>
          <StatePanel variant="loading" title="正在讀取導覽" body="正在載入目前點位。" />
        </section>
      ) : loadError ? (
        <section className="detail-panel tour-detail-layout tour-loading-layout">
          <figure className="tour-cover">
            <img src={templeExteriorImage} alt="萬春宮實景" />
            <figcaption>
              <span className="tag">主殿導覽</span>
              <strong>宮廟導覽</strong>
            </figcaption>
          </figure>
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
        </section>
      ) : spot ? (
        <section className="detail-panel tour-detail-layout">
          <figure className="tour-cover">
            <img src={spot.image_url || templeExteriorImage} alt={spot.title} />
            <figcaption>
              <span className="tag">{spot.category}</span>
              <strong>{spot.title}</strong>
            </figcaption>
          </figure>
          <div className="tour-note-grid">
            <article>
              <i className="tour-note-mark" aria-hidden="true">重</i>
              <span>導覽重點</span>
              <p>{spot.summary}</p>
            </article>
            <article>
              <i className="tour-note-mark" aria-hidden="true">故</i>
              <span>文化故事</span>
              <p>{spot.cultural_note}</p>
            </article>
          </div>
          <div className="tour-photo-strip" aria-label="萬春宮實景照片">
            {templePhotoGallery.slice(1).map((photo) => (
              <figure key={photo.src}>
                <img src={photo.src} alt={photo.title} />
                <figcaption>{photo.title}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : (
        <StatePanel variant="empty" title="找不到導覽點" body="目前沒有這個導覽點資料，請回到主殿導覽重新查看。" />
      )}
    </Shell>
  );
}
