import { FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Shell } from "../../components/Shell";
import { apiFetch, type EventItem, type Registration } from "../../lib/api";
import { getLiffSession } from "../../lib/session";

export function RegistrationPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [created, setCreated] = useState<Registration | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    contact_name: "小安",
    phone: "",
    party_size: 1,
    reminder_opt_in: true,
    note: ""
  });

  useEffect(() => {
    getLiffSession()
      .then((session) => setForm((current) => ({ ...current, contact_name: session.display_name })))
      .catch(console.error);
    if (eventId) {
      apiFetch<EventItem>(`/api/events/${eventId}`).then(setEvent).catch(console.error);
    }
  }, [eventId]);

  async function submit(eventSubmit: FormEvent) {
    eventSubmit.preventDefault();
    if (!eventId || !canRegister) return;
    setSaving(true);
    setError("");
    try {
      const session = await getLiffSession();
      const result = await apiFetch<Registration>(`/api/events/${eventId}/registrations`, {
        method: "POST",
        body: JSON.stringify({ ...form, user_id: session.user_id })
      });
      setCreated(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "報名失敗，請稍後再試。");
    } finally {
      setSaving(false);
    }
  }

  const canRegister =
    Boolean(event?.requires_registration) &&
    ["open", "published"].includes(event?.status || "") &&
    !(event?.capacity && event.registered_count >= event.capacity);

  return (
    <Shell title="活動報名">
      {event ? (
        <section className="detail-panel">
          <h2>{event.title}</h2>
          <p>{event.summary}</p>
          <div className="event-info-grid">
            <div>
              <span>報名狀態</span>
              <strong>{canRegister ? "開放示範報名" : "目前不開放"}</strong>
            </div>
            <div>
              <span>目前名額</span>
              <strong>
                {event.capacity ? `${event.registered_count}/${event.capacity} 人` : "由廟方確認"}
              </strong>
            </div>
          </div>
        </section>
      ) : null}
      {created ? (
        <section className="success-panel">
          <h2>報名成功</h2>
          <p>報名編號：{created.registration_id}</p>
          <p className="notice">這是示範報名紀錄，不代表萬春宮官方報名資料。</p>
        </section>
      ) : event && !canRegister ? (
        <section className="form-panel">
          <h2>目前不開放報名</h2>
          <p className="notice">此活動可能尚未開放、已截止或名額已滿；正式資訊仍以廟方公告為準。</p>
        </section>
      ) : (
        <form className="form-panel" onSubmit={submit}>
          <label>
            姓名
            <input
              value={form.contact_name}
              onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
              required
            />
          </label>
          <label>
            手機（選填）
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label>
            參加人數
            <input
              type="number"
              min={1}
              max={10}
              value={form.party_size}
              onChange={(e) => setForm({ ...form, party_size: Number(e.target.value) })}
            />
          </label>
          <label className="check-row">
            <input
              type="checkbox"
              checked={form.reminder_opt_in}
              onChange={(e) => setForm({ ...form, reminder_opt_in: e.target.checked })}
            />
            接收活動提醒
          </label>
          <label>
            備註
            <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </label>
          {error && <p className="error-text">{error}</p>}
          <button className="button primary" disabled={saving || !event} type="submit">
            {saving ? "送出中" : "送出示範報名"}
          </button>
        </form>
      )}
    </Shell>
  );
}
