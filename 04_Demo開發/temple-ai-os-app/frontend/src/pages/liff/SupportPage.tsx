import { FormEvent, useState } from "react";
import { Shell } from "../../components/Shell";
import { apiFetch } from "../../lib/api";

export function SupportPage() {
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    category: "general",
    subject: "活動報名問題",
    message: "",
    contact_name: "小安",
    phone: ""
  });

  async function submit(event: FormEvent) {
    event.preventDefault();
    await apiFetch("/api/support/tickets", {
      method: "POST",
      body: JSON.stringify({ ...form, user_id: "demo_u001" })
    });
    setDone(true);
  }

  return (
    <Shell title="客服中心">
      {done ? (
        <section className="success-panel">
          <h2>工單已建立</h2>
          <p>正式案件需由廟方人工確認；Demo 不處理真實付款或個資案件。</p>
        </section>
      ) : (
        <form className="form-panel" onSubmit={submit}>
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
            <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </label>
          <label>
            內容
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          </label>
          <label>
            聯絡人
            <input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
          </label>
          <button className="button primary" type="submit">
            建立工單
          </button>
        </form>
      )}
    </Shell>
  );
}

