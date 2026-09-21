import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, ChevronRight, MapPin, RefreshCw, Search, Sparkles, TicketCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { EventCard } from "../../components/EventCard";
import { Shell } from "../../components/Shell";
import { StatePanel } from "../../components/StatePanel";
import { apiFetch, type EventItem, type RegistrationLookupResult } from "../../lib/api";
import { eventPath } from "../../lib/eventLinks";
import { canUsePreviewFallback, isLocalPreview, localPreviewEvents, lookupLocalRegistrations } from "../../lib/localPreviewData";
import { templeExteriorImage } from "../../lib/visualAssets";

const statusLabels: Record<string, string> = {
  confirmed: "已完成報名",
  pending_review: "待確認",
  checked_in: "已報到",
  cancelled: "已取消",
  waitlisted: "候補中"
};

const eventCategoryLinks: Array<{
  label: string;
  title: string;
  body: string;
  icon: LucideIcon;
  to?: string;
  href?: string;
}> = [
  { label: "法會", title: "法會服務", body: "普度、祈福、禮斗", icon: Sparkles, href: "#event-list" },
  { label: "導覽", title: "參拜導覽", body: "第一次來先看這裡", icon: MapPin, to: "/tour/main-hall" },
  { label: "講堂", title: "文化活動", body: "媽祖故事與書法體驗", icon: BookOpen, href: "#event-list" },
  { label: "查詢", title: "報名進度", body: "手機或編號查詢", icon: Search, href: "#registration-lookup" }
];

export function EventsPage() {
  const location = useLocation();
  const [events, setEvents] = useState<EventItem[]>(localPreviewEvents);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lookupPhone, setLookupPhone] = useState("");
  const [lookupCode, setLookupCode] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [lookupResults, setLookupResults] = useState<RegistrationLookupResult[] | null>(null);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 3500);

    apiFetch<EventItem[]>("/api/events", { signal: controller.signal })
      .then((items) => {
        if (mounted && Array.isArray(items) && items.length > 0) {
          setEvents(items);
          setError("");
        }
      })
      .catch((eventError) => {
        if (mounted && (!events || events.length === 0)) {
          if (canUsePreviewFallback()) {
            setEvents(localPreviewEvents);
            setError("");
            return;
          }
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
    if (isLocalPreview()) {
      setLookupResults(lookupLocalRegistrations(phone, registrationId));
      setLookupLoading(false);
      return;
    }
    try {
      setLookupResults(await apiFetch<RegistrationLookupResult[]>(`/api/events/registrations/lookup?${params}`));
    } catch (err) {
      if (canUsePreviewFallback()) {
        setLookupResults(lookupLocalRegistrations(phone, registrationId));
        return;
      }
      setLookupError(err instanceof Error ? err.message : "查詢失敗，請稍後再試");
      setLookupResults(null);
    } finally {
      setLookupLoading(false);
    }
  }

  const featuredEvent = events.find((eventItem) => eventItem.status === "open" && eventItem.requires_registration) || events[0];

  return (
    <Shell title="活動中心">
      <section className="event-page-hero visual-page-hero events-visual-hero">
        <figure>
          <img src={templeExteriorImage} alt="萬春宮實景" loading="eager" decoding="async" />
        </figure>
        <div>
          <span className="tag">活動看板</span>
          <h2>近期活動與報名</h2>
          <p>法會、導覽、講座與服務活動集中查看。</p>
          <div className="primary-route-row">
            <a className="button primary" href="#event-list">
              查看活動
            </a>
            <a className="button" href="#registration-lookup">
              查報名
            </a>
            <Link className="button" to="/support">
              詢問
            </Link>
          </div>
        </div>
      </section>

      <section className="event-reference-rail" aria-label="活動分類">
        {eventCategoryLinks.map((item) => {
          const Icon = item.icon;
          const content = (
            <>
              <span>{item.label}</span>
              <Icon size={20} />
              <strong>{item.title}</strong>
              <small>{item.body}</small>
            </>
          );
          return item.to ? (
            <Link key={item.title} to={item.to}>
              {content}
            </Link>
          ) : (
            <a key={item.title} href={item.href}>
              {content}
            </a>
          );
        })}
      </section>

      {!loading && !error && featuredEvent ? (
        <section className="featured-event-panel" aria-label="本期主推活動">
          <figure>
            <img src={templeExteriorImage} alt={featuredEvent.title} loading="lazy" decoding="async" />
          </figure>
          <div>
            <span className="tag">本期主推</span>
            <h2>{featuredEvent.title}</h2>
            <p>{featuredEvent.summary}</p>
            <dl>
              <div>
                <dt>日期</dt>
                <dd>{featuredEvent.date}</dd>
              </div>
              <div>
                <dt>時間</dt>
                <dd>
                  {featuredEvent.start_time} - {featuredEvent.end_time}
                </dd>
              </div>
              <div>
                <dt>地點</dt>
                <dd>{featuredEvent.location}</dd>
              </div>
            </dl>
            <Link className="button primary" to={eventPath(featuredEvent.event_id)}>
              查看活動 <ChevronRight size={18} />
            </Link>
          </div>
        </section>
      ) : null}

      <section className="registration-lookup-panel" id="registration-lookup">
        <div className="registration-lookup-copy">
          <span className="tag">報名進度</span>
          <h2>查報名狀態</h2>
          <p>輸入手機或報名編號即可查看。</p>
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
        <div className="event-list-grid" id="event-list">
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
