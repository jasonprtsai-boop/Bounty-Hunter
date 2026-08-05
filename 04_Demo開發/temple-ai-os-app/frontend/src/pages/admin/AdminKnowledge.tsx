import { useEffect, useState } from "react";
import { Shell } from "../../components/Shell";
import { apiFetch } from "../../lib/api";

type KnowledgeDoc = {
  document_id: string;
  title: string;
  status: string;
  source_type: string;
};

export function AdminKnowledge() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);

  useEffect(() => {
    apiFetch<KnowledgeDoc[]>("/api/admin/knowledge-documents", {}, true).then(setDocs).catch(console.error);
  }, []);

  return (
    <Shell title="知識庫" mode="admin">
      <section className="tool-panel">
        {docs.map((doc) => (
          <div className="list-row" key={doc.document_id}>
            <strong>{doc.title}</strong>
            <span>{doc.status}</span>
          </div>
        ))}
      </section>
    </Shell>
  );
}

