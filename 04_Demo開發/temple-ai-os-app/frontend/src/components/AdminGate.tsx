import { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { apiFetch, type DashboardSummary } from "../lib/api";

type AdminGateProps = {
  children: React.ReactNode;
};

export function AdminGate({ children }: AdminGateProps) {
  const [token, setToken] = useState(() => localStorage.getItem("adminToken") || "");
  const [draftToken, setDraftToken] = useState("");
  const [draftActor, setDraftActor] = useState(() => localStorage.getItem("adminActor") || "");
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(Boolean(token));
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
          setError(err instanceof Error ? err.message : "Token 驗證失敗");
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

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextToken = draftToken.trim();
    const nextActor = draftActor.trim() || "admin";
    if (!nextToken) {
      setError("請輸入後台管理 Token");
      return;
    }
    localStorage.setItem("adminToken", nextToken);
    localStorage.setItem("adminActor", nextActor);
    setToken(nextToken);
    setDraftToken("");
  }

  if (verified) {
    return <>{children}</>;
  }

  return (
    <main className="admin-login-page">
      <form className="admin-login-card" onSubmit={submit}>
        <div className="admin-login-mark">
          <LockKeyhole size={26} />
        </div>
        <div>
          <h1>後台管理登入</h1>
          <p>輸入部署環境設定的管理 Token 後，才能進入活動、知識庫、客服與推播管理。</p>
        </div>
        <label>
          管理 Token
          <input
            autoComplete="off"
            autoFocus
            type="password"
            value={draftToken}
            onChange={(event) => setDraftToken(event.target.value)}
            placeholder="請輸入 ADMIN_DEMO_TOKEN"
          />
        </label>
        <label>
          管理者名稱
          <input
            autoComplete="name"
            value={draftActor}
            onChange={(event) => setDraftActor(event.target.value)}
            placeholder="例如：專案管理員"
          />
        </label>
        <button className="button primary" disabled={checking} type="submit">
          <LockKeyhole size={18} />
          {checking ? "驗證中" : "進入後台"}
        </button>
        {error && <p className="error-text">{error}</p>}
      </form>
    </main>
  );
}
