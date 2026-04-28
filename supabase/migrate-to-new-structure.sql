-- Migration: Fjern gamle sanger og oppdater skjema
-- Kjør denne i Supabase SQL Editor

-- 1. Slett alle eksisterende sanger
DELETE FROM public.songs;

-- 2. Fjern gamle kolonner
ALTER TABLE public.songs 
  DROP COLUMN IF EXISTS nickname,
  DROP COLUMN IF EXISTS lyrics_snippet,
  DROP COLUMN IF EXISTS dropbox_url;

-- 3. Legg til nye kolonner
ALTER TABLE public.songs 
  ADD COLUMN IF NOT EXISTS voices text NOT NULL DEFAULT 'SATB',
  ADD COLUMN IF NOT EXISTS key_signature text;

-- 4. Gjør tempo_bpm NOT NULL (nå som tabellen er tom)
ALTER TABLE public.songs 
  ALTER COLUMN tempo_bpm SET NOT NULL;

-- 5. Oppdater indekser
DROP INDEX IF EXISTS public.songs_nickname_idx;
CREATE INDEX IF NOT EXISTS songs_voices_idx ON public.songs USING btree (voices);

-- Ferdig! Nå kan du importere nye sanger.
