import { useEffect, useState } from "react";
import { CheckCircle2, Trash2 } from "lucide-react";
import { Shell } from "../../components/Shell";
import { apiFetch } from "../../lib/api";

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

export function AdminSupport() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  return (
    <Shell title="客服工單" mode="admin">
      <section className="tool-panel">
        {message && <p className="notice">{message}</p>}
        {error && <p className="error-text">{error}</p>}
        {tickets.length === 0 ? <p>目前沒有新工單。</p> : null}
        <div className="support-list">
          {tickets.map((ticket) => (
          <div className="support-ticket" key={ticket.ticket_id}>
            <div>
              <div className="card-row">
                <strong>{ticket.subject}</strong>
                <span className={`status ${ticket.status}`}>{ticket.status}</span>
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
                <option value="open">open</option>
                <option value="triaged">triaged</option>
                <option value="waiting_user">waiting_user</option>
                <option value="resolved">resolved</option>
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
