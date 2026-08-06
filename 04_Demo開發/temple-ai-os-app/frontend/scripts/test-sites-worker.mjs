import { readFile } from "node:fs/promises";
import { extname, normalize, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const dist = resolve(root, "dist");
const workerPath = resolve(dist, "server", "index.js");
const { default: worker } = await import(`${pathToFileURL(workerPath).href}?t=${Date.now()}`);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

function resolveAsset(pathname) {
  const relative = normalize(pathname === "/" ? "index.html" : pathname.replace(/^\/+/, ""));
  const fullPath = resolve(dist, relative);
  if (!fullPath.startsWith(`${dist}${sep}`) && fullPath !== dist) {
    throw new Error(`Unsafe asset path: ${pathname}`);
  }
  return fullPath;
}

const env = {
  ASSETS: {
    async fetch(request) {
      const url = new URL(request.url);
      try {
        const bytes = await readFile(resolveAsset(url.pathname));
        return new Response(bytes, {
          headers: { "content-type": contentTypes[extname(url.pathname)] || "application/octet-stream" }
        });
      } catch {
        return new Response("Not found", { status: 404 });
      }
    }
  }
};

for (const pathname of ["/", "/site", "/community", "/privacy", "/terms"]) {
  const response = await worker.fetch(new Request(`https://example.test${pathname}`), env);
  if (response.status !== 200) {
    throw new Error(`${pathname} returned ${response.status}`);
  }
  const html = await response.text();
  if (!html.includes("Temple AI OS")) {
    throw new Error(`${pathname} did not return the app shell`);
  }
}

console.log("Sites worker routes OK");
