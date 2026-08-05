import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Shell } from "../../components/Shell";
import { apiFetch, type EventItem } from "../../lib/api";

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

  return (
    <Shell title={event.title}>
      <section className="detail-panel">
        <span className="tag">{event.category}</span>
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
        <p className="notice">{event.demo_note}</p>
        {event.requires_registration ? (
          <Link className="button primary" to={`/register/${event.event_id}`}>
            示範報名
          </Link>
        ) : null}
      </section>
    </Shell>
  );
}

