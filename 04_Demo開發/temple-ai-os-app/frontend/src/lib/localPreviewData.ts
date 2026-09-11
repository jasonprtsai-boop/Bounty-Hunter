import type { Deity, EventItem, Registration, RegistrationLookupResult } from "./api";
import { templePhotoGallery } from "./visualAssets";

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
    summary: "國曆8月6日為關聖帝君聖誕佳辰，萬春宮舉行祝壽參拜儀程，祈願善信安泰、事業順達。",
    requires_registration: false,
    capacity: null,
    registered_count: 0,
    status: "upcoming",
    registration_fields: [],
    demo_note: "法會儀程與參拜時間請依廟方現場公告為準。",
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
    summary: "欣逢開基媽祖來台305週年宮慶，舉行文化導覽與感恩祈福祭典，歡迎善信共沐神恩。",
    requires_registration: false,
    capacity: null,
    registered_count: 0,
    status: "upcoming",
    registration_fields: [],
    demo_note: "宮慶活動詳情與導覽梯次請依廟方公告為準。",
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
    summary: "萬春宮中元普度超拔拔薦法會，提供信眾預先登記消災祈福與普度項目。",
    requires_registration: true,
    capacity: 120,
    registered_count: 78,
    status: "open",
    registration_fields: ["姓名", "手機", "參加人數", "祈福項目", "備註"],
    payment_policy: "請於現場服務處確認登記或由廟方服務人員引導辦理。",
    demo_note: "報名名額、祈福項目與活動細節請以現場公告為準。",
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
    summary: "專為初次到訪善信規劃之正殿參拜導覽，深入認識天上聖母歷史與殿堂建築特色。",
    requires_registration: true,
    capacity: 30,
    registered_count: 18,
    status: "open",
    registration_fields: ["姓名", "LINE 顯示名稱", "參加人數", "是否需要提醒"],
    demo_note: "活動內容與導覽規則請依現場志工與公告引導。",
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
    summary: "邀請文史學者分享臺中媽祖信仰淵源、萬春宮建廟歷史與城市發展脈絡。",
    requires_registration: true,
    capacity: 50,
    registered_count: 34,
    status: "open",
    registration_fields: ["姓名", "手機", "參加人數", "想了解的主題"],
    demo_note: "講座名額有限，報名規範請依廟方公告為準。",
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
    summary: "發揚傳統寺廟藝文與書法之美，舉辦現場揮毫與書法文化觀摩體驗。",
    requires_registration: true,
    capacity: 60,
    registered_count: 42,
    status: "open",
    registration_fields: ["姓名", "年級/身份", "聯絡電話", "陪同人數"],
    demo_note: "體驗活動與材料準備請依現場說明為準。",
    max_party_size: 10,
    waitlist_enabled: false
  },
  {
    event_id: "evt_20261019_chongyang_lidou",
    title: "重陽秋季祈安禮斗大法會",
    category: "法會服務",
    source_type: "temple_service",
    date: "2026-10-19",
    start_time: "09:00",
    end_time: "17:00",
    location: "萬春宮正殿與斗堂",
    address: "臺中市中區成功路212號",
    summary: "欣逢重陽秋祭，萬春宮啟建祈安植福禮斗大法會，恭祈天尊庇佑善信消災解厄、元辰光彩、延壽迎祥。",
    requires_registration: true,
    capacity: 150,
    registered_count: 92,
    status: "open",
    registration_fields: ["姓名", "手機", "安奉斗別", "合家丁口", "備註"],
    payment_policy: "請於現場服務處確認登記或由廟方服務人員引導辦理。",
    demo_note: "禮斗登記名額有限，敬請提早辦理以利入疏安奉。",
    max_party_size: 10,
    waitlist_enabled: true
  },
  {
    event_id: "evt_20270205_spring_blessing",
    title: "新春祈福消災點燈與安太歲",
    category: "祈福服務",
    source_type: "temple_service",
    date: "2027-02-05",
    start_time: "08:30",
    end_time: "17:30",
    location: "萬春宮辦事處",
    address: "臺中市中區成功路212號",
    summary: "萬春宮新春祈安點燈開始預約登記，包含光明燈、文昌燈、太歲燈、安太歲與平安米祈福，祈求新歲家宅安康。",
    requires_registration: true,
    capacity: 300,
    registered_count: 168,
    status: "open",
    registration_fields: ["信士姓名", "農曆生辰", "聯絡電話", "祈福項目", "通訊地址"],
    payment_policy: "現場服務台辦理登記與開立安奉祈福憑條。",
    demo_note: "新年點燈依登記入殿安奉，額滿即止。",
    max_party_size: 10,
    waitlist_enabled: true
  }
];

export const localPreviewDeities: Deity[] = [
  {
    deity_id: "deity_mazu",
    name: "天上聖母（藍興媽祖）",
    category: "主祀神明",
    enshrined_area: "正殿神龕",
    description: "萬春宮開基主神，清康熙六十年隨總兵藍廷珍渡臺，雍正元年建廟立基大墩，慈悲護佑臺中三百年。",
    birthday_lunar: "三月廿三日",
    service_notes: "正殿設有求平安符、祈安疏文與聖母參拜導引。",
    source_url: "https://www.lswc.org.tw/tw/?Page=about",
    status: "published",
    sort_order: 1
  },
  {
    deity_id: "deity_guanyin",
    name: "觀音佛祖",
    category: "主配祀神",
    enshrined_area: "觀音佛祖神龕",
    description: "鎮殿觀音佛祖、老觀音佛祖與左觀音佛祖共同奉祀於神龕，大慈大悲，普度世間苦厄。",
    birthday_lunar: "二月十九日、六月十九日、九月十九日",
    service_notes: "每年佛祖成道紀念日舉行祝壽祈安儀程。",
    source_url: "https://www.lswc.org.tw/tw/?ID=5&Page=gods_list",
    status: "published",
    sort_order: 10
  },
  {
    deity_id: "deity_zhusheng",
    name: "註生娘娘",
    category: "主配祀神",
    enshrined_area: "註生娘娘神龕",
    description: "掌管人間生育、保佑懷孕與孩童安康，神龕配祀婆姐、祿位牌位與值年太歲星君。",
    birthday_lunar: "三月二十日",
    service_notes: "祈求生男育女、安胎順產與換花祈願，可洽現場服務人員。",
    source_url: "https://www.lswc.org.tw/tw/?ID=5&Page=gods_list",
    status: "published",
    sort_order: 20
  },
  {
    deity_id: "deity_sanguan",
    name: "三官大帝",
    category: "副配祀神",
    enshrined_area: "中案神桌",
    description: "奉祀天官一品賜福大帝、地官二品赦罪大帝、水官三品解厄大帝，考校人神功過。",
    birthday_lunar: "正月十五、七月十五、十月十五",
    service_notes: "上元、中元、下元三元節期舉行隆重祈安消災植福法會。",
    source_url: "https://www.lswc.org.tw/tw/?ID=6&Page=gods_list",
    status: "published",
    sort_order: 30
  },
  {
    deity_id: "deity_wenchang",
    name: "文昌帝君",
    category: "副配祀神",
    enshrined_area: "副配祀神明區",
    description: "掌管天下功名、文運與仕途祿籍，為學子考取功名、求職升遷之守護主神。",
    birthday_lunar: "二月初三日",
    service_notes: "考季提供文昌燈祈願登記、准考證影本祈安與開竅智慧筆。",
    source_url: "https://www.lswc.org.tw/tw/?ID=6&Page=gods_list",
    status: "published",
    sort_order: 40
  },
  {
    deity_id: "deity_guansheng",
    name: "關聖帝君",
    category: "副配祀神",
    enshrined_area: "正殿副神位",
    description: "三國蜀漢名將關羽，忠義貫日月，儒釋道三教共尊，亦為商業界信奉之武財神與正氣守護神。",
    birthday_lunar: "六月廿四日",
    service_notes: "每年聖誕佳辰舉行祝壽典禮，護佑信眾忠信處世、事業亨通。",
    source_url: "https://www.lswc.org.tw/tw/?ID=6&Page=gods_list",
    status: "published",
    sort_order: 45
  },
  {
    deity_id: "deity_luxianzu",
    name: "孚佑帝君（呂仙祖）",
    category: "客座神明",
    enshrined_area: "客座神明區",
    description: "八仙之一純陽祖師呂洞賓，道教全真派祖師，以劍術智慧斬除貪嗔癡煩惱，護佑醫藥與文士。",
    birthday_lunar: "四月十四日",
    service_notes: "敬拜仙祖點化智慧，排解心結煩憂。",
    source_url: "https://www.lswc.org.tw/tw/?ID=7&Page=gods_list",
    status: "published",
    sort_order: 50
  },
  {
    deity_id: "deity_qianliyan",
    name: "千里眼將軍",
    category: "護法神明",
    enshrined_area: "正殿與神龕前",
    description: "天上聖母左金精將軍，手執方天畫戟，眼觀千里，察查人間疾苦善惡。",
    birthday_lunar: "三月廿三日（隨聖母慶壽）",
    service_notes: "正殿與拜殿皆有奉祀將軍神位，隨侍聖母左右護持。",
    source_url: "https://www.lswc.org.tw/tw/?ID=8&Page=gods_list",
    status: "published",
    sort_order: 60
  },
  {
    deity_id: "deity_shunfeng",
    name: "順風耳將軍",
    category: "護法神明",
    enshrined_area: "正殿與神龕前",
    description: "天上聖母右水精將軍，手持月牙斧，耳聽八方，傾聽萬民呼救之聲。",
    birthday_lunar: "三月廿三日（隨聖母慶壽）",
    service_notes: "正殿與拜殿皆有奉祀將軍神位，隨侍聖母左右護持。",
    source_url: "https://www.lswc.org.tw/tw/?ID=8&Page=gods_list",
    status: "published",
    sort_order: 70
  },
  {
    deity_id: "deity_huye",
    name: "虎爺將軍",
    category: "下壇將軍",
    enshrined_area: "正殿神案下方",
    description: "山神與土地公之坐騎，鎮守下界除魔辟邪，相傳深具招財、咬錢進寶與守護幼童平安之威能。",
    birthday_lunar: "六月初六日",
    service_notes: "信眾常備生雞蛋、肉品或豆乾誠心參拜，祈求避邪招財、孩童好養。",
    source_url: "https://www.lswc.org.tw/tw/?Page=gods_list",
    status: "published",
    sort_order: 80
  },
  {
    deity_id: "deity_taixui",
    name: "值年太歲星君",
    category: "祈安奉祀",
    enshrined_area: "配殿太歲神位",
    description: "六十甲子輪值太歲星君，主管人間一年吉凶禍福與行運流年。",
    birthday_lunar: "七月十九日",
    service_notes: "每年立春至元宵提供信眾登記「安太歲」，祈求流年化凶逢吉、元辰光彩。",
    source_url: "https://www.lswc.org.tw/tw/?Page=blessing",
    status: "published",
    sort_order: 90
  }
];

export const localPreviewTourSpots: LocalTourSpot[] = [
  {
    code: "front-arch",
    title: "天后閣牌樓山門",
    category: "建築山門",
    summary: "萬春宮成功路迎賓牌坊，三間四柱宮殿式造型，典雅巍峨，為入廟參拜之第一道宏偉門戶。",
    cultural_note: "牌樓建於民國六十年代，頂覆琉璃瓦，斗拱飛簷氣宇非凡，正額題書天后閣，展現傳統寺廟營建技藝之美。",
    image_url: templePhotoGallery[1].src,
    source_type: "open_data_plus_service_summary"
  },
  {
    code: "stone-lions",
    title: "萬春宮青斗石獅",
    category: "清代石雕",
    summary: "廟埕一對青斗石古獅，公獅張口戲球、母獅閉口撫幼，雕刻精美雄健，為萬春宮鎮殿之寶。",
    cultural_note: "石獅雕工細膩靈動，造形線條古雅，歷經數百年風霜洗禮仍神采奕奕，為臺中市極珍貴的清代古石雕藝術瑰寶。",
    image_url: templePhotoGallery[3].src,
    source_type: "open_data_plus_service_summary"
  },
  {
    code: "main-hall",
    title: "正殿 ‧ 天上聖母殿",
    category: "參拜動線",
    summary: "萬春宮核心神聖殿堂，恭奉開基三百年藍興媽祖神尊，香煙裊裊，莊嚴肅穆。",
    cultural_note: "藍興媽祖自清康熙六十年（1721）隨福建總兵藍廷珍渡臺，雍正元年（1723）立廟大墩，歷久彌堅，為老城繁榮象徵。",
    image_url: templePhotoGallery[0].src,
    source_type: "open_data_plus_service_summary"
  },
  {
    code: "dragon-pillars",
    title: "道光年間雕花龍柱",
    category: "石雕文物",
    summary: "拜殿前保存之道光年間八角雕花龍柱，單龍蟠繞戲珠，柱身沉穩厚重，展現清中葉石雕巔峰風貌。",
    cultural_note: "此對龍柱為道光三年（1823）地方仕紳重修萬春宮時所敬獻，柱身刻工深峻，騰雲戲浪之勢躍然石上，見證建廟沿革。",
    image_url: templePhotoGallery[2].src,
    source_type: "temple_service"
  },
  {
    code: "plaque-relics",
    title: "光緒御匾「海晏河清」與古鐘",
    category: "廟堂文物",
    summary: "清光緒皇帝御賜「海晏河清」古匾與昭和年代銅鐘，象徵媽祖神威顯赫、海陸永安。",
    cultural_note: "「海晏河清」匾額懸於正殿大門上方，金字黑漆蒼勁有力，與殿內日治時期銅鐘相互輝映，為萬春宮三百年滄桑歷史之鐵證。",
    image_url: templePhotoGallery[0].src,
    source_type: "temple_service"
  },
  {
    code: "history-wall",
    title: "宮廟文化故事牆",
    category: "文化導覽",
    summary: "透過珍貴歷史照片與文史紀錄，細細品讀萬春宮老城信仰、大墩街拓墾與三百年風華。",
    cultural_note: "萬春宮歷經朱一貴事件、日治市區改正拆遷與戰後重建，為臺中舊城區核心信仰象徵；現場亦備有文史解說牌供善信閱讀。",
    image_url: templePhotoGallery[2].src,
    source_type: "temple_service"
  }
];

export const localPreviewFortuneSlips: LocalFortuneSlip[] = [
  {
    slip_id: "fortune_culture_001",
    title: "靜心觀路",
    poem: "香煙一縷照初心，行到廟前問本心。",
    plain_language: "先把紛亂思緒放下，將問題拆小，再按輕重緩急行事。這是一劑沉澱心性的自我整理良方。",
    cultural_note: "籤詩在民間信仰中常被用來提醒信眾靜心自省；心定則智慧生，凡事謀定而後動。",
    reminder: "內容僅供文化參考，重要廟務、醫療、法律或財務決策請尋求專業與公告指引。"
  },
  {
    slip_id: "fortune_culture_002",
    title: "循序成事",
    poem: "一階一履過前庭，風來仍聽鼓聲清。",
    plain_language: "事情宜循序漸進，切莫躁急盲動。先確認資訊與條件齊備，按部就班自能水到渠成。",
    cultural_note: "以宮殿建築之階石動線為喻，提醒處事要像登階一般踩穩每一步，步步踏實。",
    reminder: "若遇重大疑難，先確認事實依據，與親友師長充分商議後再行決定。"
  },
  {
    slip_id: "fortune_culture_003",
    title: "問清再行",
    poem: "燈前莫急定行藏，問得分明路自長。",
    plain_language: "資訊不明朗時切莫倉促下定論。多加打聽、核對細節，路徑自然開朗分明。",
    cultural_note: "傳統籤詩語感融合慎思明辨的生活處事哲學，提醒求籤者以理性智慧明辨是非曲折。",
    reminder: "線上文化籤詩旨在啟發思維；重要契約與決策請以廟方官方公告或客觀事實為憑。"
  },
  {
    slip_id: "fortune_culture_004",
    title: "積善福臨",
    poem: "積德由來天自照，善心常伴福無窮。",
    plain_language: "善念如春風化雨，日常多行善助人、廣結良緣，自然能逢凶化吉、常獲貴人相助。",
    cultural_note: "媽祖信仰核心在於慈悲為懷、濟困扶危。此籤體現傳統信仰「存好心、說好話、做好事」之德行本源。",
    reminder: "心懷善念，處世寬厚，即是最佳之護身庇佑。"
  },
  {
    slip_id: "fortune_culture_005",
    title: "誠敬道安",
    poem: "心誠自有清泉湧，敬仰何須萬語多。",
    plain_language: "待人處事以真誠為首要。不需多餘虛飾，心懷坦蕩與誠敬，自有明燈指引前路。",
    cultural_note: "取意於莊子「真者，精誠之至也」。傳統祭祀講究「誠心一炷香」，心正則神明自知。",
    reminder: "抱持真誠態度與合作夥伴或家人溝通，多數誤會皆能冰釋。"
  },
  {
    slip_id: "fortune_culture_006",
    title: "守正待時",
    poem: "雪盡冰消春又回，莫教躁進損芳枝。",
    plain_language: "當前若逢逆境或停滯，宜隱忍蓄力、充實自我。待時機成熟，春天自然百花齊放。",
    cultural_note: "源於易經「君子藏器於身，待時而動」之智慧。時機未至時守正固本，時機一到自展宏圖。",
    reminder: "面對挑戰保持耐心與韌性，切莫因一時情緒影響大局。"
  },
  {
    slip_id: "fortune_culture_007",
    title: "和氣致祥",
    poem: "滿座春風多樂意，一門和睦自興隆。",
    plain_language: "家和萬事興，團隊協同以和為貴。多傾聽包容少計較，自能聚氣生財、合家平安。",
    cultural_note: "民間有言「和氣生財、家和業興」。萬春宮三百年歷經地方和睦共築，象徵團結包容之福。",
    reminder: "多花時間陪伴家人，以溫柔耐心對待身邊夥伴。"
  },
  {
    slip_id: "fortune_culture_008",
    title: "行遠自邇",
    poem: "步步登高千里目，涓涓細水匯長流。",
    plain_language: "遠大志向需從小事做起。持之以恆、日拱一卒，微小的積累終將匯聚成澎湃江海。",
    cultural_note: "取自中庸「登高必自卑，行遠必自邇」。強調築基的重要性，鼓勵善信在專業領域踏實深耕。",
    reminder: "給自己設定階段性小目標，每天進步一點即是成功的開始。"
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
        event_title: event?.title || "萬春宮活動",
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
