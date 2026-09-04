alter table events
  add column if not exists registration_open_at timestamptz,
  add column if not exists registration_close_at timestamptz,
  add column if not exists countdown_target_at timestamptz,
  add column if not exists countdown_label text,
  add column if not exists max_party_size integer not null default 10,
  add column if not exists waitlist_enabled boolean not null default false;

alter table events
  drop constraint if exists events_max_party_size_valid;

alter table events
  add constraint events_max_party_size_valid
  check (max_party_size between 1 and 10);

alter table event_registrations
  drop constraint if exists event_registrations_status_valid;

alter table event_registrations
  add constraint event_registrations_status_valid
  check (status in ('confirmed', 'pending_review', 'checked_in', 'cancelled', 'waitlisted'));

create table if not exists deities (
  deity_id text primary key,
  temple_id text not null references temples(temple_id) on delete cascade,
  name text not null,
  category text not null default '配祀神佛',
  enshrined_area text not null default '',
  description text not null,
  birthday_lunar text,
  service_notes text,
  source_url text,
  status text not null default 'published',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table deities enable row level security;

drop policy if exists "public read published deities" on deities;
create policy "public read published deities" on deities
  for select using (status = 'published');

create index if not exists deities_temple_status_order_idx
  on deities (temple_id, status, sort_order, name);

create index if not exists events_registration_window_idx
  on events (status, registration_open_at, registration_close_at);

update events
   set max_party_size = 10
 where max_party_size is null;

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
  existing_registration event_registrations%rowtype;
  new_registration event_registrations%rowtype;
  registration_status text := 'confirmed';
begin
  if p_user_id is null or btrim(p_user_id) = '' then
    raise exception 'invalid_user_id';
  end if;
  if p_contact_name is null or btrim(p_contact_name) = '' then
    raise exception 'invalid_contact_name';
  end if;

  select * into locked_event from events where event_id = p_event_id for update;
  if not found then raise exception 'event_not_found'; end if;
  if not locked_event.requires_registration then raise exception 'registration_not_required'; end if;
  if locked_event.status not in ('open', 'published') then raise exception 'event_not_open'; end if;
  if locked_event.registration_open_at is not null and now() < locked_event.registration_open_at then
    raise exception 'event_not_open';
  end if;
  if locked_event.registration_close_at is not null and now() >= locked_event.registration_close_at then
    raise exception 'event_registration_closed';
  end if;
  if p_party_size < 1 or p_party_size > locked_event.max_party_size then
    raise exception 'party_size_exceeded';
  end if;

  insert into line_users (user_id, line_display_name, segment)
  values (p_user_id, 'LINE user', 'line_friend')
  on conflict (user_id) do nothing;

  select * into existing_registration
    from event_registrations
   where event_id = p_event_id and user_id = p_user_id
     and status in ('confirmed', 'pending_review', 'checked_in', 'waitlisted')
   limit 1;
  if found then raise exception 'duplicate_registration'; end if;

  select coalesce(sum(party_size), 0) into confirmed_total
    from event_registrations
   where event_id = p_event_id and status in ('confirmed', 'pending_review', 'checked_in');

  if locked_event.capacity is not null and confirmed_total + p_party_size > locked_event.capacity then
    if not locked_event.waitlist_enabled then raise exception 'event_capacity_exceeded'; end if;
    registration_status := 'waitlisted';
  end if;

  insert into event_registrations (
    registration_id, event_id, user_id, status, party_size,
    reminder_opt_in, contact_name, phone, note
  ) values (
    'reg_' || encode(gen_random_bytes(4), 'hex'), p_event_id, p_user_id,
    registration_status, p_party_size, p_reminder_opt_in, btrim(p_contact_name),
    nullif(btrim(coalesce(p_phone, '')), ''), nullif(btrim(coalesce(p_note, '')), '')
  ) returning * into new_registration;

  perform sync_event_registered_count(p_event_id);
  return new_registration;
end;
$$;
