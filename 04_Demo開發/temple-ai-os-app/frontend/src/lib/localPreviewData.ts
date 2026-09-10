import type { Deity, EventItem, Registration, RegistrationLookupResult } from "./api";
import { templeExteriorImage } from "./visualAssets";

export type LocalTourSpot = {
  code: string;
  title: string;
  category: string;
  summary: string;
  cultural_note: string;
  image_url?: string;
  source_type: string;
};

export type LocalFortuneSlip = {
  slip_id: string;
  title: string;
  poem: string;
  plain_language: string;
  cultural_note: string;
  reminder: string;
};

export function isLocalPreview() {
  return typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);
}

export function canUsePreviewFallback() {
  if (isLocalPreview()) return true;
  if (typeof window === "undefined") return false;
  return window.location.hostname === "temple-ai-os-demo-20260828.jeremy40713.chatgpt.site";
}

export const localPreviewEvents: EventItem[] = [
  {
    event_id: "evt_20260806_guansheng",
    title: "關聖帝君聖誕佳辰",
    category: "祭典參拜",
    source_type: "official_public_reference",
    date: "2026-08-06",
    start_time: "09:00",
    end_time: "11:00",
    location: "萬春宮",
    address: "臺中市中區成功路212號",
    summary: "國曆8月6日為關聖帝君聖誕佳辰，可用於近期祭典提醒。",
    requires_registration: false,
    capacity: null,
    registered_count: 0,
    status: "upcoming",
    registration_fields: [],
    demo_note: "公開活動資訊整理，非官方報名資料。",
    max_party_size: 10,
    waitlist_enabled: false
  },
  {
    event_id: "evt_20260818_mazu_305",
    title: "開基媽祖來台305週年宮慶",
    category: "宮慶活動",
    source_type: "official_public_reference",
    date: "2026-08-18",
    start_time: "09:00",
    end_time: "12:00",
    location: "萬春宮",
    address: "臺中市中區成功路212號",
    summary: "以宮慶紀念為主題，適合活動卡、提醒推播與文化導覽。",
    requires_registration: false,
    capacity: null,
    registered_count: 0,
    status: "upcoming",
    registration_fields: [],
    demo_note: "公開活動資訊整理，時間細節請以廟方公告為準。",
    max_party_size: 10,
    waitlist_enabled: false
  },
  {
    event_id: "evt_20260827_zhongyuan",
    title: "中元普度法會線上報名",
    category: "法會服務",
    source_type: "official_public_reference_plus_service_flow",
    date: "2026-08-27",
    start_time: "14:00",
    end_time: "17:00",
    location: "萬春宮",
    address: "臺中市中區成功路212號",
    summary: "以中元普度法會資訊為背景，提供登記需求、廟方確認與提醒通知。",
    requires_registration: true,
    capacity: 120,
    registered_count: 78,
    status: "open",
    registration_fields: ["姓名", "手機", "參加人數", "祈福項目", "備註"],
    payment_policy: "目前不串接真實金流，正式服務需由廟方確認。",
    demo_note: "報名名額、欄位與統計數字請以廟方公告為準。",
    max_party_size: 10,
    waitlist_enabled: false
  },
  {
    event_id: "evt_demo_worship_intro",
    title: "第一次參拜導覽",
    category: "導覽互動",
    source_type: "temple_service",
    date: "2026-09-07",
    start_time: "10:00",
    end_time: "10:40",
    location: "萬春宮正殿與拜殿",
    address: "臺中市中區成功路212號",
    summary: "面向第一次到訪者，透過 LINE 頁面了解參拜流程與建築特色。",
    requires_registration: true,
    capacity: 30,
    registered_count: 18,
    status: "open",
    registration_fields: ["姓名", "LINE 顯示名稱", "參加人數", "是否需要提醒"],
    demo_note: "活動內容與報名規則請以廟方公告為準。",
    max_party_size: 10,
    waitlist_enabled: false
  },
  {
    event_id: "evt_demo_culture_talk",
    title: "媽祖文化小講堂",
    category: "文化教育",
    source_type: "temple_service",
    date: "2026-09-14",
    start_time: "15:00",
    end_time: "16:00",
    location: "萬春會館",
    address: "臺中市中區成功路210號",
    summary: "介紹臺中媽祖信仰、萬春宮歷史與城市文化脈絡。",
    requires_registration: true,
    capacity: 50,
    registered_count: 34,
    status: "open",
    registration_fields: ["姓名", "手機", "參加人數", "想了解的主題"],
    demo_note: "活動內容與報名規則請以廟方公告為準。",
    max_party_size: 10,
    waitlist_enabled: false
  },
  {
    event_id: "evt_demo_calligraphy",
    title: "萬春盃書法體驗日",
    category: "文化教育",
    source_type: "official_public_reference_plus_service_flow",
    date: "2026-09-20",
    start_time: "13:30",
    end_time: "16:30",
    location: "萬春會館",
    address: "臺中市中區成功路210號",
    summary: "參考萬春盃書法比賽公開資訊，整理為文化體驗活動報名流程。",
    requires_registration: true,
    capacity: 60,
    registered_count: 42,
    status: "open",
    registration_fields: ["姓名", "年級/身份", "聯絡電話", "陪同人數"],
    demo_note: "體驗日活動資訊請以廟方公告為準。",
    max_party_size: 10,
    waitlist_enabled: false
  }
];

export const localPreviewDeities: Deity[] = [
  {
    deity_id: "deity_guanyin",
    name: "觀音佛祖",
    category: "主配祀神",
    enshrined_area: "觀音佛祖神龕",
    description: "鎮殿觀音佛祖、老觀音佛祖與左觀音佛祖共同奉祀於觀音佛祖神龕。",
    birthday_lunar: null,
    service_notes: "神龕位置與參拜方式請依現場指示。",
    source_url: "https://www.lswc.org.tw/tw/?ID=5&Page=gods_list",
    status: "published",
    sort_order: 10
  },
  {
    deity_id: "deity_zhusheng",
    name: "註生娘娘",
    category: "主配祀神",
    enshrined_area: "註生娘娘神龕",
    description: "註生娘娘神龕另配祀婆姐、值年太歲與祿位牌位。",
    birthday_lunar: null,
    service_notes: "正式登記與祈求方式請以廟方公告與現場人員說明為準。",
    source_url: "https://www.lswc.org.tw/tw/?ID=5&Page=gods_list",
    status: "published",
    sort_order: 20
  },
  {
    deity_id: "deity_sanguan",
    name: "三官大帝",
    category: "副配祀神",
    enshrined_area: "中案神桌",
    description: "列於萬春宮公開配祀神佛資料中的副配祀神明。",
    birthday_lunar: null,
    service_notes: "節慶法會與供奉安排請以廟方公告為準。",
    source_url: "https://www.lswc.org.tw/tw/?ID=6&Page=gods_list",
    status: "published",
    sort_order: 30
  },
  {
    deity_id: "deity_wenchang",
    name: "文昌帝君",
    category: "副配祀神",
    enshrined_area: "副配祀神明區",
    description: "列於公開配祀神佛資料中的副配祀神明，可作為文化導覽與節慶查詢入口。",
    birthday_lunar: null,
    service_notes: "文化介紹不取代正式祭祀或廟方服務說明。",
    source_url: "https://www.lswc.org.tw/tw/?ID=6&Page=gods_list",
    status: "published",
    sort_order: 40
  },
  {
    deity_id: "deity_qianliyan",
    name: "千里眼將軍",
    category: "護法神明",
    enshrined_area: "正殿與神龕前",
    description: "公開資料列載的護法神明，正殿與神龕前皆有奉祀位置。",
    birthday_lunar: null,
    service_notes: "位置資訊依公開頁整理，現場若有調整請以廟方公告為準。",
    source_url: "https://www.lswc.org.tw/tw/?ID=8&Page=gods_list",
    status: "published",
    sort_order: 60
  }
];

export const localPreviewTourSpots: LocalTourSpot[] = [
  {
    code: "main-hall",
    title: "萬春宮正殿",
    category: "參拜動線",
    summary: "第一次到訪者可從正殿認識主祀天上聖母與基本參拜動線。",
    cultural_note: "此內容依公開資料與服務摘要整理，現場細節仍以廟方公告為準。",
    image_url: templeExteriorImage,
    source_type: "open_data_plus_service_summary"
  },
  {
    code: "history-wall",
    title: "宮廟文化故事牆",
    category: "文化導覽",
    summary: "用 LINE LIFF 呈現萬春宮歷史、城市信仰與文化脈絡摘要。",
    cultural_note: "正式導入前，歷史文字與圖片應由廟方審核或採用明確授權素材。",
    image_url: templeExteriorImage,
    source_type: "temple_service"
  }
];

export const localPreviewFortuneSlips: LocalFortuneSlip[] = [
  {
    slip_id: "fortune_culture_001",
    title: "靜心觀路",
    poem: "香煙一縷照初心，行到廟前問本心。",
    plain_language: "先把問題拆小，再決定下一步。這不是命運判斷，而是文化式的自我整理。",
    cultural_note: "籤詩在民間文化中常被用來提醒人沉澱心緒；本服務只提供文化解說。",
    reminder: "不保證吉凶，不替代醫療、法律、財務或人生重大決策建議。"
  },
  {
    slip_id: "fortune_culture_002",
    title: "循序成事",
    poem: "一階一履過前庭，風來仍聽鼓聲清。",
    plain_language: "事情適合分階段處理，先確認資訊來源，再安排時間與資源。",
    cultural_note: "以宮廟建築動線作比喻，提醒使用者按部就班。",
    reminder: "若問題涉及報名、付款或廟方決策，請以廟方公告為準。"
  },
  {
    slip_id: "fortune_culture_003",
    title: "問清再行",
    poem: "燈前莫急定行藏，問得分明路自長。",
    plain_language: "資訊不足時不要急著下結論，可以先列出要確認的問題。",
    cultural_note: "這是以傳統籤詩語感寫成的正向提醒，不代表神諭。",
    reminder: "線上服務不能代表神明或廟方作出指示。"
  }
];

const localRegistrations = [
  {
    registration_id: "reg_0001",
    event_id: "evt_20260827_zhongyuan",
    status: "confirmed",
    party_size: 2,
    phone: "0912-345-678"
  },
  {
    registration_id: "reg_0002",
    event_id: "evt_demo_worship_intro",
    status: "confirmed",
    party_size: 1,
    phone: "0912-345-678"
  },
  {
    registration_id: "reg_0004",
    event_id: "evt_demo_calligraphy",
    status: "pending_review",
    party_size: 2,
    phone: "0933-220-118"
  }
];

export function eventRouteKeyOf(eventId: string) {
  return eventId.replace(/^evt_demo_/, "").replace(/_/g, "-");
}

export function findLocalPreviewEvent(routeKeyOrId = "") {
  return localPreviewEvents.find((event) => event.event_id === routeKeyOrId || eventRouteKeyOf(event.event_id) === routeKeyOrId) || null;
}

export function findLocalPreviewTourSpot(code = "main-hall") {
  return localPreviewTourSpots.find((spot) => spot.code === code) || localPreviewTourSpots[0];
}

export function pickLocalPreviewSlip() {
  return localPreviewFortuneSlips[Math.floor(Math.random() * localPreviewFortuneSlips.length)];
}

export function lookupLocalRegistrations(phone: string, registrationId: string): RegistrationLookupResult[] {
  const normalizedPhone = phone.replace(/\D/g, "");
  return localRegistrations
    .filter((registration) => {
      const matchesPhone = normalizedPhone && registration.phone.replace(/\D/g, "").includes(normalizedPhone);
      const matchesCode = registrationId && registration.registration_id.toLowerCase().includes(registrationId.toLowerCase());
      return matchesPhone || matchesCode;
    })
    .map((registration) => {
      const event = findLocalPreviewEvent(registration.event_id);
      return {
        registration_id: registration.registration_id,
        event_id: registration.event_id,
        event_title: event?.title || "示範活動",
        event_date: event?.date || "",
        event_time: event ? `${event.start_time}-${event.end_time}` : "",
        event_location: event?.location || "萬春宮",
        status: registration.status,
        party_size: registration.party_size,
        reminder_opt_in: true,
        masked_phone: registration.phone.replace(/^(\d{4}).*(\d{3})$/, "$1***$2"),
        created_at: null
      };
    });
}

export function createLocalRegistration(event: EventItem, partySize: number, contactName: string, phone: string): Registration {
  return {
    registration_id: `local_${Date.now().toString().slice(-6)}`,
    event_id: event.event_id,
    user_id: "demo_u001",
    status: event.capacity && event.registered_count >= event.capacity ? "waitlisted" : "confirmed",
    party_size: partySize,
    reminder_opt_in: true,
    created_at: new Date().toISOString(),
    contact_name: contactName,
    phone
  };
}
