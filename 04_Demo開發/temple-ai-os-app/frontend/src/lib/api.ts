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

export type AdminLoginResult = {
  access_token: string;
  token_type: string;
  actor: string;
  expires_at: string;
  expires_in_seconds: number;
  legacy_token_fallback?: boolean;
};

function errorMessageFromPayload(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }
  const data = payload as ApiResponse<unknown> & { detail?: unknown };
  if (data.error?.message) {
    return data.error.message;
  }
  if (typeof data.detail === "string") {
    return data.detail;
  }
  if (data.detail) {
    return JSON.stringify(data.detail);
  }
  return fallback;
}

function adminActorHeaderValue() {
  const actor = localStorage.getItem("adminActor") || "admin";
  return encodeURIComponent(actor);
}

export async function adminLogin(username: string, password: string): Promise<AdminLoginResult> {
  const response = await fetch(`${API_BASE_URL}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  const payload = (await response.json().catch(() => null)) as
    | (ApiResponse<AdminLoginResult> & { detail?: unknown })
    | null;
  if (response.status === 404 || response.status === 405) {
    return {
      access_token: password,
      token_type: "bearer",
      actor: username || "admin",
      expires_at: "",
      expires_in_seconds: 0,
      legacy_token_fallback: true
    };
  }
  if (!response.ok || payload?.error) {
    throw new Error(errorMessageFromPayload(payload, response.statusText || "登入失敗"));
  }
  if (!payload?.data?.access_token) {
    throw new Error("登入回應格式不正確");
  }
  return payload.data;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  admin = false
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (admin) {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      throw new Error("請先登入後台");
    }
    headers.set("Authorization", `Bearer ${adminToken}`);
    headers.set("X-Admin-Actor", adminActorHeaderValue());
  }
  const liffIdToken = localStorage.getItem("liffIdToken");
  if (liffIdToken) {
    headers.set("X-LIFF-ID-Token", liffIdToken);
  }
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const payload = (await response.json()) as ApiResponse<T> & { detail?: string };
  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message || payload.detail || response.statusText);
  }
  return payload.data as T;
}
