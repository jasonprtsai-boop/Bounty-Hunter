insert into temples (
  temple_id, name, aliases, main_deity, religion, registration_status, tax_id,
  address, phone, coordinates, image, demo_positioning, sources
) values (
  'wcg_taichung_demo',
  '萬春宮',
  array['台中媽祖', '藍興媽祖'],
  '天上聖母',
  '道教',
  '正式登記',
  '02987849',
  '臺中市中區成功路212號',
  '04-22245964',
  '{"longitude":120.681602478027,"latitude":24.1420803070068}',
  '{"url":"https://travel.taichung.gov.tw/content/images/attractions/60331/640x480_attractions-image-reeo_rka6kg04vfs2xyzmw.jpg","source":"臺中市政府觀光旅遊局，觀光多媒體開放資料「萬春宮」","license":"Open Government Data License"}',
  '依政府開放資料與觀光開放資料整理的萬春宮服務資訊；正式活動與服務細節請以廟方公告為準。',
  '[]'
) on conflict (temple_id) do update set updated_at = now();

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

insert into line_users (user_id, line_display_name, segment, consent_status, interests) values
  ('demo_u001', '小安', 'new_visitor', 'demo_consented', array['第一次參拜','交通','活動提醒']),
  ('demo_u002', '阿哲', 'regular_visitor', 'demo_consented', array['祭典','媽祖文化','推播提醒']),
  ('demo_u003', 'Mei', 'culture_learner', 'demo_consented', array['建築特色','歷史','導覽']),
  ('demo_u004', '志工王', 'volunteer', 'demo_consented', array['活動協助','報到管理']),
  ('demo_u005', '林小姐', 'parent', 'demo_consented', array['親子活動','書法','繪畫'])
on conflict (user_id) do nothing;

insert into events (
  event_id, temple_id, title, category, source_type, event_date, start_time, end_time,
  location, address, summary, requires_registration, capacity, registered_count,
  status, registration_fields, payment_policy, demo_note, max_party_size, waitlist_enabled
) values
  ('evt_20260806_guansheng','wcg_taichung_demo','關聖帝君聖誕佳辰','祭典參拜','official_public_reference','2026-08-06','09:00','11:00','萬春宮','臺中市中區成功路212號','國曆8月6日為關聖帝君聖誕佳辰，萬春宮舉行祝壽參拜儀程，祈願善信安泰、事業順達。',false,null,0,'upcoming','{}',null,'法會儀程與參拜時間請依廟方現場公告為準。',10,false),
  ('evt_20260818_mazu_305','wcg_taichung_demo','開基媽祖來台305週年宮慶','宮慶活動','official_public_reference','2026-08-18','09:00','12:00','萬春宮','臺中市中區成功路212號','欣逢開基媽祖來台305週年宮慶，舉行文化導覽與感恩祈福祭典，歡迎善信共沐神恩。',false,null,0,'upcoming','{}',null,'宮慶活動詳情與導覽梯次請依廟方公告為準。',10,false),
  ('evt_20260827_zhongyuan','wcg_taichung_demo','中元普度法會線上報名','法會服務','official_public_reference_plus_service_flow','2026-08-27','14:00','17:00','萬春宮','臺中市中區成功路212號','萬春宮中元普度超拔拔薦法會，提供信眾預先登記消災祈福與普度項目。',true,120,78,'open',array['姓名','手機','參加人數','祈福項目','備註'],'請於現場服務處確認登記或由廟方服務人員引導辦理。','報名名額、祈福項目與活動細節請以現場公告為準。',10,false),
  ('evt_demo_worship_intro','wcg_taichung_demo','第一次參拜導覽','導覽互動','temple_service','2026-09-07','10:00','10:40','萬春宮正殿與拜殿','臺中市中區成功路212號','專為初次到訪善信規劃之正殿參拜導覽，深入認識天上聖母歷史與殿堂建築特色。',true,30,18,'open',array['姓名','LINE 顯示名稱','參加人數','是否需要提醒'],null,'活動內容與導覽規則請依現場志工與公告引導。',10,false),
  ('evt_demo_culture_talk','wcg_taichung_demo','媽祖文化小講堂','文化教育','temple_service','2026-09-14','15:00','16:00','萬春會館','臺中市中區成功路210號','邀請文史學者分享臺中媽祖信仰淵源、萬春宮建廟歷史與城市發展脈絡。',true,50,34,'open',array['姓名','手機','參加人數','想了解的主題'],null,'講座名額有限，報名規範請依廟方公告為準。',10,false),
  ('evt_demo_calligraphy','wcg_taichung_demo','萬春盃書法體驗日','文化教育','official_public_reference_plus_service_flow','2026-09-20','13:30','16:30','萬春會館','臺中市中區成功路210號','發揚傳統寺廟藝文與書法之美，舉辦現場揮毫與書法文化觀摩體驗。',true,60,42,'open',array['姓名','年級/身份','聯絡電話','陪同人數'],null,'體驗活動與材料準備請依現場說明為準。',10,false),
  ('evt_20261019_chongyang_lidou','wcg_taichung_demo','重陽秋季祈安禮斗大法會','法會服務','temple_service','2026-10-19','09:00','17:00','萬春宮正殿與斗堂','臺中市中區成功路212號','欣逢重陽秋祭，萬春宮啟建祈安植福禮斗大法會，恭祈天尊庇佑善信消災解厄、元辰光彩、延壽迎祥。',true,150,92,'open',array['姓名','手機','安奉斗別','合家丁口','備註'],'請於現場服務處確認登記或由廟方服務人員引導辦理。','禮斗登記名額有限，敬請提早辦理以利入疏安奉。',10,true),
  ('evt_20270205_spring_blessing','wcg_taichung_demo','新春祈福消災點燈與安太歲','祈福服務','temple_service','2027-02-05','08:30','17:30','萬春宮辦事處','臺中市中區成功路212號','萬春宮新春祈安點燈開始預約登記，包含光明燈、文昌燈、太歲燈、安太歲與平安米祈福，祈求新歲家宅安康。',true,300,168,'open',array['信士姓名','農曆生辰','聯絡電話','祈福項目','通訊地址'],'現場服務台辦理登記與開立安奉祈福憑條。','新年點燈依登記入殿安奉，額滿即止。',10,true)
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

insert into fortune_slips (slip_id, temple_id, title, poem, plain_language, cultural_note, reminder) values
  ('fortune_culture_001','wcg_taichung_demo','靜心觀路','香煙一縷照初心，行到廟前問本心。','先把問題拆小，再決定下一步。這不是命運判斷，而是文化式的自我整理。','籤詩在民間文化中常被用來提醒人沉澱心緒；本服務只提供文化解說。','不保證吉凶，不替代醫療、法律、財務或人生重大決策建議。'),
  ('fortune_culture_002','wcg_taichung_demo','循序成事','一階一履過前庭，風來仍聽鼓聲清。','事情適合分階段處理，先確認資訊來源，再安排時間與資源。','以宮廟建築動線作比喻，提醒使用者按部就班。','若問題涉及報名、付款或廟方決策，請以廟方公告為準。'),
  ('fortune_culture_003','wcg_taichung_demo','問清再行','燈前莫急定行藏，問得分明路自長。','資訊不明朗時切莫倉促下定論。多加打聽、核對細節，路徑自然開朗分明。','傳統籤詩語感融合慎思明辨的生活處事哲學，提醒求籤者以理性智慧明辨是非曲折。','線上文化籤詩旨在啟發思維；重要契約與決策請以廟方官方公告或客觀事實為憑。'),
  ('fortune_culture_004','wcg_taichung_demo','積善福臨','積德由來天自照，善心常伴福無窮。','善念如春風化雨，日常多行善助人、廣結良緣，自然能逢凶化吉、常獲貴人相助。','媽祖信仰核心在於慈悲為懷、濟困扶危。此籤體現傳統信仰「存好心、說好話、做好事」之德行本源。','心懷善念，處世寬厚，即是最佳之護身庇佑。'),
  ('fortune_culture_005','wcg_taichung_demo','誠敬道安','心誠自有清泉湧，敬仰何須萬語多。','待人處事以真誠為首要。不需多餘虛飾，心懷坦蕩與誠敬，自有明燈指引前路。','取意於莊子「真者，精誠之至也」。傳統祭祀講究「誠心一炷香」，心正則神明自知。','抱持真誠態度與合作夥伴或家人溝通，多數誤會皆能冰釋。'),
  ('fortune_culture_006','wcg_taichung_demo','守正待時','雪盡冰消春又回，莫教躁進損芳枝。','當前若逢逆境或停滯，宜隱忍蓄力、充實自我。待時機成熟，春天自然百花齊放。','源於易經「君子藏器於身，待時而動」之智慧。時機未至時守正固本，時機一到自展宏圖。','面對挑戰保持耐心與韌性，切莫因一時情緒影響大局。'),
  ('fortune_culture_007','wcg_taichung_demo','和氣致祥','滿座春風多樂意，一門和睦自興隆。','家和萬事興，團隊協同以和為貴。多傾聽包容少計較，自能聚氣生財、合家平安。','民間有言「和氣生財、家和業興」。萬春宮三百年歷經地方和睦共築，象徵團結包容之福。','多花時間陪伴家人，以溫柔耐心對待身邊夥伴。'),
  ('fortune_culture_008','wcg_taichung_demo','行遠自邇','步步登高千里目，涓涓細水匯長流。','遠大志向需從小事做起。持之以恆、日拱一卒，微小的積累終將匯聚成澎湃江海。','取自中庸「登高必自卑，行遠必自邇」。強調築基的重要性，鼓勵善信在專業領域踏實深耕。','給自己設定階段性小目標，每天進步一點即是成功的開始。')
on conflict (slip_id) do update set
  title = excluded.title,
  poem = excluded.poem,
  plain_language = excluded.plain_language,
  cultural_note = excluded.cultural_note,
  reminder = excluded.reminder;

insert into tour_spots (code, temple_id, title, category, summary, cultural_note, image_url, source_type) values
  ('front-arch','wcg_taichung_demo','天后閣牌樓山門','建築山門','萬春宮成功路迎賓牌坊，三間四柱宮殿式造型，典雅巍峨，為入廟參拜之第一道宏偉門戶。','牌樓建於民國六十年代，頂覆琉璃瓦，斗拱飛簷氣宇非凡，正額題書天后閣，展現傳統寺廟營建技藝之美。','https://images.unsplash.com/photo-1548625361-16a928929e71?auto=format&fit=crop&w=1200&q=80','open_data_plus_service_summary'),
  ('stone-lions','wcg_taichung_demo','萬春宮青斗石獅','清代石雕','廟埕一對青斗石古獅，公獅張口戲球、母獅閉口撫幼，雕刻精美雄健，為萬春宮鎮殿之寶。','石獅雕工細膩靈動，造形線條古雅，歷經數百年風霜洗禮仍神采奕奕，為臺中市極珍貴的清代古石雕藝術瑰寶。','https://images.unsplash.com/photo-1590059390046-6086e42b260d?auto=format&fit=crop&w=1200&q=80','open_data_plus_service_summary'),
  ('main-hall','wcg_taichung_demo','正殿 ‧ 天上聖母殿','參拜動線','第一次到訪者可從正殿認識主祀天上聖母與基本參拜動線。','正殿為參拜核心空間，建議先確認現場動線與開放區域。','https://travel.taichung.gov.tw/content/images/attractions/60331/640x480_attractions-image-reeo_rka6kg04vfs2xyzmw.jpg','open_data_plus_service_summary'),
  ('dragon-pillars','wcg_taichung_demo','道光年間雕花龍柱','石雕文物','拜殿前保存之道光年間八角雕花龍柱，單龍蟠繞戲珠，柱身沉穩厚重，展現清中葉石雕巔峰風貌。','此對龍柱為道光三年（1823）地方仕紳重修萬春宮時所敬獻，柱身刻工深峻，騰雲戲浪之勢躍然石上，見證建廟沿革。','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80','temple_service'),
  ('plaque-relics','wcg_taichung_demo','光緒御匾「海晏河清」與古鐘','廟堂文物','清光緒皇帝御賜「海晏河清」古匾與昭和年代銅鐘，象徵媽祖神威顯赫、海陸永安。','「海晏河清」匾額懸於正殿大門上方，金字黑漆蒼勁有力，與殿內日治時期銅鐘相互輝映，為萬春宮三百年滄桑歷史之鐵證。','https://travel.taichung.gov.tw/content/images/attractions/60331/640x480_attractions-image-reeo_rka6kg04vfs2xyzmw.jpg','temple_service'),
  ('history-wall','wcg_taichung_demo','宮廟文化故事牆','文化導覽','透過珍貴歷史照片與文史紀錄，細細品讀萬春宮老城信仰與三百年風華。','萬春宮歷經數百年歲月，是臺中舊城區核心信仰象徵；現場亦備有文史解說牌供善信閱讀。','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80','temple_service')
on conflict (code) do update set
  title = excluded.title,
  category = excluded.category,
  summary = excluded.summary,
  cultural_note = excluded.cultural_note,
  image_url = excluded.image_url,
  source_type = excluded.source_type;

insert into support_tickets (ticket_id, user_id, category, subject, message, status, priority, created_at) values
  ('ticket_demo_001','demo_u001','event_registration','想確認第一次參拜導覽是否可以帶家人','使用者詢問活動是否可增加同行人數。','open','general','2026-08-05T12:10:00+08:00'),
  ('ticket_demo_002','demo_u003','content_feedback','建議補充無障礙動線說明','使用者回饋導覽頁需要更明確的無障礙資訊。','triaged','general','2026-08-05T14:35:00+08:00')
on conflict (ticket_id) do nothing;

insert into notification_jobs (job_id, job_type, target_user_id, event_id, status, scheduled_at, payload) values
  ('job_demo_registration_confirmation','registration_confirmation','demo_u001','evt_demo_worship_intro','ready',null,'{"text":"萬春宮線上服務：你的活動報名已建立。"}'),
  ('job_demo_event_reminder','event_reminder','demo_u002','evt_20260827_zhongyuan','draft','2026-08-26T18:00:00+08:00','{"text":"提醒：你報名的活動即將開始，正式資訊仍以廟方公告為準。"}')
on conflict (job_id) do nothing;

insert into faq_rules (
  rule_id, temple_id, intent, title, keywords, negative_keywords, reply,
  priority, enabled, source_type, source_refs
) values
  (
    'rule_safety_boundary',
    'wcg_taichung_demo',
    'safety_boundary',
    '重大決策與宗教斷言安全邊界',
    array['投資','股票','借錢','法律','提告','告人','被告','疾病','生病','藥','考試會不會上','感情會不會','財運','命運','神明告訴','神明指示'],
    '{}',
    '這類問題可能涉及命運、醫療、法律或財務等重大判斷，我不能斷言結果。我可以提供公開資料、文化背景與一般參拜資訊，但不能代表神明或廟方作出指示。',
    1000,
    true,
    'fixed_safety_reply',
    '[{"source":"04_安全回覆規則.md","source_type":"safety_policy"}]'::jsonb
  ),
  (
    'rule_support',
    'wcg_taichung_demo',
    'support',
    '需要人工確認的客服問題',
    array['客服','真人','聯絡','工單','付款','收據','退款','失物','申訴','報名狀態','取消報名'],
    '{}',
    '若問題涉及報名狀態、付款、失物、申訴或廟方決策，建議建立客服工單由人工確認。線上服務不會直接代表廟方處理正式案件。',
    880,
    true,
    'fixed_support_reply',
    '[{"source":"客服工單處理規則","source_type":"service_policy"}]'::jsonb
  ),
  (
    'rule_event_query',
    'wcg_taichung_demo',
    'event_query',
    '近期活動與報名查詢',
    array['活動','近期','報名','法會','講堂','中元','宮慶','導覽活動','書法','繪畫'],
    '{}',
    '目前可查看的近期活動如下；活動、報名與統計資訊仍以廟方公告為準。',
    800,
    true,
    'fixed_event_reply',
    '[{"source":"demo_events.json","source_type":"temple_service"}]'::jsonb
  ),
  (
    'rule_temple_location',
    'wcg_taichung_demo',
    'temple_location',
    '地址、電話與交通',
    array['地址','在哪','在哪裡','交通','怎麼去','電話','停車','成功路212號'],
    '{}',
    '萬春宮地址是臺中市中區成功路212號，電話是 04-22245964。交通、開放時間、停車與現場動線仍建議以廟方公告或現場指示為準。',
    700,
    true,
    'fixed_knowledge_reply',
    '[{"source":"01_基本問答.md","title":"Q1：萬春宮在哪裡？","source_type":"open_data_plus_service_summary"}]'::jsonb
  ),
  (
    'rule_worship_process',
    'wcg_taichung_demo',
    'worship_process',
    '第一次參拜流程',
    array['第一次','參拜','怎麼拜','拜拜','流程','正殿','香','主殿'],
    '{}',
    '第一次到訪可先保持安靜與尊重，依現場動線進入正殿，再依廟方公告、服務人員或現場指示參拜。本服務只能提供一般文化導覽，不替代廟方正式流程說明。',
    700,
    true,
    'fixed_knowledge_reply',
    '[{"source":"02_參拜與服務流程.md","title":"第一次參拜流程","source_type":"service_summary"}]'::jsonb
  ),
  (
    'rule_history_culture',
    'wcg_taichung_demo',
    'history_culture',
    '歷史文化與主祀介紹',
    array['歷史','文化','媽祖','主祀','天上聖母','藍興','藍廷珍','故事','沿革'],
    '{}',
    '萬春宮知識庫以公開資料與人工摘要整理媽祖信仰、主祀天上聖母與地方文化脈絡。若涉及年份、沿革細節或正式說法，仍應以廟方與文化主管機關資料為準。',
    650,
    true,
    'fixed_knowledge_reply',
    '[{"source":"03_歷史文化建築摘要.md","title":"歷史文化建築摘要","source_type":"knowledge_base"}]'::jsonb
  ),
  (
    'rule_fortune',
    'wcg_taichung_demo',
    'fortune',
    '文化抽籤與籤詩邊界',
    array['抽籤','籤詩','求籤','文化抽籤','解籤'],
    '{}',
    '文化抽籤是文化體驗，用來協助整理心情與閱讀民俗語感，不代表神諭、吉凶保證或人生重大決策建議。涉及醫療、法律、財務或安全時，請尋求專業協助。',
    620,
    true,
    'fixed_safety_reply',
    '[{"source":"文化抽籤安全規則","source_type":"safety_policy"}]'::jsonb
  ),
  (
    'rule_general_fallback',
    'wcg_taichung_demo',
    'general',
    '未命中時的固定安全回覆',
    '{}',
    '{}',
    '目前我只能回答萬春宮公開資料、活動、參拜流程、文化導覽與線上服務操作問題。若問題涉及現場規則、付款或廟方決策，請以萬春宮公告或電話確認。',
    0,
    true,
    'fixed_fallback_reply',
    '[{"source":"固定安全回覆規則","source_type":"service_policy"}]'::jsonb
  )
on conflict (rule_id) do update set
  temple_id = excluded.temple_id,
  intent = excluded.intent,
  title = excluded.title,
  keywords = excluded.keywords,
  negative_keywords = excluded.negative_keywords,
  reply = excluded.reply,
  priority = excluded.priority,
  enabled = excluded.enabled,
  source_type = excluded.source_type,
  source_refs = excluded.source_refs,
  updated_at = now();

insert into dashboard_snapshots (
  snapshot_date, temple_id, notice, headline_metrics, event_metrics, top_ai_intents, knowledge_gaps
) values (
  '2026-08-05',
  'wcg_taichung_demo',
  'Dashboard 指標供服務檢查使用；正式活動、名額與營運數據仍以廟方確認為準。',
  '{"line_friends":1268,"active_users_7d":342,"event_views_7d":918,"registrations_total":172,"ai_questions_7d":486,"knowledge_gap_count":11}',
  '[{"event_id":"evt_20260827_zhongyuan","title":"中元普度法會線上報名","views":328,"registrations":78,"reminder_opt_ins":65,"conversion_rate":0.238},{"event_id":"evt_demo_worship_intro","title":"第一次參拜導覽","views":146,"registrations":18,"reminder_opt_ins":17,"conversion_rate":0.123}]',
  '[{"intent":"temple_location","label":"地址與交通","count":88},{"intent":"worship_process","label":"第一次參拜流程","count":73},{"intent":"event_query","label":"近期活動查詢","count":69}]',
  '["停車場即時資訊","無障礙動線細節","現場祭典準確流程時間","官方報名規則細節","廟方授權圖片清單"]'
) on conflict (snapshot_date) do nothing;
