-- =============================================================================
-- RLS Policies for Car Maintenance App
-- Execute in Supabase Dashboard > SQL Editor
-- =============================================================================

-- =============================================================================
-- 1. DATABASE RLS POLICIES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- profiles: users can only access their own profile
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- vehicles: users can only access their own vehicles
-- ---------------------------------------------------------------------------
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vehicles_select_own" ON public.vehicles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "vehicles_insert_own" ON public.vehicles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "vehicles_update_own" ON public.vehicles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "vehicles_delete_own" ON public.vehicles
  FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- maintenance_history: access through vehicle ownership
-- ---------------------------------------------------------------------------
ALTER TABLE public.maintenance_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "maintenance_history_select_own" ON public.maintenance_history
  FOR SELECT USING (vehicle_id IN (SELECT id FROM public.vehicles WHERE user_id = auth.uid()));

CREATE POLICY "maintenance_history_insert_own" ON public.maintenance_history
  FOR INSERT WITH CHECK (vehicle_id IN (SELECT id FROM public.vehicles WHERE user_id = auth.uid()));

CREATE POLICY "maintenance_history_update_own" ON public.maintenance_history
  FOR UPDATE USING (vehicle_id IN (SELECT id FROM public.vehicles WHERE user_id = auth.uid()));

CREATE POLICY "maintenance_history_delete_own" ON public.maintenance_history
  FOR DELETE USING (vehicle_id IN (SELECT id FROM public.vehicles WHERE user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- maintenance_schedule: access through vehicle ownership
-- ---------------------------------------------------------------------------
ALTER TABLE public.maintenance_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "maintenance_schedule_select_own" ON public.maintenance_schedule
  FOR SELECT USING (vehicle_id IN (SELECT id FROM public.vehicles WHERE user_id = auth.uid()));

CREATE POLICY "maintenance_schedule_insert_own" ON public.maintenance_schedule
  FOR INSERT WITH CHECK (vehicle_id IN (SELECT id FROM public.vehicles WHERE user_id = auth.uid()));

CREATE POLICY "maintenance_schedule_update_own" ON public.maintenance_schedule
  FOR UPDATE USING (vehicle_id IN (SELECT id FROM public.vehicles WHERE user_id = auth.uid()));

CREATE POLICY "maintenance_schedule_delete_own" ON public.maintenance_schedule
  FOR DELETE USING (vehicle_id IN (SELECT id FROM public.vehicles WHERE user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- documents: access through vehicle ownership
-- ---------------------------------------------------------------------------
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents_select_own" ON public.documents
  FOR SELECT USING (vehicle_id IN (SELECT id FROM public.vehicles WHERE user_id = auth.uid()));

CREATE POLICY "documents_insert_own" ON public.documents
  FOR INSERT WITH CHECK (vehicle_id IN (SELECT id FROM public.vehicles WHERE user_id = auth.uid()));

CREATE POLICY "documents_update_own" ON public.documents
  FOR UPDATE USING (vehicle_id IN (SELECT id FROM public.vehicles WHERE user_id = auth.uid()));

CREATE POLICY "documents_delete_own" ON public.documents
  FOR DELETE USING (vehicle_id IN (SELECT id FROM public.vehicles WHERE user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- expenses: access through vehicle ownership
-- ---------------------------------------------------------------------------
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expenses_select_own" ON public.expenses
  FOR SELECT USING (vehicle_id IN (SELECT id FROM public.vehicles WHERE user_id = auth.uid()));

CREATE POLICY "expenses_insert_own" ON public.expenses
  FOR INSERT WITH CHECK (vehicle_id IN (SELECT id FROM public.vehicles WHERE user_id = auth.uid()));

CREATE POLICY "expenses_update_own" ON public.expenses
  FOR UPDATE USING (vehicle_id IN (SELECT id FROM public.vehicles WHERE user_id = auth.uid()));

CREATE POLICY "expenses_delete_own" ON public.expenses
  FOR DELETE USING (vehicle_id IN (SELECT id FROM public.vehicles WHERE user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- user_settings: users can only access their own settings
-- ---------------------------------------------------------------------------
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_settings_select_own" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_settings_insert_own" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_settings_update_own" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_settings_delete_own" ON public.user_settings
  FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- conversations: users can only access their own conversations
-- ---------------------------------------------------------------------------
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations_select_own" ON public.conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "conversations_insert_own" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "conversations_update_own" ON public.conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "conversations_delete_own" ON public.conversations
  FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- messages: access through conversation ownership
-- ---------------------------------------------------------------------------
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select_own" ON public.messages
  FOR SELECT USING (conversation_id IN (SELECT id FROM public.conversations WHERE user_id = auth.uid()));

CREATE POLICY "messages_insert_own" ON public.messages
  FOR INSERT WITH CHECK (conversation_id IN (SELECT id FROM public.conversations WHERE user_id = auth.uid()));

CREATE POLICY "messages_update_own" ON public.messages
  FOR UPDATE USING (conversation_id IN (SELECT id FROM public.conversations WHERE user_id = auth.uid()));

CREATE POLICY "messages_delete_own" ON public.messages
  FOR DELETE USING (conversation_id IN (SELECT id FROM public.conversations WHERE user_id = auth.uid()));


-- =============================================================================
-- 2. STORAGE RLS POLICIES
-- =============================================================================
-- Files are organized as: <user_id>/<vehicle_id>/<filename>
-- or: <user_id>/<filename> (avatars)

-- ---------------------------------------------------------------------------
-- Bucket: documents
-- ---------------------------------------------------------------------------
CREATE POLICY "documents_storage_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "documents_storage_select" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "documents_storage_update" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "documents_storage_delete" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Bucket: vehicles
-- ---------------------------------------------------------------------------
CREATE POLICY "vehicles_storage_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'vehicles'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "vehicles_storage_select" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'vehicles'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "vehicles_storage_update" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'vehicles'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "vehicles_storage_delete" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'vehicles'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Bucket: avatars
-- ---------------------------------------------------------------------------
CREATE POLICY "avatars_storage_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_storage_select" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_storage_update" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_storage_delete" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );


-- =============================================================================
-- 3. ACCOUNT DELETION FUNCTION (RGPD Art. 17)
-- =============================================================================
-- SECURITY DEFINER: runs with the privileges of the function creator (superuser)
-- This allows cascade deletion of all user data including auth.users

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _vehicle_ids uuid[];
BEGIN
  -- Verify the user is authenticated
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get all vehicle IDs for this user
  SELECT ARRAY_AGG(id) INTO _vehicle_ids
  FROM vehicles
  WHERE user_id = _user_id;

  -- Delete messages (through conversations)
  DELETE FROM messages
  WHERE conversation_id IN (
    SELECT id FROM conversations WHERE user_id = _user_id
  );

  -- Delete conversations
  DELETE FROM conversations WHERE user_id = _user_id;

  -- Delete vehicle-related data (if user has vehicles)
  IF _vehicle_ids IS NOT NULL THEN
    DELETE FROM documents WHERE vehicle_id = ANY(_vehicle_ids);
    DELETE FROM expenses WHERE vehicle_id = ANY(_vehicle_ids);
    DELETE FROM maintenance_history WHERE vehicle_id = ANY(_vehicle_ids);
    DELETE FROM maintenance_schedule WHERE vehicle_id = ANY(_vehicle_ids);
  END IF;

  -- Delete vehicles
  DELETE FROM vehicles WHERE user_id = _user_id;

  -- Delete user settings
  DELETE FROM user_settings WHERE user_id = _user_id;

  -- Delete profile
  DELETE FROM profiles WHERE id = _user_id;

  -- Delete auth user (requires SECURITY DEFINER)
  DELETE FROM auth.users WHERE id = _user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;


-- =============================================================================
-- 4. DIAGNOSTIC QUERIES (run these to verify policies are correctly applied)
-- =============================================================================

-- Check which tables have RLS enabled
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;

-- List all policies on your tables
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname IN ('public', 'storage')
-- ORDER BY tablename, policyname;

-- Check storage.objects policies specifically
-- SELECT policyname, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'objects' AND schemaname = 'storage'
-- ORDER BY policyname;

-- =============================================================================
-- 5. FIX: If RLS is enabled but policies are missing, drop and re-create
-- =============================================================================
-- If you get "new row violates row-level security policy" errors, run the
-- diagnostic queries above FIRST to check if policies exist.
--
-- If policies are missing (RLS enabled but no CREATE POLICY was run),
-- you can either:
-- a) Re-run the CREATE POLICY statements above
-- b) If they fail with "policy already exists", drop them first:
--
-- DROP POLICY IF EXISTS "documents_insert_own" ON public.documents;
-- DROP POLICY IF EXISTS "documents_select_own" ON public.documents;
-- DROP POLICY IF EXISTS "documents_update_own" ON public.documents;
-- DROP POLICY IF EXISTS "documents_delete_own" ON public.documents;
-- Then re-run the CREATE POLICY statements.
