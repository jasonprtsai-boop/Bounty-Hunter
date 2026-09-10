const SECURITY_HEADERS = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()"
};
const SITE_SURFACE = "__SITE_SURFACE__";
const DEFAULT_API_UPSTREAM = "https://temple-ai-os-api.onrender.com";

function withHeaders(response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
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
      return withHeaders(await fetchApi(request, env));
    }
    if (shouldBlockPath(url.pathname)) {
      return withHeaders(new Response("Not found", { status: 404 }));
    }

    const assetRequest = shouldFallbackToIndex(url.pathname)
      ? new Request(new URL("/index.html", request.url), request)
      : request;
    let response = await fetchAsset(assetRequest, env);

    if (response.status === 404 && shouldFallbackToIndex(url.pathname)) {
      response = await fetchAsset(new Request(new URL("/index.html", request.url), request), env);
    }

    return withHeaders(response);
  }
};
