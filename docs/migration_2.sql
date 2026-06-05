-- PILOT Platform Migration 2: Realtime Sync & RLS Policy Upgrades

-- 1. Enable Realtime broadcast for activities and evaluations tables
ALTER PUBLICATION supabase_realtime ADD TABLE activities;
ALTER PUBLICATION supabase_realtime ADD TABLE evaluations;

-- 2. Drop old activities SELECT RLS policy
DROP POLICY IF EXISTS "Activities_submitted" ON activities;
DROP POLICY IF EXISTS "Activities_owner" ON activities;
DROP POLICY IF EXISTS "Activities_read_policy" ON activities;

-- 3. Create upgraded role-aware SELECT policy for activities:
--    - DTD users can see their own activities.
--    - DT, Admin, and SuperAdmin users can see ALL activities (so they can review pending ones, monitor history, and view reports).
CREATE POLICY "Activities_read_policy" ON activities
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('DT', 'Admin', 'SuperAdmin')
    )
  );

-- 4. Create policy for inserts/updates on activities
CREATE POLICY "Activities_write_policy" ON activities
  FOR ALL
  USING (auth.uid() = user_id);

-- 5. Drop old evaluations policies if any
DROP POLICY IF EXISTS "Evaluations_access_policy" ON evaluations;
DROP POLICY IF EXISTS "Evaluations_insert_policy" ON evaluations;

-- 6. Create RLS policies for evaluations table:
--    - Candidates and Evaluators can view their respective evaluation records.
--    - Admins and SuperAdmins can view all evaluation records.
CREATE POLICY "Evaluations_access_policy" ON evaluations
  FOR SELECT
  USING (
    auth.uid() = candidate_id 
    OR auth.uid() = evaluator_id
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('Admin', 'SuperAdmin')
    )
  );

--    - DT, Admin, and SuperAdmin users can insert evaluations
CREATE POLICY "Evaluations_insert_policy" ON evaluations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('DT', 'Admin', 'SuperAdmin')
    )
  );
