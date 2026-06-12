-- Run this once in Supabase → SQL Editor.
-- Stores every estimate request that comes in from the website.

create table if not exists public.leads (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  name         text,
  phone        text,
  address      text,
  email        text,
  notes        text,
  service      text,
  current_state text,
  city         text,
  timeline     text,
  budget       text,
  ballpark     text,
  source       text
);

-- The website never talks to this table directly (no keys in the browser).
-- The Edge Function "notify-lead" inserts rows using the service key, so we
-- lock the table down and only allow the function (service role) to write.
alter table public.leads enable row level security;
-- (No public policies = browser cannot read/write. The Edge Function uses the
--  service role key, which bypasses RLS. That keeps your data private.)
