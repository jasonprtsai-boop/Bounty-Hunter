import { useEffect, useMemo, useState } from "react";
import { BookOpen, FileSpreadsheet, Landmark, Pencil, Plus, Save, Search, ShieldCheck, Trash2, X } from "lucide-react";
import { useConfirmDialog } from "../../components/ConfirmDialog";
import { Shell } from "../../components/AdminShell";
import { StatePanel } from "../../components/StatePanel";
import { apiFetch, type Deity } from "../../lib/api";
import { canManageOperations, getStoredAdminRole } from "../../lib/adminPermissions";
import { exportRowsToExcel } from "../../lib/excelExport";

type DeityForm = {
  deity_id: string;
  name: string;
  category: string;
  enshrined_area: string;
  description: string;
  birthday_lunar: string;
  service_notes: string;
  source_url: string;
  status: string;
  sort_order: string;
};

const emptyDeityForm: DeityForm = {
  deity_id: "",
  name: "",
  category: "配祀神佛",
  enshrined_area: "",
  description: "",
  birthday_lunar: "",
  service_notes: "",
  source_url: "",
  status: "published",
  sort_order: "100"
};

const deityStatusOptions = [
  { value: "published", label: "已發布" },
  { value: "draft", label: "草稿" }
];

function deityStatusLabel(status: string) {
  return deityStatusOptions.find((option) => option.value === status)?.label || status;
}

function toForm(deity: Deity): DeityForm {
  return {
    deity_id: deity.deity_id,
    name: deity.name,
    category: deity.category,
    enshrined_area: deity.enshrined_area,
    description: deity.description,
    birthday_lunar: deity.birthday_lunar || "",
    service_notes: deity.service_notes || "",
    source_url: deity.source_url || "",
    status: deity.status,
    sort_order: String(deity.sort_order)
  };
}

function toPayload(form: DeityForm) {
  return {
    deity_id: form.deity_id.trim() || undefined,
    name: form.name.trim(),
    category: form.category.trim(),
    enshrined_area: form.enshrined_area.trim(),
    description: form.description.trim(),
    birthday_lunar: form.birthday_lunar.trim() || null,
    service_notes: form.service_notes.trim() || null,
    source_url: form.source_url.trim() || null,
    status: form.status,
    sort_order: Number(form.sort_order || 0)
  };
}

export function AdminDeities() {
  const [deities, setDeities] = useState<Deity[]>([]);
  const [form, setForm] = useState<DeityForm>(emptyDeityForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [query, setQuery] = useState("");
  const currentRole = getStoredAdminRole();
  const canEditDeities = canManageOperations(currentRole);
  const { requestConfirmation, confirmDialog } = useConfirmDialog();

  useEffect(() => {
    loadDeities();
  }, []);

  async function loadDeities() {
    setLoading(true);
    setLoadError("");
    try {
      setDeities(await apiFetch<Deity[]>("/api/admin/deities", {}, true));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "讀取神佛資料失敗");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyDeityForm);
    setMessage("");
    setError("");
  }

  function editDeity(deity: Deity) {
    setEditingId(deity.deity_id);
    setForm(toForm(deity));
    setMessage("");
    setError("");
  }

  async function saveDeity(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEditDeities) {
      setError("目前帳號只能查看神佛資料，不能變更內容");
      return;
    }
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const payload = toPayload(form);
      const saved = editingId
        ? await apiFetch<Deity>(`/api/admin/deities/${editingId}`, { method: "PUT", body: JSON.stringify(payload) }, true)
        : await apiFetch<Deity>("/api/admin/deities", { method: "POST", body: JSON.stringify(payload) }, true);
      setDeities((current) => {
        const exists = current.some((item) => item.deity_id === saved.deity_id);
        const next = exists
          ? current.map((item) => (item.deity_id === saved.deity_id ? saved : item))
          : [...current, saved];
        return next.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
      });
      setEditingId(saved.deity_id);
      setForm(toForm(saved));
      setMessage("已儲存");
    } catch (err) {
      setError(err instanceof Error ? err.message : "儲存失敗");
    } finally {
      setSaving(false);
    }
  }

  async function deleteDeity(deity: Deity) {
    if (!canEditDeities) {
      setError("目前帳號只能查看神佛資料，不能刪除內容");
      return;
    }
    if (
      !(await requestConfirmation({
        title: "刪除神佛資料",
        body: `刪除「${deity.name}」後，公開介紹與問答依據可能少一筆文化資料。`,
        confirmLabel: "刪除資料"
      }))
    ) {
      return;
    }
    setMessage("");
    setError("");
    try {
      await apiFetch<{ deleted: boolean }>(`/api/admin/deities/${deity.deity_id}`, { method: "DELETE" }, true);
      setDeities((current) => current.filter((item) => item.deity_id !== deity.deity_id));
      if (editingId === deity.deity_id) {
        resetForm();
      }
      setMessage("已刪除");
    } catch (err) {
      setError(err instanceof Error ? err.message : "刪除失敗");
    }
  }

  const categories = useMemo(
    () => Array.from(new Set(deities.map((deity) => deity.category))).filter(Boolean).sort((a, b) => a.localeCompare(b)),
    [deities]
  );
  const publishedCount = deities.filter((deity) => deity.status === "published").length;
  const draftCount = deities.filter((deity) => deity.status === "draft").length;
  const filteredDeities = deities.filter((deity) => {
    const keyword = query.trim().toLowerCase();
    const matchesQuery =
      !keyword ||
      [deity.deity_id, deity.name, deity.category, deity.enshrined_area, deity.description, deity.service_notes || ""]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    const matchesStatus = statusFilter === "all" || deity.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || deity.category === categoryFilter;
    return matchesQuery && matchesStatus && matchesCategory;
  });

  function exportDeities() {
    exportRowsToExcel({
      filename: "temple-deities",
      sheetName: "神佛資料",
      rows: filteredDeities,
      columns: [
        { header: "序號", value: (_deity, index) => index + 1 },
        { header: "資料 ID", value: (deity) => deity.deity_id },
        { header: "名稱", value: (deity) => deity.name },
        { header: "分類", value: (deity) => deity.category },
        { header: "奉祀區域", value: (deity) => deity.enshrined_area },
        { header: "農曆聖誕", value: (deity) => deity.birthday_lunar || "" },
        { header: "狀態", value: (deity) => deityStatusLabel(deity.status) },
        { header: "排序", value: (deity) => deity.sort_order },
        { header: "介紹", value: (deity) => deity.description },
        { header: "服務提醒", value: (deity) => deity.service_notes || "" },
        { header: "來源", value: (deity) => deity.source_url || "" }
      ]
    });
  }

  return (
    <Shell title="神佛資料" mode="admin">
      <section className="admin-summary-strip" aria-label="神佛資料摘要">
        <div>
          <BookOpen size={20} />
          <span>資料總數</span>
          <strong>{deities.length}</strong>
        </div>
        <div>
          <ShieldCheck size={20} />
          <span>已發布</span>
          <strong>{publishedCount}</strong>
        </div>
        <div>
          <BookOpen size={20} />
          <span>草稿</span>
          <strong>{draftCount}</strong>
        </div>
        <div>
          <Landmark size={20} />
          <span>分類</span>
          <strong>{categories.length}</strong>
        </div>
      </section>

      <div className={`admin-event-grid${canEditDeities ? "" : " read-only-admin-grid"}`}>
        {canEditDeities ? (
          <form className="form-panel admin-editor-panel" onSubmit={saveDeity}>
            <div className="admin-actions">
              <div>
                <span className="panel-kicker">{editingId ? "目前正在編輯" : "新增資料"}</span>
                <strong>{editingId ? "編輯神佛資料" : "新增神佛資料"}</strong>
              </div>
              <button className="button" type="button" onClick={resetForm}>
                <Plus size={18} />
                新增
              </button>
            </div>

            <div className="form-section">
              <div className="form-section-title">
                <span>1</span>
                <strong>基本識別</strong>
              </div>
              <label>
                資料 ID
                <input
                  disabled={Boolean(editingId)}
                  value={form.deity_id}
                  onChange={(event) => setForm({ ...form, deity_id: event.target.value })}
                  placeholder="留空會由後端產生"
                />
              </label>
              <div className="form-grid">
                <label>
                  名稱
                  <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
                </label>
                <label>
                  分類
                  <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required />
                </label>
              </div>
              <label>
                奉祀區域
                <input
                  value={form.enshrined_area}
                  onChange={(event) => setForm({ ...form, enshrined_area: event.target.value })}
                  required
                />
              </label>
              <div className="form-grid">
                <label>
                  狀態
                  <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                    {deityStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  排序
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(event) => setForm({ ...form, sort_order: event.target.value })}
                  />
                </label>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">
                <span>2</span>
                <strong>公開介紹</strong>
              </div>
              <label>
                介紹
                <textarea
                  className="knowledge-body-input"
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  required
                />
              </label>
              <label>
                服務提醒
                <textarea
                  value={form.service_notes}
                  onChange={(event) => setForm({ ...form, service_notes: event.target.value })}
                  placeholder="例如：正式祭祀與服務安排請以廟方公告為準。"
                />
              </label>
              <div className="form-grid">
                <label>
                  農曆聖誕
                  <input
                    value={form.birthday_lunar}
                    onChange={(event) => setForm({ ...form, birthday_lunar: event.target.value })}
                    placeholder="例如：農曆三月廿三"
                  />
                </label>
                <label>
                  資料來源
                  <input
                    value={form.source_url}
                    onChange={(event) => setForm({ ...form, source_url: event.target.value })}
                    placeholder="https://"
                  />
                </label>
              </div>
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
            body="服務人員可以查閱神佛資料；新增、編輯與刪除公開介紹需要管理員以上權限。"
          />
        )}

        <section className="tool-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">資料列表</span>
              <h2>維護公開介紹</h2>
            </div>
            <div className="panel-actions">
              <span className="status">{filteredDeities.length} 筆</span>
              <button className="button icon-button export-button" type="button" onClick={exportDeities} disabled={filteredDeities.length === 0}>
                <FileSpreadsheet size={17} />
                <span>匯出 Excel</span>
              </button>
            </div>
          </div>

          <div className="admin-filter-bar" aria-label="神佛資料篩選">
            <label>
              搜尋
              <div className="search-field">
                <Search size={17} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="名稱、分類、區域、介紹" />
              </div>
            </label>
            <label>
              分類
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                <option value="all">全部分類</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label>
              狀態
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">全部狀態</option>
                {deityStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="export-note">
            <FileSpreadsheet size={16} />
            會匯出目前搜尋、分類與狀態篩選後的神佛資料。
          </div>

          <div className="knowledge-list">
            {loading ? (
              <StatePanel variant="loading" title="正在讀取神佛資料" body="系統正在載入分類、奉祀區域與公開介紹。" />
            ) : loadError ? (
              <StatePanel
                variant="error"
                title="神佛資料暫時無法讀取"
                body={loadError}
                actions={
                  <button className="button primary" type="button" onClick={loadDeities}>
                    重新讀取
                  </button>
                }
              />
            ) : filteredDeities.length > 0 ? (
              filteredDeities.map((deity) => (
                <div className="knowledge-doc-card" key={deity.deity_id}>
                  <div>
                    <div className="card-row">
                      <strong>{deity.name}</strong>
                      <span className={`status ${deity.status}`}>{deityStatusLabel(deity.status)}</span>
                    </div>
                    <small>
                      {deity.category} · {deity.enshrined_area} · 排序 {deity.sort_order}
                    </small>
                    <p className="list-preview">{deity.description}</p>
                    {deity.service_notes ? <p className="list-preview">{deity.service_notes}</p> : null}
                  </div>
                  <div className="inline-actions">
                    {canEditDeities ? (
                      <>
                        <button className="button icon-button" type="button" onClick={() => editDeity(deity)}>
                          <Pencil size={17} />
                          <span>編輯</span>
                        </button>
                        <button className="button icon-button danger" type="button" onClick={() => deleteDeity(deity)}>
                          <Trash2 size={17} />
                          <span>刪除</span>
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <StatePanel variant="empty" title="沒有符合條件的神佛資料" body="請調整搜尋、分類或狀態條件。" />
            )}
          </div>
        </section>
      </div>
      {confirmDialog}
    </Shell>
  );
}
