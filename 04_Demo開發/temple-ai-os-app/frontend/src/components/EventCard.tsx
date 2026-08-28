import { Link } from "react-router-dom";
import { CalendarDays, MapPin } from "lucide-react";
import type { EventItem } from "../lib/api";

const statusLabels: Record<string, string> = {
  open: "可報名",
  published: "可報名",
  upcoming: "近期活動",
  draft: "草稿",
  closed: "已截止",
  cancelled: "已取消"
};

export function EventCard({ event }: { event: EventItem }) {
  const ratio = event.capacity ? Math.min(100, Math.round((event.registered_count / event.capacity) * 100)) : 0;
  const canRegister = event.requires_registration && ["open", "published"].includes(event.status);
  const capacityText = event.capacity
    ? `${event.registered_count}/${event.capacity} 人`
    : event.requires_registration
      ? "名額由廟方確認"
      : "免報名";

  return (
    <article className="card event-card">
      <div className="card-row">
        <span className="tag">{event.category}</span>
        <span className={canRegister ? "status open" : "status"}>
          {statusLabels[event.status] || event.status}
        </span>
      </div>
      <h2>{event.title}</h2>
      <p>{event.summary}</p>
      <div className="meta-line">
        <CalendarDays size={16} />
        <span>
          {event.date} {event.start_time}-{event.end_time}
        </span>
      </div>
      <div className="meta-line">
        <MapPin size={16} />
        <span>{event.location}</span>
      </div>
      <div className="capacity-row">
        <span>{event.requires_registration ? "報名名額" : "參與方式"}</span>
        <strong>{capacityText}</strong>
      </div>
      {event.capacity ? (
        <div className="capacity" aria-label="報名進度">
          <span style={{ width: `${ratio}%` }} />
        </div>
      ) : null}
      <Link className="button primary" to={`/events/${event.event_id}`}>
        查看詳情
      </Link>
    </article>
  );
}
