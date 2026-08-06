const LOCAL_API_BASE_URL = "http://localhost:8000";
const DEPLOYED_API_BASE_URL = "https://temple-ai-os-api.onrender.com";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? DEPLOYED_API_BASE_URL
    : LOCAL_API_BASE_URL);

export type ApiResponse<T> = {
  data: T | null;
  error?: { code: string; message: string } | null;
  meta?: Record<string, unknown>;
};

export type TempleProfile = {
  temple_id: string;
  name: string;
  aliases: string[];
  main_deity: string;
  address: string;
  phone: string;
  image?: { url: string; source: string; license: string };
  demo_positioning: string;
};

export type EventItem = {
  event_id: string;
  title: string;
  category: string;
  source_type: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  address: string;
  summary: string;
  requires_registration: boolean;
  capacity: number | null;
  registered_count: number;
  status: string;
  registration_fields: string[];
  payment_policy?: string;
  demo_note: string;
};

export type Registration = {
  registration_id: string;
  event_id: string;
  user_id: string;
  status: string;
  party_size: number;
  reminder_opt_in: boolean;
  created_at?: string;
  contact_name?: string;
  phone?: string;
  note?: string;
};

export type ChatReply = {
  intent: string;
  reply: string;
  sources: Array<Record<string, string>>;
  events: EventItem[];
  demo_notice: string;
};

export type DashboardSummary = {
  snapshot_date: string;
  notice: string;
  headline_metrics: Record<string, number>;
  event_metrics: Array<Record<string, number | string>>;
  top_ai_intents: Array<{ intent: string; label: string; count: number }>;
  knowledge_gaps: string[];
};

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  admin = false
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (admin) {
    headers.set(
      "Authorization",
      `Bearer ${localStorage.getItem("adminToken") || "temple-ai-os-admin-demo"}`
    );
  }
  const liffIdToken = localStorage.getItem("liffIdToken");
  if (liffIdToken) {
    headers.set("X-LIFF-ID-Token", liffIdToken);
  }
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message || response.statusText);
  }
  return payload.data as T;
}
