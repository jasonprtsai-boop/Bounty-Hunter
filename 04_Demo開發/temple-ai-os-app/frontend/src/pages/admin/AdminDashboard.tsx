import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MetricCard } from "../../components/MetricCard";
import { Shell } from "../../components/Shell";
import { apiFetch, type DashboardSummary } from "../../lib/api";

const labels: Record<string, string> = {
  line_friends: "LINE 好友",
  active_users_7d: "7 日活躍",
  event_views_7d: "活動瀏覽",
  registrations_total: "報名數",
  ai_questions_7d: "AI 問題",
  knowledge_gap_count: "知識缺口"
};

export function AdminDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    apiFetch<DashboardSummary>("/api/admin/dashboard/summary", {}, true).then(setSummary).catch(console.error);
  }, []);

  return (
    <Shell title="營運總覽" mode="admin">
      {summary ? (
        <>
          <section className="metric-grid">
            {Object.entries(summary.headline_metrics).map(([key, value]) => (
              <MetricCard key={key} label={labels[key] || key} value={value} />
            ))}
          </section>
          <section className="tool-panel chart-panel">
            <h2>活動轉換</h2>
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
              <h2>熱門 AI 意圖</h2>
              {summary.top_ai_intents.map((item) => (
                <div className="list-row" key={item.intent}>
                  <strong>{item.label}</strong>
                  <span>{item.count}</span>
                </div>
              ))}
            </div>
            <div className="tool-panel">
              <h2>知識缺口</h2>
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
      ) : (
        "載入中"
      )}
    </Shell>
  );
}

