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
