-- Add unique constraint required for CSV upsert import flow.
-- Run this once in Supabase SQL Editor before using ON CONFLICT imports.

do $$
begin
  alter table public.songs
    add constraint songs_title_voices_unique unique (title, voices);
exception
  when duplicate_object then
    null;
  when unique_violation then
    raise exception 'Kan ikke legge til unique(title, voices): databasen inneholder duplikater. Rydd duplikater og prov igjen.';
end;
$$;
