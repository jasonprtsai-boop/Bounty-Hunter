import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  CalendarDays,
  Compass,
  Home,
  MapPin,
  MessageCircle,
  ScrollText,
  Sparkles,
  X
} from "lucide-react";

export const quickNavItems = [
  { label: "官網", title: "萬春宮旗艦官網", icon: Home, to: "/" },
  { label: "導覽", title: "參拜動線導覽", icon: MapPin, to: "/tour/spots/main-hall" },
  { label: "神佛", title: "神佛體系介紹", icon: BookOpen, to: "/deities" },
  { label: "活動", title: "四季法會活動", icon: CalendarDays, to: "/events" },
  { label: "抽籤", title: "文化求籤提醒", icon: Sparkles, to: "/fortune" },
  { label: "擲筊", title: "擲筊問事祈請", icon: ScrollText, to: "/jiao" },
  { label: "客服", title: "線上客服諮詢", icon: MessageCircle, to: "/support" }
];

export function QuickSideMenu() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isItemActive(path: string) {
    if (path === "/") {
      return location.pathname === "/" || location.pathname === "/site";
    }
    if (path.startsWith("/tour")) {
      return location.pathname.startsWith("/tour");
    }
    if (path === "/events") {
      return location.pathname.startsWith("/events") || location.pathname.startsWith("/register");
    }
    return location.pathname.startsWith(path);
  }

  return (
    <>
      {/* Desktop Floating Side Quick Dock */}
      <nav className="public-side-menu" aria-label="側邊快捷服務">
        <span className="side-menu-label">快捷</span>
        {quickNavItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-label={item.title}
              className={active ? "active" : ""}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Floating Quick Button & Modal Drawer */}
      <div className="mobile-quick-wrapper">
        <button
          type="button"
          className="mobile-quick-trigger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="開啟快捷服務選單"
        >
          {mobileOpen ? <X size={20} /> : <Compass size={20} />}
          <span>快捷</span>
        </button>

        {mobileOpen && (
          <div className="mobile-quick-backdrop" onClick={() => setMobileOpen(false)}>
            <div className="mobile-quick-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-quick-header">
                <div className="mobile-quick-title">
                  <Compass size={18} />
                  <strong>宮廟服務快捷</strong>
                </div>
                <button
                  type="button"
                  className="mobile-quick-close"
                  onClick={() => setMobileOpen(false)}
                  aria-label="關閉快捷選單"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="mobile-quick-grid">
                {quickNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`mobile-quick-item ${active ? "active" : ""}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon size={22} />
                      <span className="mobile-quick-label">{item.label}</span>
                      <small className="mobile-quick-hint">{item.title}</small>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
