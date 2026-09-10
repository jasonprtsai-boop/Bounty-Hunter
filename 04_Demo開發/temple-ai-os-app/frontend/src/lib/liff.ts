export type LiffState = {
  ready: boolean;
  inClient: boolean;
  userId: string;
  displayName: string;
  idToken: string;
};

const DEFAULT_LIFF_ID = "2010938588-VJXpaoyH";

function isLocalHost() {
  return typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);
}

export function getConfiguredLiffId() {
  return import.meta.env.VITE_LIFF_ID || (isLocalHost() ? "" : DEFAULT_LIFF_ID);
}

export function liffEntryUrl(path?: string) {
  const targetPath =
    path ||
    (typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}${window.location.hash}`
      : "/");
  const normalizedPath = targetPath.startsWith("/") ? targetPath : `/${targetPath}`;
  return `https://liff.line.me/${getConfiguredLiffId() || DEFAULT_LIFF_ID}${normalizedPath}`;
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
