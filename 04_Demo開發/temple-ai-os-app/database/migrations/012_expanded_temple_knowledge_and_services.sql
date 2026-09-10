-- Migration 012: Expanded Temple Knowledge and Services
-- Adds full set of 11 deities, 6 tour spots, 8 cultural fortune slips, and 8 seasonal events for 萬春宮 (wcg_taichung_demo)

insert into deities (
  deity_id, temple_id, name, category, enshrined_area, description,
  birthday_lunar, service_notes, source_url, status, sort_order
) values
  ('deity_mazu', 'wcg_taichung_demo', '天上聖母（藍興媽祖）', '主祀神明', '正殿神龕', '萬春宮開基主神，清康熙六十年隨總兵藍廷珍渡臺，雍正元年建廟立基大墩，慈悲護佑臺中三百年。', '三月廿三日', '正殿設有求平安符、祈安疏文與聖母參拜導引。', 'https://www.lswc.org.tw/tw/?Page=about', 'published', 1),
  ('deity_guanyin', 'wcg_taichung_demo', '觀音佛祖', '主配祀神', '觀音佛祖神龕', '鎮殿觀音佛祖、老觀音佛祖與左觀音佛祖共同奉祀於神龕，大慈大悲，普度世間苦厄。', '二月十九日、六月十九日、九月十九日', '每年佛祖成道紀念日舉行祝壽祈安儀程。', 'https://www.lswc.org.tw/tw/?ID=5&Page=gods_list', 'published', 10),
  ('deity_zhusheng', 'wcg_taichung_demo', '註生娘娘', '主配祀神', '註生娘娘神龕', '掌管人間生育、保佑懷孕與孩童安康，神龕配祀婆姐、祿位牌位與值年太歲星君。', '三月二十日', '祈求生男育女、安胎順產與換花祈願，可洽現場服務人員。', 'https://www.lswc.org.tw/tw/?ID=5&Page=gods_list', 'published', 20),
  ('deity_sanguan', 'wcg_taichung_demo', '三官大帝', '副配祀神', '中案神桌', '奉祀天官一品賜福大帝、地官二品赦罪大帝、水官三品解厄大帝，考校人神功過。', '正月十五、七月十五、十月十五', '上元、中元、下元三元節期舉行隆重祈安消災植福法會。', 'https://www.lswc.org.tw/tw/?ID=6&Page=gods_list', 'published', 30),
  ('deity_wenchang', 'wcg_taichung_demo', '文昌帝君', '副配祀神', '副配祀神明區', '掌管天下功名、文運與仕途祿籍，為學子考取功名、求職升遷之守護主神。', '二月初三日', '考季提供文昌燈祈願登記、准考證影本祈安與開竅智慧筆。', 'https://www.lswc.org.tw/tw/?ID=6&Page=gods_list', 'published', 40),
  ('deity_guansheng', 'wcg_taichung_demo', '關聖帝君', '副配祀神', '正殿副神位', '三國蜀漢名將關羽，忠義貫日月，儒釋道三教共尊，亦為商業界信奉之武財神與正氣守護神。', '六月廿四日', '每年聖誕佳辰舉行祝壽典禮，護佑信眾忠信處世、事業亨通。', 'https://www.lswc.org.tw/tw/?ID=6&Page=gods_list', 'published', 45),
  ('deity_luxianzu', 'wcg_taichung_demo', '孚佑帝君（呂仙祖）', '客座神明', '客座神明區', '八仙之一純陽祖師呂洞賓，道教全真派祖師，以劍術智慧斬除貪嗔癡煩惱，護佑醫藥與文士。', '四月十四日', '敬拜仙祖點化智慧，排解心結煩憂。', 'https://www.lswc.org.tw/tw/?ID=7&Page=gods_list', 'published', 50),
  ('deity_qianliyan', 'wcg_taichung_demo', '千里眼將軍', '護法神明', '正殿與神龕前', '天上聖母左金精將軍，手執方天畫戟，眼觀千里，察查人間疾苦善惡。', '三月廿三日（隨聖母慶壽）', '正殿與拜殿皆有奉祀將軍神位，隨侍聖母左右護持。', 'https://www.lswc.org.tw/tw/?ID=8&Page=gods_list', 'published', 60),
  ('deity_shunfeng', 'wcg_taichung_demo', '順風耳將軍', '護法神明', '正殿與神龕前', '天上聖母右水精將軍，手持月牙斧，耳聽八方，傾聽萬民呼救之聲。', '三月廿三日（隨聖母慶壽）', '正殿與拜殿皆有奉祀將軍神位，隨侍聖母左右護持。', 'https://www.lswc.org.tw/tw/?ID=8&Page=gods_list', 'published', 70),
  ('deity_huye', 'wcg_taichung_demo', '虎爺將軍', '下壇將軍', '正殿神案下方', '山神與土地公之坐騎，鎮守下界除魔辟邪，相傳深具招財、咬錢進寶與守護幼童平安之威能。', '六月初六日', '信眾常備生雞蛋、肉品或豆乾誠心參拜，祈求避邪招財、孩童好養。', 'https://www.lswc.org.tw/tw/?Page=gods_list', 'published', 80),
  ('deity_taixui', 'wcg_taichung_demo', '值年太歲星君', '祈安奉祀', '配殿太歲神位', '六十甲子輪值太歲星君，主管人間一年吉凶禍福與行運流年。', '七月十九日', '每年立春至元宵提供信眾登記「安太歲」，祈求流年化凶逢吉、元辰光彩。', 'https://www.lswc.org.tw/tw/?Page=blessing', 'published', 90)
on conflict (deity_id) do update set
  name = excluded.name,
  category = excluded.category,
  enshrined_area = excluded.enshrined_area,
  description = excluded.description,
  birthday_lunar = excluded.birthday_lunar,
  service_notes = excluded.service_notes,
  source_url = excluded.source_url,
  status = excluded.status,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into tour_spots (code, temple_id, title, category, summary, cultural_note, image_url, source_type) values
  ('front-arch', 'wcg_taichung_demo', '天后閣牌樓山門', '建築山門', '萬春宮成功路迎賓牌坊，三間四柱宮殿式造型，典雅巍峨，為入廟參拜之第一道宏偉門戶。', '牌樓建於民國六十年代，頂覆琉璃瓦，斗拱飛簷氣宇非凡，正額題書天后閣，展現傳統寺廟營建技藝之美。', 'https://images.unsplash.com/photo-1548625361-16a928929e71?auto=format&fit=crop&w=1200&q=80', 'open_data_plus_service_summary'),
  ('stone-lions', 'wcg_taichung_demo', '萬春宮青斗石獅', '清代石雕', '廟埕一對青斗石古獅，公獅張口戲球、母獅閉口撫幼，雕刻精美雄健，為萬春宮鎮殿之寶。', '石獅雕工細膩靈動，造形線條古雅，歷經數百年風霜洗禮仍神采奕奕，為臺中市極珍貴的清代古石雕藝術瑰寶。', 'https://images.unsplash.com/photo-1590059390046-6086e42b260d?auto=format&fit=crop&w=1200&q=80', 'open_data_plus_service_summary'),
  ('main-hall', 'wcg_taichung_demo', '正殿 ‧ 天上聖母殿', '參拜動線', '萬春宮核心神聖殿堂，恭奉開基三百年藍興媽祖神尊，香煙裊裊，莊嚴肅穆。', '藍興媽祖自清康熙六十年（1721）隨福建總兵藍廷珍渡臺，雍正元年（1723）立廟大墩，歷久彌堅，為老城繁榮象徵。', 'https://travel.taichung.gov.tw/content/images/attractions/60331/640x480_attractions-image-reeo_rka6kg04vfs2xyzmw.jpg', 'open_data_plus_service_summary'),
  ('dragon-pillars', 'wcg_taichung_demo', '道光年間雕花龍柱', '石雕文物', '拜殿前保存之道光年間八角雕花龍柱，單龍蟠繞戲珠，柱身沉穩厚重，展現清中葉石雕巔峰風貌。', '此對龍柱為道光三年（1823）地方仕紳重修萬春宮時所敬獻，柱身刻工深峻，騰雲戲浪之勢躍然石上，見證建廟沿革。', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', 'temple_service'),
  ('plaque-relics', 'wcg_taichung_demo', '光緒御匾「海晏河清」與古鐘', '廟堂文物', '清光緒皇帝御賜「海晏河清」古匾與昭和年代銅鐘，象徵媽祖神威顯赫、海陸永安。', '「海晏河清」匾額懸於正殿大門上方，金字黑漆蒼勁有力，與殿內日治時期銅鐘相互輝映，為萬春宮三百年滄桑歷史之鐵證。', 'https://travel.taichung.gov.tw/content/images/attractions/60331/640x480_attractions-image-reeo_rka6kg04vfs2xyzmw.jpg', 'temple_service'),
  ('history-wall', 'wcg_taichung_demo', '宮廟文化故事牆', '文化導覽', '透過珍貴歷史照片與文史紀錄，細細品讀萬春宮老城信仰、大墩街拓墾與三百年風華。', '萬春宮歷經朱一貴事件、日治市區改正拆遷與戰後重建，為臺中舊城區核心信仰象徵；現場亦備有文史解說牌供善信閱讀。', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', 'temple_service')
on conflict (code) do update set
  title = excluded.title,
  category = excluded.category,
  summary = excluded.summary,
  cultural_note = excluded.cultural_note,
  image_url = excluded.image_url,
  source_type = excluded.source_type;

insert into fortune_slips (slip_id, temple_id, title, poem, plain_language, cultural_note, reminder) values
  ('fortune_culture_001', 'wcg_taichung_demo', '靜心觀路', '香煙一縷照初心，行到廟前問本心。', '先把紛亂思緒放下，將問題拆小，再按輕重緩急行事。這是一劑沉澱心性的自我整理良方。', '籤詩在民間信仰中常被用來提醒信眾靜心自省；心定則智慧生，凡事謀定而後動。', '內容僅供文化參考，重要廟務、醫療、法律或財務決策請尋求專業與公告指引。'),
  ('fortune_culture_002', 'wcg_taichung_demo', '循序成事', '一階一履過前庭，風來仍聽鼓聲清。', '事情宜循序漸進，切莫躁急盲動。先確認資訊與條件齊備，按部就班自能水到渠成。', '以宮殿建築之階石動線為喻，提醒處事要像登階一般踩穩每一步，步步踏實。', '若遇重大疑難，先確認事實依據，與親友師長充分商議後再行決定。'),
  ('fortune_culture_003', 'wcg_taichung_demo', '問清再行', '燈前莫急定行藏，問得分明路自長。', '資訊不明朗時切莫倉促下定論。多加打聽、核對細節，路徑自然開朗分明。', '傳統籤詩語感融合慎思明辨的生活處事哲學，提醒求籤者以理性智慧明辨是非曲折。', '線上文化籤詩旨在啟發思維；重要契約與決策請以廟方官方公告或客觀事實為憑。'),
  ('fortune_culture_004', 'wcg_taichung_demo', '積善福臨', '積德由來天自照，善心常伴福無窮。', '善念如春風化雨，日常多行善助人、廣結良緣，自然能逢凶化吉、常獲貴人相助。', '媽祖信仰核心在於慈悲為懷、濟困扶危。此籤體現傳統信仰「存好心、說好話、做好事」之德行本源。', '心懷善念，處世寬厚，即是最佳之護身庇佑。'),
  ('fortune_culture_005', 'wcg_taichung_demo', '誠敬道安', '心誠自有清泉湧，敬仰何須萬語多。', '待人處事以真誠為首要。不需多餘虛飾，心懷坦蕩與誠敬，自有明燈指引前路。', '取意於莊子「真者，精誠之至也」。傳統祭祀講究「誠心一炷香」，心正則神明自知。', '抱持真誠態度與合作夥伴或家人溝通，多數誤會皆能冰釋。'),
  ('fortune_culture_006', 'wcg_taichung_demo', '守正待時', '雪盡冰消春又回，莫教躁進損芳枝。', '當前若逢逆境或停滯，宜隱忍蓄力、充實自我。待時機成熟，春天自然百花齊放。', '源於易經「君子藏器於身，待時而動」之智慧。時機未至時守正固本，時機一到自展宏圖。', '面對挑戰保持耐心與韌性，切莫因一時情緒影響大局。'),
  ('fortune_culture_007', 'wcg_taichung_demo', '和氣致祥', '滿座春風多樂意，一門和睦自興隆。', '家和萬事興，團隊協同以和為貴。多傾聽包容少計較，自能聚氣生財、合家平安。', '民間有言「和氣生財、家和業興」。萬春宮三百年歷經地方和睦共築，象徵團結包容之福。', '多花時間陪伴家人，以溫柔耐心對待身邊夥伴。'),
  ('fortune_culture_008', 'wcg_taichung_demo', '行遠自邇', '步步登高千里目，涓涓細水匯長流。', '遠大志向需從小事做起。持之以恆、日拱一卒，微小的積累終將匯聚成澎湃江海。', '取自中庸「登高必自卑，行遠必自邇」。強調築基的重要性，鼓勵善信在專業領域踏實深耕。', '給自己設定階段性小目標，每天進步一點即是成功的開始。')
on conflict (slip_id) do update set
  title = excluded.title,
  poem = excluded.poem,
  plain_language = excluded.plain_language,
  cultural_note = excluded.cultural_note,
  reminder = excluded.reminder;

insert into events (
  event_id, temple_id, title, category, source_type, event_date, start_time, end_time,
  location, address, summary, requires_registration, capacity, registered_count,
  status, registration_fields, payment_policy, demo_note, max_party_size, waitlist_enabled
) values
  ('evt_demo_calligraphy', 'wcg_taichung_demo', '萬春盃書法體驗日', '文化教育', 'official_public_reference_plus_service_flow', '2026-09-20', '13:30', '16:30', '萬春會館', '臺中市中區成功路210號', '發揚傳統寺廟藝文與書法之美，舉辦現場揮毫與書法文化觀摩體驗。', true, 60, 42, 'open', array['姓名', '年級/身份', '聯絡電話', '陪同人數'], null, '體驗活動與材料準備請依現場說明為準。', 10, false),
  ('evt_20261019_chongyang_lidou', 'wcg_taichung_demo', '重陽秋季祈安禮斗大法會', '法會服務', 'temple_service', '2026-10-19', '09:00', '17:00', '萬春宮正殿與斗堂', '臺中市中區成功路212號', '欣逢重陽秋祭，萬春宮啟建祈安植福禮斗大法會，恭祈天尊庇佑善信消災解厄、元辰光彩、延壽迎祥。', true, 150, 92, 'open', array['姓名', '手機', '安奉斗別', '合家丁口', '備註'], '請於現場服務處確認登記或由廟方服務人員引導辦理。', '禮斗登記名額有限，敬請提早辦理以利入疏安奉。', 10, true),
  ('evt_20270205_spring_blessing', 'wcg_taichung_demo', '新春祈福消災點燈與安太歲', '祈福服務', 'temple_service', '2027-02-05', '08:30', '17:30', '萬春宮辦事處', '臺中市中區成功路212號', '萬春宮新春祈安點燈開始預約登記，包含光明燈、文昌燈、太歲燈、安太歲與平安米祈福，祈求新歲家宅安康。', true, 300, 168, 'open', array['信士姓名', '農曆生辰', '聯絡電話', '祈福項目', '通訊地址'], '現場服務台辦理登記與開立安奉祈福憑條。', '新年點燈依登記入殿安奉，額滿即止。', 10, true)
on conflict (event_id) do update set
  title = excluded.title,
  category = excluded.category,
  event_date = excluded.event_date,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  location = excluded.location,
  address = excluded.address,
  summary = excluded.summary,
  requires_registration = excluded.requires_registration,
  capacity = excluded.capacity,
  registered_count = excluded.registered_count,
  status = excluded.status,
  registration_fields = excluded.registration_fields,
  payment_policy = excluded.payment_policy,
  demo_note = excluded.demo_note,
  max_party_size = excluded.max_party_size,
  waitlist_enabled = excluded.waitlist_enabled;
