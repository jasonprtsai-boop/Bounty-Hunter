import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig(({ mode }) => {
  const surface = mode === "admin" ? "admin" : "public";
  const appEntry =
    surface === "admin"
      ? fileURLToPath(new URL("./src/apps/AdminApp.tsx", import.meta.url))
      : fileURLToPath(new URL("./src/apps/PublicApp.tsx", import.meta.url));
  const pageTitle = surface === "admin" ? "萬春宮管理後台" : "萬春宮線上服務入口";
  const pageDescription =
    surface === "admin"
      ? "萬春宮管理後台，供授權人員管理活動、客服、知識庫與發布設定。"
      : "萬春宮線上服務入口，提供 LINE 服務入口、活動資訊、參拜導覽與客服聯繫。";

  return {
    plugins: [
      react(),
      {
        name: "surface-html-metadata",
        transformIndexHtml(html) {
          return html
            .replace(/<title>.*<\/title>/, `<title>${pageTitle}</title>`)
            .replace(
              /content="萬春宮線上服務入口，提供 LINE 服務入口、活動資訊、參拜導覽與客服聯繫。"/,
              `content="${pageDescription}"`
            );
        }
      }
    ],
    resolve: {
      alias: {
        "@surface-app": appEntry
      }
    },
    build: {
      outDir: "dist/client"
    },
    server: {
      port: 5173,
      strictPort: false
    }
  };
});
