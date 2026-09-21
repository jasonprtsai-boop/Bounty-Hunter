/**
 * VersionWatcher
 * 
 * Automatically resolves mobile browser / LINE In-App Browser (WKWebView & Android WebView)
 * cache retention by:
 * 1. Listening to `vite:preloadError` (dynamic chunk loading failure on new deployments) and forcing clean reload.
 * 2. Listening to `pageshow` (back-forward cache / suspended WebView restoration) and validating remote version.
 * 3. Listening to `visibilitychange` when returning to foreground.
 * 4. Periodically checking `/version.json` against `__APP_BUILD_TIME__`.
 * 5. Unregistering any legacy Service Workers that may intercept requests.
 */

let isChecking = false;
let watcherInitialized = false;

export async function checkRemoteVersion(): Promise<boolean> {
  if (isChecking) return false;
  isChecking = true;

  try {
    const currentBuildTime = typeof __APP_BUILD_TIME__ === "number" ? __APP_BUILD_TIME__ : 0;
    if (!currentBuildTime) {
      return false;
    }

    const res = await fetch(`/version.json?_t=${Date.now()}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache"
      }
    });

    if (!res.ok) return false;

    const data = (await res.json()) as { buildTime?: number; version?: string };
    const remoteBuildTime = Number(data?.buildTime || 0);

    if (remoteBuildTime > currentBuildTime) {
      console.info(
        `[VersionWatcher] Update detected: remote=${remoteBuildTime} > local=${currentBuildTime}. Auto-reloading...`
      );

      // Prevent reload loops within 10 seconds
      const lastReload = Number(sessionStorage.getItem("app_last_version_reload") || "0");
      if (Date.now() - lastReload > 10000) {
        sessionStorage.setItem("app_last_version_reload", String(Date.now()));
        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set("_v", String(remoteBuildTime));
        window.location.replace(nextUrl.toString());
        return true;
      }
    }
  } catch {
    // Ignore network dropouts silently
  } finally {
    isChecking = false;
  }

  return false;
}

export function initVersionWatcher() {
  if (watcherInitialized || typeof window === "undefined") {
    return;
  }
  watcherInitialized = true;

  // 1. Proactively unregister any legacy service workers
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) {
        reg.unregister().catch(() => {});
      }
    }).catch(() => {});
  }

  // 2. Intercept Vite chunk load errors when new assets replace old hashes
  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();
    console.warn("[VersionWatcher] Chunk load error detected. Refreshing to load latest manifest...");
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("_v", String(Date.now()));
    window.location.replace(nextUrl.toString());
  });

  // 3. Detect restoration from mobile bfcache (back-forward cache in Safari/LINE)
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      checkRemoteVersion();
    }
  });

  // 4. Detect app returning from background / tab focus
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      checkRemoteVersion();
    }
  });

  // 5. Initial background check after short delay (let initial page render finish first)
  setTimeout(() => {
    checkRemoteVersion();
  }, 1500);

  // 6. Periodic heartbeat check every 3 minutes
  setInterval(() => {
    if (document.visibilityState === "visible") {
      checkRemoteVersion();
    }
  }, 3 * 60 * 1000);
}
