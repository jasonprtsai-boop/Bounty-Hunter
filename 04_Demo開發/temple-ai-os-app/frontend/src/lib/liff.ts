import { PUBLIC_SITE_BASE_URL } from "./siteLinks";

export type LiffState = {
  ready: boolean;
  inClient: boolean;
  userId: string;
  displayName: string;
  idToken: string;
};

const KNOWN_INVALID_LIFF_IDS = new Set(["2010938588-VJXpaoyH"]);

function isLocalHost() {
  return typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);
}

function normalizedLiffId(value: string | undefined) {
  const id = (value || "").trim();
  if (!id || KNOWN_INVALID_LIFF_IDS.has(id)) {
    return "";
  }
  return id;
}

export function getConfiguredLiffId() {
  return isLocalHost() ? "" : normalizedLiffId(import.meta.env.VITE_LIFF_ID);
}

export function hasConfiguredLiffId() {
  return Boolean(getConfiguredLiffId());
}

export function liffEntryUrl(path?: string) {
  const targetPath =
    path ||
    (typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}${window.location.hash}`
      : "/");
  const normalizedPath = targetPath.startsWith("/") ? targetPath : `/${targetPath}`;
  const liffId = getConfiguredLiffId();
  if (liffId) {
    return `https://liff.line.me/${liffId}${normalizedPath}`;
  }
  return `${PUBLIC_SITE_BASE_URL.replace(/\/$/, "")}${normalizedPath}`;
}

export function isLineAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");
  return /invalid_liff_token|missing_liff_token|line_login_required/i.test(message);
}

export function hasStoredLiffToken() {
  return typeof window !== "undefined" && Boolean(localStorage.getItem("liffIdToken"));
}

export async function initLiff(): Promise<LiffState> {
  const liffId = getConfiguredLiffId();
  if (!liffId) {
    return {
      ready: true,
      inClient: false,
      userId: "demo_u001",
      displayName: "小安",
      idToken: "demo"
    };
  }
  const { default: liff } = await import("@line/liff");
  await liff.init({ liffId });
  if (!liff.isLoggedIn()) {
    liff.login();
    await new Promise<never>(() => undefined);
  }
  const profile = await liff.getProfile();
  return {
    ready: true,
    inClient: liff.isInClient(),
    userId: profile.userId,
    displayName: profile.displayName,
    idToken: liff.getIDToken() || ""
  };
}
