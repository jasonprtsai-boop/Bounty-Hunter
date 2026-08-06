import { useEffect, useState } from "react";
import { Shell } from "../../components/Shell";
import { apiFetch, type Registration } from "../../lib/api";
import { getLiffSession } from "../../lib/session";

type MemberProfile = {
  user_id: string;
  line_display_name: string;
  segment: string;
  interests: string[];
};

export function MemberPage() {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  useEffect(() => {
    getLiffSession()
      .then(async () => {
        const [profileResult, registrationsResult] = await Promise.all([
          apiFetch<MemberProfile>("/api/member/profile"),
          apiFetch<Registration[]>("/api/member/registrations")
        ]);
        setProfile(profileResult);
        setRegistrations(registrationsResult);
      })
      .catch(console.error);
  }, []);

  return (
    <Shell title="會員中心">
      {profile ? (
        <section className="detail-panel">
          <h2>{profile.line_display_name}</h2>
          <p>會員類型：{profile.segment}</p>
          <p>興趣：{profile.interests.join("、") || "尚未設定"}</p>
        </section>
      ) : null}
      <section className="tool-panel">
        <h2>報名紀錄</h2>
        <div className="stack">
          {registrations.map((item) => (
            <div className="list-row" key={item.registration_id}>
              <strong>{item.event_id}</strong>
              <span>
                {item.status} / {item.party_size} 人
              </span>
            </div>
          ))}
        </div>
      </section>
    </Shell>
  );
}
