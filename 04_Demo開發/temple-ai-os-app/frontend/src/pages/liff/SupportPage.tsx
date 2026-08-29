import { FormEvent, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Shell } from "../../components/Shell";
import { apiFetch } from "../../lib/api";
import { getLiffSession } from "../../lib/session";

export function SupportPage() {
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    category: "general",
    subject: "",
    message: "",
    contact_name: "",
    phone: ""
  });

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const session = await getLiffSession();
      await apiFetch("/api/support/tickets", {
        method: "POST",
        body: JSON.stringify({ ...form, user_id: session.user_id })
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "建立工單失敗");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Shell title="客服中心">
      {done ? (
        <section className="success-panel">
          <h2>工單已建立</h2>
          <p>已收到你的問題。正式案件仍需由廟方或服務人員人工確認。</p>
        </section>
      ) : (
        <form className="form-panel" onSubmit={submit}>
          <div className="form-intro">
            <MessageCircle size={22} />
            <div>
              <h2>留下問題</h2>
              <p>找不到活動、導覽或參拜資訊時，可以在這裡留下要詢問的內容。</p>
            </div>
          </div>
          <label>
            類型
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="general">一般問題</option>
              <option value="event_registration">活動報名</option>
              <option value="lost_item">失物協助</option>
              <option value="content_feedback">內容修正</option>
            </select>
          </label>
          <label>
            主旨
            <input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="例如：想詢問活動報名"
              required
            />
          </label>
          <label>
            內容
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="請簡單描述你的問題"
              required
            />
          </label>
          <label>
            聯絡人
            <input
              value={form.contact_name}
              onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
              placeholder="姓名或稱呼"
            />
          </label>
          <label>
            電話
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="選填"
            />
          </label>
          {error && <p className="error-text">{error}</p>}
          <button className="button primary" disabled={saving} type="submit">
            {saving ? "送出中" : "送出問題"}
          </button>
        </form>
      )}
    </Shell>
  );
}
