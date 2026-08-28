import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, FileSpreadsheet, Headphones, Search, Trash2 } from "lucide-react";
import { Shell } from "../../components/AdminShell";
import { apiFetch } from "../../lib/api";
import { exportRowsToExcel } from "../../lib/excelExport";

type Ticket = {
  ticket_id: string;
  user_id: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
};

const ticketStatusOptions = [
  { value: "open", label: "待處理" },
  { value: "triaged", label: "已分類" },
  { value: "waiting_user", label: "等使用者回覆" },
  { value: "resolved", label: "已完成" }
];

function ticketStatusLabel(status: string) {
  return ticketStatusOptions.find((option) => option.value === status)?.label || status;
}

export function AdminSupport() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [query, setQuery] = useState("");

  useEffect(() => {
    apiFetch<Ticket[]>("/api/admin/support-tickets", {}, true).then(setTickets).catch(console.error);
  }, []);

  async function updateStatus(ticketId: string, status: string) {
    setError("");
    setMessage("");
    try {
      const ticket = await apiFetch<Ticket>(
        `/api/admin/support-tickets/${ticketId}`,
        { method: "PATCH", body: JSON.stringify({ status }) },
        true
      );
      setTickets((current) => current.map((item) => (item.ticket_id === ticketId ? ticket : item)));
      setMessage("已更新");
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失敗");
    }
  }

  async function deleteTicket(ticketId: string) {
    if (!window.confirm("確定刪除此 Demo 工單？")) {
      return;
    }
    setError("");
    setMessage("");
    try {
      await apiFetch<{ deleted: boolean }>(`/api/admin/support-tickets/${ticketId}`, { method: "DELETE" }, true);
      setTickets((current) => current.filter((ticket) => ticket.ticket_id !== ticketId));
      setMessage("已刪除");
    } catch (err) {
      setError(err instanceof Error ? err.message : "刪除失敗");
    }
  }

  const openCount = tickets.filter((ticket) => ticket.status === "open").length;
  const waitingCount = tickets.filter((ticket) => ticket.status === "waiting_user" || ticket.status === "triaged").length;
  const resolvedCount = tickets.filter((ticket) => ticket.status === "resolved").length;
  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && ticket.status !== "resolved") ||
      ticket.status === statusFilter;
    const keyword = query.trim().toLowerCase();
    const matchesQuery =
      !keyword ||
      [ticket.subject, ticket.message, ticket.category, ticket.user_id, ticket.priority]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    return matchesStatus && matchesQuery;
  });

  function exportTickets() {
    exportRowsToExcel({
      filename: "temple-support-tickets",
      sheetName: "客服工單",
      rows: filteredTickets,
      columns: [
        { header: "序號", value: (_ticket, index) => index + 1 },
        { header: "工單 ID", value: (ticket) => ticket.ticket_id },
        { header: "使用者 ID", value: (ticket) => ticket.user_id },
        { header: "分類", value: (ticket) => ticket.category },
        { header: "主旨", value: (ticket) => ticket.subject },
        { header: "內容", value: (ticket) => ticket.message },
        { header: "狀態", value: (ticket) => ticketStatusLabel(ticket.status) },
        { header: "優先度", value: (ticket) => ticket.priority },
        { header: "建立時間", value: (ticket) => ticket.created_at }
      ]
    });
  }

  return (
    <Shell title="客服工單" mode="admin">
      <section className="admin-summary-strip" aria-label="客服摘要">
        <div>
          <Headphones size={20} />
          <span>全部工單</span>
          <strong>{tickets.length}</strong>
        </div>
        <div>
          <Clock3 size={20} />
          <span>待處理</span>
          <strong>{openCount}</strong>
        </div>
        <div>
          <Search size={20} />
          <span>處理中</span>
          <strong>{waitingCount}</strong>
        </div>
        <div>
          <CheckCircle2 size={20} />
          <span>已完成</span>
          <strong>{resolvedCount}</strong>
        </div>
      </section>

      <section className="tool-panel">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">客服佇列</span>
            <h2>依狀態安排下一步</h2>
          </div>
          <div className="panel-actions">
            <span className="status">{filteredTickets.length} 筆</span>
            <button className="button icon-button export-button" type="button" onClick={exportTickets} disabled={filteredTickets.length === 0}>
              <FileSpreadsheet size={17} />
              <span>匯出 Excel</span>
            </button>
          </div>
        </div>
        <div className="admin-filter-bar" aria-label="客服篩選">
          <label>
            搜尋
            <div className="search-field">
              <Search size={17} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="主旨、內容、使用者" />
            </div>
          </label>
          <label>
            狀態
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="active">未完成</option>
              <option value="all">全部狀態</option>
              {ticketStatusOptions.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="export-note">
          <FileSpreadsheet size={16} />
          會匯出目前搜尋與狀態篩選後的客服工單。
        </div>
        {message && <p className="notice">{message}</p>}
        {error && <p className="error-text">{error}</p>}
        {filteredTickets.length === 0 ? <div className="empty-state">目前沒有符合條件的工單。</div> : null}
        <div className="support-list">
          {filteredTickets.map((ticket) => (
          <div className="support-ticket" key={ticket.ticket_id}>
            <div>
              <div className="card-row">
                <strong>{ticket.subject}</strong>
                <span className={`status ${ticket.status}`}>{ticketStatusLabel(ticket.status)}</span>
              </div>
              <p>{ticket.message}</p>
              <small>
                {ticket.category} · {ticket.user_id} · {ticket.created_at}
              </small>
            </div>
            <div className="inline-actions">
              <select
                aria-label={`${ticket.subject} 狀態`}
                value={ticket.status}
                onChange={(event) => updateStatus(ticket.ticket_id, event.target.value)}
              >
                {ticketStatusOptions.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button className="button icon-button" type="button" onClick={() => updateStatus(ticket.ticket_id, "resolved")}>
                <CheckCircle2 size={17} />
                <span>完成</span>
              </button>
              <button className="button icon-button danger" type="button" onClick={() => deleteTicket(ticket.ticket_id)}>
                <Trash2 size={17} />
                <span>刪除</span>
              </button>
            </div>
          </div>
          ))}
        </div>
      </section>
    </Shell>
  );
}
