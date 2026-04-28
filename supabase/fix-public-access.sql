-- Oppdater policies: Tillat alle å lese sanger (også uinnloggede)
-- Kjør denne i Supabase SQL Editor

-- Endre SELECT policy til å tillate anon brukere
DROP POLICY IF EXISTS "songs_select_authenticated" ON public.songs;
DROP POLICY IF EXISTS "songs_select_all" ON public.songs;

CREATE POLICY "songs_select_all"
ON public.songs
FOR SELECT
TO authenticated, anon
USING (true);

-- INFO: INSERT, UPDATE, DELETE er fortsatt kun for admin-brukere
