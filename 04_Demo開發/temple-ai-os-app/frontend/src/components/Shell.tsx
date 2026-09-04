import { Link, NavLink, useLocation } from "react-router-dom";
import { BookOpen, CalendarDays, ChevronDown, Headphones, Home, Map, ScrollText, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ShellProps = {
  title: string;
  children: React.ReactNode;
};

type NavItem = {
  path: string;
  icon: LucideIcon;
  label: string;
  hint: string;
};

const liffLinks: NavItem[] = [
  { path: "/", icon: Home, label: "首頁", hint: "服務" },
  { path: "/events", icon: CalendarDays, label: "活動", hint: "報名" },
  { path: "/deities", icon: BookOpen, label: "神佛", hint: "介紹" },
  { path: "/events?lookup=1", icon: Search, label: "查詢", hint: "進度" },
  { path: "/fortune", icon: ScrollText, label: "抽籤", hint: "文化" },
  { path: "/tour/main-hall", icon: Map, label: "導覽", hint: "現場" },
  { path: "/support", icon: Headphones, label: "客服", hint: "提問" }
];

export function Shell({ title, children }: ShellProps) {
  const location = useLocation();

  function navClass(item: NavItem, isActive: boolean) {
    if (item.path === "/events?lookup=1") {
      return location.pathname === "/events" && location.search.includes("lookup=1") ? "active" : "";
    }
    if (item.path === "/events") {
      return isActive && !location.search.includes("lookup=1") ? "active" : "";
    }
    return isActive ? "active" : "";
  }

  return (
    <div className="app">
      <header className="topbar liff-topbar">
        <Link to="/" className="brand">
          <span className="brand-mark">宮</span>
          <span className="brand-copy">
            <strong>萬春宮線上服務</strong>
            <small>LINE 服務入口</small>
          </span>
        </Link>
        <div className="topbar-context" aria-label="目前介面狀態">
          <span>LINE 服務入口</span>
          <strong>常用服務快速進入</strong>
        </div>
        <div className="topbar-actions">
          <details className="service-drawer">
            <summary>
              服務 <ChevronDown size={16} />
            </summary>
            <div className="service-drawer-panel">
              {liffLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.path} to={item.path}>
                    <Icon size={18} />
                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.hint}</small>
                    </span>
                  </Link>
                );
              })}
            </div>
          </details>
        </div>
      </header>
      <main className="main">
        <h1>{title}</h1>
        {children}
      </main>
      <nav className="bottom-nav" aria-label="主要導覽">
        {liffLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/" || item.path === "/events?lookup=1"}
              className={({ isActive }) => navClass(item, isActive)}
            >
              <span className="bottom-nav-icon">
                <Icon size={20} />
              </span>
              <span>{item.label}</span>
              <small>{item.hint}</small>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
