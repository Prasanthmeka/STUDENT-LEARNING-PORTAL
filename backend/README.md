# Backend Setup Guide

## Installation

```bash
npm install
```

## Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Public API key
   - `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for admin operations)
3. Set a secure `JWT_SECRET`

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Server will start on `http://localhost:5000`

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Create new account
- `POST /login` - Login user
- `GET /profile` - Get current user profile

### Videos (`/api/videos`)
- `GET /` - Get all published videos
- `POST /` - Create video (admin only)
- `PUT /:id` - Update video (admin only)
- `DELETE /:id` - Delete video (admin only)

### Materials (`/api/materials`)
- `GET /` - Get all materials
- `POST /` - Upload material (admin only)
- `PUT /:id` - Update material (admin only)
- `DELETE /:id` - Delete material (admin only)

### Quizzes (`/api/quizzes`)
- `GET /` - Get all quizzes
- `POST /` - Create quiz (admin only)
- `POST /:id/submit` - Submit quiz answers (student only)

### Leaderboard (`/api/leaderboard`)
- `GET /` - Get all student rankings
- `GET /student/:studentId` - Get student's rank

### Subscriptions (`/api/subscriptions`)
- `POST /` - Create subscription
- `GET /my-subscription` - Get user's subscription
- `PUT /:subscriptionId` - Update subscription

## Project Structure

```
backend/
├── routes/          # API route definitions
├── middleware/      # Custom middleware (auth, validation)
├── utils/          # Utility functions (Supabase client)
├── index.js        # Express server entry point
├── package.json
└── .env.example
```

## Dependencies

- **express** - Web framework
- **@supabase/supabase-js** - Supabase client
- **cors** - Cross-origin resource sharing
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **multer** - File upload handling
- **pdf-parse** - PDF parsing for quiz creation
- **uuid** - Unique ID generation

## Features

- JWT-based authentication
- Role-based access control (admin/student)
- MySQL queries with Supabase
- Auto-grading of quizzes
- Leaderboard ranking
- Study material management
- Video hosting via YouTube
- CSV/JSON quiz import support

## Error Handling

All endpoints return appropriate HTTP status codes:
- `201` - Resource created
- `400` - Bad request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `500` - Server error

## Security

- Passwords hashed with bcryptjs
- JWT tokens expire after 7 days
- Role-based route protection
- CORS enabled for frontend only
- Service role key used only server-side

## Debugging

Enable detailed logs by setting `NODE_ENV=development` in `.env`

## Common Issues

**Connection refused**: Ensure Supabase credentials are correct
**JWT errors**: Check JWT_SECRET matches frontend configuration
**CORS errors**: Verify frontend URL in CORS configuration

## Deployment

For production deployment:
1. Set `NODE_ENV=production`
2. Use environment variables for all secrets
3. Enable HTTPS
4. Set up proper CORS headers
5. Use a process manager like PM2

```bash
npm install -g pm2
pm2 start index.js --name "slp-api"
```
