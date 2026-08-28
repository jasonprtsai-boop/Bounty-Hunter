import { Link, NavLink } from "react-router-dom";
import { CalendarDays, Headphones, Home, ScrollText, User } from "lucide-react";
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
  { path: "/fortune", icon: ScrollText, label: "抽籤", hint: "文化" },
  { path: "/member", icon: User, label: "會員", hint: "紀錄" },
  { path: "/support", icon: Headphones, label: "客服", hint: "提問" }
];

export function Shell({ title, children }: ShellProps) {
  return (
    <div className="app">
      <header className="topbar liff-topbar">
        <Link to="/" className="brand">
          <span className="brand-mark">宮</span>
          <span className="brand-copy">
            <strong>Temple AI OS</strong>
            <small>萬春宮示範</small>
          </span>
        </Link>
        <div className="topbar-context" aria-label="目前介面狀態">
          <span>LINE 服務入口</span>
          <strong>活動、導覽、客服快速進入</strong>
        </div>
        <div className="topbar-actions">
          <span className="demo-pill">Demo</span>
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
            <NavLink key={item.path} to={item.path} end={item.path === "/"}>
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
