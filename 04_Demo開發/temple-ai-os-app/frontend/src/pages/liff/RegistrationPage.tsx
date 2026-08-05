import { FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Shell } from "../../components/Shell";
import { apiFetch, type EventItem, type Registration } from "../../lib/api";

export function RegistrationPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [created, setCreated] = useState<Registration | null>(null);
  const [form, setForm] = useState({
    contact_name: "小安",
    phone: "",
    party_size: 1,
    reminder_opt_in: true,
    note: ""
  });

  useEffect(() => {
    if (eventId) {
      apiFetch<EventItem>(`/api/events/${eventId}`).then(setEvent).catch(console.error);
    }
  }, [eventId]);

  async function submit(eventSubmit: FormEvent) {
    eventSubmit.preventDefault();
    if (!eventId) return;
    const result = await apiFetch<Registration>(`/api/events/${eventId}/registrations`, {
      method: "POST",
      body: JSON.stringify({ ...form, user_id: "demo_u001" })
    });
    setCreated(result);
  }

  return (
    <Shell title="活動報名">
      {event ? (
        <section className="detail-panel">
          <h2>{event.title}</h2>
          <p>{event.summary}</p>
        </section>
      ) : null}
      {created ? (
        <section className="success-panel">
          <h2>報名成功</h2>
          <p>報名編號：{created.registration_id}</p>
          <p className="notice">這是 Demo 報名紀錄，不代表萬春宮官方報名資料。</p>
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
          <button className="button primary" type="submit">
            送出示範報名
          </button>
        </form>
      )}
    </Shell>
  );
}

