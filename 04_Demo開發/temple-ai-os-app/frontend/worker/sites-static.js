const SECURITY_HEADERS = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()"
};
const SITE_SURFACE = "__SITE_SURFACE__";
const DEFAULT_API_UPSTREAM = "https://temple-ai-os-api.onrender.com";
const IMMUTABLE_ASSET_PATTERN = /^\/assets\/[^/]+-[a-zA-Z0-9_-]{8,}\.[a-zA-Z0-9]+$/;

function cacheControlForAssetPath(pathname) {
  if (
    pathname === "/index.html" ||
    pathname.endsWith("/index.html") ||
    pathname === "/version.json" ||
    pathname.endsWith("/version.json") ||
    !pathname.startsWith("/assets/")
  ) {
    return "no-cache, no-store, must-revalidate, max-age=0, s-maxage=0";
  }
  if (IMMUTABLE_ASSET_PATTERN.test(pathname)) {
    return "public, max-age=31536000, immutable";
  }
  if (pathname.startsWith("/assets/")) {
    return "public, max-age=604800, stale-while-revalidate=86400";
  }
  return "no-cache, no-store, must-revalidate, max-age=0, s-maxage=0";
}

function withHeaders(response, cacheControl) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }
  if (cacheControl) {
    headers.set("cache-control", response.status >= 400 ? "no-store" : cacheControl);
    if (cacheControl.includes("no-cache") || cacheControl.includes("no-store") || response.status >= 400) {
      headers.set("pragma", "no-cache");
      headers.set("expires", "0");
      headers.set("surrogate-control", "no-store");
    }
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

async function fetchAsset(request, env) {
  return env.ASSETS.fetch(request);
}

async function fetchApi(request, env) {
  const url = new URL(request.url);
  const upstream = new URL(`${url.pathname}${url.search}`, env.API_UPSTREAM || DEFAULT_API_UPSTREAM);
  const headers = new Headers(request.headers);
  headers.delete("host");
  const init = {
    method: request.method,
    headers,
    redirect: "manual"
  };
  if (!["GET", "HEAD"].includes(request.method)) {
    init.body = request.body;
  }
  return fetch(new Request(upstream.toString(), init));
}

function shouldFallbackToIndex(pathname) {
  if (pathname.startsWith("/assets/")) {
    return false;
  }
  if (pathname.includes(".")) {
    return false;
  }
  return true;
}

function shouldBlockPath(pathname) {
  return SITE_SURFACE === "public" && (pathname === "/admin" || pathname.startsWith("/admin/"));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
      return withHeaders(await fetchApi(request, env), "no-store");
    }
    if (shouldBlockPath(url.pathname)) {
      return withHeaders(new Response("Not found", { status: 404 }), "no-store");
    }

    const assetRequest = shouldFallbackToIndex(url.pathname)
      ? new Request(new URL("/index.html", request.url), request)
      : request;
    const assetPathname = new URL(assetRequest.url).pathname;
    let response = await fetchAsset(assetRequest, env);

    if (response.status === 404 && shouldFallbackToIndex(url.pathname)) {
      response = await fetchAsset(new Request(new URL("/index.html", request.url), request), env);
    }

    return withHeaders(response, cacheControlForAssetPath(assetPathname));
  }
};
