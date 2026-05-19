# Student Learning Platform - Setup Guide

## ✅ Quick Setup Checklist

### Prerequisites
- [ ] Node.js v14+ installed
- [ ] npm or yarn
- [ ] Supabase account (supabase.com)
- [ ] GitHub account (for material links)

---

## 📋 Step 1: Supabase Setup

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Click "New Project"
   - Fill in project details
   - Wait for project initialization

2. **Get Your Credentials**
   - Go to Settings → API
   - Copy `Project URL`
   - Copy `anon` key
   - Copy `service_role` key (keep secret!)

3. **Create Database Schema**
   - Open SQL Editor in Supabase
   - Copy entire content from `database/schema.sql`
   - Run the SQL
   - Wait for tables to be created

---

## 🔧 Step 2: Backend Setup

```bash
cd backend
npm install
```

**Create .env file:**
```bash
cp .env.example .env
```

**Edit backend/.env:**
```
PORT=5000
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
```

**Start Backend:**
```bash
npm run dev
```

✅ Backend should run on `http://localhost:5000`
✅ Test API: `http://localhost:5000/api/health`

---

## ⚛️ Step 3: Frontend Setup

```bash
cd frontend
npm install
```

**Create .env file:**
```bash
cp .env.example .env
```

**Edit frontend/.env:**
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SUPABASE_URL=your_project_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

**Start Frontend:**
```bash
npm start
```

✅ Frontend should open at `http://localhost:3000`

---

## 🎯 Step 4: First-Time Usage

### Register Admin Account
1. Go to `http://localhost:3000/register`
2. Fill in:
   - Name: Your name
   - Email: admin@example.com
   - Password: secure password
   - Role: Admin (select from dropdown)
3. Click Register
4. You'll be redirected to Admin Dashboard

### Register Student Account
1. Go to `http://localhost:3000/register`
2. Fill in:
   - Name: Student name
   - Email: student@example.com
   - Password: secure password
   - Role: Student
3. Click Register
4. You'll be redirected to Student Dashboard

---

## 📚 Step 5: Testing Features

### 1. **Test Admin Features**
   - Login as admin
   - Upload a video:
     - Title: "Sample Lecture"
     - YouTube URL: `https://youtube.com/watch?v=dQw4w9WgXcQ`
   - View videos on Student Dashboard

### 2. **Test Study Materials**
   - As admin, create material with GitHub URL
   - Example: `https://github.com/user/repo/raw/main/document.pdf`

### 3. **Test Quizzes**
   - As admin, create a quiz
   - Add 3 questions
   - Publish quiz
   - Login as student and take quiz
   - Check results

### 4. **Test Leaderboard**
   - As student, complete multiple quizzes
   - Login as another student and complete quizzes
   - View Leaderboard page
   - See rankings sorted by percentage

---

## 🚀 Deployment Options

### Option 1: Vercel (Frontend)
```bash
npm install -g vercel
cd frontend
vercel
```

### Option 2: Heroku (Backend)
```bash
heroku login
heroku create your-app-name
git push heroku main
```

### Option 3: Docker (Both)
```bash
# Use Docker to containerize both services
docker-compose up
```

---

## 🐛 Troubleshooting

### "Cannot connect to backend"
- [ ] Check backend is running on port 5000
- [ ] Verify REACT_APP_API_URL is correct
- [ ] Check CORS is enabled in backend

### "Database connection failed"
- [ ] Verify Supabase credentials in .env
- [ ] Check schema.sql was executed
- [ ] Ensure database tables exist

### "JWT authentication error"
- [ ] Verify JWT_SECRET is same for all requests
- [ ] Check token hasn't expired (7 days)
- [ ] Clear localStorage and login again

### "Blank page on frontend"
- [ ] Check browser console for errors
- [ ] Verify Node modules are installed
- [ ] Try `npm start` again
- [ ] Clear cache with Ctrl+Shift+Delete

---

## 📁 Project File Structure

```
SLP/
├── backend/
│   ├── routes/          API routes
│   ├── middleware/      JWT & Auth
│   ├── utils/          Supabase config
│   ├── index.js        Express server
│   ├── package.json
│   └── .env           (Create this!)
│
├── frontend/
│   ├── src/
│   │   ├── pages/      Login, Register, Dashboards
│   │   ├── components/ UI components
│   │   ├── services/   API calls
│   │   ├── context/    Auth state
│   │   ├── styles/     CSS files
│   │   └── App.js      Main component
│   ├── package.json
│   └── .env           (Create this!)
│
├── database/
│   └── schema.sql     Database setup
│
└── README.md
```

---

## 🔐 Security Checklist

- [ ] JWT_SECRET is strong (>16 characters)
- [ ] .env files are in .gitignore
- [ ] Service role key never exposed to frontend
- [ ] Passwords hashed with bcryptjs
- [ ] CORS only allows your domain
- [ ] SQL injection prevented with parameterized queries

---

## 📞 Support

- Check README.md files in each folder
- Review API documentation in backend/README.md
- Check frontend component documentation in frontend/README.md
- Review database schema in database/README.md

---

## ✨ Next Steps After Setup

1. **Customize Styling**
   - Edit CSS files in `frontend/src/styles/`
   - Change colors, fonts, layouts

2. **Add More Features**
   - Discussion forums
   - Certificates
   - Payment integration
   - Email notifications

3. **Optimize Performance**
   - Add caching
   - Compress images
   - Lazy load components
   - Setup CDN

4. **Implement Testing**
   - Jest for unit tests
   - React Testing Library
   - API integration tests

---

**Good luck with your Student Learning Platform! 🎉**
