import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { RefreshCw, Search, TicketCheck } from "lucide-react";
import { EventCard } from "../../components/EventCard";
import { Shell } from "../../components/Shell";
import { StatePanel } from "../../components/StatePanel";
import { apiFetch, type EventItem, type RegistrationLookupResult } from "../../lib/api";
import { eventPath } from "../../lib/eventLinks";

const statusLabels: Record<string, string> = {
  confirmed: "已完成報名",
  pending_review: "待人工確認",
  checked_in: "已報到",
  cancelled: "已取消",
  waitlisted: "候補中"
};

export function EventsPage() {
  const location = useLocation();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lookupPhone, setLookupPhone] = useState("");
  const [lookupCode, setLookupCode] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [lookupResults, setLookupResults] = useState<RegistrationLookupResult[] | null>(null);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);

    apiFetch<EventItem[]>("/api/events", { signal: controller.signal })
      .then((items) => {
        if (mounted) {
          setEvents(items);
          setError("");
        }
      })
      .catch((eventError) => {
        if (mounted) {
          setError(
            eventError instanceof Error && eventError.name === "AbortError"
              ? "活動資料讀取逾時"
              : eventError instanceof Error
                ? eventError.message
                : "活動資料暫時無法讀取"
          );
        }
      })
      .finally(() => {
        if (mounted) {
          window.clearTimeout(timeout);
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (location.hash === "#registration-lookup" || location.search.includes("lookup=1")) {
      window.setTimeout(() => {
        document.getElementById("registration-lookup")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [location.hash, location.search]);

  async function lookupRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const phone = lookupPhone.trim();
    const registrationId = lookupCode.trim();
    if (!phone && !registrationId) {
      setLookupError("請輸入手機號碼或報名編號");
      setLookupResults(null);
      return;
    }
    const params = new URLSearchParams();
    if (phone) {
      params.set("phone", phone);
    }
    if (registrationId) {
      params.set("registration_id", registrationId);
    }
    setLookupLoading(true);
    setLookupError("");
    try {
      setLookupResults(await apiFetch<RegistrationLookupResult[]>(`/api/events/registrations/lookup?${params}`));
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : "查詢失敗，請稍後再試");
      setLookupResults(null);
    } finally {
      setLookupLoading(false);
    }
  }

  return (
    <Shell title="活動中心">
      <section className="event-page-hero">
        <div>
          <span className="tag">LINE 活動入口</span>
          <h2>查看近期活動與報名狀態</h2>
          <p>活動中心會集中顯示法會、導覽、講座與志工服務。若目前沒有開放活動，也會清楚標示狀態。</p>
        </div>
        <Link className="button" to="/support">
          詢問活動資訊
        </Link>
      </section>

      <section className="registration-lookup-panel" id="registration-lookup">
        <div className="registration-lookup-copy">
          <span className="tag">報名進度</span>
          <h2>在活動頁直接查報名狀態</h2>
          <p>輸入報名時留下的手機，或輸入報名成功後取得的編號，即可查看活動名稱、日期與目前狀態。</p>
        </div>
        <form className="registration-lookup-form" onSubmit={lookupRegistration}>
          <label>
            手機號碼
            <input
              type="tel"
              inputMode="tel"
              value={lookupPhone}
              onChange={(eventInput) => setLookupPhone(eventInput.target.value)}
              placeholder="例如 0912-345-678"
            />
          </label>
          <label>
            報名編號
            <input
              value={lookupCode}
              onChange={(eventInput) => setLookupCode(eventInput.target.value)}
              placeholder="例如 reg_0004"
            />
          </label>
          <button className="button primary" type="submit" disabled={lookupLoading}>
            {lookupLoading ? <RefreshCw size={18} /> : <Search size={18} />}
            {lookupLoading ? "查詢中" : "查詢進度"}
          </button>
        </form>
        {lookupError ? <p className="error-text" role="alert">{lookupError}</p> : null}
        {lookupResults ? (
          lookupResults.length ? (
            <div className="registration-result-grid" aria-live="polite">
              {lookupResults.map((item) => (
                <article className="registration-result-card" key={item.registration_id}>
                  <TicketCheck size={22} />
                  <div>
                    <strong>{item.event_title}</strong>
                    <span>
                      {item.event_date} {item.event_time}
                    </span>
                    <small>
                      {statusLabels[item.status] || item.status} / {item.party_size} 人
                      {item.masked_phone ? ` / ${item.masked_phone}` : ""}
                    </small>
                  </div>
                  <Link to={eventPath(item.event_id)}>查看活動</Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="registration-result-empty" aria-live="polite">
              查不到符合的報名紀錄，請確認手機格式或改用報名編號。
            </div>
          )
        ) : null}
      </section>

      {loading ? (
        <StatePanel variant="loading" title="正在整理活動資料" body="請稍候，系統正在讀取目前可查看或可報名的活動。" />
      ) : error ? (
        <StatePanel
          variant="error"
          title="活動資料暫時無法讀取"
          body={`${error}。你仍可回到首頁使用參拜問答或客服中心。`}
          actions={
            <>
              <button className="button primary" type="button" onClick={() => window.location.reload()}>
                重新整理
              </button>
              <Link className="button" to="/">
                回首頁
              </Link>
            </>
          }
        />
      ) : events.length > 0 ? (
        <div className="event-list-grid">
          {events.map((event) => (
            <EventCard key={event.event_id} event={event} />
          ))}
        </div>
      ) : (
        <StatePanel
          variant="empty"
          title="目前沒有開放報名活動"
          body="活動中心會在有可報名活動時顯示報名入口。你可以先查看宮廟導覽，或到客服中心留下想詢問的活動內容。"
          actions={
            <>
              <Link className="button primary" to="/tour/main-hall">
                查看宮廟導覽
              </Link>
              <Link className="button" to="/support">
                聯絡客服
              </Link>
            </>
          }
        />
      )}
    </Shell>
  );
}
