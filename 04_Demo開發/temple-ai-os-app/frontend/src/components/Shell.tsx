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
  { path: "/tour/main-hall", icon: Map, label: "導覽", hint: "現場", bottom: true },
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
        <nav className="public-nav-links" aria-label="官網導覽">
          <Link to="/">首頁</Link>
          <a href="/#services">服務導覽</a>
          <a href="/#heritage">古蹟看點</a>
          <a href="/#guide">參拜指南</a>
          <Link to="/events" className={location.pathname.startsWith("/events") ? "active" : ""}>
            法會活動
          </Link>
          <Link to="/deities" className={location.pathname.startsWith("/deities") ? "active" : ""}>
            神佛介紹
          </Link>
        </nav>
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
