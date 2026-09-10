import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Shell } from "../../components/Shell";
import { StatePanel } from "../../components/StatePanel";
import { apiFetch } from "../../lib/api";
import { canUsePreviewFallback, isLocalPreview } from "../../lib/localPreviewData";
import { hasStoredLiffToken, isLineAuthError, liffEntryUrl } from "../../lib/liff";
import { getLiffSession } from "../../lib/session";

export function SupportPage() {
  const [done, setDone] = useState(false);
  const [doneMode, setDoneMode] = useState<"live" | "demo" | null>(null);
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
    if (form.subject.trim().length < 2) {
      setError("請填寫較清楚的主旨");
      return;
    }
    if (form.message.trim().length < 6) {
      setError("請至少簡單描述問題內容");
      return;
    }
    const phone = form.phone.trim();
    if (phone && !/^[0-9+\-\s()]{6,20}$/.test(phone)) {
      setError("電話格式不易辨識，請只輸入數字、空格或 + - 符號");
      return;
    }
    setSaving(true);
    setError("");
    if (isLocalPreview()) {
      setDone(true);
      setDoneMode("demo");
      setSaving(false);
      return;
    }
    if (canUsePreviewFallback() && !hasStoredLiffToken()) {
      setDone(true);
      setDoneMode("demo");
      setSaving(false);
      return;
    }
    try {
      const session = await getLiffSession();
      await apiFetch("/api/support/tickets", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          subject: form.subject.trim(),
          message: form.message.trim(),
          contact_name: form.contact_name.trim(),
          phone: phone || undefined,
          user_id: session.user_id
        })
      });
      setDone(true);
      setDoneMode("live");
    } catch (err) {
      if (canUsePreviewFallback()) {
        setDone(true);
        setDoneMode("demo");
        return;
      }
      setError(isLineAuthError(err) ? "請從 LINE 開啟此頁，才能送出客服問題。" : err instanceof Error ? err.message : "建立工單失敗");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Shell title="客服中心">
      {done ? (
        <StatePanel
          variant="success"
          title="諮詢訊息已送出"
          body={
            doneMode === "demo"
              ? "已收到您的提問。若需接收即時處理進度或專人回覆，歡迎透過 LINE 官方帳號開啟。"
              : "已收到你的問題，服務人員會再確認內容並回覆。"
          }
          actions={
            <>
              <Link className="button primary" to="/">
                回服務首頁
              </Link>
              {doneMode === "demo" ? (
                <a className="button" href={liffEntryUrl("/support")}>
                  從 LINE 開啟
                </a>
              ) : null}
              <Link className="button" to="/events">
                查看活動
              </Link>
            </>
          }
        />
      ) : (
        <form className="form-panel support-visual-form support-form-plain" onSubmit={submit}>
          <div className="support-form-fields">
            <div className="form-intro">
              <MessageCircle size={22} />
              <div>
                <h2>信眾線上諮詢</h2>
                <p>若有參拜動線、活動報名或相關廟務疑問，歡迎留下訊息。</p>
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
                minLength={2}
                required
              />
            </label>
            <label>
              內容
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="請簡單描述你的問題"
                minLength={6}
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
                type="tel"
                inputMode="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="選填"
              />
            </label>
            {canUsePreviewFallback() && !hasStoredLiffToken() ? (
              <p className="service-mode-note">目前為網頁預覽模式；如需專人回覆與即時通知，可由 LINE 官方帳號送出。</p>
            ) : null}
            {error && <p className="error-text" role="alert">{error}</p>}
            <button className="button primary" disabled={saving} type="submit">
              {saving ? "送出中" : "送出問題"}
            </button>
          </div>
        </form>
      )}
    </Shell>
  );
}
