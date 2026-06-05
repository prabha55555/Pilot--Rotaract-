/**
 * PILOT Platform - Database Setup Script
 * ----------------------------------------
 * Run this ONCE to:
 *  1. Create all database tables
 *  2. Find your Supabase auth user
 *  3. Insert you into the users table as SuperAdmin
 *
 * Usage: node scripts/setup.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import ws from 'ws'
import readline from 'readline'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: ws }
  }
)

// ─── Helpers ────────────────────────────────────────────────────────────────

const ask = (question) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    rl.question(question, (answer) => { rl.close(); resolve(answer.trim()) })
  })

const log = (msg) => console.log(`\n  ✅ ${msg}`)
const warn = (msg) => console.log(`\n  ⚠️  ${msg}`)
const err = (msg) => console.log(`\n  ❌ ${msg}`)
const section = (title) => console.log(`\n${'─'.repeat(50)}\n  ${title}\n${'─'.repeat(50)}`)

// ─── SQL Schema ──────────────────────────────────────────────────────────────

const SCHEMA_SQL = `
-- 1. Users table
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

-- 2. Activities table
CREATE TABLE IF NOT EXISTS activities (
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

CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);

-- 3. Files table
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('jpg', 'jpeg', 'png', 'pdf')),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_files_activity_id ON files(activity_id);

-- 4. Evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
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

CREATE INDEX IF NOT EXISTS idx_evaluations_candidate_id ON evaluations(candidate_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_evaluator_id ON evaluations(evaluator_id);

-- 5. Interviews table
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

-- 6. Promotions table
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

-- 7. Activity timeline table
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

-- 8. Leaderboards table
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

-- 9. Documents table
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
`

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🚀 PILOT Platform — Database Setup\n')

  // ── Step 1: List auth users ────────────────────────────────────────────────
  section('STEP 1: Finding your Supabase Auth user')

  const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers()

  if (authError) {
    err(`Could not fetch auth users: ${authError.message}`)
    process.exit(1)
  }

  if (authUsers.length === 0) {
    err('No users found in Supabase Auth. Go create one first in the Supabase dashboard.')
    process.exit(1)
  }

  console.log('\n  Found these auth users:')
  authUsers.forEach((u, i) => {
    console.log(`    [${i + 1}] ${u.email}  (id: ${u.id})`)
  })

  // Pick the user
  let selectedUser
  if (authUsers.length === 1) {
    selectedUser = authUsers[0]
    log(`Auto-selected: ${selectedUser.email}`)
  } else {
    const choice = await ask('\n  Enter the number of YOUR account: ')
    selectedUser = authUsers[parseInt(choice) - 1]
    if (!selectedUser) {
      err('Invalid selection.')
      process.exit(1)
    }
    log(`Selected: ${selectedUser.email}`)
  }

  // ── Step 2: Verify tables exist ──────────────────────────────────────────────
  section('STEP 2: Checking database tables')

  // Check if users table exists by attempting a select
  const { error: tableCheckError } = await supabase.from('users').select('id').limit(1)

  if (tableCheckError && tableCheckError.code === '42P01') {
    warn('The "users" table does not exist yet.')
    console.log(`
  ⚡ ACTION REQUIRED — Create tables in Supabase:
  ─────────────────────────────────────────────────
  1. Open: https://supabase.com/dashboard/project/wquimqkebdllktyinqgd
  2. Go to: SQL Editor → New Query
  3. Copy & run the SQL from: docs/schema.sql (created next to this script)
  4. Then re-run this setup script: node scripts/setup.js
    `)
    process.exit(0)
  } else if (tableCheckError) {
    warn(`Unexpected error checking tables: ${tableCheckError.message}`)
  } else {
    log('Database tables already exist!')
  }

  // ── Step 3: Get user details ───────────────────────────────────────────────
  section('STEP 3: Setting up your user profile')

  // Check if user already exists in users table
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('id', selectedUser.id)
    .single()

  if (existingUser) {
    log(`User already exists in users table!`)
    console.log(`    Email: ${existingUser.email}`)
    console.log(`    Role:  ${existingUser.role}`)
    console.log('\n  🎉 Setup complete! You can log in now.\n')
    process.exit(0)
  }

  // Gather user info
  console.log(`\n  Setting up profile for: ${selectedUser.email}\n`)
  const name  = await ask('  Your full name: ')
  const club  = await ask('  Your club name: ')
  const batch = await ask('  Your batch year (e.g. 2026): ')

  // ── Step 4: Insert user ────────────────────────────────────────────────────
  section('STEP 4: Inserting user into database')

  const pilotId = `PILOT-SuperAdmin-001`

  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert([{
      id:       selectedUser.id,
      pilot_id: pilotId,
      email:    selectedUser.email,
      name:     name,
      club:     club,
      role:     'SuperAdmin',
      status:   'Active',
      batch:    batch,
    }])
    .select()
    .single()

  if (insertError) {
    err(`Failed to insert user: ${insertError.message}`)
    process.exit(1)
  }

  log(`User created successfully!`)
  console.log(`
    Name:     ${newUser.name}
    Email:    ${newUser.email}
    Role:     ${newUser.role}
    Pilot ID: ${newUser.pilot_id}
    Club:     ${newUser.club}
  `)

  console.log('  🎉 Setup complete! Start the frontend and log in with your credentials.\n')
}

main().catch((e) => {
  err(`Unexpected error: ${e.message}`)
  process.exit(1)
})
