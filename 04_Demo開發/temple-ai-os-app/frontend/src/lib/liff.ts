import liff from "@line/liff";

export type LiffState = {
  ready: boolean;
  inClient: boolean;
  userId: string;
  displayName: string;
  idToken: string;
};

export async function initLiff(): Promise<LiffState> {
  const liffId = import.meta.env.VITE_LIFF_ID;
  if (!liffId) {
    return {
      ready: true,
      inClient: false,
      userId: "demo_u001",
      displayName: "小安",
      idToken: "demo"
    };
  }
  await liff.init({ liffId });
  if (!liff.isLoggedIn()) {
    liff.login();
  }
  const profile = await liff.getProfile();
  return {
    ready: true,
    inClient: liff.isInClient(),
    userId: profile.userId,
    displayName: profile.displayName,
    idToken: liff.getIDToken() || ""
  };
}

