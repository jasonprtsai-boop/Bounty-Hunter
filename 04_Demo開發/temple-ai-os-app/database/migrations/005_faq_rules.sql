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
