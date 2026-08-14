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
