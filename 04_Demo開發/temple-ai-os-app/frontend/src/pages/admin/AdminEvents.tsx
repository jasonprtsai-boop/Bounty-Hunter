import { useEffect, useState } from "react";
import { CalendarCheck, ClipboardList, FileSpreadsheet, Pencil, Plus, Save, Search, Trash2, X } from "lucide-react";
import { useConfirmDialog } from "../../components/ConfirmDialog";
import { Shell } from "../../components/AdminShell";
import { StatePanel } from "../../components/StatePanel";
import { apiFetch, type EventItem } from "../../lib/api";
import { canManageOperations, getStoredAdminRole } from "../../lib/adminPermissions";
import { exportRowsToExcel } from "../../lib/excelExport";

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

const eventStatusOptions = [
  { value: "draft", label: "草稿" },
  { value: "open", label: "開放報名" },
  { value: "upcoming", label: "即將舉行" },
  { value: "closed", label: "已結束" }
];

function eventStatusLabel(status: string) {
  return eventStatusOptions.find((option) => option.value === status)?.label || status;
}

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
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const currentRole = getStoredAdminRole();
  const canEditEvents = canManageOperations(currentRole);
  const { requestConfirmation, confirmDialog } = useConfirmDialog();

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    setLoadError("");
    try {
      setEvents(await apiFetch<EventItem[]>("/api/admin/events", {}, true));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "讀取活動失敗");
    } finally {
      setLoading(false);
    }
  }

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
    if (!canEditEvents) {
      setError("目前帳號只能查看活動，不能變更活動資料");
      return;
    }
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
    if (!canEditEvents) {
      setError("目前帳號只能查看活動，不能刪除活動");
      return;
    }
    if (
      !(await requestConfirmation({
        title: "刪除 Demo 活動",
        body: "刪除後活動會從後台列表移除，已連動的示範報名資料也不應再用這筆活動作為入口。",
        confirmLabel: "刪除活動"
      }))
    ) {
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

  const openEvents = events.filter((event) => event.status === "open").length;
  const registrationEvents = events.filter((event) => event.requires_registration).length;
  const totalRegistrations = events.reduce((total, event) => total + event.registered_count, 0);
  const filteredEvents = events.filter((event) => {
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    const keyword = query.trim().toLowerCase();
    const matchesQuery =
      !keyword ||
      [event.title, event.category, event.location, event.address, event.status]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    return matchesStatus && matchesQuery;
  });

  function exportEvents() {
    exportRowsToExcel({
      filename: "temple-events",
      sheetName: "活動列表",
      rows: filteredEvents,
      columns: [
        { header: "序號", value: (_event, index) => index + 1 },
        { header: "活動 ID", value: (event) => event.event_id },
        { header: "活動名稱", value: (event) => event.title },
        { header: "分類", value: (event) => event.category },
        { header: "狀態", value: (event) => eventStatusLabel(event.status) },
        { header: "日期", value: (event) => event.date },
        { header: "開始時間", value: (event) => event.start_time },
        { header: "結束時間", value: (event) => event.end_time },
        { header: "地點", value: (event) => event.location },
        { header: "地址", value: (event) => event.address },
        { header: "需要報名", value: (event) => event.requires_registration },
        { header: "容量", value: (event) => event.capacity ?? "" },
        { header: "已報名", value: (event) => event.registered_count },
        { header: "報名欄位", value: (event) => event.registration_fields.join("、") },
        { header: "摘要", value: (event) => event.summary },
        { header: "付款/費用說明", value: (event) => event.payment_policy || "" },
        { header: "Demo 註記", value: (event) => event.demo_note }
      ]
    });
  }

  return (
    <Shell title="活動管理" mode="admin">
      <section className="admin-summary-strip" aria-label="活動摘要">
        <div>
          <CalendarCheck size={20} />
          <span>活動總數</span>
          <strong>{events.length}</strong>
        </div>
        <div>
          <ClipboardList size={20} />
          <span>開放報名</span>
          <strong>{openEvents}</strong>
        </div>
        <div>
          <Plus size={20} />
          <span>需報名活動</span>
          <strong>{registrationEvents}</strong>
        </div>
        <div>
          <CalendarCheck size={20} />
          <span>累計報名</span>
          <strong>{totalRegistrations}</strong>
        </div>
      </section>

      <div className={`admin-event-grid${canEditEvents ? "" : " read-only-admin-grid"}`}>
        {canEditEvents ? (
        <form className="form-panel admin-editor-panel" onSubmit={saveEvent}>
          <div className="admin-actions">
            <div>
              <span className="panel-kicker">{editingId ? "目前正在編輯" : "建立新活動"}</span>
              <strong>{editingId ? "編輯活動內容" : "新增活動"}</strong>
            </div>
            <button className="button" type="button" onClick={resetForm}>
              <Plus size={18} />
              新增
            </button>
          </div>

          <div className="form-section">
            <div className="form-section-title">
              <span>1</span>
              <strong>基本資訊</strong>
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
                  {eventStatusOptions.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
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
          </div>

          <div className="form-section">
            <div className="form-section-title">
              <span>2</span>
              <strong>報名設定</strong>
            </div>
            <label className="check-row">
              <input
                type="checkbox"
                checked={form.requires_registration}
                onChange={(event) => updateForm("requires_registration", event.target.checked)}
              />
              開放報名
            </label>
            <label>
              報名欄位
              <textarea value={form.registration_fields} onChange={(event) => updateForm("registration_fields", event.target.value)} />
              <small>每行一個欄位，建議只保留姓名、聯絡方式、參加人數與必要備註。</small>
            </label>
          </div>

          <div className="form-section">
            <div className="form-section-title">
              <span>3</span>
              <strong>公開說明</strong>
            </div>
            <label>
              摘要
              <textarea value={form.summary} onChange={(event) => updateForm("summary", event.target.value)} required />
            </label>
            <label>
              Demo 註記
              <textarea value={form.demo_note} onChange={(event) => updateForm("demo_note", event.target.value)} required />
            </label>
          </div>

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
        ) : (
          <StatePanel
            variant="info"
            title="目前是查看模式"
            body="服務人員可以查看活動與報名概況；新增、編輯與刪除活動需要管理員以上權限。"
          />
        )}

        <section className="tool-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">活動列表</span>
              <h2>管理報名與公開狀態</h2>
            </div>
            <div className="panel-actions">
              <span className="status">{filteredEvents.length} 筆</span>
              <button className="button icon-button export-button" type="button" onClick={exportEvents} disabled={filteredEvents.length === 0}>
                <FileSpreadsheet size={17} />
                <span>匯出 Excel</span>
              </button>
            </div>
          </div>
          <div className="admin-filter-bar" aria-label="活動篩選">
            <label>
              搜尋
              <div className="search-field">
                <Search size={17} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="活動、地點、分類" />
              </div>
            </label>
            <label>
              狀態
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">全部狀態</option>
                {eventStatusOptions.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="export-note">
            <FileSpreadsheet size={16} />
            會匯出目前搜尋與狀態篩選後的活動清單。
          </div>
          <div className="event-list">
            {loading ? (
              <StatePanel variant="loading" title="正在讀取活動" body="系統正在整理活動列表與報名狀態。" />
            ) : loadError ? (
              <StatePanel
                variant="error"
                title="活動列表暫時無法讀取"
                body={loadError}
                actions={
                  <button className="button primary" type="button" onClick={loadEvents}>
                    重新讀取
                  </button>
                }
              />
            ) : filteredEvents.map((event) => {
              const capacityPercent = event.capacity
                ? Math.min(100, Math.round((event.registered_count / event.capacity) * 100))
                : 0;
              return (
                <article className="event-admin-card" key={event.event_id}>
                  <div className="event-admin-main">
                    <div className="card-row">
                      <strong>{event.title}</strong>
                      <span className={`status ${event.status}`}>{eventStatusLabel(event.status)}</span>
                    </div>
                    <p>{event.summary}</p>
                    <div className="event-admin-meta">
                      <span>{event.date}</span>
                      <span>
                        {event.start_time} - {event.end_time}
                      </span>
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <div className="event-admin-side">
                    <div className="registration-meter">
                      <div>
                        <span>報名</span>
                        <strong>
                          {event.registered_count}
                          {event.capacity ? `/${event.capacity}` : ""}
                        </strong>
                      </div>
                      {event.capacity ? (
                        <span className="meter-track" aria-label={`報名進度 ${capacityPercent}%`}>
                          <span style={{ width: `${capacityPercent}%` }} />
                        </span>
                      ) : (
                        <small>不需報名</small>
                      )}
                    </div>
                    <div className="inline-actions">
                      {canEditEvents ? (
                        <>
                          <button
                            className="button icon-button"
                            type="button"
                            onClick={() => {
                              setEditingId(event.event_id);
                              setForm(toForm(event));
                              setError("");
                              setMessage("");
                            }}
                          >
                            <Pencil size={17} />
                            <span>編輯</span>
                          </button>
                          <button className="button icon-button danger" type="button" onClick={() => deleteEvent(event.event_id)}>
                            <Trash2 size={17} />
                            <span>刪除</span>
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
            {!loading && !loadError && filteredEvents.length === 0 && <div className="empty-state">沒有符合條件的活動。</div>}
          </div>
        </section>
      </div>
      {confirmDialog}
    </Shell>
  );
}
