import { useEffect, useState } from "react";
import { Bell, Pencil, Plus, Save, Send, Trash2, X } from "lucide-react";
import { Shell } from "../../components/Shell";
import { apiFetch } from "../../lib/api";

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
  text: string;
};

const emptyNotificationForm: NotificationForm = {
  job_id: "",
  job_type: "event_reminder",
  target_user_id: "demo_u001",
  event_id: "evt_demo_worship_intro",
  status: "draft",
  scheduled_at: "",
  text: "Temple AI OS Demo：這是一則測試推播。"
};

export function AdminNotifications() {
  const [jobs, setJobs] = useState<NotificationJob[]>([]);
  const [form, setForm] = useState<NotificationForm>(emptyNotificationForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<NotificationJob[]>("/api/admin/notification-jobs", {}, true).then(setJobs).catch(console.error);
  }, []);

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
      text: String(job.payload.text || "")
    });
    setMessage("");
    setError("");
  }

  async function saveJob(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      payload: { text: form.text.trim() }
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
    setError("");
    setMessage("");
    try {
      const result = await apiFetch<{ sent: boolean; reason?: string }>(
        `/api/admin/notification-jobs/${jobId}/send-test`,
        { method: "POST" },
        true
      );
      setMessage(result.sent ? "已送出測試" : result.reason || "未送出");
    } catch (err) {
      setError(err instanceof Error ? err.message : "送測試失敗");
    }
  }

  async function deleteJob(jobId: string) {
    if (!window.confirm("確定刪除此 Demo 推播任務？")) {
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

  return (
    <Shell title="推播管理" mode="admin">
      <div className="admin-event-grid">
        <form className="form-panel" onSubmit={saveJob}>
          <div className="admin-actions">
            <strong>{editingId ? "編輯任務" : "新增任務"}</strong>
            <button className="button" type="button" onClick={resetForm}>
              <Plus size={18} />
              新增
            </button>
          </div>
          <label>
            任務 ID
            <input
              disabled={Boolean(editingId)}
              value={form.job_id}
              onChange={(event) => setForm({ ...form, job_id: event.target.value })}
            />
          </label>
          <div className="form-grid">
            <label>
              類型
              <select value={form.job_type} onChange={(event) => setForm({ ...form, job_type: event.target.value })}>
                <option value="event_reminder">event_reminder</option>
                <option value="registration_confirmation">registration_confirmation</option>
                <option value="knowledge_gap_followup">knowledge_gap_followup</option>
              </select>
            </label>
            <label>
              狀態
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                <option value="draft">draft</option>
                <option value="ready">ready</option>
                <option value="sent">sent</option>
                <option value="paused">paused</option>
              </select>
            </label>
          </div>
          <label>
            目標 User ID
            <input value={form.target_user_id} onChange={(event) => setForm({ ...form, target_user_id: event.target.value })} />
          </label>
          <label>
            Event ID
            <input value={form.event_id} onChange={(event) => setForm({ ...form, event_id: event.target.value })} />
          </label>
          <label>
            預定時間
            <input value={form.scheduled_at} onChange={(event) => setForm({ ...form, scheduled_at: event.target.value })} />
          </label>
          <label>
            訊息
            <textarea value={form.text} onChange={(event) => setForm({ ...form, text: event.target.value })} required />
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
          <div className="knowledge-list">
            {jobs.map((job) => (
              <div className="knowledge-doc-card" key={job.job_id}>
                <div>
                  <div className="card-row">
                    <Bell size={17} />
                    <strong>{job.job_type}</strong>
                    <span className="status">{job.status}</span>
                  </div>
                  <small>
                    {job.job_id} · {job.target_user_id || "no target"} · {job.event_id || "no event"}
                  </small>
                </div>
                <div className="inline-actions">
                  <button className="button icon-button" type="button" onClick={() => editJob(job)}>
                    <Pencil size={17} />
                    <span>編輯</span>
                  </button>
                  <button className="button icon-button" type="button" onClick={() => sendTest(job.job_id)}>
                    <Send size={17} />
                    <span>測試</span>
                  </button>
                  <button className="button icon-button danger" type="button" onClick={() => deleteJob(job.job_id)}>
                    <Trash2 size={17} />
                    <span>刪除</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <p className="notice">大量主動推播需控管 LINE 訊息用量與使用者同意。</p>
    </Shell>
  );
}
