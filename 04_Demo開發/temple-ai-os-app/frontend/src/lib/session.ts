import { apiFetch } from "./api";
import { initLiff } from "./liff";

export type VerifiedLiffSession = {
  user_id: string;
  display_name: string;
  picture_url?: string | null;
  verified: boolean;
  demo_mode: boolean;
};

let sessionPromise: Promise<VerifiedLiffSession> | null = null;

export async function getLiffSession(): Promise<VerifiedLiffSession> {
  if (!sessionPromise) {
    sessionPromise = initLiff().then(async (state) => {
      localStorage.setItem("liffIdToken", state.idToken || "demo");
      const session = await apiFetch<VerifiedLiffSession>("/api/liff/session/verify", {
        method: "POST",
        body: JSON.stringify({ id_token: state.idToken || "demo" })
      });
      localStorage.setItem("lineUserId", session.user_id);
      localStorage.setItem("lineDisplayName", session.display_name);
      return session;
    });
  }
  return sessionPromise;
}
