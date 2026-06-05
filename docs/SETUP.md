# PILOT Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create account
3. Click "New Project"
4. Enter project name: `pilot`
5. Create strong database password
6. Select region closest to you
7. Click "Create new project" (takes ~2 min)

## Step 2: Get Your Credentials

In Supabase dashboard:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `SUPABASE_URL`
   - **Anon Public Key** → `VITE_SUPABASE_ANON_KEY` (frontend) & `SUPABASE_ANON_KEY` (backend)
   - **Service Role Key** → `SUPABASE_SERVICE_KEY` (backend only)

## Step 3: Create Environment Files

### Frontend (.env.local)
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Backend (.env)
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here
JWT_SECRET=generate_a_random_secret_string_here
PORT=5000
```

## Step 4: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire SQL schema from [DATABASE.md](DATABASE.md)
4. Paste into query editor
5. Click **Run**

**Wait for all queries to complete** (check status at bottom)

### Verify Tables Created

Go to **Table Editor** in Supabase dashboard. You should see:
- users
- activities
- files
- evaluations
- interviews
- promotions
- activity_timeline
- leaderboards
- documents

## Step 5: Create Storage Buckets

In Supabase dashboard → **Storage**:

### activities-bucket
1. Click **New Bucket**
2. Name: `activities`
3. Leave **Public bucket** unchecked
4. Click **Create Bucket**
5. Click **File** on bucket menu
6. Set **Allowed MIME types**: `image/jpeg, image/png, application/pdf`
7. Set **Max file size**: 10 MB

### documents-bucket
1. Click **New Bucket**
2. Name: `documents`
3. Leave **Public bucket** unchecked
4. Click **Create Bucket**
5. Click **File** on bucket menu
6. Set **Allowed MIME types**: `image/jpeg, image/png, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
7. Set **Max file size**: 50 MB

## Step 6: Create Test User (Optional)

### Via Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Email: `test@example.com`
4. Password: `TestPass123!`
5. Click **Save**

### Via Supabase Studio (Easier for Role Assignment)

1. Go to **SQL Editor** → **New Query**
2. Run:
```sql
-- Create test user in auth.users
INSERT INTO auth.users (email, raw_user_meta_data, is_sso_user, created_at, updated_at, last_sign_in_at, email_confirmed_at)
VALUES ('test@example.com', '{}', FALSE, NOW(), NOW(), NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Get the user ID (you'll need this)
SELECT id FROM auth.users WHERE email = 'test@example.com';

-- Create user record in public.users table
INSERT INTO users (id, pilot_id, email, name, club, role, batch, status)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'test@example.com'),
  'PILOT-DTD-001',
  'test@example.com',
  'Test User',
  'Test Club',
  'DTD',
  '2026',
  'Active'
);
```

## Step 7: Enable Row Level Security (RLS)

1. Go to **Authentication** → **Policies**
2. For each table (users, activities, evaluations, etc.):
   - Click table name
   - Toggle **Enable RLS**
3. Now add basic policies for testing:

```sql
-- Allow DTD to see own data
CREATE POLICY "DTD_own_data" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Allow all authenticated users to list users (for dropdown)
CREATE POLICY "Users_list" ON users
  FOR SELECT
  USING (TRUE);

-- Allow users to see their own activities
CREATE POLICY "Activities_owner" ON activities
  FOR ALL
  USING (auth.uid() = user_id);

-- Allow all authenticated to view submitted activities
CREATE POLICY "Activities_submitted" ON activities
  FOR SELECT
  USING (status = 'Submitted' OR auth.uid() = user_id);
```

## Step 8: Verify Setup

### Frontend Test

```bash
cd frontend
npm run dev
# Open http://localhost:3000 in browser
# Should see login page
```

### Backend Test

```bash
cd backend
npm run dev
# Should see "PILOT Backend server running on http://localhost:5000"
```

### API Health Check

```bash
curl http://localhost:5000/health
# Should return: {"status":"PILOT Backend is running"}
```

### Login Test

1. Go to http://localhost:3000
2. Click "Login"
3. Enter test credentials: `test@example.com` / `TestPass123!`
4. Should redirect to Dashboard

## Troubleshooting

### "Missing Supabase credentials"
- Check `.env.local` (frontend) or `.env` (backend) files
- Verify URLs don't have typos
- Keys must be from the correct Supabase project

### "Unable to connect to database"
- Verify Supabase project is active
- Check network connectivity
- Verify SQL queries ran successfully

### "User not found on login"
- Ensure test user was created in auth.users table
- Verify user record exists in public.users table
- Check email matches exactly (case-sensitive)

### "401 Unauthorized"
- JWT token may be invalid
- Verify SUPABASE_ANON_KEY is correct
- Check token expiration (default: 1 hour)

## Next Steps

1. ✅ Create 30 DTD users for initial batch
2. ✅ Upload activity templates to documents bucket
3. ✅ Create 5-6 DT users for evaluation
4. ✅ Create Admin user
5. ✅ Create SuperAdmin user
6. ✅ Test full workflow: Activity submission → Evaluation → Interview → Promotion

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
