import { Link } from "react-router-dom";
import { CalendarDays, MapPin } from "lucide-react";
import type { EventItem } from "../lib/api";

export function EventCard({ event }: { event: EventItem }) {
  const ratio = event.capacity ? Math.min(100, Math.round((event.registered_count / event.capacity) * 100)) : 0;
  return (
    <article className="card event-card">
      <div className="card-row">
        <span className="tag">{event.category}</span>
        <span className={event.status === "open" ? "status open" : "status"}>{event.status}</span>
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

