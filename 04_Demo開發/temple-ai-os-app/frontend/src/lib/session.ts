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
      if (state.idToken) {
        localStorage.setItem("liffIdToken", state.idToken);
      } else {
        localStorage.removeItem("liffIdToken");
        throw new Error("line_login_required");
      }
      const session = await apiFetch<VerifiedLiffSession>("/api/liff/session/verify", {
        method: "POST",
        body: JSON.stringify({ id_token: state.idToken })
      });
      localStorage.setItem("lineUserId", session.user_id);
      localStorage.setItem("lineDisplayName", session.display_name);
      return session;
    }).catch((error) => {
      sessionPromise = null;
      throw error;
    });
  }
  return sessionPromise;
}
