import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const workspaceDir = "C:\\Users\\user\\Desktop\\賞金獵人\\line";
const runtimeNodeModules =
  "C:\\Users\\user\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules";
const finalPath = path.join(
  workspaceDir,
  "07_比賽交付",
  "投稿PDF",
  "Temple_AI_OS_2026_LINE_AI_競賽簡報_送件版.pptx",
);
const outputDir = path.join(workspaceDir, ".codex-finalizer", "submission-deck", "renders");
const montagePath = path.join(workspaceDir, ".codex-finalizer", "submission-deck", "after-montage.webp");
const artifactToolPath = path.join(
  runtimeNodeModules,
  "@oai",
  "artifact-tool",
  "dist",
  "artifact_tool.mjs",
);

const { FileBlob, PresentationFile } = await import(pathToFileURL(artifactToolPath).href);
await fs.mkdir(outputDir, { recursive: true });

const presentation = await PresentationFile.importPptx(await FileBlob.load(finalPath));
for (let i = 0; i < 12; i += 1) {
  const slide = presentation.slides.getItem(i);
  const preview = await slide.export({ format: "png", scale: 1 });
  await fs.writeFile(
    path.join(outputDir, `slide-${String(i + 1).padStart(2, "0")}.png`),
    new Uint8Array(await preview.arrayBuffer()),
  );
}

const montage = await presentation.export({ format: "webp", montage: true, scale: 1 });
await fs.writeFile(montagePath, new Uint8Array(await montage.arrayBuffer()));

console.log(JSON.stringify({ finalPath, outputDir, montagePath, renderedSlides: 12 }, null, 2));
