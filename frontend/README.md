# Frontend Setup Instructions

## Quick Start

```bash
npm install
npm run dev
```

Frontend will run at `http://localhost:3000`

## Environment Variables

Create `.env.local`:

```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Project Structure

- **pages**: React page components for routes
- **components**: Reusable UI components and layouts
- **services**: API client and Supabase configuration
- **context**: Authentication context
- **hooks**: Custom React hooks
- **utils**: Helper functions

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## Key Technologies

- React 18
- React Router for navigation
- Supabase for backend and auth
- Tailwind CSS for styling
- Lucide React for icons
