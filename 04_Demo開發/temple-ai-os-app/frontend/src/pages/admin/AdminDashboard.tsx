import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Headphones,
  ListChecks,
  ScrollText,
  Settings,
  ShieldCheck
} from "lucide-react";
import { MetricCard } from "../../components/MetricCard";
import { Shell } from "../../components/AdminShell";
import { StatePanel } from "../../components/StatePanel";
import { apiFetch, type DashboardSummary } from "../../lib/api";

const labels: Record<string, string> = {
  line_friends: "LINE 好友",
  active_users_7d: "7 日活躍",
  event_views_7d: "活動瀏覽",
  registrations_total: "報名數",
  ai_questions_7d: "問答次數",
  knowledge_gap_count: "知識缺口"
};

const operatingFlow = [
  ["1", "建立活動", "確認日期、名額、報名欄位與公開提醒。", "/admin/events"],
  ["2", "補齊問答", "把常見問題與安全提醒整理到知識庫。", "/admin/knowledge"],
  ["3", "安排提醒", "建立活動前提醒、補發或客服追蹤通知。", "/admin/notifications"],
  ["4", "處理回覆", "追蹤民眾問題，標記狀態與後續處理。", "/admin/support"]
];

export function AdminDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    loadSummary();
  }, []);

  async function loadSummary() {
    setLoading(true);
    setLoadError("");
    try {
      setSummary(await apiFetch<DashboardSummary>("/api/admin/dashboard/summary", {}, true));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "讀取營運總覽失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell title="營運總覽" mode="admin">
      {loading ? (
        <StatePanel
          variant="loading"
          title="正在讀取營運總覽"
          body="系統正在整理活動、客服、問答與通知摘要。"
        />
      ) : loadError ? (
        <StatePanel
          variant="error"
          title="營運總覽暫時無法讀取"
          body={loadError}
          actions={
            <button className="button primary" type="button" onClick={loadSummary}>
              重新讀取
            </button>
          }
        />
      ) : summary ? (
        <>
          <section className="admin-command-center">
            <div className="command-copy">
              <span className="section-kicker">今日工作台</span>
              <h2>先處理會影響使用者的事項</h2>
              <p>活動報名、客服問題、知識缺口與 LINE 設定分開管理；每天進來先看這一區就知道從哪裡開始。</p>
            </div>
            <div className="command-actions" aria-label="常用操作">
              <Link className="button primary" to="/admin/events">
                <CalendarDays size={18} />
                管理活動
                <ChevronRight size={16} />
              </Link>
              <Link className="button" to="/admin/support">
                <Headphones size={18} />
                處理客服
              </Link>
              <Link className="button" to="/admin/deities">
                <ScrollText size={18} />
                神佛資料
              </Link>
              <Link className="button" to="/admin/release">
                <Settings size={18} />
                上線設定
              </Link>
            </div>
          </section>

          <section className="admin-priority-grid" aria-label="今日待處理摘要">
            <Link className="priority-card" to="/admin/events">
              <CalendarDays size={22} />
              <span>活動報名</span>
              <strong>{summary.headline_metrics.registrations_total ?? 0}</strong>
              <small>確認名額與公開狀態</small>
            </Link>
            <Link className="priority-card" to="/admin/knowledge">
              <ScrollText size={22} />
              <span>知識缺口</span>
              <strong>{summary.knowledge_gaps.length}</strong>
              <small>需要補齊的問答主題</small>
            </Link>
            <Link className="priority-card" to="/admin/notifications">
              <Bell size={22} />
              <span>推播提醒</span>
              <strong>{summary.headline_metrics.active_users_7d ?? 0}</strong>
              <small>先檢查同意與用量</small>
            </Link>
            <Link className="priority-card" to="/admin/release">
              <ShieldCheck size={22} />
              <span>發布檢查</span>
              <strong>設定</strong>
              <small>LINE、Rich Menu、公開連結</small>
            </Link>
          </section>

          <section className="admin-workflow-grid" aria-label="建議操作流程">
            {operatingFlow.map(([step, title, body, to]) => (
              <Link className="workflow-card" to={to} key={title}>
                <span>{step}</span>
                <strong>{title}</strong>
                <p>{body}</p>
              </Link>
            ))}
          </section>

          <section className="metric-grid">
            {Object.entries(summary.headline_metrics).map(([key, value]) => (
              <MetricCard key={key} label={labels[key] || key} value={value} />
            ))}
          </section>
          <section className="tool-panel chart-panel">
            <div className="panel-header">
              <div>
                <span className="panel-kicker">活動狀態</span>
                <h2>活動瀏覽與報名轉換</h2>
              </div>
              <Link className="button icon-button" to="/admin/events">
                <ListChecks size={17} />
                <span>查看活動</span>
              </Link>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={summary.event_metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#06C755" name="瀏覽" />
                <Bar dataKey="registrations" fill="#B42318" name="報名" />
              </BarChart>
            </ResponsiveContainer>
          </section>
          <section className="two-column">
            <div className="tool-panel">
              <div className="panel-header compact">
                <div>
                  <span className="panel-kicker">問答觀察</span>
                  <h2>熱門問題類型</h2>
                </div>
              </div>
              {summary.top_ai_intents.map((item) => (
                <div className="list-row" key={item.intent}>
                  <strong>{item.label}</strong>
                  <span>{item.count}</span>
                </div>
              ))}
            </div>
            <div className="tool-panel">
              <div className="panel-header compact">
                <div>
                  <span className="panel-kicker">需要補齊</span>
                  <h2>知識缺口</h2>
                </div>
                <Link className="button icon-button" to="/admin/knowledge">
                  <ScrollText size={17} />
                  <span>補內容</span>
                </Link>
              </div>
              {summary.knowledge_gaps.map((gap) => (
                <div className="list-row" key={gap}>
                  <strong>{gap}</strong>
                  <span>待補</span>
                </div>
              ))}
            </div>
          </section>
          <p className="notice">{summary.notice}</p>
        </>
      ) : null}
    </Shell>
  );
}
