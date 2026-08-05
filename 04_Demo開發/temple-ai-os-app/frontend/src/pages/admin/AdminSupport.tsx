import { useEffect, useState } from "react";
import { Shell } from "../../components/Shell";
import { apiFetch } from "../../lib/api";

type Ticket = {
  ticket_id: string;
  user_id: string;
  category: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
};

export function AdminSupport() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    apiFetch<Ticket[]>("/api/admin/support-tickets", {}, true).then(setTickets).catch(console.error);
  }, []);

  return (
    <Shell title="客服工單" mode="admin">
      <section className="tool-panel">
        {tickets.length === 0 ? <p>目前沒有新工單。</p> : null}
        {tickets.map((ticket) => (
          <div className="list-row" key={ticket.ticket_id}>
            <strong>{ticket.subject}</strong>
            <span>{ticket.status}</span>
          </div>
        ))}
      </section>
    </Shell>
  );
}

