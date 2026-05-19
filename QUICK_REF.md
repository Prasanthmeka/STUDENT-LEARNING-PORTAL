# Student Learning Platform - Quick Reference

## 🚀 Quick Start (5 minutes)

```bash
# 1. Backend Setup
cd backend
npm install
cp .env.example .env
# Edit .env with Supabase credentials
npm run dev

# 2. Frontend Setup (new terminal)
cd frontend
npm install
cp .env.example .env
npm start

# 3. Open browser
# Frontend: http://localhost:3000
# Backend: http://localhost:5000/api/health
```

---

## 📋 Project Structure

```
SLP/
├── frontend/           # React app (port 3000)
├── backend/            # Express API (port 5000)
├── database/           # Supabase schema
├── README.md           # Main documentation
├── SETUP.md            # Detailed setup guide
├── FEATURES.md         # Feature documentation
├── DEPLOYMENT.md       # Deployment guide
├── DEVELOPMENT.md      # Development guide
└── QUICK_REF.md        # This file
```

---

## 🔐 Default Routes

### Public Routes
- `GET /` → Redirect to login/dashboard
- `GET /login` → Login page
- `GET /register` → Registration page

### Admin Routes (Protected)
- `GET /admin/dashboard` → Admin dashboard
- `POST /api/videos` → Upload video
- `POST /api/materials` → Upload material
- `POST /api/quizzes` → Create quiz

### Student Routes (Protected)
- `GET /student/dashboard` → Student home
- `GET /student/quizzes` → Quiz list
- `GET /student/quiz/:id` → Take quiz
- `GET /student/leaderboard` → Rankings

---

## 📦 API Endpoints Summary

### Auth
```
POST   /api/auth/register           Register user
POST   /api/auth/login              Login user
GET    /api/auth/profile            Get profile (protected)
```

### Videos
```
GET    /api/videos                  Get all videos
GET    /api/videos/:id              Get video by ID
POST   /api/videos                  Create video (admin)
PUT    /api/videos/:id              Update video (admin)
DELETE /api/videos/:id              Delete video (admin)
```

### Materials
```
GET    /api/materials               Get all materials
POST   /api/materials               Create material (admin)
PUT    /api/materials/:id           Update material (admin)
DELETE /api/materials/:id           Delete material (admin)
```

### Quizzes
```
GET    /api/quizzes                 Get all quizzes
GET    /api/quizzes/:id             Get quiz with questions
POST   /api/quizzes                 Create quiz (admin)
POST   /api/quizzes/:id/submit      Submit answers (student)
GET    /api/quizzes/:id/attempt/:attemptId    Get results
```

### Leaderboard
```
GET    /api/leaderboard             Get rankings
GET    /api/leaderboard/student/:id Get student rank
```

### Subscriptions
```
POST   /api/subscriptions           Create subscription
GET    /api/subscriptions/my-subscription    Get user's subscription
PUT    /api/subscriptions/:id       Update subscription
```

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts (admin/student) |
| `subscriptions` | Student subscription status |
| `videos` | Video metadata |
| `study_materials` | Study material links |
| `quizzes` | Quiz header info |
| `quiz_questions` | Individual questions |
| `quiz_options` | Multiple choice options |
| `quiz_attempts` | Student quiz attempts |
| `student_responses` | Student answers |
| `leaderboard` | Ranking data |

---

## 🆔 Key Components

### Frontend Components
- **Login.js** → Login form
- **Register.js** → Registration form
- **AdminDashboard.js** → Admin panel
- **StudentDashboard.js** → Student home
- **QuizzesPage.js** → Quiz list
- **QuizPage.js** → Quiz interface
- **Leaderboard.js** → Rankings

### Backend Routes
- **routes/auth.js** → Authentication
- **routes/videos.js** → Video management
- **routes/materials.js** → Material management
- **routes/quizzes.js** → Quiz operations
- **routes/leaderboard.js** → Leaderboard
- **routes/subscriptions.js** → Subscriptions

### Utilities
- **services/api.js** → API calls
- **context/AuthContext.js** → Auth state
- **middleware/auth.js** → JWT middleware
- **utils/supabase.js** → Supabase client

---

## 🔑 Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyXXX...
SUPABASE_SERVICE_ROLE_KEY=eyXXX...
JWT_SECRET=your_secret_key_here
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyXXX...
```

---

## 📱 Feature Checklist

### Admin Features
- [ ] Upload recorded videos
- [ ] Setup live streaming
- [ ] Upload study materials
- [ ] Create quizzes
- [ ] Auto-grade quizzes
- [ ] View student performance

### Student Features
- [ ] Register/Login
- [ ] Watch videos
- [ ] Download materials
- [ ] Take quizzes
- [ ] See results
- [ ] View leaderboard

---

## 🧪 Test Accounts

### Admin Account
```
Email: admin@example.com
Password: admin123
Role: admin
```

### Student Account
```
Email: student@example.com
Password: student123
Role: student
```

---

## 🐛 Troubleshooting

### Backend not running
```bash
cd backend
npm install
npm run dev
# Check port 5000 is available
```

### Can't connect to Supabase
```
❌ Check credentials in .env
❌ Verify table creation (run schema.sql)
❌ Check internet connection
```

### Frontend not connecting to API
```
❌ Verify backend is running
❌ Check REACT_APP_API_URL
❌ Refresh browser (Ctrl+Shift+R)
❌ Clear localStorage
```

### Quiz not saving
```
❌ Verify student is logged in
❌ Check quiz exists and is published
❌ Check network errors in console
❌ Ensure database schema is correct
```

---

## 📊 Quiz Scoring Logic

```
For Multiple Choice:
- Correct answer = full marks
- Incorrect answer = 0 marks

For Text/True-False:
- Exact match (case-insensitive) = full marks
- Otherwise = 0 marks

Final Score:
- Percentage = (marks_obtained / total_marks) × 100
- Passed = percentage >= passing_score
```

---

## 🎨 Styling Guide

### Color Scheme
```
Primary: #667eea (Purple-blue)
Secondary: #764ba2 (Purple)
Success: #28a745 (Green)
Danger: #dc3545 (Red)
Gray: #6c757d (Dark gray)
```

### Common Classes
```css
.btn-primary    /* Blue button */
.btn-secondary  /* Gray button */
.loading        /* Loading state */
.error-message  /* Error display */
.modal-overlay  /* Modal background */
```

---

## 📖 Documentation Files

| File | Purpose |
|------|---------|
| README.md | Overview & setup |
| SETUP.md | Step-by-step setup |
| FEATURES.md | Feature details |
| DEPLOYMENT.md | Deployment guide |
| DEVELOPMENT.md | Dev best practices |
| QUICK_REF.md | This quick reference |
| backend/README.md | Backend docs |
| frontend/README.md | Frontend docs |
| database/README.md | Database schema |

---

## 🚢 Deployment Checklist

- [ ] Create Supabase project
- [ ] Run database schema
- [ ] Setup environment variables
- [ ] Test locally (npm run dev / npm start)
- [ ] Push to GitHub
- [ ] Deploy backend (Heroku/AWS)
- [ ] Deploy frontend (Vercel/Netlify)
- [ ] Update API URL in frontend
- [ ] Test all features
- [ ] Setup monitoring
- [ ] Configure backups

---

## 🔒 Security Checklist

- [ ] Passwords hashed (bcryptjs)
- [ ] JWT secret strong (>16 chars)
- [ ] HTTPS enabled
- [ ] Service role key not exposed
- [ ] SQL parameterized
- [ ] Input validation
- [ ] CORS configured
- [ ] .env in .gitignore
- [ ] Error messages don't leak info
- [ ] Rate limiting (recommended)

---

## 💻 Development Workflow

```bash
# Start backend
cd backend && npm run dev

# Start frontend (new terminal)
cd frontend && npm start

# Make changes
# Test locally

# Commit changes
git add .
git commit -m "feat: description"
git push origin feature-branch

# Create Pull Request
# Review and merge
```

---

## 🎯 Common Tasks

### Add New Quiz Feature
1. Update database schema (if needed)
2. Create backend endpoint
3. Create API service call
4. Create/update frontend component
5. Add styling
6. Test functionality
7. Update documentation

### Add New Student Feature
1. Create new page component
2. Add route to App.js
3. Add navigation link
4. Create API calls
5. Add styling
6. Test permissions
7. Test responsiveness

### Fix a Bug
1. Identify issue (frontend/backend)
2. Reproduce locally
3. Debug and find root cause
4. Create fix
5. Test fix thoroughly
6. Commit with "fix:" commit message

---

## 📞 Support Resources

- React: https://react.dev
- Express: https://expressjs.com
- Supabase: https://supabase.com/docs
- JavaScript MDN: https://developer.mozilla.org
- GitHub Docs: https://docs.github.com

---

## 🎓 Learning Path

1. **Setup**: Complete SETUP.md
2. **Features**: Read FEATURES.md
3. **Development**: Follow DEVELOPMENT.md
4. **Deployment**: Review DEPLOYMENT.md
5. **Explore Code**: Review source files
6. **Contribute**: Create new features

---

## 📝 Notes

- JWT tokens expire after 7 days
- Passwords are hashed with 10 bcryptjs rounds
- Quiz auto-grading happens on submission
- Leaderboard sorted by percentage
- OAuth support available for future
- Payment integration ready for future

---

## 🚀 Next Steps

1. Complete local setup
2. Test all features
3. Review code structure
4. Make your first contribution
5. Deploy to cloud
6. Monitor and maintain

---

**Last Updated: April 2026**
**Version: 1.0.0**
