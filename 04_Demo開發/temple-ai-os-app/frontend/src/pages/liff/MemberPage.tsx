import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MessageCircle } from "lucide-react";
import { Shell } from "../../components/Shell";
import { StatePanel } from "../../components/StatePanel";
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
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    loadMember();
  }, []);

  async function loadMember() {
    setLoading(true);
    setLoadError("");
    try {
      await getLiffSession();
      const [profileResult, registrationsResult] = await Promise.all([
        apiFetch<MemberProfile>("/api/member/profile"),
        apiFetch<Registration[]>("/api/member/registrations")
      ]);
      setProfile(profileResult);
      setRegistrations(registrationsResult);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "讀取會員資料失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell title="會員中心">
      {loading ? (
        <StatePanel variant="loading" title="正在讀取會員資料" body="系統正在確認你的個人資料與報名紀錄。" />
      ) : loadError ? (
        <StatePanel
          variant="error"
          title="會員資料暫時無法讀取"
          body={loadError}
          actions={
            <button className="button primary" type="button" onClick={loadMember}>
              重新讀取
            </button>
          }
        />
      ) : null}
      {profile ? (
        <section className="detail-panel">
          <h2>{profile.line_display_name}</h2>
          <p>這裡會集中顯示你的活動報名與提醒狀態。</p>
        </section>
      ) : null}
      <section className="tool-panel">
        <h2>報名紀錄</h2>
        {loading || loadError ? null : registrations.length ? (
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
        ) : (
          <div className="empty-action-panel">
            <p>目前還沒有報名紀錄。你可以先查看近期活動，或到客服中心詢問。</p>
            <div className="state-actions">
              <Link className="button primary" to="/events">
                <CalendarDays size={18} />
                查看活動
              </Link>
              <Link className="button" to="/support">
                <MessageCircle size={18} />
                客服中心
              </Link>
            </div>
          </div>
        )}
      </section>
    </Shell>
  );
}
