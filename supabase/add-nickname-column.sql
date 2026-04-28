-- Legg til nickname kolonne for søkbare kallenavn
-- Kjør denne i Supabase SQL Editor

ALTER TABLE public.songs 
  ADD COLUMN IF NOT EXISTS nickname text;

-- Legg til indeks for effektiv søk
CREATE INDEX IF NOT EXISTS songs_nickname_idx ON public.songs USING btree (nickname);

-- Ferdig! Nå kan du legge til kallenavn på sanger via rediger-funksjonen
