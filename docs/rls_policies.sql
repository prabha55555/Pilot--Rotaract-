-- ============================================================
-- PILOT Platform — Production RLS and Schema Verification Script
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/wquimqkebdllktyinqgd
-- ============================================================

  -- ── 1. SCHEMA VERIFICATION: CREATE INTERVIEWS IF NOT EXIST ────
  CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Scheduled', 'Passed', 'Failed', 'Waitlisted')),
    interview_date TIMESTAMP,
    communication_notes TEXT,
    leadership_notes TEXT,
    facilitation_notes TEXT,
    overall_remarks TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_interviews_candidate_id ON public.interviews(candidate_id);
  CREATE INDEX IF NOT EXISTS idx_interviews_status ON public.interviews(status);

  -- ── 2. ENABLE ROW LEVEL SECURITY (RLS) ON ALL 10 TABLES ──────
  ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.activities         ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.files              ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.evaluations        ENABLE ROW LEVEL SECURITY;

  ALTER TABLE public.promotions         ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.activity_timeline  ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.leaderboards       ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.documents          ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.notifications      ENABLE ROW LEVEL SECURITY;

  -- ── 3. DEFINE DUAL-ROLE ESCAPE FUNCTION (AVOIDS RECURSION) ───
  CREATE OR REPLACE FUNCTION public.get_my_role()
  RETURNS text AS $$
    SELECT role FROM public.users WHERE id = auth.uid();
  $$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

  -- ── 4. POLICIES FOR 'users' TABLE ─────────────────────────────
  DROP POLICY IF EXISTS select_users ON public.users;
  CREATE POLICY select_users ON public.users 
    FOR SELECT TO authenticated USING (true);

  DROP POLICY IF EXISTS update_users ON public.users;
  CREATE POLICY update_users ON public.users 
    FOR UPDATE TO authenticated 
    USING (id = auth.uid() OR email = auth.jwt() ->> 'email' OR get_my_role() IN ('Admin', 'SuperAdmin'))
    WITH CHECK (id = auth.uid() OR email = auth.jwt() ->> 'email' OR get_my_role() IN ('Admin', 'SuperAdmin'));

  DROP POLICY IF EXISTS insert_users ON public.users;
  CREATE POLICY insert_users ON public.users 
    FOR INSERT TO authenticated 
    WITH CHECK (get_my_role() IN ('Admin', 'SuperAdmin'));

  DROP POLICY IF EXISTS delete_users ON public.users;
  CREATE POLICY delete_users ON public.users 
    FOR DELETE TO authenticated 
    USING (get_my_role() IN ('Admin', 'SuperAdmin'));

  -- ── 5. POLICIES FOR 'activities' TABLE ────────────────────────
  DROP POLICY IF EXISTS select_activities ON public.activities;
  CREATE POLICY select_activities ON public.activities 
    FOR SELECT TO authenticated 
    USING (user_id = auth.uid() OR get_my_role() IN ('DT', 'Admin', 'SuperAdmin'));

  DROP POLICY IF EXISTS insert_activities ON public.activities;
  CREATE POLICY insert_activities ON public.activities 
    FOR INSERT TO authenticated 
    WITH CHECK (user_id = auth.uid() OR get_my_role() IN ('Admin', 'SuperAdmin'));

  DROP POLICY IF EXISTS update_activities ON public.activities;
  CREATE POLICY update_activities ON public.activities 
    FOR UPDATE TO authenticated 
    USING (user_id = auth.uid() OR get_my_role() IN ('Admin', 'SuperAdmin'))
    WITH CHECK (user_id = auth.uid() OR get_my_role() IN ('Admin', 'SuperAdmin'));

  DROP POLICY IF EXISTS delete_activities ON public.activities;
  CREATE POLICY delete_activities ON public.activities 
    FOR DELETE TO authenticated 
    USING (user_id = auth.uid() OR get_my_role() IN ('Admin', 'SuperAdmin'));

  -- ── 6. POLICIES FOR 'files' TABLE ─────────────────────────────
  DROP POLICY IF EXISTS select_files ON public.files;
  CREATE POLICY select_files ON public.files 
    FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.activities WHERE public.activities.id = files.activity_id));

  DROP POLICY IF EXISTS insert_files ON public.files;
  CREATE POLICY insert_files ON public.files 
    FOR INSERT TO authenticated 
    WITH CHECK (EXISTS (SELECT 1 FROM public.activities WHERE public.activities.id = files.activity_id AND public.activities.user_id = auth.uid()));

  DROP POLICY IF EXISTS delete_files ON public.files;
  CREATE POLICY delete_files ON public.files 
    FOR DELETE TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.activities WHERE public.activities.id = files.activity_id AND (public.activities.user_id = auth.uid() OR get_my_role() IN ('Admin', 'SuperAdmin'))));

  -- ── 7. POLICIES FOR 'evaluations' TABLE ───────────────────────
  DROP POLICY IF EXISTS select_evaluations ON public.evaluations;
  CREATE POLICY select_evaluations ON public.evaluations 
    FOR SELECT TO authenticated 
    USING (candidate_id = auth.uid() OR evaluator_id = auth.uid() OR get_my_role() IN ('DT', 'Admin', 'SuperAdmin'));

  DROP POLICY IF EXISTS insert_evaluations ON public.evaluations;
  CREATE POLICY insert_evaluations ON public.evaluations 
    FOR INSERT TO authenticated 
    WITH CHECK (evaluator_id = auth.uid() AND get_my_role() IN ('DT', 'Admin', 'SuperAdmin'));

  DROP POLICY IF EXISTS update_evaluations ON public.evaluations;
  CREATE POLICY update_evaluations ON public.evaluations 
    FOR UPDATE TO authenticated 
    USING ((evaluator_id = auth.uid() AND get_my_role() IN ('DT', 'Admin', 'SuperAdmin')) OR get_my_role() IN ('Admin', 'SuperAdmin'))
    WITH CHECK ((evaluator_id = auth.uid() AND get_my_role() IN ('DT', 'Admin', 'SuperAdmin')) OR get_my_role() IN ('Admin', 'SuperAdmin'));

  DROP POLICY IF EXISTS delete_evaluations ON public.evaluations;
  CREATE POLICY delete_evaluations ON public.evaluations 
    FOR DELETE TO authenticated 
    USING ((evaluator_id = auth.uid() AND get_my_role() IN ('DT', 'Admin', 'SuperAdmin')) OR get_my_role() IN ('Admin', 'SuperAdmin'));


  -- ── 9. POLICIES FOR 'promotions' TABLE ────────────────────────
  DROP POLICY IF EXISTS select_promotions ON public.promotions;
  CREATE POLICY select_promotions ON public.promotions 
    FOR SELECT TO authenticated USING (true);

  DROP POLICY IF EXISTS manage_promotions ON public.promotions;
  CREATE POLICY manage_promotions ON public.promotions 
    FOR ALL TO authenticated 
    USING (get_my_role() IN ('Admin', 'SuperAdmin'))
    WITH CHECK (get_my_role() IN ('Admin', 'SuperAdmin'));

  -- ── 10. POLICIES FOR 'activity_timeline' TABLE ────────────────
  DROP POLICY IF EXISTS select_activity_timeline ON public.activity_timeline;
  CREATE POLICY select_activity_timeline ON public.activity_timeline 
    FOR SELECT TO authenticated USING (true);

  DROP POLICY IF EXISTS manage_activity_timeline ON public.activity_timeline;
  CREATE POLICY manage_activity_timeline ON public.activity_timeline 
    FOR ALL TO authenticated 
    USING (user_id = auth.uid() OR get_my_role() IN ('Admin', 'SuperAdmin'))
    WITH CHECK (user_id = auth.uid() OR get_my_role() IN ('Admin', 'SuperAdmin'));

  -- ── 11. POLICIES FOR 'leaderboards' TABLE ─────────────────────
  DROP POLICY IF EXISTS select_leaderboards ON public.leaderboards;
  CREATE POLICY select_leaderboards ON public.leaderboards 
    FOR SELECT TO authenticated USING (true);

  DROP POLICY IF EXISTS manage_leaderboards ON public.leaderboards;
  CREATE POLICY manage_leaderboards ON public.leaderboards 
    FOR ALL TO authenticated 
    USING (get_my_role() IN ('Admin', 'SuperAdmin'))
    WITH CHECK (get_my_role() IN ('Admin', 'SuperAdmin'));

  -- ── 12. POLICIES FOR 'documents' TABLE ────────────────────────
  DROP POLICY IF EXISTS select_documents ON public.documents;
  CREATE POLICY select_documents ON public.documents 
    FOR SELECT TO authenticated USING (true);

  DROP POLICY IF EXISTS manage_documents ON public.documents;
  CREATE POLICY manage_documents ON public.documents 
    FOR ALL TO authenticated 
    USING (get_my_role() IN ('Admin', 'SuperAdmin'))
    WITH CHECK (get_my_role() IN ('Admin', 'SuperAdmin'));

  -- ── 13. POLICIES FOR 'notifications' TABLE ────────────────────
  DROP POLICY IF EXISTS select_notifications ON public.notifications;
  CREATE POLICY select_notifications ON public.notifications 
    FOR SELECT TO authenticated USING (user_id = auth.uid());

  DROP POLICY IF EXISTS update_notifications ON public.notifications;
  CREATE POLICY update_notifications ON public.notifications 
    FOR UPDATE TO authenticated USING (user_id = auth.uid());

  DROP POLICY IF EXISTS delete_notifications ON public.notifications;
  CREATE POLICY delete_notifications ON public.notifications 
    FOR DELETE TO authenticated USING (user_id = auth.uid());

  DROP POLICY IF EXISTS insert_notifications ON public.notifications;
  CREATE POLICY insert_notifications ON public.notifications 
    FOR INSERT TO authenticated 
    WITH CHECK (user_id = auth.uid() OR get_my_role() IN ('DT', 'Admin', 'SuperAdmin'));

-- ── 14. POLICIES FOR STORAGE BUCKETS (storage.objects) ────────
-- ⚠️ NOTE ON PERMISSION ERROR:
-- If you receive "must be owner of table objects" error, it is because
-- the standard database role does not own the internal storage tables.
-- You should run Section 1-13 in the SQL Editor (which handles all database tables),
-- and configure the Storage policies through the Supabase Storage Dashboard GUI instead.
--
-- To do this via the Supabase dashboard:
-- 1. Go to Storage -> Policies.
-- 2. Under the "activities" bucket, choose "For full customization".
-- 3. For SELECT, INSERT, and DELETE, apply the rules below.
--
-- The policies are commented out below for reference:
/*
-- Enable row level security on storage.objects if it is not already
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- activities-bucket policies
DROP POLICY IF EXISTS select_storage_activities ON storage.objects;
CREATE POLICY select_storage_activities ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'activities' AND (get_my_role() IN ('DT', 'Admin', 'SuperAdmin') OR EXISTS (SELECT 1 FROM public.activities WHERE public.activities.id = (split_part(name, '/', 1))::uuid AND public.activities.user_id = auth.uid())));

DROP POLICY IF EXISTS insert_storage_activities ON storage.objects;
CREATE POLICY insert_storage_activities ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'activities' AND (EXISTS (SELECT 1 FROM public.activities WHERE public.activities.id = (split_part(name, '/', 1))::uuid AND public.activities.user_id = auth.uid())));

DROP POLICY IF EXISTS delete_storage_activities ON storage.objects;
CREATE POLICY delete_storage_activities ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'activities' AND (get_my_role() IN ('Admin', 'SuperAdmin') OR EXISTS (SELECT 1 FROM public.activities WHERE public.activities.id = (split_part(name, '/', 1))::uuid AND public.activities.user_id = auth.uid())));

-- documents-bucket policies
DROP POLICY IF EXISTS select_storage_documents ON storage.objects;
CREATE POLICY select_storage_documents ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents');

DROP POLICY IF EXISTS manage_storage_documents ON storage.objects;
CREATE POLICY manage_storage_documents ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'documents' AND get_my_role() IN ('Admin', 'SuperAdmin'))
  WITH CHECK (bucket_id = 'documents' AND get_my_role() IN ('Admin', 'SuperAdmin'));
*/
