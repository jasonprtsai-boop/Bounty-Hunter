import { Link } from "react-router-dom";
import { CalendarDays, MapPin } from "lucide-react";
import type { EventItem } from "../lib/api";
import { eventPath } from "../lib/eventLinks";

const statusLabels: Record<string, string> = {
  open: "可報名",
  published: "可報名",
  upcoming: "近期活動",
  draft: "草稿",
  closed: "已截止",
  cancelled: "已取消"
};

function eventCardThemeClass(event: EventItem) {
  const text = `${event.category} ${event.title}`;
  if (/法會|普度|祈福|服務/.test(text)) return "event-card-ritual";
  if (/導覽|第一次|參拜流程|動線/.test(text)) return "event-card-guide";
  if (/文化|講堂|書法|教育|體驗/.test(text)) return "event-card-culture";
  return "event-card-festival";
}

export function EventCard({ event }: { event: EventItem }) {
  const ratio = event.capacity ? Math.min(100, Math.round((event.registered_count / event.capacity) * 100)) : 0;
  const now = Date.now();
  const registrationOpen = !event.registration_open_at || new Date(event.registration_open_at).getTime() <= now;
  const registrationNotClosed = !event.registration_close_at || new Date(event.registration_close_at).getTime() >= now;
  const canRegister = event.requires_registration && ["open", "published"].includes(event.status) && registrationOpen && registrationNotClosed;
  const isFull = Boolean(event.capacity && event.registered_count >= event.capacity);
  const canJoinWaitlist = canRegister && isFull && event.waitlist_enabled;
  const actionLabel = event.requires_registration ? "前往活動報名" : "查看活動詳情";
  const capacityText = event.capacity
    ? isFull && event.waitlist_enabled
      ? `${event.registered_count}/${event.capacity} 人，可登記候補`
      : `${event.registered_count}/${event.capacity} 人`
    : event.requires_registration
      ? "名額由廟方確認"
      : "免報名";

  return (
    <article className={`card event-card ${eventCardThemeClass(event)}`}>
      <div className="card-row">
        <span className="tag">{event.category}</span>
        <span className={canRegister ? "status open" : "status"}>
          {canJoinWaitlist ? "可登記候補" : isFull ? "名額已滿" : statusLabels[event.status] || event.status}
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
      {event.waitlist_enabled && event.capacity ? <p className="event-card-note">額滿可登記候補</p> : null}
      {event.registration_open_at ? <p className="event-card-note">開放報名：{new Date(event.registration_open_at).toLocaleString("zh-TW")}</p> : null}
      {event.registration_close_at ? <p className="event-card-note">報名截止：{new Date(event.registration_close_at).toLocaleString("zh-TW")}</p> : null}
      {event.capacity ? (
        <div className="capacity" aria-label="報名進度">
          <span style={{ width: `${ratio}%` }} />
        </div>
      ) : null}
      <Link className="button primary" to={eventPath(event.event_id)}>
        {actionLabel}
      </Link>
    </article>
  );
}
