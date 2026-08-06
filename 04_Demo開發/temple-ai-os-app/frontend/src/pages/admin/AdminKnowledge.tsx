import { useEffect, useState } from "react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { Shell } from "../../components/Shell";
import { apiFetch } from "../../lib/api";

type KnowledgeDoc = {
  document_id: string;
  title: string;
  body: string;
  status: string;
  source_type: string;
};

type KnowledgeForm = {
  document_id: string;
  title: string;
  body: string;
  source_type: string;
  status: string;
};

const emptyKnowledgeForm: KnowledgeForm = {
  document_id: "",
  title: "",
  body: "",
  source_type: "admin_demo_knowledge",
  status: "published"
};

export function AdminKnowledge() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [form, setForm] = useState<KnowledgeForm>(emptyKnowledgeForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<KnowledgeDoc[]>("/api/admin/knowledge-documents", {}, true).then(setDocs).catch(console.error);
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm(emptyKnowledgeForm);
    setMessage("");
    setError("");
  }

  function editDoc(doc: KnowledgeDoc) {
    setEditingId(doc.document_id);
    setForm({
      document_id: doc.document_id,
      title: doc.title,
      body: doc.body,
      source_type: doc.source_type,
      status: doc.status
    });
    setMessage("");
    setError("");
  }

  async function saveDoc(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    const payload = {
      document_id: form.document_id.trim() || undefined,
      title: form.title.trim(),
      body: form.body.trim(),
      source_type: form.source_type.trim(),
      status: form.status
    };
    try {
      const saved = editingId
        ? await apiFetch<KnowledgeDoc>(
            `/api/admin/knowledge-documents/${editingId}`,
            { method: "PUT", body: JSON.stringify(payload) },
            true
          )
        : await apiFetch<KnowledgeDoc>(
            "/api/admin/knowledge-documents",
            { method: "POST", body: JSON.stringify(payload) },
            true
          );
      setDocs((current) => {
        const exists = current.some((doc) => doc.document_id === saved.document_id);
        return exists
          ? current.map((doc) => (doc.document_id === saved.document_id ? saved : doc))
          : [...current, saved].sort((a, b) => a.document_id.localeCompare(b.document_id));
      });
      setEditingId(saved.document_id);
      setForm({
        document_id: saved.document_id,
        title: saved.title,
        body: saved.body,
        source_type: saved.source_type,
        status: saved.status
      });
      setMessage("已儲存");
    } catch (err) {
      setError(err instanceof Error ? err.message : "儲存失敗");
    } finally {
      setSaving(false);
    }
  }

  async function deleteDoc(documentId: string) {
    if (!window.confirm("確定刪除此 Demo 知識文件？")) {
      return;
    }
    setError("");
    setMessage("");
    try {
      await apiFetch<{ deleted: boolean }>(`/api/admin/knowledge-documents/${documentId}`, { method: "DELETE" }, true);
      setDocs((current) => current.filter((doc) => doc.document_id !== documentId));
      if (editingId === documentId) {
        resetForm();
      }
      setMessage("已刪除");
    } catch (err) {
      setError(err instanceof Error ? err.message : "刪除失敗");
    }
  }

  return (
    <Shell title="知識庫" mode="admin">
      <div className="admin-event-grid">
        <form className="form-panel" onSubmit={saveDoc}>
          <div className="admin-actions">
            <strong>{editingId ? "編輯文件" : "新增文件"}</strong>
            <button className="button" type="button" onClick={resetForm}>
              <Plus size={18} />
              新增
            </button>
          </div>
          <label>
            文件 ID
            <input
              disabled={Boolean(editingId)}
              value={form.document_id}
              onChange={(event) => setForm({ ...form, document_id: event.target.value })}
            />
          </label>
          <label>
            標題
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          </label>
          <div className="form-grid">
            <label>
              來源類型
              <input value={form.source_type} onChange={(event) => setForm({ ...form, source_type: event.target.value })} required />
            </label>
            <label>
              狀態
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                <option value="published">published</option>
                <option value="draft">draft</option>
              </select>
            </label>
          </div>
          <label>
            內容
            <textarea className="knowledge-body-input" value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} required />
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
            {docs.map((doc) => (
              <div className="knowledge-doc-card" key={doc.document_id}>
                <div>
                  <div className="card-row">
                    <strong>{doc.title}</strong>
                    <span className="status">{doc.status}</span>
                  </div>
                  <small>
                    {doc.document_id} · {doc.source_type}
                  </small>
                </div>
                <div className="inline-actions">
                  <button className="button icon-button" type="button" onClick={() => editDoc(doc)}>
                    <Pencil size={17} />
                    <span>編輯</span>
                  </button>
                  <button className="button icon-button danger" type="button" onClick={() => deleteDoc(doc.document_id)}>
                    <Trash2 size={17} />
                    <span>刪除</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Shell>
  );
}
