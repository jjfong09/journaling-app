-- Run this in the Supabase Dashboard: SQL Editor > New query > paste and run.

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  body text not null default '',
  created_at timestamptz not null default now(),
  entry_date date not null default (current_date),
  tags text[] not null default '{}'
);

create table if not exists public.scrapbook_uploads (
  id uuid primary key default gen_random_uuid(),
  original_url text,
  processed_url text not null,
  entry_date date not null default (current_date),
  created_at timestamptz not null default now()
);

create index if not exists entries_entry_date_idx on public.entries (entry_date desc);
create index if not exists scrapbook_entry_date_idx on public.scrapbook_uploads (entry_date desc);
