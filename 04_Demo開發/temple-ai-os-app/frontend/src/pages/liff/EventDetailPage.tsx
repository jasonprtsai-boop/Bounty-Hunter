import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Shell } from "../../components/Shell";
import { apiFetch, type EventItem } from "../../lib/api";

const statusLabels: Record<string, string> = {
  open: "可報名",
  published: "可報名",
  upcoming: "近期活動",
  draft: "草稿",
  closed: "已截止",
  cancelled: "已取消"
};

export function EventDetailPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState<EventItem | null>(null);

  useEffect(() => {
    if (eventId) {
      apiFetch<EventItem>(`/api/events/${eventId}`).then(setEvent).catch(console.error);
    }
  }, [eventId]);

  if (!event) {
    return <Shell title="活動詳情">載入中</Shell>;
  }

  const canRegister = event.requires_registration && ["open", "published"].includes(event.status);
  const isFull = Boolean(event.capacity && event.registered_count >= event.capacity);

  return (
    <Shell title={event.title}>
      <section className="detail-panel">
        <div className="card-row">
          <span className="tag">{event.category}</span>
          <span className={canRegister && !isFull ? "status open" : "status"}>
            {isFull ? "名額已滿" : statusLabels[event.status] || event.status}
          </span>
        </div>
        <p>{event.summary}</p>
        <div className="meta-line">
          <CalendarDays size={18} />
          <span>
            {event.date} {event.start_time}-{event.end_time}
          </span>
        </div>
        <div className="meta-line">
          <MapPin size={18} />
          <span>{event.address}</span>
        </div>
        {event.capacity ? (
          <div className="meta-line">
            <Users size={18} />
            <span>
              {event.registered_count}/{event.capacity} 人
            </span>
          </div>
        ) : null}
        <div className="event-info-grid">
          <div>
            <span>報名狀態</span>
            <strong>{canRegister && !isFull ? "現在可報名" : "目前不開放"}</strong>
          </div>
          <div>
            <span>參加方式</span>
            <strong>{event.requires_registration ? "線上填寫資料" : "現場自由參加"}</strong>
          </div>
        </div>
        {event.payment_policy ? <p className="notice">{event.payment_policy}</p> : null}
        <p className="notice">{event.demo_note}</p>
        {canRegister && !isFull ? (
          <Link className="button primary" to={`/register/${event.event_id}`}>
            示範報名
          </Link>
        ) : event.requires_registration ? (
          <span className="button muted">目前不開放報名</span>
        ) : null}
      </section>
    </Shell>
  );
}
