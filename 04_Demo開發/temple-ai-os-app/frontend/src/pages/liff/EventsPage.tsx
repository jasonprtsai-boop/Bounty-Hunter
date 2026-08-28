import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CalendarDays, RefreshCw } from "lucide-react";
import { EventCard } from "../../components/EventCard";
import { Shell } from "../../components/Shell";
import { apiFetch, type EventItem } from "../../lib/api";

export function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);

    apiFetch<EventItem[]>("/api/events", { signal: controller.signal })
      .then((items) => {
        if (mounted) {
          setEvents(items);
          setError("");
        }
      })
      .catch((eventError) => {
        if (mounted) {
          setError(
            eventError instanceof Error && eventError.name === "AbortError"
              ? "活動資料讀取逾時"
              : eventError instanceof Error
                ? eventError.message
                : "活動資料暫時無法讀取"
          );
        }
      })
      .finally(() => {
        if (mounted) {
          window.clearTimeout(timeout);
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return (
    <Shell title="活動中心">
      <section className="event-page-hero">
        <div>
          <span className="tag">LINE 活動入口</span>
          <h2>查看近期活動與報名狀態</h2>
          <p>活動中心會集中顯示示範活動、導覽、講座與志工服務。若目前沒有開放活動，也會清楚標示狀態。</p>
        </div>
        <Link className="button" to="/support">
          詢問活動資訊
        </Link>
      </section>

      {loading ? (
        <section className="events-state-panel" aria-live="polite">
          <RefreshCw size={24} />
          <h2>正在整理活動資料</h2>
          <p>請稍候，系統正在讀取目前可查看或可報名的活動。</p>
        </section>
      ) : error ? (
        <section className="events-state-panel warning" aria-live="polite">
          <AlertCircle size={24} />
          <h2>活動資料暫時無法讀取</h2>
          <p>可能是後端服務尚未啟動，或部署 API 正在休眠。你仍可回到首頁使用 AI 問答或客服中心。</p>
          <div className="state-actions">
            <button className="button primary" type="button" onClick={() => window.location.reload()}>
              重新整理
            </button>
            <Link className="button" to="/">
              回首頁
            </Link>
          </div>
        </section>
      ) : events.length > 0 ? (
        <div className="event-list-grid">
          {events.map((event) => (
            <EventCard key={event.event_id} event={event} />
          ))}
        </div>
      ) : (
        <section className="events-state-panel">
          <CalendarDays size={24} />
          <h2>目前沒有開放報名活動</h2>
          <p>活動中心會在有示範活動時顯示報名入口。你可以先查看宮廟導覽，或到客服中心留下想詢問的活動內容。</p>
          <div className="state-actions">
            <Link className="button primary" to="/tour/main-hall">
              查看宮廟導覽
            </Link>
            <Link className="button" to="/support">
              聯絡客服
            </Link>
          </div>
        </section>
      )}
    </Shell>
  );
}
