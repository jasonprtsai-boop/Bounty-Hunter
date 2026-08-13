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
