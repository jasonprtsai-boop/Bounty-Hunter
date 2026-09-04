import { useEffect, useState } from "react";
import { Bell, Clock3, FileSpreadsheet, Pencil, Plus, Save, Search, Send, Trash2, X } from "lucide-react";
import { useConfirmDialog } from "../../components/ConfirmDialog";
import { Shell } from "../../components/AdminShell";
import { StatePanel } from "../../components/StatePanel";
import { apiFetch } from "../../lib/api";
import { canManageOperations, getStoredAdminRole } from "../../lib/adminPermissions";
import { exportRowsToExcel } from "../../lib/excelExport";

type NotificationJob = {
  job_id: string;
  job_type: string;
  target_user_id?: string | null;
  event_id?: string | null;
  status: string;
  scheduled_at?: string | null;
  payload: Record<string, unknown>;
};

type NotificationForm = {
  job_id: string;
  job_type: string;
  target_user_id: string;
  event_id: string;
  status: string;
  scheduled_at: string;
  registration_id: string;
  reminder_type: string;
  party_size: string;
  text: string;
};

const emptyNotificationForm: NotificationForm = {
  job_id: "",
  job_type: "event_reminder_day_before",
  target_user_id: "",
  event_id: "",
  status: "draft",
  scheduled_at: "",
  registration_id: "",
  reminder_type: "day_before",
  party_size: "1",
  text: "萬春宮活動提醒：請依廟方公告確認活動時間與參加方式。"
};

const notificationTypeOptions = [
  { value: "event_reminder_day_before", label: "活動前一天提醒" },
  { value: "event_reminder_day_of", label: "活動當天提醒" },
  { value: "registration_confirmation", label: "報名成功補發" },
  { value: "registration_waitlist", label: "名額已滿候補通知" },
  { value: "registration_cancellation", label: "取消報名通知" },
  { value: "knowledge_gap_followup", label: "一般文字推播" }
];

const notificationStatusOptions = [
  { value: "draft", label: "草稿" },
  { value: "ready", label: "待送出" },
  { value: "sent", label: "已送出" },
  { value: "paused", label: "暫停" }
];

function notificationTypeLabel(type: string) {
  return notificationTypeOptions.find((option) => option.value === type)?.label || type;
}

function notificationStatusLabel(status: string) {
  return notificationStatusOptions.find((option) => option.value === status)?.label || status;
}

export function AdminNotifications() {
  const [jobs, setJobs] = useState<NotificationJob[]>([]);
  const [form, setForm] = useState<NotificationForm>(emptyNotificationForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("active");
  const [query, setQuery] = useState("");
  const currentRole = getStoredAdminRole();
  const canManageNotifications = canManageOperations(currentRole);
  const { requestConfirmation, confirmDialog } = useConfirmDialog();

  useEffect(() => {
    if (canManageNotifications) {
      loadJobs();
    } else {
      setLoading(false);
    }
  }, [canManageNotifications]);

  async function loadJobs() {
    setLoading(true);
    setLoadError("");
    try {
      setJobs(await apiFetch<NotificationJob[]>("/api/admin/notification-jobs", {}, true));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "讀取推播任務失敗");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyNotificationForm);
    setMessage("");
    setError("");
  }

  function editJob(job: NotificationJob) {
    setEditingId(job.job_id);
    setForm({
      job_id: job.job_id,
      job_type: job.job_type,
      target_user_id: job.target_user_id || "",
      event_id: job.event_id || "",
      status: job.status,
      scheduled_at: job.scheduled_at || "",
      registration_id: String(job.payload.registration_id || ""),
      reminder_type: String(job.payload.reminder_type || "day_before"),
      party_size: String(job.payload.party_size || "1"),
      text: String(job.payload.text || "")
    });
    setMessage("");
    setError("");
  }

  async function saveJob(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManageNotifications) {
      setError("目前帳號不能管理推播任務");
      return;
    }
    setSaving(true);
    setMessage("");
    setError("");
    const payload = {
      job_id: form.job_id.trim() || undefined,
      job_type: form.job_type,
      target_user_id: form.target_user_id.trim() || null,
      event_id: form.event_id.trim() || null,
      status: form.status,
      scheduled_at: form.scheduled_at.trim() || null,
      payload: {
        text: form.text.trim(),
        registration_id: form.registration_id.trim() || undefined,
        reminder_type: form.reminder_type,
        party_size: Number(form.party_size) || 1
      }
    };
    try {
      const saved = editingId
        ? await apiFetch<NotificationJob>(
            `/api/admin/notification-jobs/${editingId}`,
            { method: "PUT", body: JSON.stringify(payload) },
            true
          )
        : await apiFetch<NotificationJob>(
            "/api/admin/notification-jobs",
            { method: "POST", body: JSON.stringify(payload) },
            true
          );
      setJobs((current) => {
        const exists = current.some((job) => job.job_id === saved.job_id);
        return exists
          ? current.map((job) => (job.job_id === saved.job_id ? saved : job))
          : [...current, saved].sort((a, b) => a.job_id.localeCompare(b.job_id));
      });
      editJob(saved);
      setMessage("已儲存");
    } catch (err) {
      setError(err instanceof Error ? err.message : "儲存失敗");
    } finally {
      setSaving(false);
    }
  }

  async function sendTest(jobId: string) {
    if (!canManageNotifications) {
      setError("目前帳號不能補發推播");
      return;
    }
    setError("");
    setMessage("");
    try {
      const result = await apiFetch<{ sent: boolean; reason?: string; message_type?: string }>(
        `/api/admin/notification-jobs/${jobId}/send-test`,
        { method: "POST" },
        true
      );
      setMessage(result.sent ? "已送出通知" : `${result.message_type || "通知"}：${result.reason || "未送出"}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "送出通知失敗");
    }
  }

  async function sendDueJobs() {
    if (!canManageNotifications) {
      setError("目前帳號不能送出到期推播");
      return;
    }
    setError("");
    setMessage("");
    try {
      const result = await apiFetch<{ processed: number }>(
        "/api/admin/notification-jobs/send-due",
        { method: "POST" },
        true
      );
      setMessage(`已處理 ${result.processed} 筆到期任務`);
      await loadJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "送出到期任務失敗");
    }
  }

  async function deleteJob(jobId: string) {
    if (!canManageNotifications) {
      setError("目前帳號不能刪除推播任務");
      return;
    }
    if (
      !(await requestConfirmation({
        title: "刪除推播任務",
        body: "刪除後這筆通知任務不會再出現在待送或補發清單，請先確認它不是服務流程需要的訊息。",
        confirmLabel: "刪除任務"
      }))
    ) {
      return;
    }
    setError("");
    setMessage("");
    try {
      await apiFetch<{ deleted: boolean }>(`/api/admin/notification-jobs/${jobId}`, { method: "DELETE" }, true);
      setJobs((current) => current.filter((job) => job.job_id !== jobId));
      if (editingId === jobId) {
        resetForm();
      }
      setMessage("已刪除");
    } catch (err) {
      setError(err instanceof Error ? err.message : "刪除失敗");
    }
  }

  const readyCount = jobs.filter((job) => job.status === "ready").length;
  const draftCount = jobs.filter((job) => job.status === "draft").length;
  const sentCount = jobs.filter((job) => job.status === "sent").length;
  const filteredJobs = jobs.filter((job) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && job.status !== "sent") ||
      job.status === statusFilter;
    const keyword = query.trim().toLowerCase();
    const matchesQuery =
      !keyword ||
      [job.job_id, job.job_type, job.status, job.target_user_id || "", job.event_id || "", String(job.payload.text || "")]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    return matchesStatus && matchesQuery;
  });

  function exportJobs() {
    exportRowsToExcel({
      filename: "temple-notification-jobs",
      sheetName: "推播任務",
      rows: filteredJobs,
      columns: [
        { header: "序號", value: (_job, index) => index + 1 },
        { header: "任務 ID", value: (job) => job.job_id },
        { header: "類型", value: (job) => notificationTypeLabel(job.job_type) },
        { header: "狀態", value: (job) => notificationStatusLabel(job.status) },
        { header: "目標 User ID", value: (job) => job.target_user_id || "" },
        { header: "活動 ID", value: (job) => job.event_id || "" },
        { header: "預定時間", value: (job) => job.scheduled_at || "" },
        { header: "訊息", value: (job) => String(job.payload.text || "") },
        { header: "報名編號", value: (job) => String(job.payload.registration_id || "") },
        { header: "提醒類型", value: (job) => String(job.payload.reminder_type || "") },
        { header: "人數", value: (job) => String(job.payload.party_size || "") }
      ]
    });
  }

  return (
    <Shell title="推播管理" mode="admin">
      {!canManageNotifications ? (
        <StatePanel
          variant="error"
          title="權限不足"
          body="推播任務會影響 LINE 使用者通知，需管理員以上權限。請改用客服或活動查看功能，或請最高權限帳號協助。"
        />
      ) : (
      <>
      <section className="admin-summary-strip" aria-label="推播摘要">
        <div>
          <Bell size={20} />
          <span>全部任務</span>
          <strong>{jobs.length}</strong>
        </div>
        <div>
          <Clock3 size={20} />
          <span>待送出</span>
          <strong>{readyCount}</strong>
        </div>
        <div>
          <Pencil size={20} />
          <span>草稿</span>
          <strong>{draftCount}</strong>
        </div>
        <div>
          <Send size={20} />
          <span>已送出</span>
          <strong>{sentCount}</strong>
        </div>
      </section>

      <div className="admin-event-grid">
        <form className="form-panel admin-editor-panel" onSubmit={saveJob}>
          <div className="admin-actions">
            <div>
              <span className="panel-kicker">{editingId ? "目前正在編輯" : "新增通知"}</span>
              <strong>{editingId ? "編輯任務" : "新增任務"}</strong>
            </div>
            <div className="inline-actions">
              <button className="button" type="button" onClick={sendDueJobs}>
                <Send size={18} />
                送出到期
              </button>
              <button className="button" type="button" onClick={resetForm}>
                <Plus size={18} />
                新增
              </button>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">
              <span>1</span>
              <strong>任務設定</strong>
            </div>
            <div className="form-grid">
              <label>
                類型
                <select value={form.job_type} onChange={(event) => setForm({ ...form, job_type: event.target.value })}>
                  {notificationTypeOptions.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                狀態
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                  {notificationStatusOptions.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              預定時間
              <input
                value={form.scheduled_at}
                onChange={(event) => setForm({ ...form, scheduled_at: event.target.value })}
                placeholder="例如 2026-09-01 18:00"
              />
              <small>立即補發或草稿可以留空；正式排程再填送出時間。</small>
            </label>
          </div>

          <div className="form-section">
            <div className="form-section-title">
              <span>2</span>
              <strong>訊息內容</strong>
            </div>
            <label>
              訊息
              <textarea value={form.text} onChange={(event) => setForm({ ...form, text: event.target.value })} required />
              <small>文字要像廟方服務提醒，避免工程代號或內部說明出現在使用者訊息裡。</small>
            </label>
          </div>

          <details className="advanced-fields">
            <summary>進階欄位</summary>
            <p>只有在指定單一使用者、補發特定報名，或需要固定任務代號時才需要填寫。</p>
            <label>
              任務 ID
              <input
                disabled={Boolean(editingId)}
                value={form.job_id}
                onChange={(event) => setForm({ ...form, job_id: event.target.value })}
              />
              <small>留空可由後端建立；正式任務建議使用容易辨識的命名。</small>
            </label>
            <label>
              目標 User ID
              <input value={form.target_user_id} onChange={(event) => setForm({ ...form, target_user_id: event.target.value })} />
            </label>
            <label>
              Event ID
              <input value={form.event_id} onChange={(event) => setForm({ ...form, event_id: event.target.value })} />
            </label>
            <div className="form-grid">
              <label>
                報名編號
                <input value={form.registration_id} onChange={(event) => setForm({ ...form, registration_id: event.target.value })} />
              </label>
              <label>
                提醒類型
                <select value={form.reminder_type} onChange={(event) => setForm({ ...form, reminder_type: event.target.value })}>
                  <option value="day_before">前一天</option>
                  <option value="day_of">當天</option>
                </select>
              </label>
            </div>
            <label>
              候補/詢問人數
              <input
                min="1"
                type="number"
                value={form.party_size}
                onChange={(event) => setForm({ ...form, party_size: event.target.value })}
              />
            </label>
          </details>

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

        <section className="tool-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">通知任務</span>
              <h2>檢查待送與補發</h2>
            </div>
            <div className="panel-actions">
              <span className="status">{filteredJobs.length} 筆</span>
              <button className="button icon-button export-button" type="button" onClick={exportJobs} disabled={filteredJobs.length === 0}>
                <FileSpreadsheet size={17} />
                <span>匯出 Excel</span>
              </button>
            </div>
          </div>
          <div className="admin-filter-bar" aria-label="推播篩選">
            <label>
              搜尋
              <div className="search-field">
                <Search size={17} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="任務、使用者、活動、訊息" />
              </div>
            </label>
            <label>
              狀態
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="active">未完成</option>
                <option value="all">全部狀態</option>
                {notificationStatusOptions.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="export-note">
            <FileSpreadsheet size={16} />
            會匯出目前搜尋與狀態篩選後的推播任務。
          </div>
          <div className="knowledge-list">
            {loading ? (
              <StatePanel variant="loading" title="正在讀取推播任務" body="系統正在整理待送、草稿與已送出的通知。" />
            ) : loadError ? (
              <StatePanel
                variant="error"
                title="推播任務暫時無法讀取"
                body={loadError}
                actions={
                  <button className="button primary" type="button" onClick={loadJobs}>
                    重新讀取
                  </button>
                }
              />
            ) : filteredJobs.map((job) => (
              <div className="knowledge-doc-card" key={job.job_id}>
                <div>
                  <div className="card-row">
                    <Bell size={17} />
                    <strong>{notificationTypeLabel(job.job_type)}</strong>
                    <span className={`status ${job.status}`}>{notificationStatusLabel(job.status)}</span>
                  </div>
                  <small>
                    {job.job_id} · {job.target_user_id || "no target"} · {job.event_id || "no event"}
                  </small>
                  {job.scheduled_at && <p className="list-preview">預定時間：{job.scheduled_at}</p>}
                </div>
                <div className="inline-actions">
                  <button className="button icon-button" type="button" onClick={() => editJob(job)}>
                    <Pencil size={17} />
                    <span>編輯</span>
                  </button>
                  <button className="button icon-button" type="button" onClick={() => sendTest(job.job_id)}>
                    <Send size={17} />
                    <span>補發</span>
                  </button>
                  <button className="button icon-button danger" type="button" onClick={() => deleteJob(job.job_id)}>
                    <Trash2 size={17} />
                    <span>刪除</span>
                  </button>
                </div>
              </div>
            ))}
            {!loading && !loadError && filteredJobs.length === 0 && <div className="empty-state">目前沒有符合條件的通知任務。</div>}
          </div>
        </section>
      </div>
      <p className="notice">大量主動推播需控管 LINE 訊息用量與使用者同意。</p>
      </>
      )}
      {confirmDialog}
    </Shell>
  );
}
