import { useEffect, useState } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { adminLogin, apiFetch, type DashboardSummary } from "../lib/api";

type AdminGateProps = {
  children: React.ReactNode;
};

export function AdminGate({ children }: AdminGateProps) {
  const [token, setToken] = useState(() => localStorage.getItem("adminToken") || "");
  const [draftUsername, setDraftUsername] = useState(() => localStorage.getItem("adminActor") || "");
  const [draftPassword, setDraftPassword] = useState("");
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(Boolean(token));
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setChecking(false);
      setVerified(false);
      return;
    }

    let active = true;
    setChecking(true);
    setError("");
    apiFetch<DashboardSummary>("/api/admin/dashboard/summary", {}, true)
      .then(() => {
        if (active) {
          setVerified(true);
        }
      })
      .catch((err) => {
        if (active) {
          localStorage.removeItem("adminToken");
          setToken("");
          setVerified(false);
          setError(err instanceof Error ? err.message : "登入狀態已失效，請重新登入");
        }
      })
      .finally(() => {
        if (active) {
          setChecking(false);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  function normalizeAdminLoginInput(username: string, password: string) {
    let normalizedPassword = password.trim();
    normalizedPassword = normalizedPassword.replace(/^Bearer\s+/i, "");
    normalizedPassword = normalizedPassword.replace(/^ADMIN_TOKENS\s*=\s*/i, "");
    normalizedPassword = normalizedPassword.replace(/^ADMIN_DEMO_TOKEN\s*=\s*/i, "");

    const firstEntry = normalizedPassword.split(",")[0]?.trim() || normalizedPassword;
    const separatorIndex = firstEntry.indexOf(":");
    if (separatorIndex > 0) {
      const actor = firstEntry.slice(0, separatorIndex).trim();
      const passwordValue = firstEntry.slice(separatorIndex + 1).trim();
      return {
        username: username.trim() || actor,
        password: passwordValue
      };
    }

    return {
      username: username.trim(),
      password: normalizedPassword
    };
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeAdminLoginInput(draftUsername, draftPassword);
    if (!normalized.username || !normalized.password) {
      setError("請輸入後台帳號與密碼");
      return;
    }
    setLoggingIn(true);
    setError("");
    try {
      const result = await adminLogin(normalized.username, normalized.password);
      localStorage.setItem("adminToken", result.access_token);
      localStorage.setItem("adminActor", result.actor);
      setToken(result.access_token);
      setDraftUsername(result.actor);
      setDraftPassword("");
    } catch (err) {
      localStorage.removeItem("adminToken");
      setToken("");
      setVerified(false);
      setError(err instanceof Error ? err.message : "登入失敗，請確認帳號與密碼");
    } finally {
      setLoggingIn(false);
    }
  }

  if (verified) {
    return <>{children}</>;
  }

  return (
    <main className="admin-login-page">
      <form className="admin-login-card" onSubmit={submit}>
        <div className="admin-login-header">
          <div className="admin-login-mark">
            <LockKeyhole size={26} />
          </div>
          <span className="admin-login-badge">
            <ShieldCheck size={16} />
            管理人員
          </span>
        </div>
        <div className="admin-login-copy">
          <h1>萬春宮後台</h1>
          <p>登入後可管理活動、問答內容、客服回覆與推播排程。</p>
        </div>
        <label>
          後台帳號
          <input
            autoComplete="username"
            autoFocus
            value={draftUsername}
            onChange={(event) => setDraftUsername(event.target.value)}
            placeholder="輸入帳號"
          />
        </label>
        <label>
          密碼
          <input
            autoComplete="current-password"
            type="password"
            value={draftPassword}
            onChange={(event) => setDraftPassword(event.target.value)}
            placeholder="輸入密碼"
          />
          <small>忘記帳號或密碼時，請聯絡系統管理員協助重設。</small>
        </label>
        <button className="button primary" disabled={checking || loggingIn} type="submit">
          <LockKeyhole size={18} />
          {checking || loggingIn ? "驗證中" : "進入後台"}
        </button>
        {error && <p className="error-text">{error}</p>}
      </form>
    </main>
  );
}
