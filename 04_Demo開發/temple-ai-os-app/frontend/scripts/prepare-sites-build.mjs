import { copyFile, cp, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = resolve(root, "dist");
const source = resolve(root, "worker", "sites-static.js");
const target = resolve(distRoot, "server", "index.js");
const clientDist = resolve(distRoot, "client");
const appShell = resolve(clientDist, "index.html");

const appRoutes = [
  "site",
  "community",
  "privacy",
  "terms",
  "events",
  "fortune",
  "member",
  "stickers",
  "support",
  "admin",
  "admin/events",
  "admin/knowledge",
  "admin/support",
  "admin/notifications",
  "admin/release",
  "tour/main-hall"
];

await mkdir(dirname(target), { recursive: true });
await copyFile(source, target);
await copyFile(appShell, resolve(distRoot, "index.html"));
await rm(resolve(distRoot, "assets"), { recursive: true, force: true });
await cp(resolve(clientDist, "assets"), resolve(distRoot, "assets"), { recursive: true });

for (const route of appRoutes) {
  const routeIndex = resolve(clientDist, route, "index.html");
  const rootRouteIndex = resolve(distRoot, route, "index.html");
  await mkdir(dirname(routeIndex), { recursive: true });
  await mkdir(dirname(rootRouteIndex), { recursive: true });
  await copyFile(appShell, routeIndex);
  await copyFile(appShell, rootRouteIndex);
}

console.log(`Prepared Sites worker: ${target}`);
