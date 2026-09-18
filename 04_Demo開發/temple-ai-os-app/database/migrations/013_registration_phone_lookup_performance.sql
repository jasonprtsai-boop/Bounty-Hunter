-- Migration 013: Registration phone lookup performance
-- Normalizes existing phone values and adds an index for lookup by phone.

update event_registrations
set phone = regexp_replace(phone, '\D', '', 'g')
where phone is not null
  and regexp_replace(phone, '\D', '', 'g') <> ''
  and phone <> regexp_replace(phone, '\D', '', 'g');

create index if not exists event_registrations_phone_created_idx
  on event_registrations (phone, created_at desc)
  where phone is not null;
