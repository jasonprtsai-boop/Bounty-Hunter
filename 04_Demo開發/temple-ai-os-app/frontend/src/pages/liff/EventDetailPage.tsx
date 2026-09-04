import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Shell } from "../../components/Shell";
import { StatePanel } from "../../components/StatePanel";
import { apiFetch, type EventItem } from "../../lib/api";
import { eventRouteKey } from "../../lib/eventLinks";

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
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  useEffect(() => {
    if (!event?.countdown_target_at) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [event?.countdown_target_at]);

  async function loadEvent() {
    if (!eventId) {
      setLoadError("找不到活動代號");
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError("");
    try {
      setEvent(await apiFetch<EventItem>(`/api/events/${eventId}`));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "讀取活動失敗");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Shell title="活動詳情">
        <StatePanel variant="loading" title="正在讀取活動" body="請稍候，系統正在確認活動時間、地點與報名狀態。" />
      </Shell>
    );
  }

  if (loadError || !event) {
    return (
      <Shell title="活動詳情">
        <StatePanel
          variant="error"
          title="活動資料暫時無法讀取"
          body={loadError || "找不到這筆活動資料"}
          actions={
            <>
              <button className="button primary" type="button" onClick={loadEvent}>
                重新讀取
              </button>
              <Link className="button" to="/events">
                回活動中心
              </Link>
            </>
          }
        />
      </Shell>
    );
  }

  const registrationOpen = !event.registration_open_at || new Date(event.registration_open_at).getTime() <= now;
  const registrationNotClosed = !event.registration_close_at || new Date(event.registration_close_at).getTime() >= now;
  const canRegister = event.requires_registration && ["open", "published"].includes(event.status) && registrationOpen && registrationNotClosed;
  const isFull = Boolean(event.capacity && event.registered_count >= event.capacity);
  const registrationNotStarted = Boolean(event.registration_open_at && new Date(event.registration_open_at).getTime() > now);
  const registrationClosed = Boolean(event.registration_close_at && new Date(event.registration_close_at).getTime() <= now);
  const countdownSeconds = event.countdown_target_at
    ? Math.max(0, Math.floor((new Date(event.countdown_target_at).getTime() - now) / 1000))
    : 0;
  const countdownText = `${Math.floor(countdownSeconds / 86400)}天 ${String(Math.floor((countdownSeconds % 86400) / 3600)).padStart(2, "0")}:${String(Math.floor((countdownSeconds % 3600) / 60)).padStart(2, "0")}:${String(countdownSeconds % 60).padStart(2, "0")}`;
  const canJoinWaitlist = canRegister && isFull && event.waitlist_enabled;

  return (
    <Shell title={event.title}>
      <section className="detail-panel">
        <div className="card-row">
          <span className="tag">{event.category}</span>
          <span className={canRegister ? "status open" : "status"}>
            {canJoinWaitlist ? "可登記候補" : isFull ? "名額已滿" : statusLabels[event.status] || event.status}
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
            <strong>
              {canJoinWaitlist
                ? "額滿，可登記候補"
                : canRegister
                  ? "現在可報名"
                  : registrationNotStarted
                    ? "尚未開放"
                    : registrationClosed
                      ? "已截止"
                      : "目前不開放"}
            </strong>
          </div>
            <div>
              <span>參加方式</span>
              <strong>{event.requires_registration ? "線上填寫資料" : "現場自由參加"}</strong>
            </div>
            {event.registration_close_at ? (
              <div>
                <span>報名截止</span>
                <strong>{new Date(event.registration_close_at).toLocaleString("zh-TW")}</strong>
              </div>
            ) : null}
            {event.registration_open_at ? (
              <div>
                <span>開放報名</span>
                <strong>{new Date(event.registration_open_at).toLocaleString("zh-TW")}</strong>
              </div>
            ) : null}
            {event.countdown_target_at && countdownSeconds > 0 ? (
              <div>
                <span>{event.countdown_label || "活動開始倒數"}</span>
                <strong>{countdownText}</strong>
              </div>
            ) : null}
          </div>
        {event.payment_policy ? <p className="notice">{event.payment_policy}</p> : null}
        <p className="notice">{event.demo_note}</p>
        {canRegister && (!isFull || event.waitlist_enabled) ? (
          <Link className="button primary" to={`/register/${eventRouteKey(event.event_id)}`}>
            {canJoinWaitlist ? "登記候補" : "線上報名"}
          </Link>
        ) : event.requires_registration ? (
          <span className="button muted">目前不開放報名</span>
        ) : null}
      </section>
    </Shell>
  );
}
