-- ============================================================
--  MahairaSystem — database-driven owner allowlist
--  Run this ONCE in Supabase → SQL Editor.
--
--  After this, add a new owner by simply inserting a row (see bottom) —
--  no code change, no redeploy.
-- ============================================================

-- 1. Owners allowlist table
create table if not exists app_owners (
  id         uuid default gen_random_uuid() primary key,
  email      text unique,          -- the owner's login email (lowercase recommended)
  phone      text,                 -- optional: login phone (e.g. +919xxxxxxxxx)
  name       text,                 -- friendly label
  created_at timestamptz default now()
);

-- 2. Lock the table down. No client can read it directly — only the
--    SECURITY DEFINER function below can, so owner emails never leak.
alter table app_owners enable row level security;
-- (intentionally NO select/insert/update/delete policies for clients)

-- 3. Secure check: is the *currently logged-in* user an allowed owner?
--    Runs with elevated rights so it can read app_owners, but only ever
--    returns a boolean about the caller — never the list itself.
create or replace function public.check_is_owner()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from app_owners o
    where
      -- email match (case-insensitive)
      (o.email is not null
        and lower(o.email) = lower(nullif(auth.jwt() ->> 'email', '')))
      or
      -- phone match on the last 10 digits (ignores +91 / spaces)
      (o.phone is not null
        and nullif(auth.jwt() ->> 'phone', '') is not null
        and right(regexp_replace(o.phone, '[^0-9]', '', 'g'), 10)
          = right(regexp_replace(auth.jwt() ->> 'phone', '[^0-9]', '', 'g'), 10))
  );
$$;

grant execute on function public.check_is_owner() to authenticated, anon;

-- 4. Seed your existing owner (optional — this one is also hardcoded as a
--    safety fallback in the app, so you can never lock yourself out).
insert into app_owners (email, name)
values ('vkartheek0000@gmail.com', 'Primary Owner')
on conflict (email) do nothing;

-- ============================================================
--  HOW TO ADD A NEW OWNER LATER (no redeploy!)
--  Run just this one line in the SQL Editor:
--
--    insert into app_owners (email, name)
--    values ('newowner@example.com', 'New Owner Name')
--    on conflict (email) do nothing;
--
--  Or by phone:
--    insert into app_owners (phone, name)
--    values ('+919812345678', 'Owner By Phone');
--
--  To REMOVE an owner:
--    delete from app_owners where email = 'someone@example.com';
--
--  The new owner logs in at /owner/login with that email (OTP or password)
--  and gets in immediately. To LIST current owners:
--    select email, phone, name from app_owners order by created_at;
-- ============================================================
