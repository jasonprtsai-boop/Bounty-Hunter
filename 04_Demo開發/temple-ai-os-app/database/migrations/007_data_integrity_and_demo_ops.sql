create unique index if not exists event_registrations_check_in_token_unique
  on event_registrations (check_in_token);

create unique index if not exists event_registrations_active_user_event_unique
  on event_registrations (event_id, user_id)
  where status in ('confirmed', 'pending_review', 'checked_in');

create index if not exists support_tickets_user_created_idx
  on support_tickets (user_id, created_at desc);

create index if not exists notification_jobs_event_status_idx
  on notification_jobs (event_id, status, scheduled_at);

create index if not exists notification_jobs_ready_due_idx
  on notification_jobs (scheduled_at)
  where status = 'ready';

create index if not exists faq_rules_temple_enabled_priority_idx
  on faq_rules (temple_id, enabled, priority desc);

create index if not exists messages_created_brin_idx
  on messages using brin (created_at);

alter table event_registrations
  drop constraint if exists event_registrations_status_valid;

alter table event_registrations
  add constraint event_registrations_status_valid
  check (status in ('confirmed', 'pending_review', 'checked_in', 'cancelled'));

alter table support_tickets
  drop constraint if exists support_tickets_status_valid;

alter table support_tickets
  add constraint support_tickets_status_valid
  check (status in ('open', 'triaged', 'waiting_user', 'resolved', 'closed'));

alter table support_tickets
  drop constraint if exists support_tickets_priority_valid;

alter table support_tickets
  add constraint support_tickets_priority_valid
  check (priority in ('general', 'payment', 'urgent', 'content_feedback'));

alter table notification_jobs
  drop constraint if exists notification_jobs_status_valid;

alter table notification_jobs
  add constraint notification_jobs_status_valid
  check (status in ('draft', 'ready', 'sent', 'failed', 'cancelled', 'paused'));

alter table line_users
  drop constraint if exists line_users_consent_status_valid;

alter table line_users
  add constraint line_users_consent_status_valid
  check (consent_status in ('demo_consented', 'consented', 'revoked', 'unknown'));

alter table messages
  drop constraint if exists messages_channel_valid;

alter table messages
  add constraint messages_channel_valid
  check (channel in ('line', 'liff', 'admin', 'system', 'test'));

alter table event_registrations
  drop constraint if exists event_registrations_contact_name_length;

alter table event_registrations
  add constraint event_registrations_contact_name_length
  check (contact_name is null or char_length(contact_name) <= 80);

alter table support_tickets
  drop constraint if exists support_tickets_message_reasonable_length;

alter table support_tickets
  add constraint support_tickets_message_reasonable_length
  check (char_length(message) <= 2000);

create or replace function sync_event_registered_count(p_event_id text)
returns void
language plpgsql
as $$
begin
  if p_event_id is null then
    return;
  end if;

  update events
     set registered_count = (
           select coalesce(sum(party_size), 0)
             from event_registrations
            where event_id = p_event_id
              and status in ('confirmed', 'pending_review', 'checked_in')
         ),
         updated_at = now()
   where event_id = p_event_id;
end;
$$;

create or replace function event_registrations_sync_count_trigger()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform sync_event_registered_count(old.event_id);
    return old;
  end if;

  perform sync_event_registered_count(new.event_id);

  if tg_op = 'UPDATE' and old.event_id is distinct from new.event_id then
    perform sync_event_registered_count(old.event_id);
  end if;

  return new;
end;
$$;

drop trigger if exists event_registrations_sync_count on event_registrations;
create trigger event_registrations_sync_count
after insert or update or delete on event_registrations
for each row execute function event_registrations_sync_count_trigger();

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

  select *
    into existing_registration
    from event_registrations
   where event_id = p_event_id
     and user_id = p_user_id
     and status in ('confirmed', 'pending_review', 'checked_in')
   limit 1;

  if found then
    raise exception 'duplicate_registration';
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

  perform sync_event_registered_count(p_event_id);

  return new_registration;
end;
$$;
