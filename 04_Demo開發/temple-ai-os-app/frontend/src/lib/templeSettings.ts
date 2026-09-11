export type TempleSettings = {
  temple_name: string;
  sub_name: string;
  main_deity: string;
  address: string;
  phone: string;
  open_hours_weekday: string;
  open_hours_weekend: string;
  open_hours_special: string;
  intro_summary: string;
  announcement_enabled: boolean;
  announcement_tag: string;
  announcement_text: string;
  announcement_link: string;
  transit_bus: string;
  transit_parking: string;
  service_notes_fortune: string;
  service_notes_events: string;
};

export const defaultTempleSettings: TempleSettings = {
  temple_name: "臺中萬春宮",
  sub_name: "藍興媽祖 ‧ 開基三百年",
  main_deity: "天上聖母（開基藍興媽祖）",
  address: "臺中市中區成功路212號",
  phone: "04-22245964",
  open_hours_weekday: "每日 06:30 - 20:30",
  open_hours_weekend: "週末與例假日 06:00 - 21:00",
  open_hours_special: "逢初一、十五、媽祖聖誕或重大法會延長至 22:00",
  intro_summary: "清康熙六十年（1721）渡臺，雍正元年（1723）建廟立基。三百年來慈悲護佑臺中大墩街區與十方善信。",
  announcement_enabled: true,
  announcement_tag: "即時公告",
  announcement_text: "欣逢開基媽祖來台305週年宮慶與中元普度法會，歡迎十方善信踴躍線上登記與共沐神恩！",
  announcement_link: "/events",
  transit_bus: "搭乘臺中市公車至「臺中車站」或「第二市場站」，沿成功路步行約 3-5 分鐘即達。",
  transit_parking: "周邊設有光復國小外操場地下停車場、興中立體停車場，步行約 2 分鐘。",
  service_notes_fortune: "線上抽籤旨在提供信眾生活提醒與心靈啟發；重要廟務決策請以現場公告為準。",
  service_notes_events: "法會與慶典名額有限，登記後可至活動中心或透過 LINE 官方帳號查詢進度。"
};

const STORAGE_KEY = "wanchun_temple_settings_v1";

export function getTempleSettings(): TempleSettings {
  if (typeof window === "undefined") return defaultTempleSettings;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultTempleSettings;
    return { ...defaultTempleSettings, ...JSON.parse(raw) };
  } catch {
    return defaultTempleSettings;
  }
}

export function saveTempleSettings(settings: TempleSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent("temple-settings-updated", { detail: settings }));
}

export function resetTempleSettings(): TempleSettings {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("temple-settings-updated", { detail: defaultTempleSettings }));
  }
  return defaultTempleSettings;
}
