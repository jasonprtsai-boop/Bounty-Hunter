import { useEffect, useState } from "react";
import { EventCard } from "../../components/EventCard";
import { Shell } from "../../components/Shell";
import { apiFetch, type EventItem } from "../../lib/api";

export function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    apiFetch<EventItem[]>("/api/events").then(setEvents).catch(console.error);
  }, []);

  return (
    <Shell title="活動中心">
      <div className="stack">
        {events.map((event) => (
          <EventCard key={event.event_id} event={event} />
        ))}
      </div>
    </Shell>
  );
}

