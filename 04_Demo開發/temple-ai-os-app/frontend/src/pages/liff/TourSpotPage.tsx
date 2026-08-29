import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Shell } from "../../components/Shell";
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

  useEffect(() => {
    apiFetch<TourSpot>(`/api/tour/spots/${code || "main-hall"}`).then(setSpot).catch(console.error);
  }, [code]);

  return (
    <Shell title="宮廟導覽">
      {spot ? (
        <section className="detail-panel">
          {spot.image_url ? <img className="wide-image" src={spot.image_url} alt={spot.title} /> : null}
          <span className="tag">{spot.category}</span>
          <h2>{spot.title}</h2>
          <p>{spot.summary}</p>
          <p>{spot.cultural_note}</p>
        </section>
      ) : (
        "載入中"
      )}
    </Shell>
  );
}
