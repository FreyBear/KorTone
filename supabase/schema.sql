-- KorTone schema
-- Run in Supabase SQL editor

create extension if not exists pgcrypto;

create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  voices text not null default 'SATB',
  sequence text[] not null default '{}',
  pitches jsonb not null default '{}'::jsonb,
  key_signature text,
  tempo_bpm int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin')),
  created_at timestamptz not null default now()
);

create index if not exists songs_title_idx on public.songs using btree (title);
create index if not exists songs_voices_idx on public.songs using btree (voices);
create index if not exists songs_pitches_gin_idx on public.songs using gin (pitches);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_songs_updated_at on public.songs;
create trigger trg_songs_updated_at
before update on public.songs
for each row
execute function public.set_updated_at();
