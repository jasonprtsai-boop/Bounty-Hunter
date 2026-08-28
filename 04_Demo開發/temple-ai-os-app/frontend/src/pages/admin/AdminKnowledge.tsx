import { useEffect, useState } from "react";
import { FileSpreadsheet, FileText, Pencil, Plus, Save, Search, ShieldCheck, Trash2, X } from "lucide-react";
import { Shell } from "../../components/AdminShell";
import { apiFetch } from "../../lib/api";
import { exportRowsToExcel } from "../../lib/excelExport";

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

const knowledgeStatusOptions = [
  { value: "published", label: "已發布" },
  { value: "draft", label: "草稿" }
];

function knowledgeStatusLabel(status: string) {
  return knowledgeStatusOptions.find((option) => option.value === status)?.label || status;
}

export function AdminKnowledge() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [form, setForm] = useState<KnowledgeForm>(emptyKnowledgeForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");

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

  const publishedDocs = docs.filter((doc) => doc.status === "published").length;
  const draftDocs = docs.filter((doc) => doc.status === "draft").length;
  const filteredDocs = docs.filter((doc) => {
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    const keyword = query.trim().toLowerCase();
    const matchesQuery =
      !keyword ||
      [doc.title, doc.document_id, doc.source_type, doc.body]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    return matchesStatus && matchesQuery;
  });

  function exportDocs() {
    exportRowsToExcel({
      filename: "temple-knowledge-documents",
      sheetName: "知識庫",
      rows: filteredDocs,
      columns: [
        { header: "序號", value: (_doc, index) => index + 1 },
        { header: "文件 ID", value: (doc) => doc.document_id },
        { header: "標題", value: (doc) => doc.title },
        { header: "來源類型", value: (doc) => doc.source_type },
        { header: "狀態", value: (doc) => knowledgeStatusLabel(doc.status) },
        { header: "內容", value: (doc) => doc.body }
      ]
    });
  }

  return (
    <Shell title="知識庫" mode="admin">
      <section className="admin-summary-strip" aria-label="知識庫摘要">
        <div>
          <FileText size={20} />
          <span>文件總數</span>
          <strong>{docs.length}</strong>
        </div>
        <div>
          <ShieldCheck size={20} />
          <span>已發布</span>
          <strong>{publishedDocs}</strong>
        </div>
        <div>
          <FileText size={20} />
          <span>草稿</span>
          <strong>{draftDocs}</strong>
        </div>
        <div>
          <ShieldCheck size={20} />
          <span>回覆依據</span>
          <strong>FAQ</strong>
        </div>
      </section>

      <div className="admin-event-grid">
        <form className="form-panel admin-editor-panel" onSubmit={saveDoc}>
          <div className="admin-actions">
            <div>
              <span className="panel-kicker">{editingId ? "目前正在編輯" : "新增知識"}</span>
              <strong>{editingId ? "編輯文件" : "新增文件"}</strong>
            </div>
            <button className="button" type="button" onClick={resetForm}>
              <Plus size={18} />
              新增
            </button>
          </div>

          <div className="form-section">
            <div className="form-section-title">
              <span>1</span>
              <strong>文件識別</strong>
            </div>
            <label>
              文件 ID
              <input
                disabled={Boolean(editingId)}
                value={form.document_id}
                onChange={(event) => setForm({ ...form, document_id: event.target.value })}
              />
              <small>留空會依標題自動產生；編輯既有文件時不可更改。</small>
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
                  {knowledgeStatusOptions.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">
              <span>2</span>
              <strong>回覆內容</strong>
            </div>
            <label>
              內容
              <textarea className="knowledge-body-input" value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} required />
              <small>建議用問答或短段落撰寫，並明確標示資料來源與不能確定的部分。</small>
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

        <section className="tool-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">文件列表</span>
              <h2>維護回覆依據</h2>
            </div>
            <div className="panel-actions">
              <span className="status">{filteredDocs.length} 筆</span>
              <button className="button icon-button export-button" type="button" onClick={exportDocs} disabled={filteredDocs.length === 0}>
                <FileSpreadsheet size={17} />
                <span>匯出 Excel</span>
              </button>
            </div>
          </div>
          <div className="admin-filter-bar" aria-label="知識庫篩選">
            <label>
              搜尋
              <div className="search-field">
                <Search size={17} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="標題、文件 ID、內容" />
              </div>
            </label>
            <label>
              狀態
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">全部狀態</option>
                {knowledgeStatusOptions.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="export-note">
            <FileSpreadsheet size={16} />
            會匯出目前搜尋與狀態篩選後的知識文件。
          </div>
          <div className="knowledge-list">
            {filteredDocs.map((doc) => (
              <div className="knowledge-doc-card" key={doc.document_id}>
                <div>
                  <div className="card-row">
                    <strong>{doc.title}</strong>
                    <span className={`status ${doc.status}`}>{knowledgeStatusLabel(doc.status)}</span>
                  </div>
                  <small>
                    {doc.document_id} · {doc.source_type}
                  </small>
                  <p className="list-preview">{doc.body.slice(0, 118)}{doc.body.length > 118 ? "..." : ""}</p>
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
            {filteredDocs.length === 0 && <div className="empty-state">沒有符合條件的知識文件。</div>}
          </div>
        </section>
      </div>
    </Shell>
  );
}
