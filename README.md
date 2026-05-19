# Student Learning Platform (SLP)

A comprehensive educational platform built with React, Node.js/Express, and Supabase. The platform allows admins to manage educational content (videos, study materials, quizzes) and students to learn, take quizzes, and compete on a leaderboard.

## Features

### Admin Features
- **Video Management**: Upload YouTube videos or set up live streaming links
- **Study Materials**: Upload study materials with GitHub links for easy access
- **Quiz Creation**: Create quizzes with multiple question types (multiple choice, true/false, short answer)
- **PDF Parsing**: Upload documents for automatic quiz conversion (PDF and CSV/JSON format supported)
- **Analytics**: Track student performance and engagement

### Student Features
- **Authentication**: Register and login with email/password or OAuth
- **Video Access**: Watch recorded videos and join live streams
- **Study Materials**: Download study materials from GitHub links
- **Quiz System**: Take quizzes with instant grading
- **Results Tracking**: View quiz results with detailed performance metrics
- **Leaderboard**: Compete with other students based on quiz performance
- **Subscription**: Choose between free and premium subscriptions

## Project Structure

```
SLP/
├── frontend/              # React frontend application
│   ├── public/           # Static files
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service layer
│   │   ├── context/      # React Context for state management
│   │   ├── styles/       # CSS stylesheets
│   │   ├── App.js        # Main App component
│   │   └── index.js      # React entry point
│   └── package.json
│
├── backend/               # Node.js/Express backend API
│   ├── routes/           # API route handlers
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   ├── index.js          # Express server entry point
│   ├── .env.example      # Environment variables template
│   └── package.json
│
├── database/             # Database configuration
│   └── schema.sql        # Supabase database schema
│
└── README.md
```

## Prerequisites

- Node.js 14+ and npm
- Supabase account
- GitHub account (for study materials storage)

## Installation & Setup

### 1. Clone & Setup
```bash
cd SLP
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Add your environment variables to .env:
# - PORT
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - JWT_SECRET
# - NODE_ENV

npm run dev
```

The backend should run on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Create .env file
cp .env.example .env

# Add your environment variables to .env:
# - REACT_APP_API_URL=http://localhost:5000/api
# - REACT_APP_SUPABASE_URL
# - REACT_APP_SUPABASE_ANON_KEY

npm start
```

The frontend should run on `http://localhost:3000`

### 4. Database Setup

#### Create Supabase Project
1. Go to https://supabase.com and create a new project
2. Get your Project URL and API keys
3. Go to SQL Editor and run the SQL from `database/schema.sql`

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Videos
- `GET /api/videos` - Get all published videos
- `GET /api/videos/:id` - Get video details
- `POST /api/videos` - Create video (admin only)
- `PUT /api/videos/:id` - Update video (admin only)
- `DELETE /api/videos/:id` - Delete video (admin only)

### Study Materials
- `GET /api/materials` - Get all study materials
- `GET /api/materials/:id` - Get material details
- `POST /api/materials` - Create material (admin only)
- `PUT /api/materials/:id` - Update material (admin only)
- `DELETE /api/materials/:id` - Delete material (admin only)

### Quizzes
- `GET /api/quizzes` - Get all published quizzes
- `GET /api/quizzes/:id` - Get quiz with questions
- `POST /api/quizzes` - Create quiz (admin only)
- `POST /api/quizzes/:id/submit` - Submit quiz answers (student)
- `GET /api/quizzes/:id/attempt/:attemptId` - Get quiz attempt results

### Leaderboard
- `GET /api/leaderboard` - Get overall leaderboard
- `GET /api/leaderboard/student/:studentId` - Get specific student rank

### Subscriptions
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions/my-subscription` - Get user's subscription
- `PUT /api/subscriptions/:subscriptionId` - Upgrade subscription

## Usage

### For Admins
1. Register with role as "admin"
2. Go to Admin Dashboard
3. Upload videos with YouTube URLs
4. Upload study materials with GitHub links
5. Create quizzes with questions and options
6. View analytics and student progress

### For Students
1. Register with role as "student"
2. Go to Student Dashboard
3. View available videos and materials
4. Take quizzes from the quiz section
5. Check your results and ranking on leaderboard

## Technologies Used

### Frontend
- React 18
- React Router v6
- Axios
- Supabase Client

### Backend
- Node.js
- Express.js
- Supabase
- JWT for authentication
- bcryptjs for password hashing
- UUID for ID generation

### Database
- Supabase (PostgreSQL)

## Environment Variables

### Backend (.env)
```
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

## Future Enhancements

- [ ] OAuth 2.0 integration (Google, GitHub)
- [ ] Docker containerization
- [ ] Payment integration for premium subscriptions
- [ ] Advanced quiz analytics
- [ ] Discussion forums
- [ ] Certificates on course completion
- [ ] Mobile app (React Native)
- [ ] Real-time notifications
- [ ] Advanced PDF parsing for quiz creation
- [ ] Code execution for programming quizzes

## Troubleshooting

### CORS Issues
Make sure the backend is running and CORS is properly configured in `index.js`

### Database Connection Issues
1. Verify Supabase credentials in .env
2. Check if schema.sql was executed in Supabase SQL Editor
3. Ensure tables are created properly

### Authentication Issues
1. Verify JWT_SECRET is set correctly
2. Check token expiration in AuthContext
3. Ensure cookies/localStorage is enabled

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for educational purposes

## Support

For issues or questions, please create an issue in the repository or contact the development team.
