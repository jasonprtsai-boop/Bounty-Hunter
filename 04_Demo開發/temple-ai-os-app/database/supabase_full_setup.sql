-- Temple AI OS Supabase full setup
-- Execute this file in Supabase SQL Editor for a fresh project.
-- It is generated from database/migrations/*.sql plus database/seeds/demo_seed.sql.


-- ============================================================
-- 001_init.sql
-- ============================================================

create extension if not exists pgcrypto;
create extension if not exists vector;

create table if not exists temples (
  temple_id text primary key,
  name text not null,
  aliases text[] not null default '{}',
  main_deity text not null,
  religion text,
  registration_status text,
  tax_id text,
  address text not null,
  phone text,
  coordinates jsonb not null default '{}',
  image jsonb,
  demo_positioning text not null,
  sources jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists line_users (
  user_id text primary key,
  line_display_name text not null,
  picture_url text,
  segment text not null default 'visitor',
  consent_status text not null default 'demo_consented',
  interests text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists members (
  member_id uuid primary key default gen_random_uuid(),
  user_id text not null unique references line_users(user_id) on delete cascade,
  display_name text,
  phone text,
  reminder_opt_in boolean not null default true,
  privacy_version text not null default 'demo-v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists events (
  event_id text primary key,
  temple_id text not null references temples(temple_id) on delete cascade,
  title text not null,
  category text not null,
  source_type text not null,
  event_date date not null,
  start_time time not null,
  end_time time not null,
  location text not null,
  address text not null,
  summary text not null,
  requires_registration boolean not null default false,
  capacity integer,
  registered_count integer not null default 0,
  status text not null default 'draft',
  registration_fields text[] not null default '{}',
  payment_policy text,
  demo_note text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists event_registrations (
  registration_id text primary key,
  event_id text not null references events(event_id) on delete cascade,
  user_id text not null references line_users(user_id) on delete cascade,
  status text not null default 'confirmed',
  party_size integer not null check (party_size between 1 and 10),
  reminder_opt_in boolean not null default true,
  contact_name text,
  phone text,
  note text,
  check_in_token text not null default encode(gen_random_bytes(16), 'hex'),
  checked_in_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  message_id uuid primary key default gen_random_uuid(),
  user_id text references line_users(user_id) on delete set null,
  channel text not null default 'line',
  user_text text not null,
  intent text,
  ai_reply text,
  source_refs jsonb not null default '[]',
  demo_notice text,
  created_at timestamptz not null default now()
);

create table if not exists knowledge_documents (
  document_id text primary key,
  temple_id text not null references temples(temple_id) on delete cascade,
  title text not null,
  body text not null,
  source_type text not null,
  source_url text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists knowledge_chunks (
  chunk_id uuid primary key default gen_random_uuid(),
  document_id text not null references knowledge_documents(document_id) on delete cascade,
  chunk_index integer not null,
  title text not null,
  content text not null,
  source_type text not null,
  embedding vector(3072),
  created_at timestamptz not null default now(),
  unique (document_id, chunk_index)
);

-- The demo uses text-embedding-3-large (3072 dimensions). pgvector's ivfflat
-- index is limited to 2000 dimensions on this Supabase project, so the small
-- demo knowledge base uses exact scan through match_knowledge_chunks instead.

create table if not exists support_tickets (
  ticket_id text primary key,
  user_id text references line_users(user_id) on delete set null,
  category text not null,
  subject text not null,
  message text not null,
  status text not null default 'open',
  priority text not null default 'general',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tour_spots (
  code text primary key,
  temple_id text not null references temples(temple_id) on delete cascade,
  title text not null,
  category text not null,
  summary text not null,
  cultural_note text not null,
  image_url text,
  source_type text not null default 'demo_sample',
  created_at timestamptz not null default now()
);

create table if not exists fortune_slips (
  slip_id text primary key,
  temple_id text not null references temples(temple_id) on delete cascade,
  title text not null,
  poem text not null,
  plain_language text not null,
  cultural_note text not null,
  reminder text not null,
  status text not null default 'published',
  created_at timestamptz not null default now()
);

create table if not exists notification_jobs (
  job_id text primary key,
  job_type text not null,
  target_user_id text references line_users(user_id) on delete set null,
  event_id text references events(event_id) on delete cascade,
  status text not null default 'draft',
  scheduled_at timestamptz,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists rich_menu_versions (
  version_id text primary key,
  rich_menu_id text,
  alias_id text,
  payload jsonb not null,
  image_path text,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  audit_id uuid primary key default gen_random_uuid(),
  actor_id text,
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists dashboard_snapshots (
  snapshot_date date primary key,
  temple_id text not null references temples(temple_id) on delete cascade,
  notice text not null,
  headline_metrics jsonb not null,
  event_metrics jsonb not null,
  top_ai_intents jsonb not null,
  knowledge_gaps jsonb not null,
  created_at timestamptz not null default now()
);


-- ============================================================
-- 002_rls_policies.sql
-- ============================================================

alter table temples enable row level security;
alter table line_users enable row level security;
alter table members enable row level security;
alter table events enable row level security;
alter table event_registrations enable row level security;
alter table messages enable row level security;
alter table knowledge_documents enable row level security;
alter table knowledge_chunks enable row level security;
alter table support_tickets enable row level security;
alter table tour_spots enable row level security;
alter table fortune_slips enable row level security;
alter table notification_jobs enable row level security;
alter table rich_menu_versions enable row level security;
alter table audit_logs enable row level security;
alter table dashboard_snapshots enable row level security;

drop policy if exists "public read published temple profile" on temples;
create policy "public read published temple profile"
  on temples for select
  using (true);

drop policy if exists "public read published events" on events;
create policy "public read published events"
  on events for select
  using (status in ('open', 'upcoming', 'published'));

drop policy if exists "public read tour spots" on tour_spots;
create policy "public read tour spots"
  on tour_spots for select
  using (true);

drop policy if exists "public read published fortune slips" on fortune_slips;
create policy "public read published fortune slips"
  on fortune_slips for select
  using (status = 'published');

drop policy if exists "public read demo dashboard" on dashboard_snapshots;
create policy "public read demo dashboard"
  on dashboard_snapshots for select
  using (true);

-- Writes should go through FastAPI with the Supabase service role key.
-- Supabase service_role bypasses RLS; anon clients intentionally have no write policy here.


-- ============================================================
-- 003_line_webhook_events.sql
-- ============================================================

create table if not exists line_webhook_events (
  event_id text primary key,
  processed_at timestamptz not null default now()
);

alter table line_webhook_events enable row level security;

-- LINE webhook writes go through FastAPI with the Supabase service role key.
-- Anon clients intentionally have no read or write policy for webhook event IDs.


-- ============================================================
-- 004_search_and_atomic_registration.sql
-- ============================================================

create or replace function match_knowledge_chunks(
  query_embedding vector(3072),
  match_threshold double precision default 0.15,
  match_count integer default 3
)
returns table (
  document_id text,
  chunk_index integer,
  title text,
  content text,
  source_type text,
  similarity double precision
)
language sql
stable
as $$
  select
    knowledge_chunks.document_id,
    knowledge_chunks.chunk_index,
    knowledge_chunks.title,
    knowledge_chunks.content,
    knowledge_chunks.source_type,
    1 - (knowledge_chunks.embedding <=> query_embedding) as similarity
  from knowledge_chunks
  where knowledge_chunks.embedding is not null
    and 1 - (knowledge_chunks.embedding <=> query_embedding) >= match_threshold
  order by knowledge_chunks.embedding <=> query_embedding
  limit least(match_count, 20);
$$;

create or replace function register_for_event(
  p_event_id text,
  p_user_id text,
  p_contact_name text,
  p_phone text default null,
  p_party_size integer default 1,
  p_reminder_opt_in boolean default true,
  p_note text default null
)
returns event_registrations
language plpgsql
as $$
declare
  locked_event events%rowtype;
  confirmed_total integer;
  new_registration event_registrations%rowtype;
begin
  select *
    into locked_event
    from events
   where event_id = p_event_id
   for update;

  if not found then
    raise exception 'event_not_found';
  end if;

  if not locked_event.requires_registration then
    raise exception 'registration_not_required';
  end if;

  if p_party_size < 1 or p_party_size > 10 then
    raise exception 'invalid_party_size';
  end if;

  select coalesce(sum(party_size), 0)
    into confirmed_total
    from event_registrations
   where event_id = p_event_id
     and status in ('confirmed', 'pending_review');

  if locked_event.capacity is not null and confirmed_total + p_party_size > locked_event.capacity then
    raise exception 'event_capacity_exceeded';
  end if;

  insert into event_registrations (
    registration_id,
    event_id,
    user_id,
    status,
    party_size,
    reminder_opt_in,
    contact_name,
    phone,
    note
  )
  values (
    'reg_' || encode(gen_random_bytes(4), 'hex'),
    p_event_id,
    p_user_id,
    'confirmed',
    p_party_size,
    p_reminder_opt_in,
    p_contact_name,
    p_phone,
    p_note
  )
  returning * into new_registration;

  update events
     set registered_count = confirmed_total + p_party_size,
         updated_at = now()
   where event_id = p_event_id;

  return new_registration;
end;
$$;


-- ============================================================
-- 005_faq_rules.sql
-- ============================================================

create table if not exists faq_rules (
  rule_id text primary key,
  temple_id text references temples(temple_id) on delete cascade,
  intent text not null,
  title text not null,
  keywords text[] not null default '{}',
  negative_keywords text[] not null default '{}',
  reply text not null,
  priority integer not null default 100,
  enabled boolean not null default true,
  source_type text not null default 'fixed_reply',
  source_refs jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists faq_rules_enabled_priority_idx
  on faq_rules (enabled, priority desc, rule_id asc);

alter table faq_rules enable row level security;

drop policy if exists "public read enabled faq rules" on faq_rules;

create policy "public read enabled faq rules"
  on faq_rules for select
  using (enabled = true);


-- ============================================================
-- 006_operational_hardening.sql
-- ============================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists temples_set_updated_at on temples;
create trigger temples_set_updated_at
before update on temples
for each row execute function set_updated_at();

drop trigger if exists line_users_set_updated_at on line_users;
create trigger line_users_set_updated_at
before update on line_users
for each row execute function set_updated_at();

drop trigger if exists members_set_updated_at on members;
create trigger members_set_updated_at
before update on members
for each row execute function set_updated_at();

drop trigger if exists events_set_updated_at on events;
create trigger events_set_updated_at
before update on events
for each row execute function set_updated_at();

drop trigger if exists support_tickets_set_updated_at on support_tickets;
create trigger support_tickets_set_updated_at
before update on support_tickets
for each row execute function set_updated_at();

drop trigger if exists knowledge_documents_set_updated_at on knowledge_documents;
create trigger knowledge_documents_set_updated_at
before update on knowledge_documents
for each row execute function set_updated_at();

drop trigger if exists faq_rules_set_updated_at on faq_rules;
create trigger faq_rules_set_updated_at
before update on faq_rules
for each row execute function set_updated_at();

create index if not exists events_status_date_idx
  on events (status, event_date, start_time);

create index if not exists event_registrations_event_status_idx
  on event_registrations (event_id, status);

create index if not exists event_registrations_user_created_idx
  on event_registrations (user_id, created_at desc);

create index if not exists messages_user_created_idx
  on messages (user_id, created_at desc);

create index if not exists messages_intent_created_idx
  on messages (intent, created_at desc);

create index if not exists support_tickets_status_created_idx
  on support_tickets (status, created_at desc);

create index if not exists notification_jobs_status_scheduled_idx
  on notification_jobs (status, scheduled_at);

create index if not exists knowledge_chunks_document_idx
  on knowledge_chunks (document_id, chunk_index);

create index if not exists audit_logs_created_idx
  on audit_logs (created_at desc);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'events_capacity_positive') then
    alter table events
      add constraint events_capacity_positive
      check (capacity is null or capacity > 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'events_registered_count_nonnegative') then
    alter table events
      add constraint events_registered_count_nonnegative
      check (registered_count >= 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'events_registered_count_within_capacity') then
    alter table events
      add constraint events_registered_count_within_capacity
      check (capacity is null or registered_count <= capacity);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'events_status_valid') then
    alter table events
      add constraint events_status_valid
      check (status in ('draft', 'open', 'upcoming', 'published', 'closed', 'cancelled'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'event_registrations_status_valid') then
    alter table event_registrations
      add constraint event_registrations_status_valid
      check (status in ('confirmed', 'pending_review', 'checked_in', 'cancelled'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'messages_user_text_reasonable_length') then
    alter table messages
      add constraint messages_user_text_reasonable_length
      check (char_length(user_text) <= 1000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'support_tickets_status_valid') then
    alter table support_tickets
      add constraint support_tickets_status_valid
      check (status in ('open', 'triaged', 'resolved', 'closed'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'notification_jobs_status_valid') then
    alter table notification_jobs
      add constraint notification_jobs_status_valid
      check (status in ('draft', 'ready', 'sent', 'failed', 'cancelled'));
  end if;
end;
$$;

create or replace function register_for_event(
  p_event_id text,
  p_user_id text,
  p_contact_name text,
  p_phone text default null,
  p_party_size integer default 1,
  p_reminder_opt_in boolean default true,
  p_note text default null
)
returns event_registrations
language plpgsql
as $$
declare
  locked_event events%rowtype;
  confirmed_total integer;
  new_registration event_registrations%rowtype;
begin
  if p_user_id is null or btrim(p_user_id) = '' then
    raise exception 'invalid_user_id';
  end if;

  if p_contact_name is null or btrim(p_contact_name) = '' then
    raise exception 'invalid_contact_name';
  end if;

  if p_party_size < 1 or p_party_size > 10 then
    raise exception 'invalid_party_size';
  end if;

  insert into line_users (user_id, line_display_name, segment)
  values (p_user_id, 'LINE user', 'line_friend')
  on conflict (user_id) do nothing;

  select *
    into locked_event
    from events
   where event_id = p_event_id
   for update;

  if not found then
    raise exception 'event_not_found';
  end if;

  if not locked_event.requires_registration then
    raise exception 'registration_not_required';
  end if;

  if locked_event.status not in ('open', 'published') then
    raise exception 'event_not_open';
  end if;

  select coalesce(sum(party_size), 0)
    into confirmed_total
    from event_registrations
   where event_id = p_event_id
     and status in ('confirmed', 'pending_review', 'checked_in');

  if locked_event.capacity is not null and confirmed_total + p_party_size > locked_event.capacity then
    raise exception 'event_capacity_exceeded';
  end if;

  insert into event_registrations (
    registration_id,
    event_id,
    user_id,
    status,
    party_size,
    reminder_opt_in,
    contact_name,
    phone,
    note
  )
  values (
    'reg_' || encode(gen_random_bytes(4), 'hex'),
    p_event_id,
    p_user_id,
    'confirmed',
    p_party_size,
    p_reminder_opt_in,
    btrim(p_contact_name),
    nullif(btrim(coalesce(p_phone, '')), ''),
    nullif(btrim(coalesce(p_note, '')), '')
  )
  returning * into new_registration;

  update events
     set registered_count = (
           select coalesce(sum(party_size), 0)
             from event_registrations
            where event_id = p_event_id
              and status in ('confirmed', 'pending_review', 'checked_in')
         ),
         updated_at = now()
   where event_id = p_event_id;

  return new_registration;
end;
$$;


-- ============================================================
-- demo_seed.sql
-- ============================================================

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
