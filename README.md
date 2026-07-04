# Campus Issue Tracker

A full-stack campus maintenance issue tracking system with AI-powered issue analysis and duplicate detection.

## Tech Stack
- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL (Neon)
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Recharts
- **AI**: Google Gemini 2.5 Flash

## Project Structure
```
campus-issue-tracker/
├── backend/   # Express + TypeScript API
└── frontend/  # Vite + React SPA
```

## Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL
npm run dev
```

## Environment Variables

### Backend `.env`
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-key
PORT=5000
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:5000/api
```

## Roles
- **STUDENT** — raise issues, view own issues
- **STAFF** — view assigned issues, update status
- **ADMIN** — view all issues, assign staff, view analytics
