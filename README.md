# PILOT Platform

**Trainer Development Lifecycle Management Platform for Rotaract District Training Programs**

## Overview

PILOT is a comprehensive platform designed to identify, track, evaluate, and promote future trainers within Rotaract District training programs.

### Key Features

- **User Management**: Role-based access (DTD, DT, Admin, SuperAdmin)
- **Activity Tracking**: Submit and track trainer activities across 8 categories
- **Leaderboards**: Real-time ranking by activity type
- **Evaluation System**: Multi-tier evaluation workflow
- **Interview Management**: Track candidate interviews and promotion readiness
- **Promotion Module**: Manual, SuperAdmin-controlled promotions
- **Reports**: Generate and export detailed analytics
- **Document Library**: Store shared resources and templates

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + Shadcn UI
- **Backend**: Node.js + Express + ES Modules
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage (jpg, jpeg, png, pdf)
- **Hosting**: Vercel (Frontend + Serverless Backend)

## Project Structure

```
pilot/
├── frontend/              # React + Vite application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── public/    # Landing, Login, Password reset
│   │   │   └── protected/ # Dashboard, Activities, Reports, etc.
│   │   ├── components/
│   │   │   ├── layout/    # Navbar, Sidebar
│   │   │   ├── ui/        # Shared UI components
│   │   │   └── dashboards/ # Role-specific dashboards
│   │   ├── services/      # Supabase, API client
│   │   ├── context/       # Auth context
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Helper utilities
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── backend/               # Node.js + Express API
│   ├── routes/            # API endpoints
│   ├── controllers/       # Business logic
│   ├── middleware/        # Auth, error handling
│   ├── models/            # Database queries
│   ├── config/            # Supabase setup
│   ├── utils/             # Helpers
│   ├── server.js          # Entry point
│   └── package.json
├── docs/                  # Documentation
│   ├── DATABASE.md        # Database schema
│   ├── API.md             # API documentation
│   └── SETUP.md           # Setup instructions
├── .github/
│   └── copilot-instructions.md  # Project guidelines
├── .gitignore
├── .env.example
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- Git

### Installation

#### 1. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Add your Supabase credentials to .env.local
npm run dev
```

Frontend runs at `http://localhost:3000`

#### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Add your Supabase credentials to .env
npm run dev
```

Backend runs at `http://localhost:5000`

### Environment Variables

#### Frontend (.env.local)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

#### Backend (.env)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key_here
SUPABASE_ANON_KEY=your_anon_key_here
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

## Database Setup

1. Create a Supabase project
2. Run SQL schema from [docs/DATABASE.md](docs/DATABASE.md)
3. Enable Row Level Security (RLS) on all tables
4. Create storage buckets: `activities-bucket` and `documents-bucket`

See [docs/DATABASE.md](docs/DATABASE.md) for complete schema and setup instructions.

## API Documentation

See [docs/API.md](docs/API.md) for detailed API endpoint documentation.

### Key Endpoints

- **Auth**: `POST /auth/login`, `POST /auth/forgot-password`
- **Users**: `GET /users`, `POST /users`, `PATCH /users/:id/promote`
- **Activities**: `GET /activities`, `POST /activities`, `PATCH /activities/:id/status`
- **Evaluations**: `POST /evaluations`, `GET /evaluations`
- **Interviews**: `POST /interviews`, `PATCH /interviews/:id`
- **Reports**: `GET /reports/top-members`, `GET /reports/monthly`, `GET /reports/promotions`

## User Roles

### DTD (District Trainer Designate)
- Submit activities
- View personal leaderboard rank
- Receive evaluations
- Attend interviews

### DT (District Trainer)
- Submit activities
- Evaluate DTDs
- View leaderboard
- Conduct interviews
- Appear on DT leaderboard

### Admin
- Monitor all DTDs and DTs
- Evaluate DTs
- Generate reports
- View analytics

### SuperAdmin
- Create and manage users
- Assign Pilot IDs
- Conduct promotions
- Manage interviews
- Export reports
- Full system access

## Activity Categories

1. Event Conducted
2. MC Assignment
3. Training Session
4. Project Participation
5. Task Completion
6. Content Creation
7. Club Visit
8. Workshop Facilitation

## Development Checklist

- [ ] Supabase project created and configured
- [ ] Database schema implemented
- [ ] Frontend dependencies installed
- [ ] Backend dependencies installed
- [ ] Environment variables configured
- [ ] Frontend dev server running
- [ ] Backend dev server running
- [ ] Authentication workflow tested
- [ ] Sample user created and logged in
- [ ] Activity submission flow tested
- [ ] Leaderboard data populated
- [ ] Evaluation workflow tested

## Deployment

### Frontend (Vercel)

```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel
```

### Backend

Options:
1. Vercel Serverless Functions
2. Railway
3. Render
4. Self-hosted Node.js server

### Database

Supabase handles all database hosting. Enable daily backups.

## Support & Documentation

- Frontend: See [frontend/README.md](frontend/README.md) (if created)
- Backend: See [backend/README.md](backend/README.md) (if created)
- Database: See [docs/DATABASE.md](docs/DATABASE.md)
- API: See [docs/API.md](docs/API.md)

## License

Copyright © 2026 Rotaract District Training Programs

## Contact

For questions about PILOT, contact the district training team.
