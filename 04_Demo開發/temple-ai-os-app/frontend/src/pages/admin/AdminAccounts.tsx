import { useEffect, useMemo, useState } from "react";
import {
  KeyRound,
  Pencil,
  Plus,
  Save,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCog,
  UsersRound,
  X
} from "lucide-react";
import { Shell } from "../../components/AdminShell";
import { apiFetch, type AdminAccount, type AdminAccountStatus, type AdminRole } from "../../lib/api";

type AccountForm = {
  username: string;
  display_name: string;
  role: AdminRole;
  status: AdminAccountStatus;
  password: string;
};

const emptyForm: AccountForm = {
  username: "",
  display_name: "",
  role: "manager",
  status: "active",
  password: ""
};

const roleOptions: Array<{ value: AdminRole; label: string; hint: string }> = [
  { value: "owner", label: "最高權限", hint: "可管理所有功能與後台帳號" },
  { value: "manager", label: "管理員", hint: "可管理日常營運資料" },
  { value: "staff", label: "服務人員", hint: "適合客服與現場協助" }
];

const statusOptions: Array<{ value: AdminAccountStatus; label: string }> = [
  { value: "active", label: "啟用" },
  { value: "disabled", label: "停用" }
];

function roleLabel(role: string) {
  return roleOptions.find((option) => option.value === role)?.label || role;
}

function statusLabel(status: string) {
  return statusOptions.find((option) => option.value === status)?.label || status;
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "尚未登入";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function accountToForm(account: AdminAccount): AccountForm {
  return {
    username: account.username,
    display_name: account.display_name,
    role: account.role,
    status: account.status,
    password: ""
  };
}

export function AdminAccounts() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [form, setForm] = useState<AccountForm>(emptyForm);
  const [editingUsername, setEditingUsername] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const currentActor = typeof window !== "undefined" ? localStorage.getItem("adminActor") || "" : "";
  const currentRole = typeof window !== "undefined" ? localStorage.getItem("adminRole") || "" : "";

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    setLoading(true);
    setError("");
    try {
      setAccounts(await apiFetch<AdminAccount[]>("/api/admin/accounts", {}, true));
    } catch (err) {
      setError(err instanceof Error ? err.message : "讀取帳號失敗");
    } finally {
      setLoading(false);
    }
  }

  function updateForm<K extends keyof AccountForm>(key: K, value: AccountForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingUsername(null);
    setMessage("");
    setError("");
  }

  function editAccount(account: AdminAccount) {
    setForm(accountToForm(account));
    setEditingUsername(account.username);
    setMessage("");
    setError("");
  }

  async function saveAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingUsername && form.password.trim().length < 8) {
      setError("新增帳號的密碼至少需要 8 碼");
      return;
    }
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const payload: Record<string, string> = {
        display_name: form.display_name.trim(),
        role: form.role,
        status: form.status
      };
      if (!editingUsername) {
        payload.username = form.username.trim();
      }
      if (form.password.trim()) {
        payload.password = form.password.trim();
      }
      const saved = editingUsername
        ? await apiFetch<AdminAccount>(
            `/api/admin/accounts/${editingUsername}`,
            { method: "PUT", body: JSON.stringify(payload) },
            true
          )
        : await apiFetch<AdminAccount>(
            "/api/admin/accounts",
            { method: "POST", body: JSON.stringify(payload) },
            true
          );
      setAccounts((current) =>
        current.some((account) => account.username === saved.username)
          ? current.map((account) => (account.username === saved.username ? saved : account))
          : [...current, saved].sort((a, b) => a.username.localeCompare(b.username))
      );
      setEditingUsername(saved.username);
      setForm(accountToForm(saved));
      setMessage(editingUsername ? "帳號已更新" : "帳號已建立");
    } catch (err) {
      setError(err instanceof Error ? err.message : "儲存帳號失敗");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAccount(username: string) {
    if (username === currentActor) {
      setError("不能刪除目前登入中的帳號");
      return;
    }
    if (!window.confirm(`確定刪除 ${username}？刪除後此帳號無法再登入。`)) {
      return;
    }
    setMessage("");
    setError("");
    try {
      await apiFetch<{ deleted: boolean }>(`/api/admin/accounts/${username}`, { method: "DELETE" }, true);
      setAccounts((current) => current.filter((account) => account.username !== username));
      if (editingUsername === username) {
        resetForm();
      }
      setMessage("帳號已刪除");
    } catch (err) {
      setError(err instanceof Error ? err.message : "刪除帳號失敗");
    }
  }

  const filteredAccounts = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) {
      return accounts;
    }
    return accounts.filter((account) =>
      [account.username, account.display_name, roleLabel(account.role), statusLabel(account.status)]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [accounts, query]);

  const ownerCount = accounts.filter((account) => account.role === "owner" && account.status === "active").length;
  const activeCount = accounts.filter((account) => account.status === "active").length;
  const disabledCount = accounts.filter((account) => account.status === "disabled").length;
  const passwordCount = accounts.filter((account) => account.password_set).length;
  const isOwner = currentRole === "owner";

  return (
    <Shell title="權限管理" mode="admin">
      <section className="admin-summary-strip" aria-label="權限摘要">
        <div>
          <UsersRound size={20} />
          <span>後台帳號</span>
          <strong>{accounts.length}</strong>
        </div>
        <div>
          <ShieldCheck size={20} />
          <span>最高權限</span>
          <strong>{ownerCount}</strong>
        </div>
        <div>
          <UserCog size={20} />
          <span>啟用中</span>
          <strong>{activeCount}</strong>
        </div>
        <div>
          <ShieldAlert size={20} />
          <span>已停用</span>
          <strong>{disabledCount}</strong>
        </div>
      </section>

      {!isOwner ? (
        <section className="tool-panel account-denied-panel">
          <ShieldAlert size={28} />
          <div>
            <span className="panel-kicker">權限不足</span>
            <h2>只有最高權限可以管理後台帳號</h2>
            <p>你仍可使用已授權的日常管理功能；新增人員、停用帳號或重設密碼需要最高權限。</p>
          </div>
        </section>
      ) : (
        <div className="admin-event-grid account-admin-grid">
          <form className="form-panel admin-editor-panel" onSubmit={saveAccount}>
            <div className="admin-actions">
              <div>
                <span className="panel-kicker">{editingUsername ? "正在編輯" : "新增帳號"}</span>
                <strong>{editingUsername ? form.display_name || editingUsername : "建立後台使用者"}</strong>
              </div>
              <button className="button" type="button" onClick={resetForm}>
                <Plus size={18} />
                新增
              </button>
            </div>

            <div className="form-section">
              <div className="form-section-title">
                <span>1</span>
                <strong>登入資訊</strong>
              </div>
              <label>
                帳號
                <input
                  autoComplete="username"
                  disabled={Boolean(editingUsername)}
                  value={form.username}
                  onChange={(event) => updateForm("username", event.target.value)}
                  placeholder="例如 temple-admin"
                  required
                />
                <small>可使用英文、數字、底線、連字號與小數點；建立後不可更改帳號名稱。</small>
              </label>
              <label>
                密碼
                <input
                  autoComplete="new-password"
                  type="password"
                  value={form.password}
                  onChange={(event) => updateForm("password", event.target.value)}
                  placeholder={editingUsername ? "留空代表不更改密碼" : "至少 8 碼"}
                  required={!editingUsername}
                />
                <small>{editingUsername ? "只有需要重設密碼時才填寫。" : "建議使用至少 12 碼，並避免多人共用同一組帳密。"}</small>
              </label>
            </div>

            <div className="form-section">
              <div className="form-section-title">
                <span>2</span>
                <strong>身分與狀態</strong>
              </div>
              <label>
                顯示名稱
                <input
                  value={form.display_name}
                  onChange={(event) => updateForm("display_name", event.target.value)}
                  placeholder="例如 櫃台管理員"
                  required
                />
              </label>
              <div className="form-grid">
                <label>
                  身分
                  <select value={form.role} onChange={(event) => updateForm("role", event.target.value as AdminRole)}>
                    {roleOptions.map((option) => (
                      <option value={option.value} key={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  狀態
                  <select
                    value={form.status}
                    onChange={(event) => updateForm("status", event.target.value as AdminAccountStatus)}
                  >
                    {statusOptions.map((option) => (
                      <option value={option.value} key={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="role-hint-list">
                {roleOptions.map((option) => (
                  <span key={option.value}>
                    <strong>{option.label}</strong>
                    {option.hint}
                  </span>
                ))}
              </div>
            </div>

            <div className="admin-actions">
              <button className="button primary" disabled={saving} type="submit">
                <Save size={18} />
                {saving ? "儲存中" : editingUsername ? "更新帳號" : "建立帳號"}
              </button>
              {editingUsername && (
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
                <span className="panel-kicker">帳號列表</span>
                <h2>管理誰可以進入後台</h2>
              </div>
              <div className="panel-actions">
                <span className="status">{filteredAccounts.length} 筆</span>
                <span className="status active">{passwordCount} 組密碼</span>
              </div>
            </div>

            <div className="admin-filter-bar account-filter-bar" aria-label="帳號篩選">
              <label>
                搜尋
                <div className="search-field">
                  <Search size={17} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="帳號、名稱、身分或狀態"
                  />
                </div>
              </label>
            </div>

            <div className="export-note">
              <KeyRound size={16} />
              這裡只顯示帳號狀態，不會顯示任何人的密碼。
            </div>

            {loading ? <div className="empty-state">讀取帳號中</div> : null}
            {!loading && filteredAccounts.length === 0 ? <div className="empty-state">沒有符合條件的帳號。</div> : null}

            <div className="account-list">
              {filteredAccounts.map((account) => (
                <article className="account-card" key={account.account_id}>
                  <div className="account-card-main">
                    <div className="account-avatar" aria-hidden="true">
                      {account.display_name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className="card-row">
                        <strong>{account.display_name}</strong>
                        <span className={`status ${account.status}`}>{statusLabel(account.status)}</span>
                      </div>
                      <p>
                        {account.username}
                        {account.username === currentActor ? " · 目前登入" : ""}
                      </p>
                      <small>最近登入：{formatDateTime(account.last_login_at)}</small>
                    </div>
                  </div>
                  <div className="account-card-side">
                    <span className={`role-badge ${account.role}`}>{roleLabel(account.role)}</span>
                    <div className="inline-actions">
                      <button className="button icon-button" type="button" onClick={() => editAccount(account)}>
                        <Pencil size={17} />
                        <span>編輯</span>
                      </button>
                      <button
                        className="button icon-button danger"
                        type="button"
                        disabled={account.username === currentActor}
                        onClick={() => deleteAccount(account.username)}
                      >
                        <Trash2 size={17} />
                        <span>刪除</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </Shell>
  );
}
