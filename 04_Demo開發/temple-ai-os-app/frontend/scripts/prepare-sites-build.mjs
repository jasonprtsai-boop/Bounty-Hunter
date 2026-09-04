import { copyFile, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = resolve(root, "dist");
const source = resolve(root, "worker", "sites-static.js");
const target = resolve(distRoot, "server", "index.js");
const clientDist = resolve(distRoot, "client");
const appShell = resolve(clientDist, "index.html");
const requestedSurface = process.argv.includes("--surface")
  ? process.argv[process.argv.indexOf("--surface") + 1]
  : "public";
const surface = requestedSurface === "admin" ? "admin" : "public";

const publicRoutes = [
  "site",
  "community",
  "privacy",
  "terms",
  "events",
  "deities",
  "fortune",
  "member",
  "stickers",
  "support",
  "tour/main-hall"
];
const adminRoutes = [
  "admin",
  "admin/events",
  "admin/deities",
  "admin/knowledge",
  "admin/support",
  "admin/notifications",
  "admin/release"
];
const appRoutes = surface === "admin" ? adminRoutes : publicRoutes;
const routeRoots = new Set([...publicRoutes, ...adminRoutes].map((route) => route.split("/")[0]));

await mkdir(dirname(target), { recursive: true });
const workerSource = await readFile(source, "utf8");
await writeFile(target, workerSource.replaceAll("__SITE_SURFACE__", surface));
await copyFile(appShell, resolve(distRoot, "index.html"));
await rm(resolve(distRoot, "assets"), { recursive: true, force: true });
for (const routeRoot of routeRoots) {
  await rm(resolve(distRoot, routeRoot), { recursive: true, force: true });
}
await cp(resolve(clientDist, "assets"), resolve(distRoot, "assets"), { recursive: true });

for (const route of appRoutes) {
  const routeIndex = resolve(clientDist, route, "index.html");
  const rootRouteIndex = resolve(distRoot, route, "index.html");
  await mkdir(dirname(routeIndex), { recursive: true });
  await mkdir(dirname(rootRouteIndex), { recursive: true });
  await copyFile(appShell, routeIndex);
  await copyFile(appShell, rootRouteIndex);
}

console.log(`Prepared ${surface} Sites worker: ${target}`);
