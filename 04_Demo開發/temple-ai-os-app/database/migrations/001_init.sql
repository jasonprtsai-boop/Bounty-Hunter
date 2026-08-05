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

create index if not exists knowledge_chunks_embedding_idx
  on knowledge_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

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

