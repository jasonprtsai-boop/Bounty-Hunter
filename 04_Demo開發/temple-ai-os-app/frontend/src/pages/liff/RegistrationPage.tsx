import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Shell } from "../../components/Shell";
import { StatePanel } from "../../components/StatePanel";
import { apiFetch, type EventItem, type Registration } from "../../lib/api";
import { eventPath } from "../../lib/eventLinks";
import { getLiffSession } from "../../lib/session";

export function RegistrationPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [created, setCreated] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
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
      .catch(() => undefined);
    loadEvent();
  }, [eventId]);

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

  async function submit(eventSubmit: FormEvent) {
    eventSubmit.preventDefault();
    if (!eventId || !event || !canRegister) return;
    const contactName = form.contact_name.trim();
    const phone = form.phone.trim();
    const partySize = Number(form.party_size);
    if (!contactName) {
      setError("請填寫姓名或稱呼");
      return;
    }
    if (!Number.isInteger(partySize) || partySize < 1 || partySize > (event.max_party_size || 10)) {
      setError(`參加人數需為 1 到 ${event.max_party_size || 10} 人`);
      return;
    }
    if (phone && !/^[0-9+\-\s()]{6,20}$/.test(phone)) {
      setError("手機格式不易辨識，請只輸入數字、空格或 + - 符號");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const session = await getLiffSession();
      const result = await apiFetch<Registration>(`/api/events/${eventId}/registrations`, {
        method: "POST",
        body: JSON.stringify({
          ...form,
          contact_name: contactName,
          phone: phone || undefined,
          party_size: partySize,
          note: form.note.trim(),
          user_id: session.user_id
        })
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
    !(event?.capacity && event.registered_count >= event.capacity && !event.waitlist_enabled) &&
    (!event?.registration_open_at || new Date(event.registration_open_at).getTime() <= Date.now()) &&
    (!event?.registration_close_at || new Date(event.registration_close_at).getTime() >= Date.now());

  return (
    <Shell title="活動報名">
      {loading ? (
        <StatePanel variant="loading" title="正在確認活動" body="請稍候，系統正在確認活動是否仍可報名。" />
      ) : loadError ? (
        <StatePanel
          variant="error"
          title="活動報名資料暫時無法讀取"
          body={loadError}
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
      ) : event ? (
        <section className="detail-panel">
          <h2>{event.title}</h2>
          <p>{event.summary}</p>
          <div className="event-info-grid">
            <div>
              <span>報名狀態</span>
                <strong>{event.waitlist_enabled && event.capacity && event.registered_count >= event.capacity ? "可登記候補" : canRegister ? "開放線上報名" : "目前不開放"}</strong>
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
          <h2>{created.status === "waitlisted" ? "已登記候補" : "報名成功"}</h2>
          <p>報名編號：{created.registration_id}</p>
          <p className="notice">報名紀錄已建立；正式活動資訊仍以廟方公告為準。</p>
          <div className="state-actions">
            <Link className="button primary" to="/events?lookup=1">
              查詢報名進度
            </Link>
            <Link className="button" to={eventPath(created.event_id)}>
              回活動詳情
            </Link>
          </div>
        </section>
      ) : loading || loadError ? null : !event ? (
        <StatePanel variant="empty" title="找不到活動" body="目前無法確認這筆活動，請回到活動中心重新選擇。" />
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
            <input
              type="tel"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="例如 0912-345-678"
            />
          </label>
          <label>
            參加人數
            <input
              type="number"
              min={1}
                max={event.max_party_size || 10}
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
          {error && <p className="error-text" role="alert">{error}</p>}
          <button className="button primary" disabled={saving || !event || !canRegister} type="submit">
            {saving ? "送出中" : "送出報名"}
          </button>
        </form>
      )}
    </Shell>
  );
}
