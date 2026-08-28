import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Bot,
  CalendarDays,
  ChevronRight,
  Globe2,
  Headphones,
  LayoutDashboard,
  LogOut,
  ScrollText,
  Settings,
  ShieldCheck,
  UserCog,
  User
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PUBLIC_SITE_BASE_URL } from "../lib/siteLinks";

type ShellProps = {
  title: string;
  children: React.ReactNode;
  mode?: "admin";
};

type NavItem = {
  path: string;
  icon: LucideIcon;
  label: string;
  hint: string;
};

const adminLinks: NavItem[] = [
  { path: "/admin", icon: LayoutDashboard, label: "總覽", hint: "營運指標" },
  { path: "/admin/events", icon: CalendarDays, label: "活動", hint: "發布與報名" },
  { path: "/admin/knowledge", icon: ScrollText, label: "知識庫", hint: "AI 回覆依據" },
  { path: "/admin/support", icon: Headphones, label: "客服", hint: "服務單追蹤" },
  { path: "/admin/notifications", icon: Bot, label: "推播", hint: "LINE 通知" }
];

const adminSetupLinks: NavItem[] = [
  { path: "/admin/accounts", icon: UserCog, label: "權限", hint: "帳號與身分" },
  { path: "/admin/release", icon: Settings, label: "設定", hint: "LINE 與發布" }
];

const adminPageDescriptions: Record<string, string> = {
  "/admin": "先看今日待處理事項，再進入活動、客服、內容與發布設定。",
  "/admin/events": "建立活動、控制報名狀態、確認名額與公開說明。",
  "/admin/knowledge": "維護問答依據與安全提醒，避免回覆內容過時或不完整。",
  "/admin/support": "集中處理民眾留下的問題，依狀態安排下一步。",
  "/admin/notifications": "管理 LINE 提醒任務、補發訊息與到期通知。",
  "/admin/accounts": "建立後台帳號、設定身分角色，並停用不再使用的帳號。",
  "/admin/release": "整理 LINE 帳號設定、公開連結、Rich Menu 與上線檢查。"
};

const roleLabels: Record<string, string> = {
  owner: "最高權限",
  manager: "管理員",
  staff: "服務人員"
};

export function Shell({ title, children }: ShellProps) {
  const location = useLocation();
  const adminActor = typeof window !== "undefined" ? localStorage.getItem("adminActor") || "管理員" : "管理員";
  const adminDisplayName =
    typeof window !== "undefined" ? localStorage.getItem("adminDisplayName") || adminActor : adminActor;
  const adminRole = typeof window !== "undefined" ? localStorage.getItem("adminRole") || "owner" : "owner";
  const pageDescription = adminPageDescriptions[location.pathname] || "管理資料、服務與發布狀態。";

  const renderAdminNavLink = (item: NavItem) => {
    const Icon = item.icon;
    return (
      <NavLink key={item.path} to={item.path} end={item.path === "/admin"}>
        <span className="nav-icon">
          <Icon size={20} />
        </span>
        <span className="nav-copy">
          <span>{item.label}</span>
          <small>{item.hint}</small>
        </span>
      </NavLink>
    );
  };

  return (
    <div className="app admin-app">
      <header className="topbar admin-topbar">
        <Link to="/admin" className="brand">
          <span className="brand-mark">OS</span>
          <span className="brand-copy">
            <strong>Temple AI OS</strong>
            <small>管理後台</small>
          </span>
        </Link>
        <div className="topbar-context" aria-label="目前介面狀態">
          <span>營運模式</span>
          <strong>資料、活動與通知集中控管</strong>
        </div>
        <div className="topbar-actions">
          <span className="demo-pill">Demo 營運</span>
          <a className="button icon-button admin-public-button" href={`${PUBLIC_SITE_BASE_URL}/site`} target="_blank" rel="noreferrer">
            <Globe2 size={17} />
            <span>公開站</span>
          </a>
          <span className="operator-chip">
            <User size={16} />
            <span>
              {adminDisplayName}
              <small>{roleLabels[adminRole] || adminRole}</small>
            </span>
          </span>
          <button
            className="button icon-button"
            type="button"
            aria-label="登出管理後台"
            onClick={() => {
              localStorage.removeItem("adminToken");
              localStorage.removeItem("adminActor");
              localStorage.removeItem("adminDisplayName");
              localStorage.removeItem("adminRole");
              window.location.assign("/admin");
            }}
          >
            <LogOut size={17} />
            <span>登出</span>
          </button>
        </div>
      </header>
      <nav className="side-nav" aria-label="管理後台導覽">
        <div className="side-nav-header">
          <span>Temple Ops</span>
          <strong>營運控制台</strong>
          <small>日常作業與發布設定分層管理</small>
        </div>
        <div className="side-nav-list">
          <span className="side-nav-label">日常作業</span>
          {adminLinks.map(renderAdminNavLink)}
          <span className="side-nav-label">設定與發布</span>
          {adminSetupLinks.map(renderAdminNavLink)}
        </div>
        <a className="side-nav-public-link" href={`${PUBLIC_SITE_BASE_URL}/site`} target="_blank" rel="noreferrer">
          <ShieldCheck size={18} />
          <span>
            公開官網
            <small>檢查信眾入口</small>
          </span>
          <ChevronRight size={16} />
        </a>
      </nav>
      <main className="main">
        <div className="admin-page-heading">
          <div>
            <span>後台管理</span>
            <h1>{title}</h1>
            <p>{pageDescription}</p>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
