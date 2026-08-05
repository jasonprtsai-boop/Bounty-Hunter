import { useEffect, useState } from "react";
import { Shell } from "../../components/Shell";
import { apiFetch } from "../../lib/api";

type NotificationJob = {
  job_id: string;
  type: string;
  status: string;
};

export function AdminNotifications() {
  const [jobs, setJobs] = useState<NotificationJob[]>([]);

  useEffect(() => {
    apiFetch<NotificationJob[]>("/api/admin/notification-jobs", {}, true).then(setJobs).catch(console.error);
  }, []);

  return (
    <Shell title="推播管理" mode="admin">
      <section className="tool-panel">
        {jobs.map((job) => (
          <div className="list-row" key={job.job_id}>
            <strong>{job.type}</strong>
            <span>{job.status}</span>
          </div>
        ))}
      </section>
      <p className="notice">大量主動推播需控管 LINE 訊息用量與使用者同意。</p>
    </Shell>
  );
}

