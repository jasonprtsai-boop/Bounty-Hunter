import { useEffect, useState } from "react";
import { Shell } from "../../components/Shell";
import { apiFetch, type EventItem } from "../../lib/api";

export function AdminEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    apiFetch<EventItem[]>("/api/admin/events", {}, true).then(setEvents).catch(console.error);
  }, []);

  return (
    <Shell title="活動管理" mode="admin">
      <section className="tool-panel">
        <div className="table">
          <div className="table-head">
            <span>活動</span>
            <span>日期</span>
            <span>報名</span>
            <span>狀態</span>
          </div>
          {events.map((event) => (
            <div className="table-row" key={event.event_id}>
              <span>{event.title}</span>
              <span>{event.date}</span>
              <span>
                {event.registered_count}
                {event.capacity ? `/${event.capacity}` : ""}
              </span>
              <span>{event.status}</span>
            </div>
          ))}
        </div>
      </section>
    </Shell>
  );
}

