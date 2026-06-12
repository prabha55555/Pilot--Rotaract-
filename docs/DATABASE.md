# PILOT Database Schema

## Overview
PostgreSQL database schema for PILOT Trainer Development Lifecycle Management Platform.

All tables use Supabase with Row Level Security (RLS) for multi-role access control.

---

## Tables

### 1. users
Stores all user accounts with role-based information.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

**RLS Policies**:
- DTD: Can view own record only
- DT: Can view own record + DTDs under their district
- Admin: Can view all DT and DTD records
- SuperAdmin: Can view and edit all records

---

### 2. activities
User-submitted activities with metadata and status tracking.

```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL CHECK (category IN (
    'Event Conducted', 'MC Assignment', 'Training Session', 'Project Participation',
    'Task Completion', 'Content Creation', 'Club Visit', 'Workshop Facilitation'
  )),
  description TEXT,
  outcome TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Reviewed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_created_at ON activities(created_at);
```

**RLS Policies**:
- User can view/edit own activities
- Evaluators can view submitted activities of assigned users
- Admins can view all activities

---

### 3. files
File uploads associated with activities.

```sql
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('jpg', 'jpeg', 'png', 'pdf')),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_files_activity_id ON files(activity_id);
```

---

### 4. evaluations
Evaluation records for activities and performance.

```sql
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  evaluator_id UUID NOT NULL REFERENCES users(id),
  remarks TEXT,
  strengths TEXT,
  improvements TEXT,
  recommendation BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_evaluations_candidate_id ON evaluations(candidate_id);
CREATE INDEX idx_evaluations_evaluator_id ON evaluations(evaluator_id);
```

---

### 5. interviews
Interview tracking and scheduling.

```sql
CREATE TABLE interviews (
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

CREATE INDEX idx_interviews_candidate_id ON interviews(candidate_id);
CREATE INDEX idx_interviews_status ON interviews(status);
```

---

### 6. promotions
Promotion history and records.

```sql
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  old_role VARCHAR(20) NOT NULL,
  new_role VARCHAR(20) NOT NULL,
  promoted_by UUID REFERENCES users(id),
  promoted_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_promotions_user_id ON promotions(user_id);
CREATE INDEX idx_promotions_promoted_at ON promotions(promoted_at);
```

---

### 7. activity_timeline
Monthly activity tracking for timeline views.

```sql
CREATE TABLE activity_timeline (
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

CREATE INDEX idx_activity_timeline_user_id ON activity_timeline(user_id);
CREATE INDEX idx_activity_timeline_year_month ON activity_timeline(year, month);
```

---

### 8. leaderboards
Cached leaderboard rankings by role.

```sql
CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  rank INT,
  activity_count INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, role)
);

CREATE INDEX idx_leaderboards_role_rank ON leaderboards(role, rank);
CREATE INDEX idx_leaderboards_user_id ON leaderboards(user_id);
```

---

### 9. documents
Shared documents library (templates, guidelines, etc.).

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_documents_category ON documents(category);
```

---

## Key Relationships

```
users
├─ activities (one-to-many)
│  └─ files (one-to-many)
├─ evaluations (as candidate and evaluator)
├─ interviews
└─ promotions

leaderboards (references users)
documents (uploaded_by references users)
```

---

## Row Level Security (RLS) Policies

### DTD Policies
- **activities**: Can view/edit own activities only
- **evaluations**: Can view own evaluations only
- **leaderboards**: Can view own rank

### DT Policies
- **activities**: Can view own + can view DTDs' submitted activities
- **evaluations**: Can create/view evaluations for assigned DTDs
- **interviews**: Can view interview records for evaluated candidates

### Admin Policies
- **users**: Can view all DT and DTD records
- **activities**: Can view all activities
- **evaluations**: Can view all evaluations
- **interviews**: Can manage interview scheduling
- **reports**: Can generate and access all reports

### SuperAdmin Policies
- **users**: FULL ACCESS (create, update, delete, promote)
- **activities**: FULL ACCESS
- **evaluations**: FULL ACCESS
- **interviews**: FULL ACCESS
- **promotions**: Can create, update, view
- **reports**: FULL ACCESS
- **documents**: FULL ACCESS

---

## Storage Buckets (Supabase)

### activities-bucket
- Stores activity-related file uploads
- Allowed: jpg, jpeg, png, pdf
- Max size: 10MB per file
- Path: `/activities/{activity_id}/{file_id}`

### documents-bucket
- Stores shared district documents
- Allowed: jpg, jpeg, png, pdf, docx, xlsx
- Max size: 50MB per file
- Path: `/documents/{document_id}`

---

## Setup Instructions

1. Create a Supabase project at [Supabase Dashboard](https://supabase.com/dashboard/).
2. Copy and execute the SQL schema from [docs/schema.sql](file:///d:/PROJECTS/Pilot%20-%20UM/docs/schema.sql) in the Supabase SQL Editor to create all primary tables and indexes.
3. Verify that the [interviews](file:///d:/PROJECTS/Pilot%20-%20UM/backend/routes/interviews.js) table and database RLS are configured for production by running the full production migration script in [docs/rls_policies.sql](file:///d:/PROJECTS/Pilot%20-%20UM/docs/rls_policies.sql) in the Supabase SQL Editor.
4. Ensure storage buckets `activities` and `documents` are created under your Supabase storage page.
5. Once executed, the role-based security policies for all tables and storage layers will be fully active.

---

## Notes

- All IDs use UUID v4 for security and scalability
- Timestamps use UTC and auto-populate on create
- Constraints enforce data integrity at database level
- Indexes optimize common query patterns
- RLS ensures users can only access data appropriate to their role
- Promotion history is immutable (append-only)
