-- PILOT Platform Migration 3: Row Level Security Policies and Constraint Upgrades for files table

-- 1. Enable RLS on files table (if not already enabled)
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- 2. Drop old policies if any exist
DROP POLICY IF EXISTS "Files_read_policy" ON files;
DROP POLICY IF EXISTS "Files_insert_policy" ON files;
DROP POLICY IF EXISTS "Files_delete_policy" ON files;

-- 3. Create SELECT policy for files:
--    Allows read access to a file if the user has access to the parent activity.
CREATE POLICY "Files_read_policy" ON files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM activities
      WHERE activities.id = files.activity_id
      AND (
        activities.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM users 
          WHERE users.id = auth.uid() 
          AND users.role IN ('DT', 'Admin', 'SuperAdmin')
        )
      )
    )
  );

-- 4. Create INSERT policy for files:
--    Allows DTD/activity owner to insert files for their own activities.
CREATE POLICY "Files_insert_policy" ON files
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM activities
      WHERE activities.id = files.activity_id
      AND activities.user_id = auth.uid()
    )
  );

-- 5. Create DELETE policy for files:
--    Allows DTD/activity owner to delete files from their own activities.
CREATE POLICY "Files_delete_policy" ON files
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM activities
      WHERE activities.id = files.activity_id
      AND activities.user_id = auth.uid()
    )
  );

-- 6. Upgrade check constraint on file_type to support webp and supporting documents:
--    - Drop old constraint
ALTER TABLE files DROP CONSTRAINT IF EXISTS files_file_type_check;

--    - Add updated constraint supporting additional image and document extensions
ALTER TABLE files ADD CONSTRAINT files_file_type_check 
  CHECK (file_type IN ('jpg', 'jpeg', 'png', 'pdf', 'webp', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv'));
