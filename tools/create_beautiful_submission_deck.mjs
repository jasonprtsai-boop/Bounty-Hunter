import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const workspaceDir = "C:\\Users\\user\\Desktop\\賞金獵人\\line";
const skillDir =
  "C:\\Users\\user\\.codex\\plugins\\cache\\openai-primary-runtime\\presentations\\26.905.11957\\skills\\presentations";
const runtimeNode =
  "C:\\Users\\user\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\bin\\node.exe";
const runtimeNodeModules =
  "C:\\Users\\user\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules";
const runtimePython =
  "C:\\Users\\user\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe";
const runtimeBinDir =
  "C:\\Users\\user\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\bin\\override";

process.env.RUNTIME_NODE = runtimeNode;
process.env.RUNTIME_NODE_MODULES = runtimeNodeModules;
process.env.RUNTIME_PYTHON = runtimePython;
process.env.RUNTIME_BIN_DIR = runtimeBinDir;

const artifactToolPath = path.join(
  runtimeNodeModules,
  "@oai",
  "artifact-tool",
  "dist",
  "artifact_tool.mjs",
);
const utilsPath = path.join(skillDir, "container_tools", "artifact_tool_utils.mjs");

const { Presentation, PresentationFile } = await import(pathToFileURL(artifactToolPath).href);
const { finalizePresentation, resolvePresentationFont } = await import(pathToFileURL(utilsPath).href);

const outputDir = path.join(workspaceDir, "07_比賽交付", "投稿PDF");
const finalPath = path.join(outputDir, "Temple_AI_OS_2026_LINE_AI_競賽簡報_精美送件版_v6.pptx");
const stagingDir = path.join(workspaceDir, ".codex-finalizer", "beautiful-submission-deck-v6");
const renderDir = path.join(stagingDir, "renders");

const deckDir = path.join(workspaceDir, "01_企畫書", "10頁投稿簡報");
const uiDir = path.join(deckDir, "ui_screenshots");
const demoAssets = path.join(workspaceDir, "04_Demo開發", "temple-ai-os-app", "assets");
const researchAssets = path.join(workspaceDir, "03_素材與圖片", "research-assets", "temple-ai-os");
const qrAssets = path.join(workspaceDir, "07_比賽交付", "qr");

const imagePaths = {
  cover: path.join(workspaceDir, "03_素材與圖片", "research-assets", "temple_ai_os_pitch_cover_2026.jpg"),
  solution: path.join(deckDir, "slide2_solution.jpg"),
  lineChat: path.join(uiDir, "mockup_chat_menu.png"),
  register: path.join(uiDir, "ui_register.png"),
  events: path.join(uiDir, "ui_events.png"),
  fortune: path.join(uiDir, "ui_fortune.png"),
  jiao: path.join(uiDir, "ui_jiao.png"),
  adminSettings: path.join(uiDir, "ui_admin_settings_full.png"),
  adminDashboard: path.join(uiDir, "full_admin_dashboard.png"),
  richMenu: path.join(demoAssets, "rich-menu", "main-2500x1686.png"),
  stickers: path.join(demoAssets, "stickers", "spring-fortune-messenger", "preview-sheet.png"),
  logo: path.join(researchAssets, "temple_ai_os_logo.png"),
  journey: path.join(researchAssets, "journey.png"),
  architecture: path.join(researchAssets, "architecture.png"),
  rag: path.join(researchAssets, "rag_agent.png"),
  qrLine: path.join(qrAssets, "line-add-friend.png"),
  qrLiff: path.join(qrAssets, "liff-demo.png"),
};

const W = 1280;
const H = 720;
const FONT = resolvePresentationFont({ fontFamily: "Noto Sans TC" });

const C = {
  bg: "#FBF7EF",
  paper: "#FFFDF8",
  ink: "#1F2933",
  sub: "#5C6670",
  faint: "#E9DDC9",
  red: "#B9251C",
  redDark: "#7F1D1D",
  gold: "#C79A35",
  green: "#06C755",
  jade: "#16815F",
  blue: "#244765",
  cream: "#FFF4D8",
  line: "#D9C8A7",
};

function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "image/png";
}

async function mustReadImage(file) {
  await fs.access(file);
  return await fs.readFile(file);
}

function addText(slide, text, position, style = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = text;
  shape.text.style = {
    typeface: FONT,
    fontSize: style.fontSize ?? 24,
    bold: style.bold ?? false,
    color: style.color ?? C.ink,
    alignment: style.alignment ?? "left",
    verticalAlignment: style.verticalAlignment ?? "top",
    lineSpacing: style.lineSpacing ?? 1.05,
    autoFit: style.autoFit ?? "shrinkText",
    insets: style.insets ?? { top: 0, right: 0, bottom: 0, left: 0 },
  };
  return shape;
}

function addBox(slide, position, fill, line = "none", options = {}) {
  return slide.shapes.add({
    geometry: options.geometry ?? "roundRect",
    position,
    fill,
    line:
      line === "none"
        ? { style: "solid", fill: "none", width: 0 }
        : { style: "solid", fill: line, width: options.lineWidth ?? 1 },
    borderRadius: options.borderRadius ?? 18,
    shadow: options.shadow ?? "shadow-none",
  });
}

function addRule(slide, left, top, width, color = C.gold, weight = 2) {
  return slide.shapes.add({
    geometry: "line",
    position: { left, top, width, height: 0 },
    fill: "none",
    line: { style: "solid", fill: color, width: weight },
  });
}

async function addImage(slide, file, position, options = {}) {
  const blob = await mustReadImage(file);
  const geometry = options.geometry ?? "roundRect";
  const imageOptions = {
    blob,
    contentType: contentType(file),
    alt: options.alt ?? path.basename(file),
    fit: options.fit ?? "cover",
    crop: options.crop,
    geometry,
    position,
  };
  if (geometry === "rect" || geometry === "roundRect") {
    imageOptions.borderRadius = options.borderRadius ?? 18;
  }
  return slide.images.add(imageOptions);
}

async function addFramedImage(slide, file, position, options = {}) {
  addBox(
    slide,
    {
      left: position.left - 10,
      top: position.top - 10,
      width: position.width + 20,
      height: position.height + 20,
    },
    options.frameFill ?? "#FFFFFF",
    options.frameLine ?? C.faint,
    { borderRadius: options.frameRadius ?? 24, shadow: options.shadow ?? "shadow-md" },
  );
  return await addImage(slide, file, position, {
    alt: options.alt,
    fit: options.fit ?? "cover",
    crop: options.crop,
    geometry: "roundRect",
    borderRadius: options.radius ?? 16,
  });
}

function addHeader(slide, page, section, title, subtitle = "") {
  addText(slide, `P.${String(page).padStart(2, "0")} / 10`, { left: 66, top: 34, width: 120, height: 24 }, {
    fontSize: 15,
    bold: true,
    color: C.red,
  });
  addText(slide, section, { left: 192, top: 34, width: 620, height: 24 }, {
    fontSize: 15,
    bold: true,
    color: C.sub,
  });
  addText(slide, title, { left: 66, top: 78, width: 820, height: 58 }, {
    fontSize: 34,
    bold: true,
    color: C.ink,
  });
  if (subtitle) {
    addText(slide, subtitle, { left: 66, top: 134, width: 780, height: 42 }, {
      fontSize: 17,
      color: C.sub,
      lineSpacing: 1.2,
    });
  }
  addRule(slide, 66, 188, 184, C.red, 4);
  addFooter(slide);
}

function addFooter(slide) {
  addRule(slide, 66, 674, 1148, "#E7D8BC", 1);
  addText(slide, "Temple AI OS｜2026 LINE AI 創新創業競賽｜公開 Demo 送件版", {
    left: 66,
    top: 688,
    width: 700,
    height: 20,
  }, {
    fontSize: 10,
    color: "#8D7A5D",
  });
  addText(slide, "示範資料採自公開資訊", {
    left: 810,
    top: 688,
    width: 404,
    height: 20,
  }, {
    fontSize: 10,
    color: "#8D7A5D",
    alignment: "right",
  });
}

function addMetric(slide, value, label, position, color = C.red) {
  addText(slide, value, { left: position.left, top: position.top, width: position.width, height: 46 }, {
    fontSize: 39,
    bold: true,
    color,
    alignment: "center",
  });
  addRule(slide, position.left + 24, position.top + 58, position.width - 48, color, 2);
  addText(slide, label, { left: position.left, top: position.top + 72, width: position.width, height: 50 }, {
    fontSize: 16,
    bold: true,
    color: C.ink,
    alignment: "center",
    lineSpacing: 1.1,
  });
}

function addSimpleCard(slide, title, body, position, options = {}) {
  addBox(slide, position, options.fill ?? C.paper, options.line ?? C.faint, {
    borderRadius: options.borderRadius ?? 20,
    shadow: options.shadow ?? "shadow-sm",
  });
  addText(slide, title, { left: position.left + 22, top: position.top + 18, width: position.width - 44, height: 32 }, {
    fontSize: options.titleSize ?? 19,
    bold: true,
    color: options.color ?? C.red,
  });
  addText(slide, body, { left: position.left + 22, top: position.top + 58, width: position.width - 44, height: position.height - 76 }, {
    fontSize: options.bodySize ?? 16,
    color: C.sub,
    lineSpacing: 1.2,
  });
}

function addStep(slide, number, title, body, position, color = C.red) {
  addText(slide, number, { left: position.left, top: position.top, width: 52, height: 52 }, {
    fontSize: 34,
    bold: true,
    color,
    alignment: "center",
  });
  addText(slide, title, { left: position.left + 70, top: position.top + 2, width: position.width - 70, height: 28 }, {
    fontSize: 19,
    bold: true,
    color: C.ink,
  });
  addText(slide, body, { left: position.left + 70, top: position.top + 34, width: position.width - 70, height: 54 }, {
    fontSize: 15,
    color: C.sub,
    lineSpacing: 1.16,
  });
}

function addBadge(slide, text, position, fill = C.cream, color = C.red) {
  addBox(slide, position, fill, "none", { borderRadius: 18 });
  addText(slide, text, { left: position.left + 12, top: position.top + 6, width: position.width - 24, height: position.height - 10 }, {
    fontSize: 14,
    bold: true,
    color,
    alignment: "center",
    verticalAlignment: "middle",
  });
}

function addSlideNote(slide, note) {
  try {
    slide.speakerNotes.textFrame.setText(note);
  } catch {
    // Speaker notes are useful but not required for the exported deck.
  }
}

async function buildDeck() {
  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(stagingDir, { recursive: true });
  await fs.mkdir(renderDir, { recursive: true });

  const presentation = Presentation.create({ slideSize: { width: W, height: H } });
  presentation.theme.colorScheme = {
    name: "Temple Editorial",
    themeColors: {
      accent1: C.red,
      accent2: C.gold,
      accent3: C.green,
      accent4: C.blue,
      accent5: C.jade,
      accent6: C.cream,
      bg1: C.paper,
      bg2: C.bg,
      tx1: C.ink,
      tx2: C.sub,
      dk1: "#000000",
      dk2: C.ink,
      lt1: "#FFFFFF",
      lt2: C.bg,
      hlink: C.blue,
      folHlink: C.redDark,
    },
  };

  const cover = presentation.slides.add();
  await addImage(cover, imagePaths.cover, { left: 0, top: 0, width: W, height: H }, {
    alt: "Temple AI OS cover visual",
    fit: "cover",
    geometry: "rect",
    borderRadius: 0,
  });
  addBox(cover, { left: 0, top: 0, width: W, height: H }, "#000000/20", "none", { geometry: "rect", borderRadius: 0 });
  addBox(cover, { left: 62, top: 504, width: 568, height: 130 }, "#FFFDF8/88", "none", {
    geometry: "rect",
    borderRadius: 0,
  });
  addText(cover, "2026 LINE AI 創新創業競賽", { left: 86, top: 526, width: 360, height: 26 }, {
    fontSize: 16,
    bold: true,
    color: C.red,
  });
  addText(cover, "Temple AI OS", { left: 84, top: 554, width: 430, height: 54 }, {
    fontSize: 41,
    bold: true,
    color: C.ink,
  });
  addText(cover, "智慧宮廟 AI 服務入口與數位營運平台", { left: 86, top: 608, width: 500, height: 30 }, {
    fontSize: 19,
    bold: true,
    color: C.sub,
  });
  addSlideNote(cover, "封面使用既有視覺素材。送件主張為公開 Demo 與公開資料示範場景。");

  const s1 = presentation.slides.add();
  s1.background.fill = C.bg;
  addHeader(s1, 1, "市場需求", "宮廟數位服務缺口", "信眾已經在 LINE 裡，宮廟服務仍分散在電話、紙本與現場口耳相傳");
  await addFramedImage(s1, imagePaths.events, { left: 690, top: 132, width: 420, height: 440 }, {
    alt: "Demo activity center screenshot",
    fit: "cover",
    crop: { left: 0.02, top: 0.04, right: 0.02, bottom: 0.18 },
  });
  addBox(s1, { left: 1020, top: 430, width: 184, height: 126 }, "#B9251C/92", "none", { borderRadius: 22, shadow: "shadow-md" });
  addText(s1, "核心缺口", { left: 1042, top: 454, width: 140, height: 26 }, {
    fontSize: 18,
    bold: true,
    color: "#FFFFFF",
    alignment: "center",
  });
  addText(s1, "入口分散\n資料斷裂\n志工耗時", { left: 1042, top: 486, width: 140, height: 60 }, {
    fontSize: 19,
    bold: true,
    color: "#FFFFFF",
    alignment: "center",
    lineSpacing: 1.12,
  });
  addStep(s1, "01", "信眾找不到入口", "參拜規矩、活動資訊、交通與客服分散，第一次到訪者需要有人帶路。", {
    left: 86,
    top: 238,
    width: 500,
    height: 90,
  }, C.red);
  addStep(s1, "02", "廟方行政重複", "報名、通知、查詢與名冊整理仰賴人工，越接近祭典越容易出錯。", {
    left: 86,
    top: 358,
    width: 500,
    height: 90,
  }, C.gold);
  addStep(s1, "03", "文化知識難延續", "神明由來、建築故事與儀式禁忌缺少可搜尋、可更新、可審核的數位載體。", {
    left: 86,
    top: 478,
    width: 500,
    height: 90,
  }, C.blue);
  addSlideNote(s1, "本頁使用實際 Demo 活動中心截圖。市場問題來自企畫書與產品需求整理。");

  const s2 = presentation.slides.add();
  s2.background.fill = C.paper;
  addHeader(s2, 2, "產品定位", "LINE 裡的智慧宮廟入口", "以官方帳號為主入口，把導覽、問答、活動與後台營運連成一條服務路徑");
  await addFramedImage(s2, imagePaths.lineChat, { left: 760, top: 112, width: 276, height: 548 }, {
    alt: "LINE chat menu mockup",
    fit: "cover",
    frameFill: C.bg,
  });
  addSimpleCard(s2, "信眾端", "掃碼加入後，直接在聊天室進入參拜指南、文化解籤、法會報名、宮廟動態與客服。", {
    left: 86,
    top: 236,
    width: 290,
    height: 142,
  }, { color: C.green, fill: "#F2FFF8" });
  addSimpleCard(s2, "廟方端", "後台集中管理活動、公告、報名名冊、客服追蹤與知識內容，降低日常行政負擔。", {
    left: 408,
    top: 236,
    width: 290,
    height: 142,
  }, { color: C.red });
  addSimpleCard(s2, "文化端", "把公開文史資料、參拜流程與民俗互動整理為可查詢、可審核、可持續更新的知識庫。", {
    left: 86,
    top: 412,
    width: 612,
    height: 132,
  }, { color: C.gold, fill: "#FFF8E7" });
  addBadge(s2, "LINE OA", { left: 86, top: 582, width: 110, height: 34 }, "#E9FFF1", C.green);
  addBadge(s2, "Rich Menu", { left: 212, top: 582, width: 130, height: 34 }, "#FFF4D8", C.red);
  addBadge(s2, "LIFF", { left: 358, top: 582, width: 88, height: 34 }, "#E9FFF1", C.green);
  addBadge(s2, "Messaging API", { left: 462, top: 582, width: 154, height: 34 }, "#EEF5FF", C.blue);
  addBadge(s2, "Admin Dashboard", { left: 632, top: 582, width: 180, height: 34 }, "#FFF4D8", C.gold);
  addSlideNote(s2, "本頁為產品定位說明。右側為 Demo LINE 入口截圖。");

  const s3 = presentation.slides.add();
  s3.background.fill = C.bg;
  addHeader(s3, 3, "LINE 生態", "官方帳號成為服務大廳", "Rich Menu 負責分流，LIFF 負責表單，Messaging API 負責提醒與回覆");
  await addFramedImage(s3, imagePaths.richMenu, { left: 86, top: 232, width: 522, height: 352 }, {
    alt: "Rich Menu visual",
    fit: "cover",
    frameFill: "#FFFFFF",
  });
  addText(s3, "六格入口覆蓋高頻需求", { left: 86, top: 202, width: 360, height: 26 }, {
    fontSize: 19,
    bold: true,
    color: C.red,
  });
  addText(s3, "參拜指南、解籤諮詢、法會報名、AI 分析、宮廟動態與客服，全部從同一個 LINE 入口開始。", {
    left: 650,
    top: 236,
    width: 470,
    height: 66,
  }, {
    fontSize: 22,
    bold: true,
    color: C.ink,
    lineSpacing: 1.18,
  });
  addStep(s3, "1", "點選 Rich Menu", "信眾不用記網址，依需求點選圖文選單。", {
    left: 650,
    top: 342,
    width: 450,
    height: 76,
  }, C.green);
  addStep(s3, "2", "開啟 LIFF 或 Flex Message", "活動與表單保留 LINE 內的使用情境。", {
    left: 650,
    top: 438,
    width: 450,
    height: 76,
  }, C.red);
  addStep(s3, "3", "回到通知與客服", "報名後可查進度，也能由 Messaging API 發送提醒。", {
    left: 650,
    top: 534,
    width: 450,
    height: 76,
  }, C.gold);
  addSlideNote(s3, "本頁強調 LINE 生態結合度。Rich Menu 圖檔來自本專案產生素材。");

  const s4 = presentation.slides.add();
  s4.background.fill = C.paper;
  addHeader(s4, 4, "Demo 功能", "LIFF 活動報名", "聊天室內完成活動瀏覽、資料填寫與提醒勾選，後台同步管理名額與名冊");
  await addFramedImage(s4, imagePaths.register, { left: 104, top: 208, width: 246, height: 400 }, {
    alt: "LIFF registration screenshot",
    fit: "cover",
    crop: { left: 0.02, top: 0, right: 0.02, bottom: 0.02 },
    frameFill: C.bg,
  });
  await addFramedImage(s4, imagePaths.events, { left: 400, top: 208, width: 280, height: 400 }, {
    alt: "Event center screenshot",
    fit: "cover",
    crop: { left: 0.02, top: 0, right: 0.02, bottom: 0.22 },
    frameFill: "#FFFFFF",
  });
  addText(s4, "報名流程收斂成三步", { left: 840, top: 218, width: 320, height: 34 }, {
    fontSize: 25,
    bold: true,
    color: C.ink,
  });
  addStep(s4, "01", "看活動", "活動中心展示法會、導覽與講堂內容。", { left: 840, top: 282, width: 350, height: 72 }, C.red);
  addStep(s4, "02", "填表單", "姓名、人數、提醒選項在 LIFF 頁面完成。", { left: 840, top: 374, width: 350, height: 72 }, C.gold);
  addStep(s4, "03", "進後台", "報名資料進入後台清冊，廟方可查詢與匯出。", { left: 840, top: 466, width: 350, height: 72 }, C.green);
  addBadge(s4, "LIFF v2", { left: 840, top: 582, width: 96, height: 34 }, "#E9FFF1", C.green);
  addBadge(s4, "React", { left: 952, top: 582, width: 92, height: 34 }, "#EEF5FF", C.blue);
  addBadge(s4, "FastAPI", { left: 1060, top: 582, width: 112, height: 34 }, "#FFF4D8", C.red);
  addSlideNote(s4, "本頁使用實際 Demo 的 LIFF 報名與活動中心截圖。");

  const s5 = presentation.slides.add();
  s5.background.fill = C.bg;
  addHeader(s5, 5, "文化互動", "抽籤與擲筊變成可理解流程", "保留民俗儀式的節奏，同時用清楚介面降低第一次使用者的心理門檻");
  await addFramedImage(s5, imagePaths.fortune, { left: 96, top: 208, width: 248, height: 418 }, {
    alt: "Fortune page screenshot",
    fit: "cover",
    frameFill: "#FFFFFF",
  });
  await addFramedImage(s5, imagePaths.jiao, { left: 386, top: 208, width: 248, height: 418 }, {
    alt: "Jiao page screenshot",
    fit: "cover",
    frameFill: "#FFFFFF",
  });
  addText(s5, "三個安全邊界", { left: 790, top: 228, width: 300, height: 34 }, {
    fontSize: 27,
    bold: true,
    color: C.ink,
  });
  addSimpleCard(s5, "不斷言吉凶", "籤詩解讀採正向提醒，避免對人生重大決策做絕對判斷。", {
    left: 790,
    top: 288,
    width: 340,
    height: 96,
  }, { color: C.red, fill: C.paper });
  addSimpleCard(s5, "回到正式窗口", "涉及活動、服務與現場細節時，提醒以廟方公告與現場人員為準。", {
    left: 790,
    top: 402,
    width: 340,
    height: 96,
  }, { color: C.gold, fill: C.paper });
  addSimpleCard(s5, "保留文化語氣", "以白話解釋流程，不把民俗互動包裝成神諭或絕對預測。", {
    left: 790,
    top: 516,
    width: 340,
    height: 96,
  }, { color: C.blue, fill: C.paper });
  addSlideNote(s5, "本頁使用實際 Demo 的抽籤與擲筊頁面截圖。");

  const s6 = presentation.slides.add();
  s6.background.fill = C.paper;
  addHeader(s6, 6, "AI 展示", "AI 文史問答安全邊界", "把公開資料整理成可搜尋知識，讓 AI 回答有依據、有分寸、可被廟方維護");
  await addFramedImage(s6, imagePaths.rag, { left: 82, top: 226, width: 650, height: 250 }, {
    alt: "RAG agent flow diagram",
    fit: "contain",
    frameFill: "#FFFFFF",
  });
  addText(s6, "內容治理原則", { left: 808, top: 226, width: 320, height: 34 }, {
    fontSize: 27,
    bold: true,
    color: C.ink,
  });
  addStep(s6, "1", "先找資料", "以公開文史與服務資料作為回答基礎。", { left: 808, top: 286, width: 356, height: 68 }, C.green);
  addStep(s6, "2", "再生成回覆", "AI 只回答可追溯內容，降低錯答與幻想風險。", { left: 808, top: 376, width: 356, height: 68 }, C.red);
  addStep(s6, "3", "保留人工審核", "文化與儀式資料由廟方或維護者更新。", { left: 808, top: 466, width: 356, height: 68 }, C.gold);
  addBox(s6, { left: 84, top: 530, width: 652, height: 78 }, "#FFF8E7", C.line, { borderRadius: 18 });
  addText(s6, "AI 不扮演神明、不宣稱神諭、不處理醫療投資等敏感決策。這條邊界會直接寫進系統提示詞與安全回覆規則。", {
    left: 110,
    top: 550,
    width: 600,
    height: 40,
  }, {
    fontSize: 18,
    bold: true,
    color: C.redDark,
    lineSpacing: 1.15,
  });
  addSlideNote(s6, "本頁使用本專案 RAG 與任務型 Agent 架構圖，說明 AI 安全邊界。");

  const s7 = presentation.slides.add();
  s7.background.fill = C.bg;
  addHeader(s7, 7, "廟方後台", "廟務營運後台", "廟方可自行維護基本資料、公告、活動與服務內容，減少每次都要請工程人員改版");
  await addFramedImage(s7, imagePaths.adminSettings, { left: 78, top: 212, width: 704, height: 342 }, {
    alt: "Admin settings screenshot",
    fit: "cover",
    crop: { left: 0.03, top: 0, right: 0.02, bottom: 0.02 },
    frameFill: "#FFFFFF",
  });
  addMetric(s7, "即時", "公告與服務資料\n後台更新", { left: 836, top: 222, width: 210, height: 130 }, C.red);
  addMetric(s7, "分權", "Admin 與 Staff\n操作權限", { left: 994, top: 350, width: 210, height: 130 }, C.blue);
  addMetric(s7, "留痕", "登入與異動\n便於追蹤", { left: 836, top: 478, width: 210, height: 130 }, C.gold);
  addBox(s7, { left: 92, top: 590, width: 660, height: 42 }, "#FFFFFF/82", C.faint, { borderRadius: 18 });
  addText(s7, "此頁呈現實際後台設定畫面：廟名、全銜、主祀神祇、開放時段、公告與服務指引可集中維護。", {
    left: 120,
    top: 602,
    width: 604,
    height: 30,
  }, {
    fontSize: 16,
    bold: true,
    color: C.sub,
  });
  addSlideNote(s7, "本頁使用實際 Demo 後台設定截圖。");

  const s8 = presentation.slides.add();
  s8.background.fill = C.paper;
  addHeader(s8, 8, "技術架構", "LINE 到資料庫的服務閉環", "入口、Webhook、LIFF、後端、資料庫與知識庫都有清楚責任邊界");
  await addFramedImage(s8, imagePaths.architecture, { left: 74, top: 206, width: 712, height: 392 }, {
    alt: "System architecture diagram",
    fit: "contain",
    frameFill: "#FFFFFF",
  });
  addText(s8, "架構重點", { left: 846, top: 214, width: 260, height: 34 }, {
    fontSize: 27,
    bold: true,
    color: C.ink,
  });
  addSimpleCard(s8, "LINE 入口", "Rich Menu 與 Messaging API 接住高頻服務需求。", {
    left: 846,
    top: 270,
    width: 316,
    height: 86,
  }, { color: C.green, fill: "#F2FFF8" });
  addSimpleCard(s8, "後端任務", "FastAPI 負責驗證、資料處理、RAG 與通知流程。", {
    left: 846,
    top: 374,
    width: 316,
    height: 86,
  }, { color: C.red, fill: "#FFFDF8" });
  addSimpleCard(s8, "資料治理", "PostgreSQL 保存使用者、活動與營運資料，知識庫支援文化問答。", {
    left: 846,
    top: 478,
    width: 316,
    height: 102,
  }, { color: C.gold, fill: "#FFF8E7" });
  addSlideNote(s8, "本頁使用本專案架構圖。");

  const s9 = presentation.slides.add();
  s9.background.fill = C.bg;
  addHeader(s9, 9, "商業模式", "商業模式與驗證成果", "以 SaaS 訂閱為基礎，活動模組、客製導入與文創內容提高長期收入彈性");
  addSimpleCard(s9, "基礎訂閱", "中小型宮廟使用標準化 LINE 入口、AI 問答、活動報名與後台管理。", {
    left: 82,
    top: 228,
    width: 260,
    height: 150,
  }, { color: C.red, fill: "#FFFFFF" });
  addSimpleCard(s9, "客製導入", "百年宮廟可擴充專屬文史、科儀流程、導覽內容與後台欄位。", {
    left: 372,
    top: 228,
    width: 260,
    height: 150,
  }, { color: C.gold, fill: "#FFF8E7" });
  addSimpleCard(s9, "慶典模組", "媽祖誕辰、普度與建醮等高峰活動可啟用報名、通知與排隊能力。", {
    left: 82,
    top: 408,
    width: 260,
    height: 150,
  }, { color: C.blue, fill: "#FFFFFF" });
  addSimpleCard(s9, "文創延伸", "春福小使貼圖與商圈導流，讓文化互動延伸到日常社群。", {
    left: 372,
    top: 408,
    width: 260,
    height: 150,
  }, { color: C.jade, fill: "#F2FFF8" });
  await addFramedImage(s9, imagePaths.stickers, { left: 710, top: 238, width: 414, height: 238 }, {
    alt: "Spring Fortune Messenger sticker preview sheet",
    fit: "contain",
    frameFill: "#FFFFFF",
  });
  addBox(s9, { left: 704, top: 508, width: 424, height: 80 }, "#FFFFFF", C.faint, { borderRadius: 18, shadow: "shadow-sm" });
  addMetric(s9, "69 / 69", "後端測試通過", { left: 708, top: 516, width: 190, height: 68 }, C.green);
  addMetric(s9, "20 / 20", "公開服務檢查通過", { left: 906, top: 516, width: 210, height: 68 }, C.red);
  addSlideNote(s9, "本頁使用貼圖預覽圖與本輪驗證結果。69/69 後端測試、20/20 公開服務檢查已在本工作區驗證。");

  const s10 = presentation.slides.add();
  s10.background.fill = C.paper;
  addHeader(s10, 10, "發展藍圖", "從公開 Demo 到可導入產品", "目前先交付可體驗 Demo，後續補齊現場硬體互動、正式場域授權與跨廟模板");
  await addFramedImage(s10, imagePaths.journey, { left: 78, top: 206, width: 746, height: 394 }, {
    alt: "User journey diagram",
    fit: "contain",
    frameFill: "#FFFFFF",
  });
  addStep(s10, "1", "送件階段", "Demo、簡報、影片與測試紀錄完成，評審可先體驗公開服務。", {
    left: 872,
    top: 218,
    width: 326,
    height: 82,
  }, C.green);
  addStep(s10, "2", "入選三個月", "補齊現場 QR、NFC 或 Beacon 互動，取得場域授權後再對外宣稱合作導入。", {
    left: 872,
    top: 326,
    width: 326,
    height: 98,
  }, C.red);
  addStep(s10, "3", "一年藍圖", "將活動、知識庫、Rich Menu 與後台設定包裝成可複製模板。", {
    left: 872,
    top: 462,
    width: 326,
    height: 82,
  }, C.gold);
  addBox(s10, { left: 872, top: 580, width: 326, height: 48 }, "#FFF8E7", C.line, { borderRadius: 16 });
  addText(s10, "送件前仍需補 YouTube 連結與簽署文件。", { left: 890, top: 593, width: 290, height: 22 }, {
    fontSize: 16,
    bold: true,
    color: C.redDark,
    alignment: "center",
  });
  addSlideNote(s10, "本頁區分已完成、待入選後導入與正式送件仍待補項目。");

  const back = presentation.slides.add();
  back.background.fill = C.bg;
  addBox(back, { left: 0, top: 0, width: W, height: H }, C.redDark, "none", { geometry: "rect", borderRadius: 0 });
  addBox(back, { left: 650, top: 0, width: 630, height: H }, C.bg, "none", { geometry: "rect", borderRadius: 0 });
  await addFramedImage(back, imagePaths.lineChat, { left: 912, top: 62, width: 236, height: 596 }, {
    alt: "Actual LINE entry screenshot",
    fit: "contain",
    frameFill: "#111827",
    frameLine: "#7A1F1F",
    frameRadius: 30,
    radius: 24,
    shadow: "shadow-lg",
  });
  await addImage(back, imagePaths.logo, { left: 92, top: 104, width: 116, height: 116 }, {
    alt: "Temple AI OS logo",
    fit: "contain",
    geometry: "ellipse",
    borderRadius: 0,
  });
  addText(back, "科技賦能信仰\n智慧傳承文化", { left: 88, top: 258, width: 500, height: 130 }, {
    fontSize: 43,
    bold: true,
    color: "#FFFFFF",
    lineSpacing: 1.05,
  });
  addText(back, "Temple AI OS 智慧宮廟平台", { left: 92, top: 418, width: 460, height: 34 }, {
    fontSize: 23,
    bold: true,
    color: "#FFF1C1",
  });
  addText(back, "LINE OA：@983zhzni\n公開 Demo：前台、後台、API 已完成基礎驗證\n補件提醒：YouTube 連結與簽署文件需送件前完成", {
    left: 92,
    top: 488,
    width: 520,
    height: 96,
  }, {
    fontSize: 18,
    color: "#FFFFFF",
    lineSpacing: 1.22,
  });
  addBox(back, { left: 684, top: 118, width: 166, height: 190 }, "#FFFFFF", C.faint, {
    borderRadius: 18,
    shadow: "shadow-sm",
  });
  await addImage(back, imagePaths.qrLine, { left: 708, top: 136, width: 118, height: 118 }, {
    alt: "LINE add friend QR code",
    fit: "contain",
    geometry: "rect",
    borderRadius: 0,
  });
  addText(back, "LINE 加好友", { left: 702, top: 264, width: 130, height: 24 }, {
    fontSize: 16,
    bold: true,
    color: C.redDark,
    alignment: "center",
  });
  addText(back, "@983zhzni", { left: 702, top: 286, width: 130, height: 18 }, {
    fontSize: 11,
    color: C.sub,
    alignment: "center",
  });
  addBox(back, { left: 684, top: 360, width: 166, height: 190 }, "#FFFFFF", C.faint, {
    borderRadius: 18,
    shadow: "shadow-sm",
  });
  await addImage(back, imagePaths.qrLiff, { left: 708, top: 378, width: 118, height: 118 }, {
    alt: "LIFF Demo QR code",
    fit: "contain",
    geometry: "rect",
    borderRadius: 0,
  });
  addText(back, "LIFF Demo", { left: 702, top: 506, width: 130, height: 24 }, {
    fontSize: 16,
    bold: true,
    color: C.redDark,
    alignment: "center",
  });
  addText(back, "掃描體驗入口", { left: 702, top: 528, width: 130, height: 18 }, {
    fontSize: 11,
    color: C.sub,
    alignment: "center",
  });
  addSlideNote(back, "封底維持安全對外說法，提醒外部待補項目。");

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
    layoutArgs: ["--expected-slide-size-emu", "12192000,6858000", "--validate-heading-fit"],
    requiredNativeTableOwnerSlides: [],
    requiredNativeChartOwnerSlides: [],
    fontPolicy: { basis: "design", families: [FONT], scriptFonts: { ea: FONT } },
    verifyArtifactToolImport: true,
    receiptPath: path.join(stagingDir, "validation.json"),
  });

  const finalDeck = await PresentationFile.importPptx(await fs.readFile(finalPath));
  for (let i = 0; i < 12; i += 1) {
    const slide = finalDeck.slides.getItem(i);
    const png = await slide.export({ format: "png", scale: 1 });
    await fs.writeFile(
      path.join(renderDir, `slide-${String(i + 1).padStart(2, "0")}.png`),
      new Uint8Array(await png.arrayBuffer()),
    );
  }
  const montage = await finalDeck.export({
    format: "webp",
    montage: { columns: 3, slideWidth: 420, padding: 24, gap: 18, background: "#f6efe2" },
  });
  await fs.writeFile(path.join(stagingDir, "montage.webp"), new Uint8Array(await montage.arrayBuffer()));

  console.log(JSON.stringify({
    finalPath,
    stagingDir,
    renderDir,
    validationStatus: result?.status ?? "unknown",
    slideCount: 12,
  }, null, 2));
}

await buildDeck();
