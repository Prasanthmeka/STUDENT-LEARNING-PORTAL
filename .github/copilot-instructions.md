# Copilot Instructions

## Project Setup

This is the Student Learning Platform (SLP) - a comprehensive educational system built with React, Node.js/Express, and Supabase.

## Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL and Supabase keys
npm start
```

### 3. Database Setup
Run the SQL schema from `database/schema.sql` in your Supabase SQL Editor.

## Project Structure

```
SLP/
├── frontend/        React frontend (port 3000)
├── backend/         Express API (port 5000)
└── database/        Supabase schema
```

## Key Features

- User authentication (email/password + OAuth support)
- Admin video and material management
- Student quiz system with auto-grading
- Leaderboard with rankings
- Subscription management
- YouTube video embedding
- GitHub material links

## Tech Stack

- **Frontend**: React 18, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT

## Important Notes

- Backend runs on `http://localhost:5000`
- Frontend runs on `http://localhost:3000`
- JWT tokens expire after 7 days
- All passwords are hashed with bcryptjs
- Role-based access control (admin/student)

## For Development

Use the provided npm scripts:
- Backend: `npm run dev` for development mode
- Frontend: `npm start` for development with hot reload

## API Base URL

Frontend communicates with: `http://localhost:5000/api`

## Environment Variables

### Backend (.env)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - For database operations
- `JWT_SECRET` - For token signing

### Frontend (.env)
- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_SUPABASE_URL` - Supabase URL
- `REACT_APP_SUPABASE_ANON_KEY` - Supabase anon key

## Common Tasks

### Adding a Video
1. Login as admin
2. Go to Admin Dashboard
3. Click "Upload Video"
4. Paste YouTube URL and submit

### Creating a Quiz
1. Login as admin
2. Navigate to Quiz creation
3. Add questions with multiple choice options
4. Set passing score and time limit
5. Publish quiz

### Viewing Leaderboard
1. Login as student
2. Navigate to Leaderboard page
3. View your rank and other students' scores

## Debugging

- Check browser console for frontend errors
- Check server logs for backend errors
- Verify Supabase connection in .env files

## Future Enhancements

- OAuth2 integration
- Payment system for premium subscriptions
- PDF auto-quiz generation
- Mobile app
- Real-time notifications
- Discussion forums
