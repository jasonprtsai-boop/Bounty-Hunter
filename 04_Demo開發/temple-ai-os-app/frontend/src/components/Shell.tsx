import { Link, NavLink, useLocation } from "react-router-dom";
import { CalendarDays, Headphones, Home, Map, ScrollText, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { QuickSideMenu } from "./QuickSideMenu";

type ShellProps = {
  title: string;
  children: React.ReactNode;
};

type NavItem = {
  path: string;
  icon: LucideIcon;
  label: string;
  hint: string;
  bottom?: boolean;
};

const liffLinks: NavItem[] = [
  { path: "/", icon: Home, label: "首頁", hint: "官網", bottom: true },
  { path: "/events", icon: CalendarDays, label: "活動", hint: "報名", bottom: true },
  { path: "/tour/main-hall", icon: Map, label: "導覽", hint: "現場" },
  { path: "/fortune", icon: ScrollText, label: "抽籤", hint: "文化", bottom: true },
  { path: "/jiao", icon: Sparkles, label: "擲筊", hint: "問事", bottom: true },
  { path: "/support", icon: Headphones, label: "客服", hint: "提問", bottom: true }
];

export function Shell({ title, children }: ShellProps) {
  const location = useLocation();
  const bottomLinks = liffLinks.filter((item) => item.bottom);

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
        <div className="topbar-context symbol-context" aria-label="宮廟服務符號">
          <span>香</span>
          <span>籤</span>
          <span>筊</span>
          <span>安</span>
        </div>
      </header>
      <QuickSideMenu />
      <main className="main">
        <h1>{title}</h1>
        {children}
      </main>
      <nav className="bottom-nav" aria-label="主要導覽">
        {bottomLinks.map((item) => {
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
