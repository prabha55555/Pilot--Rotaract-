# PILOT Platform - Copilot Instructions

## Project Overview
Full-stack Trainer Development Lifecycle Management Platform for Rotaract District Training Programs.

- **Frontend**: React (Vite) + Tailwind CSS + Shadcn UI
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage (jpg, jpeg, png, pdf)
- **Hosting**: Vercel (Frontend + Serverless Backend)

## Project Structure
```
pilot/
├── frontend/                  # React + Vite app
├── backend/                   # Node.js + Express API
├── docs/                      # Database schemas, API docs, guides
├── .github/                   # GitHub config
├── .gitignore                 # Git ignore rules
├── .env.example               # Environment variables template
├── package.json               # Root dependencies (monorepo scripts)
└── README.md                  # Project documentation
```

## Development Checklist

- [x] **Step 1: Verify Project Requirements** - COMPLETED
  - Full platform (12 modules) from day 1 ✓
  - Solo developer, flexible timeline ✓
  - Tech stack confirmed: React + Node.js + Supabase + Vercel ✓
  - Activity categories finalized ✓

- [x] **Step 2: Scaffold Frontend Project** - COMPLETED
  - React + Vite + Tailwind CSS ✓
  - All folder structure created (/pages, /components, /services, /context, /hooks, /utils) ✓
  - Environment variables configured (.env.example) ✓
  - 11 pages created (1 landing, 4 auth, 6 protected) ✓
  - Navbar, Sidebar, Layout components ✓
  - npm dependencies installed ✓

- [x] **Step 3: Scaffold Backend Project** - COMPLETED
  - Node.js + Express initialized ✓
  - All folder structure created (/routes, /controllers, /middleware, /config, /utils) ✓
  - Environment variables configured (.env.example) ✓
  - 7 route files created (auth, users, activities, evaluations, interviews, leaderboards, reports) ✓
  - npm dependencies installed ✓

- [x] **Step 4: Create Database Schema Documentation** - COMPLETED
  - 9 tables fully documented: users, activities, files, evaluations, interviews, promotions, activity_timeline, leaderboards, documents ✓
  - RLS policies documented for each role (DTD, DT, Admin, SuperAdmin) ✓
  - Storage bucket configuration documented ✓
  - Complete SQL schema provided ✓
  - Relationship diagram included ✓

- [x] **Step 5: Configure Authentication** - COMPLETED
  - AuthContext with Supabase integration (frontend) ✓
  - Auth middleware template (backend) ✓
  - Login, Forgot Password, Reset Password flows (frontend) ✓
  - Role-based redirect after login ✓
  - Supabase client configuration ✓

- [x] **Step 6: Initialize Core Components** - COMPLETED
  - Navbar with role badge and logout ✓
  - Sidebar with role-based menu items ✓
  - ProtectedLayout for authenticated pages ✓
  - All pages properly routed ✓
  - Role-specific dashboard shells ✓

- [x] **Step 7: Create Backend API Skeleton** - COMPLETED
  - Auth routes: POST /auth/login, /forgot-password, /reset-password ✓
  - User routes: GET /users, POST /users, PATCH /users/:id/promote, etc. ✓
  - Activity routes: GET /activities, POST /activities, PATCH status, upload ✓
  - Evaluation routes: POST /evaluations, GET /evaluations ✓
  - Interview routes: POST /interviews, PATCH /interviews/:id ✓
  - Leaderboard routes: GET /leaderboards/:role ✓
  - Report routes: GET /reports/top-members, /monthly, /promotions, /export ✓

- [x] **Step 8: Install Dependencies** - COMPLETED
  - Frontend: 344 npm packages installed ✓
  - Backend: 284 npm packages installed ✓
  - No critical vulnerabilities blocking development ✓

- [ ] **Step 9: Supabase Setup** - NEXT
  - Create Supabase project
  - Run SQL schema from docs/DATABASE.md
  - Configure storage buckets
  - Create test user
  - Enable RLS policies
  - Follow docs/SETUP.md guide

- [ ] **Step 10: Test & Verify**
  - Frontend dev server: npm run dev (port 3000)
  - Backend dev server: npm run dev (port 5000)
  - Test login flow end-to-end
  - Verify API health endpoint
  - Test Supabase connection

- [ ] **Step 11: Phase 1 Development**
  - Complete backend authentication endpoints
  - Complete user management API
  - Complete activity submission flow
  - Connect frontend forms to backend APIs
  - Test file upload functionality

- [ ] **Step 12: Documentation Complete** - COMPLETED
  - README.md with project overview ✓
  - API documentation (docs/API.md) ✓
  - Database schema guide (docs/DATABASE.md) ✓
  - Setup instructions (docs/SETUP.md) ✓
  - Frontend README ✓
  - Backend README ✓
  - copilot-instructions.md ✓

## Quick Start Commands

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend (in separate terminal)
cd backend
npm install
npm run dev

# Database setup
# Follow setup guide in docs/DATABASE.md
```

## Environment Variables

Create `.env.local` (frontend) and `.env` (backend) from `.env.example`

**Frontend (.env.local)**:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

**Backend (.env)**:
```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
SUPABASE_ANON_KEY=
JWT_SECRET=
PORT=5000
```

## Contact & Support
For PILOT platform questions, refer to docs/ folder or contact district team.
