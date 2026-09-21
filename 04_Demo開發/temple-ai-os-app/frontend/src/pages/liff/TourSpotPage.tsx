import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BookOpen, ChevronLeft, ChevronRight, Compass, MapPin, Navigation, ShieldCheck } from "lucide-react";
import { Shell } from "../../components/Shell";
import { StatePanel } from "../../components/StatePanel";
import { apiFetch } from "../../lib/api";
import { findLocalPreviewTourSpot, localPreviewTourSpots, type LocalTourSpot } from "../../lib/localPreviewData";
import { templeExteriorImage, templePhotoGallery } from "../../lib/visualAssets";

const visitTips = [
  "入殿前先確認現場動線與開放區域。",
  "若遇法會或祭典，請依現場人員引導參拜。",
  "需要活動、報名或服務協助，可到客服中心留下問題。"
];

export function TourSpotPage() {
  const { code } = useParams();
  const currentCode = code || "main-hall";
  const [spot, setSpot] = useState<LocalTourSpot | null>(() => findLocalPreviewTourSpot(currentCode));
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const allSpots = localPreviewTourSpots;
  const currentIndex = allSpots.findIndex((s) => s.code === currentCode);
  const prevSpot = currentIndex > 0 ? allSpots[currentIndex - 1] : null;
  const nextSpot = currentIndex >= 0 && currentIndex < allSpots.length - 1 ? allSpots[currentIndex + 1] : null;

  useEffect(() => {
    loadSpot();
  }, [currentCode]);

  async function loadSpot() {
    const local = findLocalPreviewTourSpot(currentCode);
    if (local) {
      setSpot(local);
      setLoading(false);
    }
    setLoadError("");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 3500);

    try {
      const data = await apiFetch<LocalTourSpot>(`/api/tour/spots/${currentCode}`, { signal: controller.signal });
      if (data) {
        setSpot(data);
      }
    } catch (err) {
      if (!local) {
        setLoadError(err instanceof Error ? err.message : "讀取導覽資料失敗");
      }
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }

  return (
    <Shell title="宮廟導覽">
      {/* 6-Spot Tour Stepper Navigation Bar */}
      <section className="tool-panel tour-stepper-panel" aria-label="萬春宮參拜動線導覽點">
        <div className="tour-stepper-header">
          <Compass size={18} />
          <h2>參拜動線導覽 <span>（共 6 大景點）</span></h2>
        </div>
        <nav className="tour-stepper-nav" aria-label="景點切換">
          {allSpots.map((s, idx) => {
            const isActive = s.code === currentCode || (!code && s.code === "main-hall" && currentCode === "main-hall");
            return (
              <Link
                key={s.code}
                to={`/tour/spots/${s.code}`}
                className={`tour-step-item${isActive ? " is-active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="step-num">{idx + 1}</span>
                <span className="step-title">{s.title.split(" ‧ ")[0]}</span>
              </Link>
            );
          })}
        </nav>
      </section>

      {loading ? (
        <section className="detail-panel tour-detail-layout tour-loading-layout">
          <figure className="tour-cover">
            <img src={templeExteriorImage} alt="萬春宮實景" />
            <figcaption>
              <span className="tag">古蹟導覽</span>
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
              <span className="tag">古蹟導覽</span>
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
        <>
          <section className="tour-overview">
            <figure className="tour-cover tour-hero-card">
              <img src={spot.image_url || templeExteriorImage} alt={spot.title} />
              <figcaption>
                <span className="tag">{spot.category}</span>
                <strong>{spot.title}</strong>
              </figcaption>
            </figure>
            <div className="tour-guide-panel">
              <div className="tour-guide-badge-row">
                <span className="tag">第 {currentIndex >= 0 ? currentIndex + 1 : 1} 站 ‧ {spot.category}</span>
              </div>
              <h2>{spot.title}</h2>
              <p>{spot.summary}</p>
              <dl className="tour-guide-facts" aria-label="導覽資訊">
                <div>
                  <dt>景點類型</dt>
                  <dd>{spot.category}</dd>
                </div>
                <div>
                  <dt>參拜順序</dt>
                  <dd>第 {currentIndex >= 0 ? currentIndex + 1 : 1} 站（循動線參觀）</dd>
                </div>
              </dl>
              <div className="tour-step-navigation-actions">
                {prevSpot && (
                  <Link className="button" to={`/tour/spots/${prevSpot.code}`}>
                    <ChevronLeft size={16} /> 上一站：{prevSpot.title.split(" ‧ ")[0]}
                  </Link>
                )}
                {nextSpot && (
                  <Link className="button primary" to={`/tour/spots/${nextSpot.code}`}>
                    下一站：{nextSpot.title.split(" ‧ ")[0]} <ChevronRight size={16} />
                  </Link>
                )}
              </div>
            </div>
          </section>

          <section className="tour-content-layout">
            <div className="tour-note-grid tour-note-grid-refined">
              <article>
                <i className="tour-note-mark" aria-hidden="true"><Navigation size={22} /></i>
                <span>導覽重點</span>
                <p>先確認入口、殿堂位置與現場開放區域，再依廟方指示參拜。</p>
              </article>
              <article>
                <i className="tour-note-mark" aria-hidden="true"><BookOpen size={22} /></i>
                <span>文史溯源</span>
                <p>{spot.cultural_note}</p>
              </article>
            </div>
            <aside className="tour-visit-card" aria-label="參拜提醒">
              <div>
                <MapPin size={22} />
                <h2>參拜小提醒</h2>
              </div>
              <ul>
                {visitTips.map((tip) => (
                  <li key={tip}>
                    <ShieldCheck size={17} />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </section>

          <section className="tour-photo-strip tour-photo-strip-refined" aria-label="萬春宮實景照片">
            {templePhotoGallery.slice(0, 3).map((photo) => (
              <figure key={photo.src}>
                <img src={photo.src} alt={photo.title} />
                <figcaption>{photo.title}</figcaption>
              </figure>
            ))}
          </section>
        </>
      ) : (
        <StatePanel variant="empty" title="找不到導覽點" body="目前沒有這個導覽點資料，請回到主殿導覽重新查看。" />
      )}
    </Shell>
  );
}
