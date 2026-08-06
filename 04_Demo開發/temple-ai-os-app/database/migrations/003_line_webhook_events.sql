create table if not exists line_webhook_events (
  event_id text primary key,
  processed_at timestamptz not null default now()
);

alter table line_webhook_events enable row level security;

-- LINE webhook writes go through FastAPI with the Supabase service role key.
-- Anon clients intentionally have no read or write policy for webhook event IDs.
