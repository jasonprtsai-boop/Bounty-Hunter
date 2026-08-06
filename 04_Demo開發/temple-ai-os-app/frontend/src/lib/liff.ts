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
  const { default: liff } = await import("@line/liff");
  await liff.init({ liffId });
  if (!liff.isLoggedIn()) {
    liff.login();
    await new Promise<never>(() => undefined);
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
