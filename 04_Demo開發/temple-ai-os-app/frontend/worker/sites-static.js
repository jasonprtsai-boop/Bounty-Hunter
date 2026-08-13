const SECURITY_HEADERS = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()"
};

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

function shouldFallbackToIndex(pathname) {
  if (pathname.startsWith("/assets/")) {
    return false;
  }
  if (pathname.includes(".")) {
    return false;
  }
  return true;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
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
