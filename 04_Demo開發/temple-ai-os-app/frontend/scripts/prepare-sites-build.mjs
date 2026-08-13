import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "worker", "sites-static.js");
const target = resolve(root, "dist", "server", "index.js");
const clientDist = resolve(root, "dist", "client");
const appShell = resolve(clientDist, "index.html");

const appRoutes = [
  "site",
  "community",
  "privacy",
  "terms",
  "events",
  "fortune",
  "member",
  "support",
  "admin",
  "admin/events",
  "admin/knowledge",
  "admin/support",
  "admin/notifications",
  "tour/main-hall"
];

await mkdir(dirname(target), { recursive: true });
await copyFile(source, target);

for (const route of appRoutes) {
  const routeIndex = resolve(clientDist, route, "index.html");
  await mkdir(dirname(routeIndex), { recursive: true });
  await copyFile(appShell, routeIndex);
}

console.log(`Prepared Sites worker: ${target}`);
