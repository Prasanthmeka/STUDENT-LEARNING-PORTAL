# Database Schema Documentation

This file contains the SQL schema for the Student Learning Platform (SLP) database using Supabase (PostgreSQL).

## Tables Overview

### 1. **users**
Stores user information for both admins and students.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'student')),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id` - Unique user identifier
- `email` - User email (unique)
- `password_hash` - Hashed password
- `full_name` - User's full name
- `role` - User role (admin or student)
- `avatar_url` - Profile picture URL
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

---

### 2. **subscriptions**
Manages student subscription types and status.

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_type VARCHAR(50) NOT NULL CHECK (subscription_type IN ('free', 'premium')),
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id` - Subscription identifier
- `student_id` - Foreign key to users table
- `subscription_type` - free or premium
- `start_date` - Subscription start date
- `end_date` - Subscription expiry date
- `is_active` - Active status
- `created_at` - Creation timestamp

---

### 3. **videos**
Stores information about uploaded or linked videos.

```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_type VARCHAR(50) NOT NULL CHECK (video_type IN ('recorded', 'live')),
  youtube_url VARCHAR(500),
  live_stream_url VARCHAR(500),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  thumbnail_url TEXT,
  course_id UUID,
  duration_minutes INT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id` - Video identifier
- `title` - Video title
- `description` - Video description
- `video_type` - recorded or live
- `youtube_url` - YouTube video link
- `live_stream_url` - Live streaming URL
- `uploaded_by` - Admin who uploaded the video
- `thumbnail_url` - Video thumbnail
- `course_id` - Associated course (if any)
- `duration_minutes` - Video length
- `is_published` - Visibility status

---

### 4. **study_materials**
Stores study material references from GitHub.

```sql
CREATE TABLE study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_name VARCHAR(255) NOT NULL,
  github_url VARCHAR(500) NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  course_id UUID,
  file_type VARCHAR(50),
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id` - Material identifier
- `title` - Material title
- `description` - Material description
- `file_name` - Original file name
- `github_url` - Direct GitHub link for download
- `uploaded_by` - Admin who uploaded
- `course_id` - Associated course
- `file_type` - PDF, DOC, etc.
- `is_published` - Visibility status

---

### 5. **quizzes**
Stores quiz information and metadata.

```sql
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  course_id UUID,
  total_questions INT,
  passing_score INT DEFAULT 50,
  time_limit_minutes INT,
  source_document_url VARCHAR(500),
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id` - Quiz identifier
- `title` - Quiz title
- `description` - Quiz description
- `created_by` - Admin who created the quiz
- `course_id` - Associated course
- `total_questions` - Number of questions
- `passing_score` - Minimum passing percentage
- `time_limit_minutes` - Time limit for quiz
- `source_document_url` - Original document URL
- `is_published` - Visibility status

---

### 6. **quiz_questions**
Stores individual quiz questions.

```sql
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) DEFAULT 'multiple_choice',
  marks INT DEFAULT 1,
  correct_answer TEXT,
  order_number INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id` - Question identifier
- `quiz_id` - Parent quiz
- `question_text` - The question
- `question_type` - multiple_choice, short_answer, true_false
- `marks` - Marks for this question
- `correct_answer` - Correct answer (for matching)
- `order_number` - Question order in quiz

---

### 7. **quiz_options**
Stores answer options for multiple choice questions.

```sql
CREATE TABLE quiz_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  order_number INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id` - Option identifier
- `question_id` - Parent question
- `option_text` - The option text
- `is_correct` - Whether this is the correct answer
- `order_number` - Option display order

---

### 8. **quiz_attempts**
Records each student's quiz attempt.

```sql
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  quiz_id UUID NOT NULL REFERENCES quizzes(id),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP,
  total_marks INT,
  marks_obtained INT,
  percentage DECIMAL(5, 2),
  is_passed BOOLEAN,
  status VARCHAR(50) DEFAULT 'in_progress',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id` - Attempt identifier
- `student_id` - Student taking the quiz
- `quiz_id` - Quiz being taken
- `started_at` - When the attempt started
- `submitted_at` - When the quiz was submitted
- `total_marks` - Total marks for the quiz
- `marks_obtained` - Marks earned by student
- `percentage` - Percentage score
- `is_passed` - Whether student passed
- `status` - in_progress, submitted, graded

---

### 9. **student_responses**
Stores individual student answers to questions.

```sql
CREATE TABLE student_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id),
  selected_option_id UUID REFERENCES quiz_options(id),
  text_response TEXT,
  is_correct BOOLEAN,
  marks_obtained INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id` - Response identifier
- `quiz_attempt_id` - Associated quiz attempt
- `question_id` - The question answered
- `selected_option_id` - Selected multiple choice option
- `text_response` - Text response (for short answers)
- `is_correct` - Whether answer was correct
- `marks_obtained` - Marks for this answer

---

### 10. **leaderboard**
Materialized leaderboard data for performance.

```sql
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  total_marks INT DEFAULT 0,
  quizzes_completed INT DEFAULT 0,
  average_percentage DECIMAL(5, 2) DEFAULT 0,
  rank INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id` - Leaderboard entry identifier
- `student_id` - Student reference
- `total_marks` - Total marks across all quizzes
- `quizzes_completed` - Number of completed quizzes
- `average_percentage` - Average percentage score
- `rank` - Current leaderboard rank
- `updated_at` - Last calculation time

---

## Indexes

Indexes are created for frequently queried columns:

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_subscriptions_student ON subscriptions(student_id);
CREATE INDEX idx_videos_course ON videos(course_id);
CREATE INDEX idx_materials_course ON study_materials(course_id);
CREATE INDEX idx_quizzes_course ON quizzes(course_id);
CREATE INDEX idx_quiz_questions_quiz ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_options_question ON quiz_options(question_id);
CREATE INDEX idx_responses_attempt ON student_responses(quiz_attempt_id);
CREATE INDEX idx_attempts_student ON quiz_attempts(student_id);
CREATE INDEX idx_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX idx_leaderboard_student ON leaderboard(student_id);
CREATE INDEX idx_leaderboard_rank ON leaderboard(rank);
```

---

## Relationships

```
users (1) ──┬──(Many) videos
            ├──(Many) study_materials
            ├──(Many) quizzes
            └──(Many) subscriptions

quizzes (1)──(Many) quiz_questions
quiz_questions (1)──(Many) quiz_options
quiz_questions (1)──(Many) student_responses

quiz_attempts (1)──(Many) student_responses
users (1)──(Many) quiz_attempts
quizzes (1)──(Many) quiz_attempts

users (1)──(Many) leaderboard
```

---

## Setup Instructions

1. Create a Supabase project at https://supabase.com
2. Go to SQL Editor
3. Copy and paste the entire schema.sql content
4. Run the SQL
5. Enable Row Level Security (RLS) for production

## Backup & Recovery

Regular backups are recommended. Use Supabase's built-in backup features.

## Future Enhancements

- Course management table
- Discussion/comments table
- Certificates table
- Payment transaction tracking
- API key management for integrations
