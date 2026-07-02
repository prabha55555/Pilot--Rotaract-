-- migration_workflow.sql
-- Add Stage 1 and Stage 2 workflow fields
ALTER TABLE activities ADD COLUMN IF NOT EXISTS expected_duration NUMERIC;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS objectives TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS expected_participants INT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS num_participants INT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS event_status VARCHAR(50) DEFAULT 'Conducted';
ALTER TABLE activities ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS additional_remarks TEXT;

-- Increase status column length to avoid "value too long for type character varying(20)"
ALTER TABLE activities ALTER COLUMN status TYPE VARCHAR(50);
ALTER TABLE evaluations ALTER COLUMN status TYPE VARCHAR(50);

-- Drop and recreate status check constraint to support the new workflow statuses:
-- 'Draft', 'Planned', 'Submitted for Approval', 'Event Conducted', 'Event Cancelled', 'Under Review', 'Approved', 'Rejected', 'Resubmitted'
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_status_check;
ALTER TABLE activities ADD CONSTRAINT activities_status_check CHECK (status IN (
  'Draft',
  'Planned',
  'Submitted for Approval',
  'Event Conducted',
  'Event Cancelled',
  'Under Review',
  'Approved',
  'Rejected',
  'Resubmitted',
  'Cancellation Approved',
  'Cancellation Rejected'
));

-- Add action_type column to promotions table
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS action_type VARCHAR(50) DEFAULT 'Role Change';

-- Add poster_url column to activities table
ALTER TABLE activities ADD COLUMN IF NOT EXISTS poster_url VARCHAR(500);
