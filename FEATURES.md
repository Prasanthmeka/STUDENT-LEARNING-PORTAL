# Features Implementation Guide

This guide explains how each major feature is implemented in the Student Learning Platform.

## 1. Authentication System

### User Registration
- **Route**: `POST /api/auth/register`
- **Flow**:
  1. User fills registration form
  2. Password hashed with bcryptjs (10 rounds)
  3. User created in Supabase
  4. JWT token generated (7-day expiry)
  5. Token stored in localStorage
  6. User redirected based on role

### User Login
- **Route**: `POST /api/auth/login`
- **Flow**:
  1. Email and password provided
  2. User fetched from database
  3. Password compared with hash
  4. JWT token generated
  5. Token stored in localStorage
  6. User redirected to appropriate dashboard

### Token Management
- Token stored in localStorage
- Added to all API requests in Authorization header
- Auto-refresh not implemented (7-day expiry)
- Clear token on logout

---

## 2. Video Management

### Upload Video (Admin)
- **Route**: `POST /api/videos`
- **Fields**:
  - Title, Description
  - Video Type (recorded or live)
  - YouTube URL or Live Stream URL
  - Published status
- **Storage**: Metadata in Supabase, video on YouTube/streaming platform
- **Display**: iframe embedded with YouTube URL

### Get Videos
- **Route**: `GET /api/videos`
- **Returns**: All published videos
- **Filtering**: Only shows published videos to students

---

## 3. Study Materials Management

### Upload Material (Admin)
- **Route**: `POST /api/materials`
- **Fields**:
  - Title, Description
  - File Name
  - GitHub URL (direct raw link)
  - File Type
- **Storage**: Link stored in Supabase
- **Access**: Click link to download from GitHub

### Material Access
- **Route**: `GET /api/materials`
- **Flow**:
  1. Student clicks material link
  2. Redirect to GitHub raw URL
  3. Browser downloads file

---

## 4. Quiz System

### Quiz Creation (Admin)
- **Route**: `POST /api/quizzes`
- **Structure**:
  ```
  Quiz
  ├── Questions (ordered)
  │   ├── Multiple Choice
  │   │   └── Options (with correct answer flag)
  │   ├── True/False
  │   └── Short Answer
  ```
- **Question Types**:
  - **Multiple Choice**: Select one correct option
  - **True/False**: Select true or false
  - **Short Answer**: Type text response (exact match)

### Quiz Submission (Student)
- **Route**: `POST /api/quizzes/:id/submit`
- **Flow**:
  1. Create quiz_attempts record
  2. For each student answer:
     - Compare with correct answer
     - Calculate marks
     - Store in student_responses
  3. Calculate total marks and percentage
  4. Update quiz_attempts with results
  5. Return results to student

### Auto-Grading Logic
```javascript
Multiple Choice:
  - Compare selected_option_id with is_correct flag
  - If match: marks obtained = question.marks
  
Short Answer/True-False:
  - Compare text_response (case-insensitive) with correct_answer
  - If match: marks obtained = question.marks
  
Final Score:
  - total_marks = sum of all question marks
  - percentage = (marks_obtained / total_marks) * 100
  - passed = percentage >= quiz.passing_score
```

---

## 5. Leaderboard System

### Leaderboard Calculation
- **Route**: `GET /api/leaderboard`
- **Algorithm**:
  1. Get all graded quiz_attempts
  2. Group by student
  3. Calculate for each student:
     - Total marks across all quizzes
     - Number of quizzes completed
     - Average percentage
  4. Sort by average_percentage (descending)
  5. Assign rank based on position

### Student Rank
- **Route**: `GET /api/leaderboard/student/:studentId`
- **Returns**: Individual student statistics and ranking

---

## 6. Subscription System

### Subscription Types
- **Free**: Access to all published content
- **Premium**: (Extensible) Features can be restricted by subscription type

### Current Implementation
- Subscriptions tracked in database
- Can be extended to limit features
- Payment integration ready for future

---

## 7. Database Features

### Cascading Deletes
- Deleting quiz deletes all questions
- Deleting questions deletes all options
- Deleting quiz attempts deletes all responses

### Indexes for Performance
- Email index for fast lookup
- Foreign key indexes for joins
- Leaderboard indexes for ranking queries

### Data Relationships
```
users
 ├── videos (1:M) - uploaded_by
 ├── study_materials (1:M) - uploaded_by
 ├── quizzes (1:M) - created_by
 ├── subscriptions (1:M)
 ├── quiz_attempts (1:M)
 └── leaderboard (1:M)

quizzes
 ├── quiz_questions (1:M)
 └── quiz_attempts (1:M)

quiz_questions
 ├── quiz_options (1:M)
 └── student_responses (1:M)

quiz_attempts
 └── student_responses (1:M)
```

---

## 8. Security Features

### Password Security
- Hashed with bcryptjs (10 rounds)
- Never stored as plain text
- Compared during login

### JWT Authentication
- Token-based stateless authentication
- Secret key never exposed to client
- 7-day expiration
- Used for protected routes

### Authorization
- Role-based access control (RBAC)
- Admin-only routes protected with `authorizeRole(['admin'])`
- Student-only routes protected with `authorizeRole(['student'])`

### Data Privacy
- Service role key used only server-side
- Anon key used only in frontend (limited permissions)
- SQL queries parameterized (via Supabase ORM)

---

## 9. Frontend Features

### State Management
- **AuthContext**: User authentication state
- React hooks for component state
- localStorage for persistence

### Routing
- Protected routes based on authentication
- Role-based route guards
- Automatic redirection based on user role

### API Communication
- Axios with interceptors
- Token auto-added to headers
- Centralized API service
- Error handling

---

## 10. Future Enhancement Ideas

### Payments
```javascript
// Add Stripe integration
POST /api/subscriptions/checkout
```

### Notifications
```javascript
// Real-time updates
WebSocket connections
Firebase Cloud Messaging
Email notifications
```

### Advanced Quizzes
```javascript
// Programming questions
// Essay questions with AI grading
// Code execution for practice
```

### Discussion Forums
```javascript
// Comments on materials
// Q&A sections
// Student collaboration
```

### Certificates
```javascript
// Generate PDF certificates
// Track completion
// Share certificates
```

---

## 11. Performance Optimizations

### Frontend
- Code splitting with React Router
- Lazy loading components
- CSS optimization
- Image compression

### Backend
- Database indexes
- Query optimization
- Caching strategies
- Connection pooling

### Database
- Materialized leaderboard views
- Indexed foreign keys
- Pagination for large result sets

---

## 12. Testing Scenarios

### Test Admin Features
1. Register as admin
2. Upload video
3. Upload material
4. Create quiz with 5 questions
5. Publish quiz

### Test Student Features
1. Register as student
2. View videos list
3. Download materials
4. Take quiz
5. Check results
6. View leaderboard

### Test Edge Cases
1. Attempt duplicate registration
2. Login with wrong password
3. Try to access admin routes as student
4. Submit quiz with unanswered questions
5. Check leaderboard with single student

---

For more details, refer to individual README files in each directory.
