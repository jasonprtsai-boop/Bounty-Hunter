alter table support_tickets
  add column if not exists contact_name text;

alter table support_tickets
  add column if not exists phone text;

alter table support_tickets
  drop constraint if exists support_tickets_category_length;

alter table support_tickets
  add constraint support_tickets_category_length
  check (char_length(category) <= 40);

alter table support_tickets
  drop constraint if exists support_tickets_subject_reasonable_length;

alter table support_tickets
  add constraint support_tickets_subject_reasonable_length
  check (char_length(subject) between 2 and 120);

alter table support_tickets
  drop constraint if exists support_tickets_contact_name_length;

alter table support_tickets
  add constraint support_tickets_contact_name_length
  check (contact_name is null or char_length(contact_name) <= 80);

alter table support_tickets
  drop constraint if exists support_tickets_phone_length;

alter table support_tickets
  add constraint support_tickets_phone_length
  check (phone is null or char_length(phone) <= 32);
