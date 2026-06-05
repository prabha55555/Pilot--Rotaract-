# Backend Setup Instructions

## Quick Start

```bash
npm install
npm run dev
```

Backend will run at `http://localhost:5000`

## Environment Variables

Create `.env`:

```
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

## Project Structure

- **routes**: Express route handlers
- **controllers**: Business logic (to be implemented)
- **middleware**: Authentication and error handling
- **models**: Database queries (to be implemented)
- **config**: Supabase configuration
- **utils**: Helper utilities

## Available Scripts

- `npm run dev`: Start development server with auto-reload
- `npm start`: Start production server

## API Endpoints

See [docs/API.md](../docs/API.md) for complete endpoint documentation.

## Key Technologies

- Express.js
- Supabase
- CORS for cross-origin requests
- dotenv for environment variables
