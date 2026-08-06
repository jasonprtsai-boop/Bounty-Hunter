import { useEffect, useState } from "react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { Shell } from "../../components/Shell";
import { apiFetch, type EventItem } from "../../lib/api";

type EventForm = {
  title: string;
  category: string;
  source_type: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  address: string;
  summary: string;
  requires_registration: boolean;
  capacity: string;
  status: string;
  registration_fields: string;
  payment_policy: string;
  demo_note: string;
};

const emptyForm: EventForm = {
  title: "",
  category: "文化教育",
  source_type: "team_demo_sample",
  date: "2026-10-01",
  start_time: "10:00",
  end_time: "11:00",
  location: "萬春宮",
  address: "臺中市中區成功路212號",
  summary: "",
  requires_registration: true,
  capacity: "30",
  status: "draft",
  registration_fields: "姓名\n參加人數\n是否需要提醒",
  payment_policy: "",
  demo_note: "後台建立的 Demo 活動，不代表萬春宮官方活動。"
};

function toForm(event: EventItem): EventForm {
  return {
    title: event.title,
    category: event.category,
    source_type: event.source_type,
    date: event.date,
    start_time: event.start_time,
    end_time: event.end_time,
    location: event.location,
    address: event.address,
    summary: event.summary,
    requires_registration: event.requires_registration,
    capacity: event.capacity ? String(event.capacity) : "",
    status: event.status,
    registration_fields: event.registration_fields.join("\n"),
    payment_policy: event.payment_policy || "",
    demo_note: event.demo_note
  };
}

function toPayload(form: EventForm) {
  return {
    title: form.title.trim(),
    category: form.category.trim(),
    source_type: form.source_type,
    date: form.date,
    start_time: form.start_time,
    end_time: form.end_time,
    location: form.location.trim(),
    address: form.address.trim(),
    summary: form.summary.trim(),
    requires_registration: form.requires_registration,
    capacity: form.capacity ? Number(form.capacity) : null,
    status: form.status,
    registration_fields: form.registration_fields
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    payment_policy: form.payment_policy.trim() || null,
    demo_note: form.demo_note.trim()
  };
}

export function AdminEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<EventItem[]>("/api/admin/events", {}, true).then(setEvents).catch(console.error);
  }, []);

  function updateForm<K extends keyof EventForm>(key: K, value: EventForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setMessage("");
  }

  async function saveEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = toPayload(form);
      const saved = editingId
        ? await apiFetch<EventItem>(
            `/api/admin/events/${editingId}`,
            { method: "PUT", body: JSON.stringify(payload) },
            true
          )
        : await apiFetch<EventItem>(
            "/api/admin/events",
            { method: "POST", body: JSON.stringify(payload) },
            true
          );
      setEvents((current) => {
        const exists = current.some((item) => item.event_id === saved.event_id);
        return exists
          ? current.map((item) => (item.event_id === saved.event_id ? saved : item))
          : [...current, saved].sort((a, b) => `${a.date}${a.start_time}`.localeCompare(`${b.date}${b.start_time}`));
      });
      setEditingId(saved.event_id);
      setMessage("已儲存");
    } catch (err) {
      setError(err instanceof Error ? err.message : "儲存失敗");
    } finally {
      setSaving(false);
    }
  }

  async function deleteEvent(eventId: string) {
    if (!window.confirm("確定刪除此 Demo 活動？")) {
      return;
    }
    setError("");
    setMessage("");
    try {
      await apiFetch<{ deleted: boolean }>(`/api/admin/events/${eventId}`, { method: "DELETE" }, true);
      setEvents((current) => current.filter((event) => event.event_id !== eventId));
      if (editingId === eventId) {
        resetForm();
      }
      setMessage("已刪除");
    } catch (err) {
      setError(err instanceof Error ? err.message : "刪除失敗");
    }
  }

  return (
    <Shell title="活動管理" mode="admin">
      <div className="admin-event-grid">
        <form className="form-panel" onSubmit={saveEvent}>
          <div className="admin-actions">
            <strong>{editingId ? "編輯活動" : "新增活動"}</strong>
            <button className="button" type="button" onClick={resetForm}>
              <Plus size={18} />
              新增
            </button>
          </div>

          <label>
            活動名稱
            <input value={form.title} onChange={(event) => updateForm("title", event.target.value)} required />
          </label>

          <div className="form-grid">
            <label>
              分類
              <input value={form.category} onChange={(event) => updateForm("category", event.target.value)} required />
            </label>
            <label>
              狀態
              <select value={form.status} onChange={(event) => updateForm("status", event.target.value)}>
                <option value="draft">draft</option>
                <option value="open">open</option>
                <option value="upcoming">upcoming</option>
                <option value="closed">closed</option>
              </select>
            </label>
          </div>

          <div className="form-grid">
            <label>
              日期
              <input type="date" value={form.date} onChange={(event) => updateForm("date", event.target.value)} required />
            </label>
            <label>
              容量
              <input
                min="1"
                type="number"
                value={form.capacity}
                onChange={(event) => updateForm("capacity", event.target.value)}
              />
            </label>
          </div>

          <div className="form-grid">
            <label>
              開始
              <input type="time" value={form.start_time} onChange={(event) => updateForm("start_time", event.target.value)} required />
            </label>
            <label>
              結束
              <input type="time" value={form.end_time} onChange={(event) => updateForm("end_time", event.target.value)} required />
            </label>
          </div>

          <label>
            地點
            <input value={form.location} onChange={(event) => updateForm("location", event.target.value)} required />
          </label>
          <label>
            地址
            <input value={form.address} onChange={(event) => updateForm("address", event.target.value)} required />
          </label>
          <label>
            摘要
            <textarea value={form.summary} onChange={(event) => updateForm("summary", event.target.value)} required />
          </label>
          <label>
            報名欄位
            <textarea value={form.registration_fields} onChange={(event) => updateForm("registration_fields", event.target.value)} />
          </label>
          <label>
            Demo 註記
            <textarea value={form.demo_note} onChange={(event) => updateForm("demo_note", event.target.value)} required />
          </label>
          <label className="check-row">
            <input
              type="checkbox"
              checked={form.requires_registration}
              onChange={(event) => updateForm("requires_registration", event.target.checked)}
            />
            開放報名
          </label>

          <div className="admin-actions">
            <button className="button primary" disabled={saving} type="submit">
              <Save size={18} />
              {saving ? "儲存中" : "儲存"}
            </button>
            {editingId && (
              <button className="button" type="button" onClick={resetForm}>
                <X size={18} />
                取消
              </button>
            )}
          </div>
          {message && <p className="notice">{message}</p>}
          {error && <p className="error-text">{error}</p>}
        </form>

        <section className="tool-panel">
          <div className="table events-table">
          <div className="table-head">
            <span>活動</span>
            <span>日期</span>
            <span>報名</span>
            <span>狀態</span>
            <span>操作</span>
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
              <span className="inline-actions">
                <button className="button icon-button" type="button" onClick={() => {
                  setEditingId(event.event_id);
                  setForm(toForm(event));
                  setError("");
                  setMessage("");
                }}>
                  <Pencil size={17} />
                  <span>編輯</span>
                </button>
                <button className="button icon-button danger" type="button" onClick={() => deleteEvent(event.event_id)}>
                  <Trash2 size={17} />
                  <span>刪除</span>
                </button>
              </span>
            </div>
          ))}
        </div>
        </section>
      </div>
    </Shell>
  );
}
