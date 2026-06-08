-- ============================================================
-- PILOT Platform — Full Database Schema
-- Run this ONCE in Supabase SQL Editor
-- https://supabase.com/dashboard/project/wquimqkebdllktyinqgd
-- ============================================================

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  pilot_id VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  club VARCHAR(100),
  role VARCHAR(20) NOT NULL CHECK (role IN ('DTD', 'DT', 'Admin', 'SuperAdmin')),
  status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Promoted', 'Archived', 'Inactive')),
  batch VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Activities
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL CHECK (category IN (
    'Event Conducted', 'MC Assignment', 'Training Session', 'Project Participation',
    'Task Completion', 'Content Creation', 'Club Visit', 'Workshop Facilitation',
    'Workshop', 'Community Service', 'Leadership Development', 'Membership Development',
    'Public Relations', 'Professional Development', 'Other'
  )),
  description TEXT,
  outcome TEXT,
  avenue VARCHAR(100),
  project_type VARCHAR(100),
  project_mode VARCHAR(50),
  location VARCHAR(255),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  project_chair VARCHAR(255),
  project_chair_contact VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Reviewed', 'Pending Review', 'Approved', 'Rejected', 'Resubmitted')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);

-- 3. Files
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('jpg', 'jpeg', 'png', 'pdf')),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_files_activity_id ON files(activity_id);

-- 4. Evaluations
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  evaluator_id UUID NOT NULL REFERENCES users(id),
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  remarks TEXT,
  strengths TEXT,
  improvements TEXT,
  recommendation BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'Reviewed',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evaluations_candidate_id ON evaluations(candidate_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_evaluator_id ON evaluations(evaluator_id);

-- 5. Interviews
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Scheduled', 'Passed', 'Failed', 'Waitlisted')),
  interview_date TIMESTAMP,
  communication_notes TEXT,
  leadership_notes TEXT,
  facilitation_notes TEXT,
  overall_remarks TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interviews_candidate_id ON interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);

-- 6. Promotions
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  old_role VARCHAR(20) NOT NULL,
  new_role VARCHAR(20) NOT NULL,
  promoted_by UUID REFERENCES users(id),
  promoted_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promotions_user_id ON promotions(user_id);
CREATE INDEX IF NOT EXISTS idx_promotions_promoted_at ON promotions(promoted_at);

-- 7. Activity Timeline
CREATE TABLE IF NOT EXISTS activity_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  year INT NOT NULL,
  activity_count INT DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

CREATE INDEX IF NOT EXISTS idx_activity_timeline_user_id ON activity_timeline(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_timeline_year_month ON activity_timeline(year, month);

-- 8. Leaderboards
CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  rank INT,
  activity_count INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_leaderboards_role_rank ON leaderboards(role, rank);
CREATE INDEX IF NOT EXISTS idx_leaderboards_user_id ON leaderboards(user_id);

-- 9. Documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);

-- 10. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ============================================================
-- DISABLE Row Level Security (for development — re-enable for production)
-- ============================================================
ALTER TABLE users              DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities         DISABLE ROW LEVEL SECURITY;
ALTER TABLE files              DISABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations        DISABLE ROW LEVEL SECURITY;
ALTER TABLE interviews         DISABLE ROW LEVEL SECURITY;
ALTER TABLE promotions         DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_timeline  DISABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards       DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents          DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications      DISABLE ROW LEVEL SECURITY;
