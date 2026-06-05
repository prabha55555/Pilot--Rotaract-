-- PILOT Platform Migration 3: Add webp support to files table

-- 1. Drop existing file_type check constraint if it exists
ALTER TABLE files DROP CONSTRAINT IF EXISTS files_file_type_check;

-- 2. Add the updated check constraint that supports 'webp' format along with jpg, jpeg, png, and pdf
ALTER TABLE files ADD CONSTRAINT files_file_type_check
CHECK (file_type IN ('jpg', 'jpeg', 'png', 'pdf', 'webp'));
