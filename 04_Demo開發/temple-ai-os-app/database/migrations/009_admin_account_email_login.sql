alter table admin_accounts
  drop constraint if exists admin_accounts_username_valid;

alter table admin_accounts
  add constraint admin_accounts_username_valid
  check (
    username ~ '^[A-Za-z0-9_.-]{1,80}$'
    or (
      char_length(username) <= 120
      and username ~ '^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,253}\.[A-Za-z]{2,}$'
    )
  );
