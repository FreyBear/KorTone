-- Rollehåndtering: Legg til 'editor' rolle og admin-funksjoner
-- Kjør denne i Supabase SQL Editor

-- 1. Oppdater user_roles tabellen for å støtte flere roller
ALTER TABLE public.user_roles 
  DROP CONSTRAINT IF EXISTS user_roles_role_check;

ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_role_check 
  CHECK (role IN ('admin', 'editor'));

-- 2. Oppdater hjelpefunksjoner
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_editor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'editor'
  );
$$;

CREATE OR REPLACE FUNCTION public.can_edit_songs()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'editor')
  );
$$;

-- 3. Oppdater policies for songs (admin + editor kan redigere)
DROP POLICY IF EXISTS "songs_insert_admin" ON public.songs;
CREATE POLICY "songs_insert_editors"
ON public.songs
FOR INSERT
TO authenticated
WITH CHECK (public.can_edit_songs());

DROP POLICY IF EXISTS "songs_update_admin" ON public.songs;
CREATE POLICY "songs_update_editors"
ON public.songs
FOR UPDATE
TO authenticated
USING (public.can_edit_songs())
WITH CHECK (public.can_edit_songs());

-- DELETE er fortsatt kun for admin
DROP POLICY IF EXISTS "songs_delete_admin" ON public.songs;
CREATE POLICY "songs_delete_admin"
ON public.songs
FOR DELETE
TO authenticated
USING (public.is_admin());

-- 4. Policies for user_roles (kun admin kan se og endre)
DROP POLICY IF EXISTS "user_roles_select_admin" ON public.user_roles;
CREATE POLICY "user_roles_select_admin"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "user_roles_insert_admin" ON public.user_roles;
CREATE POLICY "user_roles_insert_admin"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "user_roles_update_admin" ON public.user_roles;
CREATE POLICY "user_roles_update_admin"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "user_roles_delete_admin" ON public.user_roles;
CREATE POLICY "user_roles_delete_admin"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.is_admin());

-- 5. Funksjon for å hente alle brukere med roller (kun for admin)
CREATE OR REPLACE FUNCTION public.get_all_users_with_roles()
RETURNS TABLE (
  user_id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  role text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Sjekk at brukeren er admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Kun admin kan hente brukerliste';
  END IF;

  RETURN QUERY
  SELECT 
    u.id AS user_id,
    u.email::text,
    u.created_at,
    u.last_sign_in_at,
    ur.role::text
  FROM auth.users u
  LEFT JOIN public.user_roles ur ON u.id = ur.user_id
  ORDER BY u.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_editor() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_edit_songs() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_users_with_roles() TO authenticated;

-- Ferdig! Nå har du:
-- ✅ 'admin' rolle: Full tilgang
-- ✅ 'editor' rolle: Kan legge til og redigere sanger, men ikke administrere brukere
-- ✅ Admin-funksjon: get_all_users_with_roles() for å liste brukere
