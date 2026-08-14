import { Link, NavLink } from "react-router-dom";
import { Bot, CalendarDays, Headphones, Home, LayoutDashboard, LogOut, Rocket, ScrollText, User } from "lucide-react";

type ShellProps = {
  title: string;
  children: React.ReactNode;
  mode?: "liff" | "admin";
};

export function Shell({ title, children, mode = "liff" }: ShellProps) {
  const links =
    mode === "admin"
      ? [
          ["/admin", LayoutDashboard, "總覽"],
          ["/admin/events", CalendarDays, "活動"],
          ["/admin/knowledge", ScrollText, "知識庫"],
          ["/admin/support", Headphones, "客服"],
          ["/admin/notifications", Bot, "推播"],
          ["/admin/release", Rocket, "發布"]
        ]
      : [
          ["/", Home, "首頁"],
          ["/events", CalendarDays, "活動"],
          ["/fortune", ScrollText, "抽籤"],
          ["/member", User, "會員"],
          ["/support", Headphones, "客服"]
        ];
  return (
    <div className={mode === "admin" ? "app admin-app" : "app"}>
      <header className="topbar">
        <Link to={mode === "admin" ? "/admin" : "/"} className="brand">
          <span className="brand-mark">AI</span>
          <span>
            <strong>Temple AI OS</strong>
            <small>{mode === "admin" ? "管理後台" : "萬春宮示範"}</small>
          </span>
        </Link>
        <div className="topbar-actions">
          <span className="demo-pill">Demo</span>
          {mode === "admin" && (
            <button
              className="button icon-button"
              type="button"
              onClick={() => {
                localStorage.removeItem("adminToken");
                localStorage.removeItem("adminActor");
                window.location.assign("/admin");
              }}
            >
              <LogOut size={17} />
              <span>登出</span>
            </button>
          )}
        </div>
      </header>
      <main className="main">
        <h1>{title}</h1>
        {children}
      </main>
      <nav className={mode === "admin" ? "side-nav" : "bottom-nav"} aria-label="主要導覽">
        {links.map(([path, Icon, label]) => (
          <NavLink key={path as string} to={path as string}>
            <Icon size={19} />
            <span>{label as string}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
