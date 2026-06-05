-- PILOT Platform Migration 1: Activity Redesign & Evaluation Workflow

-- 1. Modify activities table: Add new fields for Project Activity Document
ALTER TABLE activities
ADD COLUMN avenue VARCHAR(100),
ADD COLUMN project_type VARCHAR(100),
ADD COLUMN project_mode VARCHAR(50),
ADD COLUMN location VARCHAR(255),
ADD COLUMN start_date TIMESTAMP,
ADD COLUMN end_date TIMESTAMP,
ADD COLUMN project_chair VARCHAR(255),
ADD COLUMN project_chair_contact VARCHAR(50);

-- 2. Modify activities table: Update status check constraint to support the new approval workflow
-- First we must drop the old constraint
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_status_check;

-- Then add the new constraint
ALTER TABLE activities ADD CONSTRAINT activities_status_check 
CHECK (status IN ('Draft', 'Submitted', 'Reviewed', 'Pending Review', 'Approved', 'Rejected', 'Resubmitted'));

-- 3. Modify evaluations table: Add activity reference and status for history tracking
ALTER TABLE evaluations
ADD COLUMN activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
ADD COLUMN status VARCHAR(20) DEFAULT 'Reviewed';
