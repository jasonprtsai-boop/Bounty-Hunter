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
  '以政府開放資料與觀光開放資料建立的萬春宮示範場景，非萬春宮官方系統。',
  '[]'
) on conflict (temple_id) do update set updated_at = now();

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
  status, registration_fields, payment_policy, demo_note
) values
  ('evt_20260806_guansheng','wcg_taichung_demo','關聖帝君聖誕佳辰','祭典參拜','official_public_reference','2026-08-06','09:00','11:00','萬春宮','臺中市中區成功路212號','國曆8月6日為關聖帝君聖誕佳辰，Demo 可用於近期祭典提醒。',false,null,0,'upcoming','{}',null,'公開活動資訊整理，非官方報名資料。'),
  ('evt_20260818_mazu_305','wcg_taichung_demo','開基媽祖來台305週年宮慶','宮慶活動','official_public_reference','2026-08-18','09:00','12:00','萬春宮','臺中市中區成功路212號','以宮慶紀念為主題，適合展示活動卡、提醒推播與文化導覽。',false,null,0,'upcoming','{}',null,'公開活動資訊整理，時間細節為 Demo 補齊。'),
  ('evt_20260827_zhongyuan','wcg_taichung_demo','中元普度法會示範報名','法會服務','official_public_reference_plus_demo_flow','2026-08-27','14:00','17:00','萬春宮','臺中市中區成功路212號','以公開中元普度法會資訊為背景，Demo 展示登記需求、廟方確認與提醒通知。',true,120,78,'open',array['姓名','手機','參加人數','祈福項目','備註'],'Demo 不串接真實金流，正式服務需由廟方確認。','報名名額、欄位與統計數字為示範資料。'),
  ('evt_demo_worship_intro','wcg_taichung_demo','第一次參拜導覽','導覽互動','team_demo_sample','2026-09-07','10:00','10:40','萬春宮正殿與拜殿','臺中市中區成功路212號','面向第一次到訪者，透過 LIFF 頁面與 AI 導覽了解參拜流程與建築特色。',true,30,18,'open',array['姓名','LINE 顯示名稱','參加人數','是否需要提醒'],null,'純 Demo 活動。'),
  ('evt_demo_culture_talk','wcg_taichung_demo','媽祖文化小講堂','文化教育','team_demo_sample','2026-09-14','15:00','16:00','萬春會館','臺中市中區成功路210號','介紹臺中媽祖信仰、萬春宮歷史與城市文化脈絡。',true,50,34,'open',array['姓名','手機','參加人數','想了解的主題'],null,'純 Demo 活動。')
on conflict (event_id) do nothing;

insert into fortune_slips (slip_id, temple_id, title, poem, plain_language, cultural_note, reminder) values
  ('fortune_culture_001','wcg_taichung_demo','靜心觀路','香煙一縷照初心，行到廟前問本心。','先把問題拆小，再決定下一步。這不是命運判斷，而是文化式的自我整理。','籤詩在民間文化中常被用來提醒人沉澱心緒；本 Demo 只提供文化解說。','不保證吉凶，不替代醫療、法律、財務或人生重大決策建議。'),
  ('fortune_culture_002','wcg_taichung_demo','循序成事','一階一履過前庭，風來仍聽鼓聲清。','事情適合分階段處理，先確認資訊來源，再安排時間與資源。','以宮廟建築動線作比喻，提醒使用者按部就班。','若問題涉及報名、付款或廟方決策，請以廟方公告為準。')
on conflict (slip_id) do nothing;

insert into tour_spots (code, temple_id, title, category, summary, cultural_note, image_url, source_type) values
  ('main-hall','wcg_taichung_demo','萬春宮正殿','參拜動線','示範點位：第一次到訪者可從正殿認識主祀天上聖母與基本參拜動線。','此內容依公開資料與 Demo 摘要整理，現場細節仍以廟方公告為準。','https://travel.taichung.gov.tw/content/images/attractions/60331/640x480_attractions-image-reeo_rka6kg04vfs2xyzmw.jpg','open_data_plus_demo_summary'),
  ('history-wall','wcg_taichung_demo','宮廟文化故事牆','文化導覽','示範點位：用 LINE LIFF 呈現萬春宮歷史、城市信仰與文化脈絡摘要。','正式導入前，歷史文字與圖片應由廟方審核或採用明確授權素材。',null,'demo_sample')
on conflict (code) do nothing;

insert into support_tickets (ticket_id, user_id, category, subject, message, status, priority, created_at) values
  ('ticket_demo_001','demo_u001','event_registration','想確認第一次參拜導覽是否可以帶家人','Demo 使用者詢問活動是否可增加同行人數。','open','general','2026-08-05T12:10:00+08:00'),
  ('ticket_demo_002','demo_u003','content_feedback','建議補充無障礙動線說明','Demo 使用者回饋導覽頁需要更明確的無障礙資訊。','triaged','general','2026-08-05T14:35:00+08:00')
on conflict (ticket_id) do nothing;

insert into notification_jobs (job_id, job_type, target_user_id, event_id, status, scheduled_at, payload) values
  ('job_demo_registration_confirmation','registration_confirmation','demo_u001','evt_demo_worship_intro','ready',null,'{"text":"Temple AI OS Demo：你的活動報名已建立。"}'),
  ('job_demo_event_reminder','event_reminder','demo_u002','evt_20260827_zhongyuan','draft','2026-08-26T18:00:00+08:00','{"text":"提醒：你報名的 Demo 活動即將開始，正式資訊仍以廟方公告為準。"}')
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
    '[{"source":"04_AI安全回覆規則.md","source_type":"demo_policy"}]'::jsonb
  ),
  (
    'rule_support',
    'wcg_taichung_demo',
    'support',
    '需要人工確認的客服問題',
    array['客服','真人','聯絡','工單','付款','收據','退款','失物','申訴','報名狀態','取消報名'],
    '{}',
    '若問題涉及報名狀態、付款、失物、申訴或廟方決策，建議建立客服工單由人工確認。Demo 系統只示範流程，不會直接代表廟方處理正式案件。',
    880,
    true,
    'fixed_support_reply',
    '[{"source":"客服工單示範規則","source_type":"demo_policy"}]'::jsonb
  ),
  (
    'rule_event_query',
    'wcg_taichung_demo',
    'event_query',
    '近期活動與報名查詢',
    array['活動','近期','報名','法會','講堂','中元','宮慶','導覽活動','書法','繪畫'],
    '{}',
    '目前可展示的近期活動如下；其中活動、報名與統計為 Demo 示範資料，正式資訊仍以廟方公告為準。',
    800,
    true,
    'fixed_event_reply',
    '[{"source":"demo_events.json","source_type":"team_demo_sample"}]'::jsonb
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
    '[{"source":"01_基本問答.md","title":"Q1：萬春宮在哪裡？","source_type":"open_data_plus_demo_summary"}]'::jsonb
  ),
  (
    'rule_worship_process',
    'wcg_taichung_demo',
    'worship_process',
    '第一次參拜流程',
    array['第一次','參拜','怎麼拜','拜拜','流程','正殿','香','主殿'],
    '{}',
    '第一次到訪可先保持安靜與尊重，依現場動線進入正殿，再依廟方公告、服務人員或現場指示參拜。Demo 只能提供一般文化導覽，不替代廟方正式流程說明。',
    700,
    true,
    'fixed_knowledge_reply',
    '[{"source":"02_參拜與服務流程.md","title":"第一次參拜流程","source_type":"demo_summary"}]'::jsonb
  ),
  (
    'rule_history_culture',
    'wcg_taichung_demo',
    'history_culture',
    '歷史文化與主祀介紹',
    array['歷史','文化','媽祖','主祀','天上聖母','藍興','藍廷珍','故事','沿革'],
    '{}',
    '萬春宮示範知識庫以公開資料與人工摘要整理媽祖信仰、主祀天上聖母與地方文化脈絡。若涉及年份、沿革細節或正式說法，仍應以廟方與文化主管機關資料為準。',
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
    '文化抽籤是 Demo 體驗，用來協助整理心情與閱讀民俗語感，不代表神諭、吉凶保證或人生重大決策建議。涉及醫療、法律、財務或安全時，請尋求專業協助。',
    620,
    true,
    'fixed_safety_reply',
    '[{"source":"文化抽籤安全規則","source_type":"demo_policy"}]'::jsonb
  ),
  (
    'rule_general_fallback',
    'wcg_taichung_demo',
    'general',
    '未命中時的固定安全回覆',
    '{}',
    '{}',
    '目前我只能回答萬春宮公開資料、活動、參拜流程、文化導覽與 Demo 操作問題。若問題涉及現場規則、付款或廟方決策，請以萬春宮公告或電話確認。',
    0,
    true,
    'fixed_fallback_reply',
    '[{"source":"固定安全回覆規則","source_type":"demo_policy"}]'::jsonb
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
  'All metrics are demo sample data, not official Wan Chun Gong operating data.',
  '{"line_friends":1268,"active_users_7d":342,"event_views_7d":918,"registrations_total":172,"ai_questions_7d":486,"knowledge_gap_count":11}',
  '[{"event_id":"evt_20260827_zhongyuan","title":"中元普度法會示範報名","views":328,"registrations":78,"reminder_opt_ins":65,"conversion_rate":0.238},{"event_id":"evt_demo_worship_intro","title":"第一次參拜導覽","views":146,"registrations":18,"reminder_opt_ins":17,"conversion_rate":0.123}]',
  '[{"intent":"temple_location","label":"地址與交通","count":88},{"intent":"worship_process","label":"第一次參拜流程","count":73},{"intent":"event_query","label":"近期活動查詢","count":69}]',
  '["停車場即時資訊","無障礙動線細節","現場祭典準確流程時間","官方報名規則細節","廟方授權圖片清單"]'
) on conflict (snapshot_date) do nothing;
