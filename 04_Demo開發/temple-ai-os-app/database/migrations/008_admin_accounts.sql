create table if not exists admin_accounts (
  account_id text primary key default ('acct_' || encode(gen_random_bytes(6), 'hex')),
  username text not null unique,
  display_name text not null,
  role text not null default 'manager',
  status text not null default 'active',
  password_hash text not null,
  created_by text,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_accounts_username_valid
    check (
      username ~ '^[A-Za-z0-9_.-]{1,80}$'
      or (
        char_length(username) <= 120
        and username ~ '^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,253}\.[A-Za-z]{2,}$'
      )
    ),
  constraint admin_accounts_role_valid
    check (role in ('owner', 'manager', 'staff')),
  constraint admin_accounts_status_valid
    check (status in ('active', 'disabled')),
  constraint admin_accounts_display_name_present
    check (char_length(btrim(display_name)) > 0),
  constraint admin_accounts_password_hash_present
    check (char_length(btrim(password_hash)) > 0)
);

alter table admin_accounts enable row level security;

drop trigger if exists admin_accounts_set_updated_at on admin_accounts;
create trigger admin_accounts_set_updated_at
before update on admin_accounts
for each row execute function set_updated_at();

create index if not exists admin_accounts_role_status_idx
  on admin_accounts (role, status);

create index if not exists admin_accounts_updated_idx
  on admin_accounts (updated_at desc);
