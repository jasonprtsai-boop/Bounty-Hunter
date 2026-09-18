import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const workspaceDir = "C:\\Users\\user\\Desktop\\賞金獵人\\line";
const skillDir =
  "C:\\Users\\user\\.codex\\plugins\\cache\\openai-primary-runtime\\presentations\\26.905.11957\\skills\\presentations";
const runtimeNodeModules =
  "C:\\Users\\user\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules";
const runtimePython =
  "C:\\Users\\user\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe";

const sourcePath = path.join(
  workspaceDir,
  "01_企畫書",
  "10頁投稿簡報",
  "Temple_AI_OS_2026_LINE_AI_競賽簡報.pptx",
);
const outputDir = path.join(workspaceDir, "07_比賽交付", "投稿PDF");
const finalPath = path.join(outputDir, "Temple_AI_OS_2026_LINE_AI_競賽簡報_送件版.pptx");
const stagingDir = path.join(workspaceDir, ".codex-finalizer", "submission-deck");
const renderDir = path.join(stagingDir, "renders");

const artifactToolPath = path.join(
  runtimeNodeModules,
  "@oai",
  "artifact-tool",
  "dist",
  "artifact_tool.mjs",
);
const utilsPath = path.join(skillDir, "container_tools", "artifact_tool_utils.mjs");

const { FileBlob, PresentationFile } = await import(pathToFileURL(artifactToolPath).href);
const { finalizePresentation } = await import(pathToFileURL(utilsPath).href);

process.env.RUNTIME_NODE_MODULES = runtimeNodeModules;
process.env.RUNTIME_PYTHON = runtimePython;
process.env.RUNTIME_NODE =
  "C:\\Users\\user\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\bin\\node.exe";
process.env.RUNTIME_BIN_DIR =
  "C:\\Users\\user\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\bin\\override";

const replacements = [
  ["正式在線系統", "公開展示系統"],
  ["正式在線部署", "公開 Demo 部署"],
  ["正式部署上線", "公開 Demo 部署"],
  ["正式部署實證站台已全面上線開放體驗", "公開 Demo 站台已部署，可供評審體驗"],
  ["正式上線實證", "公開 Demo 驗證"],
  ["100% 正式上線實證", "公開部署與測試驗證"],
  ["全功能已在線部署並通過完整驗證", "公開 Demo 已部署並完成基礎驗證"],
  ["全功能已在線部署，具備可持續盈利與全台複製擴展性", "公開 Demo 已部署，具備產品可行性與複製潛力"],
  ["台中萬春宮正式在線部署", "萬春宮公開資料示範場景"],
  ["Temple AI OS 已經在萬春宮公開 Demo 部署。", "Temple AI OS 已完成公開 Demo 部署，示範資料取材自萬春宮公開資訊。"],
  ["Temple AI OS 已經在萬春宮正式部署上線。", "Temple AI OS 已完成公開 Demo 部署，示範資料取材自萬春宮公開資訊。"],
  ["台中萬春宮（創立於康熙年間，三百年歷史宮廟）。", "以台中萬春宮公開資料建立服務原型。"],
  ["示範合作場域：台中三百年媽祖名廟「萬春宮」", "示範資料場景：台中萬春宮公開資料"],
  ["示範合作夥伴：台中三百年媽祖名廟「萬春宮」公開 Demo 部署", "示範場景：以台中萬春宮公開資料建立 Demo"],
  ["示範合作夥伴：台中三百年媽祖名廟「萬春宮」正式部署", "示範場景：以台中萬春宮公開資料建立 Demo"],
  ["示範合作場域", "示範資料場景"],
  ["萬春宮實體落地", "萬春宮公開資料 Demo"],
  ["萬春宮實體驗證", "公開 Demo 驗證"],
  ["實證場域", "示範場景"],
  ["實證落地", "Demo 驗證"],
  ["實證成果", "Demo 成果"],
  ["實證成熟度", "Demo 成熟度"],
  ["實證網頁介面", "Demo 網頁介面"],
  ["拒絕紙上談兵：台中萬春宮公開 Demo 部署", "公開 Demo：萬春宮公開資料示範場景"],
  ["拒絕概念簡報：公開 Demo 已部署，具備產品可行性與複製潛力", "公開 Demo、測試與部署紀錄支撐產品可行性"],
  ["正式部署實證站台", "公開 Demo 站台"],
  ["全線暢通運作", "公開路徑檢查通過"],
  ["18 / 18", "20 / 20"],
  ["18 項冒煙檢驗", "20 項公開冒煙檢查"],
  ["18 項全端冒煙測試綠燈", "20 項公開連結冒煙檢查通過"],
  ["冒煙檢驗綠燈", "公開冒煙檢查通過"],
  ["全端 API 與深層路由正常", "API 與深層路由正常"],
];

await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(stagingDir, { recursive: true });
await fs.mkdir(renderDir, { recursive: true });

const presentation = await PresentationFile.importPptx(await FileBlob.load(sourcePath));
const beforeMontage = await presentation.export({ format: "webp", montage: true, scale: 1 });
await fs.writeFile(
  path.join(stagingDir, "before-montage.webp"),
  new Uint8Array(await beforeMontage.arrayBuffer()),
);

const snapshot = await presentation.inspect({
  kind: "textbox,shape,notes",
  include: "id,slide,text",
  maxChars: 250000,
});

let changedShapes = 0;
let replacementHits = 0;
const changedSlideNumbers = new Set();

for (const line of snapshot.ndjson.trim().split("\n")) {
  if (!line.trim()) continue;
  const record = JSON.parse(line);
  if (!record.id || typeof record.text !== "string") continue;
  const target = presentation.resolve(record.id);
  if (!target?.text?.replace) continue;

  let hasChange = false;
  for (const [oldText, newText] of replacements) {
    if (record.text.includes(oldText)) {
      target.text.replace(oldText, newText);
      replacementHits += 1;
      hasChange = true;
    }
  }
  if (hasChange) {
    changedShapes += 1;
    if (record.slide) changedSlideNumbers.add(record.slide);
  }
}

const afterSnapshot = await presentation.inspect({
  kind: "slide,textbox,shape",
  search: "正式部署",
  maxChars: 12000,
});
const residualSnapshot = await presentation.inspect({
  kind: "slide,textbox,shape",
  search: "正式上線",
  maxChars: 12000,
});

await fs.writeFile(path.join(stagingDir, "after-search-正式部署.ndjson"), afterSnapshot.ndjson);
await fs.writeFile(path.join(stagingDir, "after-search-正式上線.ndjson"), residualSnapshot.ndjson);

const candidatePath = path.join(stagingDir, "candidate.pptx");
await (await PresentationFile.exportPptx(presentation)).save(candidatePath);

const result = await finalizePresentation({
  explicitTotalSlideCount: 12,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [],
  workspaceDir,
  candidatePath,
  finalPath,
  pythonExecutable: runtimePython,
  integrityValidatorPath: path.join(skillDir, "container_tools", "inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(skillDir, "container_tools", "inspect_presentation_layout_geometry.py"),
  layoutArgs: ["--expected-slide-size-emu", "12191695,6858000", "--validate-heading-fit"],
  verifyArtifactToolImport: true,
  receiptPath: path.join(stagingDir, "validation.json"),
});

const finalPresentation = await PresentationFile.importPptx(await FileBlob.load(finalPath));
for (let i = 0; i < 12; i += 1) {
  const slide = finalPresentation.slides.getItem(i);
  const preview = await slide.export({ format: "png", scale: 1 });
  await fs.writeFile(
    path.join(renderDir, `slide-${String(i + 1).padStart(2, "0")}.png`),
    new Uint8Array(await preview.arrayBuffer()),
  );
}
const afterMontage = await finalPresentation.export({ format: "webp", montage: true, scale: 1 });
await fs.writeFile(
  path.join(stagingDir, "after-montage.webp"),
  new Uint8Array(await afterMontage.arrayBuffer()),
);

console.log(JSON.stringify({
  finalPath,
  changedShapes,
  replacementHits,
  changedSlides: [...changedSlideNumbers].sort((a, b) => a - b),
  validationStatus: result?.status ?? "unknown",
  renderDir,
}, null, 2));
