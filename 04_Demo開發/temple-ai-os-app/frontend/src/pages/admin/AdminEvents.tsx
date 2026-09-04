import { useEffect, useState } from "react";
import { Ban, CalendarCheck, CheckCircle, ClipboardList, FileSpreadsheet, Pencil, Plus, Save, Search, Trash2, UserCheck, X } from "lucide-react";
import { useConfirmDialog } from "../../components/ConfirmDialog";
import { Shell } from "../../components/AdminShell";
import { StatePanel } from "../../components/StatePanel";
import { apiFetch, type AdminRegistrationRecord, type AdminRegistrationSummary, type EventItem } from "../../lib/api";
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
  registration_open_at: string;
  registration_close_at: string;
  countdown_target_at: string;
  countdown_label: string;
  max_party_size: string;
  waitlist_enabled: boolean;
};

const emptyForm: EventForm = {
  title: "",
  category: "文化教育",
  source_type: "temple_service",
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
  demo_note: "活動內容與報名規則請以廟方公告為準。",
  registration_open_at: "",
  registration_close_at: "",
  countdown_target_at: "",
  countdown_label: "活動開始倒數",
  max_party_size: "10",
  waitlist_enabled: false
};

const eventStatusOptions = [
  { value: "draft", label: "草稿" },
  { value: "open", label: "開放報名" },
  { value: "published", label: "已發布" },
  { value: "upcoming", label: "即將舉行" },
  { value: "cancelled", label: "已取消" },
  { value: "closed", label: "已結束" }
];

const registrationStatusOptions = [
  { value: "confirmed", label: "已確認" },
  { value: "pending_review", label: "待人工確認" },
  { value: "checked_in", label: "已報到" },
  { value: "waitlisted", label: "候補中" },
  { value: "cancelled", label: "已取消" }
];

function eventStatusLabel(status: string) {
  return eventStatusOptions.find((option) => option.value === status)?.label || status;
}

function registrationStatusLabel(status: string) {
  return registrationStatusOptions.find((option) => option.value === status)?.label || status;
}

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value.slice(0, 16);
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}

function toIsoOrNull(value: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
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
    demo_note: event.demo_note,
    registration_open_at: toDateTimeLocal(event.registration_open_at),
    registration_close_at: toDateTimeLocal(event.registration_close_at),
    countdown_target_at: toDateTimeLocal(event.countdown_target_at),
    countdown_label: event.countdown_label || "活動開始倒數",
    max_party_size: String(event.max_party_size || 10),
    waitlist_enabled: Boolean(event.waitlist_enabled)
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
    demo_note: form.demo_note.trim(),
    registration_open_at: toIsoOrNull(form.registration_open_at),
    registration_close_at: toIsoOrNull(form.registration_close_at),
    countdown_target_at: toIsoOrNull(form.countdown_target_at),
    countdown_label: form.countdown_label.trim() || null,
    max_party_size: Number(form.max_party_size) || 10,
    waitlist_enabled: form.waitlist_enabled
  };
}

export function AdminEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<AdminRegistrationRecord[]>([]);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [registrationsLoading, setRegistrationsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [registrationsError, setRegistrationsError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyAction, setBusyAction] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [registrationEventFilter, setRegistrationEventFilter] = useState("all");
  const [registrationStatusFilter, setRegistrationStatusFilter] = useState("active");
  const [registrationQuery, setRegistrationQuery] = useState("");
  const [registrationDateFrom, setRegistrationDateFrom] = useState("");
  const [registrationDateTo, setRegistrationDateTo] = useState("");
  const [registrationCreatedFrom, setRegistrationCreatedFrom] = useState("");
  const [registrationCreatedTo, setRegistrationCreatedTo] = useState("");
  const [query, setQuery] = useState("");
  const currentRole = getStoredAdminRole();
  const canEditEvents = canManageOperations(currentRole);
  const { requestConfirmation, confirmDialog } = useConfirmDialog();

  useEffect(() => {
    loadEvents();
    loadRegistrations();
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

  async function loadRegistrations() {
    setRegistrationsLoading(true);
    setRegistrationsError("");
    try {
      setRegistrations(await apiFetch<AdminRegistrationRecord[]>("/api/admin/registrations", {}, true));
    } catch (err) {
      setRegistrationsError(err instanceof Error ? err.message : "讀取報名名冊失敗");
    } finally {
      setRegistrationsLoading(false);
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
      if (form.registration_open_at && form.registration_close_at && new Date(form.registration_open_at) > new Date(form.registration_close_at)) {
        setError("開放報名時間不能晚於截止報名時間");
        setSaving(false);
        return;
      }
      if (form.countdown_target_at && Number.isNaN(new Date(form.countdown_target_at).getTime())) {
        setError("倒數目標時間格式不正確");
        setSaving(false);
        return;
      }
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
        title: "刪除活動",
        body: "刪除後活動會從後台列表移除，已連動的報名資料也不應再用這筆活動作為入口。",
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
      setRegistrations((current) => current.filter((registration) => registration.event_id !== eventId));
      if (editingId === eventId) {
        resetForm();
      }
      setMessage("已刪除");
    } catch (err) {
      setError(err instanceof Error ? err.message : "刪除失敗");
    }
  }

  async function updateEventStatus(event: EventItem, nextStatus: string) {
    if (!canEditEvents) {
      setError("目前帳號只能查看活動，不能變更活動狀態");
      return;
    }
    const actionKey = `${event.event_id}:${nextStatus}`;
    if (
      nextStatus === "closed" &&
      !(await requestConfirmation({
        title: "提前結束活動",
        body: "提前結束後，活動仍可在公開頁看到資訊，但民眾不能再送出報名。",
        confirmLabel: "結束活動"
      }))
    ) {
      return;
    }
    setBusyAction(actionKey);
    setError("");
    setMessage("");
    try {
      const saved = await apiFetch<EventItem>(
        `/api/admin/events/${event.event_id}`,
        { method: "PUT", body: JSON.stringify({ status: nextStatus }) },
        true
      );
      setEvents((current) => current.map((item) => (item.event_id === saved.event_id ? saved : item)));
      if (editingId === saved.event_id) {
        setForm(toForm(saved));
      }
      setMessage(nextStatus === "closed" ? "活動已提前結束" : "活動狀態已更新");
    } catch (err) {
      setError(err instanceof Error ? err.message : "活動狀態更新失敗");
    } finally {
      setBusyAction("");
    }
  }

  async function updateRegistrationStatus(registration: AdminRegistrationRecord, nextStatus: string) {
    if (!canEditEvents) {
      setError("目前帳號只能查看報名名冊，不能變更報名狀態");
      return;
    }
    const actionKey = `${registration.registration_id}:${nextStatus}`;
    setBusyAction(actionKey);
    setError("");
    setMessage("");
    try {
      const saved = await apiFetch<AdminRegistrationRecord>(
        `/api/admin/registrations/${registration.registration_id}`,
        { method: "PATCH", body: JSON.stringify({ status: nextStatus }) },
        true
      );
      setRegistrations((current) =>
        current.map((item) => (item.registration_id === saved.registration_id ? saved : item))
      );
      await loadEvents();
      setMessage(`報名狀態已更新為「${registrationStatusLabel(saved.status)}」`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "報名狀態更新失敗");
    } finally {
      setBusyAction("");
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
  const filteredRegistrations = registrations.filter((registration) => {
    const matchesEvent = registrationEventFilter === "all" || registration.event_id === registrationEventFilter;
    const matchesStatus =
      registrationStatusFilter === "all" ||
      (registrationStatusFilter === "active" && registration.status !== "cancelled") ||
      registration.status === registrationStatusFilter;
    const matchesDateFrom = !registrationDateFrom || registration.event_date >= registrationDateFrom;
    const matchesDateTo = !registrationDateTo || registration.event_date <= registrationDateTo;
    const createdDate = registration.created_at?.slice(0, 10) || "";
    const matchesCreatedFrom = !registrationCreatedFrom || createdDate >= registrationCreatedFrom;
    const matchesCreatedTo = !registrationCreatedTo || createdDate <= registrationCreatedTo;
    const keyword = registrationQuery.trim().toLowerCase();
    const matchesQuery =
      !keyword ||
      [
        registration.registration_id,
        registration.event_title,
        registration.event_category,
        registration.contact_name || "",
        registration.phone || "",
        registration.user_id,
        registration.status,
        registration.note || ""
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    return matchesEvent && matchesStatus && matchesDateFrom && matchesDateTo && matchesCreatedFrom && matchesCreatedTo && matchesQuery;
  });
  const visibleRegistrationSummary: AdminRegistrationSummary = {
    total_registrations: filteredRegistrations.length,
    total_party_size: filteredRegistrations.reduce(
      (total, registration) => total + (registration.status === "cancelled" ? 0 : registration.party_size),
      0
    ),
    confirmed: filteredRegistrations.filter((item) => item.status === "confirmed").length,
    pending_review: filteredRegistrations.filter((item) => item.status === "pending_review").length,
    checked_in: filteredRegistrations.filter((item) => item.status === "checked_in").length,
    cancelled: filteredRegistrations.filter((item) => item.status === "cancelled").length,
    waitlisted: filteredRegistrations.filter((item) => item.status === "waitlisted").length,
    events_with_registrations: new Set(filteredRegistrations.map((item) => item.event_id)).size
  };

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
        { header: "開放報名時間", value: (event) => event.registration_open_at || "" },
        { header: "截止報名時間", value: (event) => event.registration_close_at || "" },
        { header: "倒數目標時間", value: (event) => event.countdown_target_at || "" },
        { header: "倒數標題", value: (event) => event.countdown_label || "" },
        { header: "每筆最多人數", value: (event) => event.max_party_size },
        { header: "額滿候補", value: (event) => (event.waitlist_enabled ? "是" : "否") },
        { header: "報名欄位", value: (event) => event.registration_fields.join("、") },
        { header: "摘要", value: (event) => event.summary },
        { header: "付款/費用說明", value: (event) => event.payment_policy || "" },
        { header: "活動備註", value: (event) => event.demo_note }
      ]
    });
  }

  function exportRegistrations(rows = filteredRegistrations, filename = "temple-event-registrations") {
    exportRowsToExcel({
      filename,
      sheetName: "報名名冊",
      rows,
      columns: [
        { header: "序號", value: (_registration, index) => index + 1 },
        { header: "報名編號", value: (registration) => registration.registration_id },
        { header: "活動 ID", value: (registration) => registration.event_id },
        { header: "活動名稱", value: (registration) => registration.event_title },
        { header: "分類", value: (registration) => registration.event_category },
        { header: "活動日期", value: (registration) => registration.event_date },
        { header: "活動時間", value: (registration) => registration.event_time },
        { header: "活動地點", value: (registration) => registration.event_location },
        { header: "姓名", value: (registration) => registration.contact_name || "" },
        { header: "手機", value: (registration) => registration.phone || "" },
        { header: "LINE User ID", value: (registration) => registration.user_id },
        { header: "報名人數", value: (registration) => registration.party_size },
        { header: "報名狀態", value: (registration) => registrationStatusLabel(registration.status) },
        { header: "提醒", value: (registration) => registration.reminder_opt_in },
        { header: "建立時間", value: (registration) => registration.created_at || "" },
        { header: "備註", value: (registration) => registration.note || "" }
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
            <div className="form-grid">
              <label>
                每筆最多幾人
                <input min="1" max="10" type="number" value={form.max_party_size} onChange={(event) => updateForm("max_party_size", event.target.value)} />
              </label>
              <label className="check-row">
                <input type="checkbox" checked={form.waitlist_enabled} onChange={(event) => updateForm("waitlist_enabled", event.target.checked)} />
                額滿後接受候補
              </label>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">
              <span>3</span>
              <strong>時間控制</strong>
            </div>
            <div className="form-grid">
              <label>
                開放報名時間
                <input type="datetime-local" value={form.registration_open_at} onChange={(event) => updateForm("registration_open_at", event.target.value)} />
                <small>留白代表儲存後立即依活動狀態開放。</small>
              </label>
              <label>
                截止報名時間
                <input type="datetime-local" value={form.registration_close_at} onChange={(event) => updateForm("registration_close_at", event.target.value)} />
              </label>
            </div>
            <div className="form-grid">
              <label>
                倒數目標時間
                <input type="datetime-local" value={form.countdown_target_at} onChange={(event) => updateForm("countdown_target_at", event.target.value)} />
                <small>前台活動詳情可依此顯示倒數。</small>
              </label>
              <label>
                倒數標題
                <input value={form.countdown_label} onChange={(event) => updateForm("countdown_label", event.target.value)} placeholder="活動開始倒數" />
              </label>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">
              <span>4</span>
              <strong>公開說明</strong>
            </div>
            <label>
              摘要
              <textarea value={form.summary} onChange={(event) => updateForm("summary", event.target.value)} required />
            </label>
            <label>
              活動備註
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
          {error && <p className="error-text" role="alert">{error}</p>}
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
              const eventRegistrations = registrations.filter((registration) => registration.event_id === event.event_id);
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
                      <button
                        className="button icon-button export-button"
                        type="button"
                        onClick={() => exportRegistrations(eventRegistrations, `temple-${event.event_id}-registrations`)}
                        disabled={eventRegistrations.length === 0}
                      >
                        <FileSpreadsheet size={17} />
                        <span>名冊</span>
                      </button>
                      {canEditEvents ? (
                        <>
                          {event.status === "closed" || event.status === "cancelled" ? (
                            <button
                              className="button icon-button"
                              type="button"
                              disabled={busyAction === `${event.event_id}:open`}
                              onClick={() => updateEventStatus(event, "open")}
                            >
                              <CheckCircle size={17} />
                              <span>重新開放</span>
                            </button>
                          ) : (
                            <button
                              className="button icon-button danger"
                              type="button"
                              disabled={busyAction === `${event.event_id}:closed`}
                              onClick={() => updateEventStatus(event, "closed")}
                            >
                              <Ban size={17} />
                              <span>提前結束</span>
                            </button>
                          )}
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

      <section className="tool-panel registration-admin-panel">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">報名名冊</span>
            <h2>報名者資訊與出席控制</h2>
          </div>
          <div className="panel-actions">
            <span className="status">{filteredRegistrations.length} 筆</span>
            <button
              className="button icon-button export-button"
              type="button"
              onClick={() => exportRegistrations()}
              disabled={filteredRegistrations.length === 0}
            >
              <FileSpreadsheet size={17} />
              <span>匯出名冊</span>
            </button>
          </div>
        </div>

        <section className="admin-summary-strip registration-summary-strip" aria-label="報名統計">
          <div><span>報名筆數</span><strong>{visibleRegistrationSummary.total_registrations}</strong></div>
          <div><span>登記總人數</span><strong>{visibleRegistrationSummary.total_party_size}</strong></div>
          <div><span>待確認</span><strong>{visibleRegistrationSummary.pending_review}</strong></div>
          <div><span>已報到</span><strong>{visibleRegistrationSummary.checked_in}</strong></div>
          <div><span>候補</span><strong>{visibleRegistrationSummary.waitlisted}</strong></div>
        </section>

        <div className="admin-filter-bar registration-filter-bar" aria-label="報名名冊篩選">
          <label>
            搜尋
            <div className="search-field">
              <Search size={17} />
              <input
                value={registrationQuery}
                onChange={(event) => setRegistrationQuery(event.target.value)}
                placeholder="姓名、手機、活動、報名編號"
              />
            </div>
          </label>
          <label>
            活動
            <select value={registrationEventFilter} onChange={(event) => setRegistrationEventFilter(event.target.value)}>
              <option value="all">全部活動</option>
              {events.map((event) => (
                <option value={event.event_id} key={event.event_id}>
                  {event.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            報名狀態
            <select value={registrationStatusFilter} onChange={(event) => setRegistrationStatusFilter(event.target.value)}>
              <option value="active">有效報名</option>
              <option value="all">全部狀態</option>
              {registrationStatusOptions.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            活動日期起
            <input type="date" value={registrationDateFrom} onChange={(event) => setRegistrationDateFrom(event.target.value)} />
          </label>
          <label>
            活動日期迄
            <input type="date" value={registrationDateTo} onChange={(event) => setRegistrationDateTo(event.target.value)} />
          </label>
          <label>
            報名建立日起
            <input type="date" value={registrationCreatedFrom} onChange={(event) => setRegistrationCreatedFrom(event.target.value)} />
          </label>
          <label>
            報名建立日迄
            <input type="date" value={registrationCreatedTo} onChange={(event) => setRegistrationCreatedTo(event.target.value)} />
          </label>
        </div>

        <div className="export-note">
          <FileSpreadsheet size={16} />
          匯出會包含目前篩選後的姓名、手機、活動、報名人數、狀態與備註。
        </div>

        {message && <p className="notice">{message}</p>}
        {error && <p className="error-text" role="alert">{error}</p>}

        <div className="registration-admin-list">
          {registrationsLoading ? (
            <StatePanel variant="loading" title="正在讀取報名名冊" body="系統正在整理報名者資訊與出席狀態。" />
          ) : registrationsError ? (
            <StatePanel
              variant="error"
              title="報名名冊暫時無法讀取"
              body={registrationsError}
              actions={
                <button className="button primary" type="button" onClick={loadRegistrations}>
                  重新讀取
                </button>
              }
            />
          ) : filteredRegistrations.length > 0 ? (
            filteredRegistrations.map((registration) => (
              <article className="registration-admin-card" key={registration.registration_id}>
                <div className="registration-admin-person">
                  <UserCheck size={20} />
                  <div>
                    <strong>{registration.contact_name || "未填姓名"}</strong>
                    <span>{registration.phone || "未留手機"} / {registration.party_size} 人</span>
                    <small>{registration.registration_id}</small>
                  </div>
                </div>
                <div className="registration-admin-event">
                  <strong>{registration.event_title}</strong>
                  <span>
                    {registration.event_date} {registration.event_time} / {registration.event_location}
                  </span>
                  {registration.note ? <small>{registration.note}</small> : null}
                </div>
                <div className="registration-admin-actions">
                  <select
                    value={registration.status}
                    disabled={!canEditEvents || busyAction.startsWith(registration.registration_id)}
                    onChange={(event) => updateRegistrationStatus(registration, event.target.value)}
                    aria-label={`${registration.contact_name || registration.registration_id} 報名狀態`}
                  >
                    {registrationStatusOptions.map((option) => (
                      <option value={option.value} key={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="inline-actions">
                    <button
                      className="button icon-button"
                      type="button"
                      disabled={!canEditEvents || busyAction === `${registration.registration_id}:checked_in`}
                      onClick={() => updateRegistrationStatus(registration, "checked_in")}
                    >
                      <CheckCircle size={17} />
                      <span>報到</span>
                    </button>
                    <button
                      className="button icon-button danger"
                      type="button"
                      disabled={!canEditEvents || busyAction === `${registration.registration_id}:cancelled`}
                      onClick={() => updateRegistrationStatus(registration, "cancelled")}
                    >
                      <Ban size={17} />
                      <span>取消</span>
                    </button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">沒有符合條件的報名資料。</div>
          )}
        </div>
      </section>
      {confirmDialog}
    </Shell>
  );
}
