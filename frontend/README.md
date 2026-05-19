# Frontend Setup Guide

## Installation

```bash
npm install
```

## Environment Setup

1. Copy `.env.example` to `.env`
2. Configure variables:
   - `REACT_APP_API_URL` - Backend API URL (default: `http://localhost:5000/api`)
   - `REACT_APP_SUPABASE_URL` - Supabase project URL
   - `REACT_APP_SUPABASE_ANON_KEY` - Supabase anonymous key

## Running the Application

### Development Mode
```bash
npm start
```

Application will open at `http://localhost:3000`

### Build for Production
```bash
npm run build
```

Output folder: `build/`

## Project Structure

```
frontend/
├── public/          # Static files (HTML, images)
├── src/
│   ├── components/  # Reusable React components
│   ├── pages/       # Full-page components
│   ├── services/    # API communication layer
│   ├── context/     # React Context (Authentication state)
│   ├── styles/      # CSS stylesheets
│   ├── App.js       # Main app component with routing
│   └── index.js     # React entry point
└── package.json
```

## Pages Available

- **Login** (`/login`) - User authentication
- **Register** (`/register`) - New user registration
- **Admin Dashboard** (`/admin/dashboard`) - Admin panel
- **Student Dashboard** (`/student/dashboard`) - Student home
- **Leaderboard** (`/student/leaderboard`) - Rankings and scores

## Components

- **Login** - Login form
- **Register** - Registration form
- **AdminDashboard** - Admin control panel
- **StudentDashboard** - Student home with videos
- **Leaderboard** - Student rankings

## Context

### AuthContext
Manages user authentication state:
- User profile
- JWT token
- Login/logout functions
- Role-based access control

Usage:
```javascript
import { useAuth } from './context/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
};
```

## API Services

### authAPI
- `register(userData)` - Create account
- `login(credentials)` - Login
- `getProfile()` - Get user info

### videoAPI
- `getVideos()` - Get all videos
- `getVideo(id)` - Get video details
- `createVideo()` - Upload video (admin)

### materialAPI
- `getMaterials()` - Get materials
- `createMaterial()` - Upload material (admin)

### quizAPI
- `getQuizzes()` - Get quizzes
- `getQuiz(id)` - Get quiz details
- `submitQuiz()` - Submit answers

### leaderboardAPI
- `getLeaderboard()` - Get rankings
- `getStudentRank(studentId)` - Get student rank

### subscriptionAPI
- `getMySubscription()` - Get user subscription
- `createSubscription()` - Create subscription

## Authentication Flow

1. User registers/logs in
2. Backend returns JWT token
3. Token stored in localStorage
4. Token added to every API request header
5. Token validated on each request
6. User redirected based on role (admin/student)

## Styling

- Responsive design with CSS Grid and Flexbox
- Mobile-first approach
- Color scheme: Blue/Purple (#667eea, #764ba2)
- Interactive hover effects
- Modal dialogs for forms

## Routing

- Public routes: `/login`, `/register`
- Protected routes: `/admin/*`, `/student/*`
- Automatic role-based redirection
- Token validation on route change

## Dependencies

- **react** - UI framework
- **react-router-dom** - Routing
- **axios** - HTTP client
- **@supabase/supabase-js** - Supabase client

## Features

- User registration and login
- Role-based access (admin/student)
- Video player with YouTube embedding
- Quiz interface with grading
- Leaderboard display
- Responsive mobile design
- Error handling
- Loading states

## Common Tasks

### Adding a New Page

1. Create page in `src/pages/YourPage.js`
2. Add route in `App.js`
3. Create styles in `src/styles/YourPage.css`

### Making API Calls

1. Use services from `src/services/api.js`
2. Handle loading/error states
3. Update component state with response

### Adding Protected Routes

Use `ProtectedRoute` component in `App.js` with role requirement

## Error Handling

- API errors displayed as alert messages
- Loading states show spinner
- Network errors logged to console
- Authentication errors redirect to login

## Performance

- Code splitting with React Router
- Lazy loading of components
- Optimized re-renders
- CSS optimization for production

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Upload 'build' folder to Netlify
```

### Docker
Create `Dockerfile` for containerization

## Troubleshooting

**Blank page**: Check browser console for errors
**API errors**: Verify backend is running and URL is correct
**Login fails**: Check credentials and backend response
**CORS issues**: Ensure backend allows the frontend URL

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| REACT_APP_API_URL | Backend endpoint | http://localhost:5000/api |
| REACT_APP_SUPABASE_URL | Database URL | https://xxx.supabase.co |
| REACT_APP_SUPABASE_ANON_KEY | Supabase key | eyXXX... |

## Testing

Run tests:
```bash
npm test
```

Build app:
```bash
npm run build
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
