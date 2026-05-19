# Development Guide

This guide provides best practices and workflow for developing the Student Learning Platform.

## Development Environment Setup

### Prerequisites
- Node.js 14+ with npm
- VS Code or preferred IDE
- Git
- Postman or similar API testing tool
- Supabase account for testing

### Initial Setup
```bash
# Clone repository
git clone https://github.com/your-org/SLP.git
cd SLP

# Setup backend
cd backend
npm install
cp .env.example .env
# Fill in .env with development credentials

# Setup frontend
cd ../frontend
npm install
cp .env.example .env
# Fill in .env with development API URL

# Start both services
# Terminal 1:
cd backend
npm run dev

# Terminal 2:
cd frontend
npm start
```

Backend will be at `http://localhost:5000`
Frontend will be at `http://localhost:3000`

---

## Project Structure Overview

```
SLP/
├── backend/
│   ├── routes/          # API endpoint definitions
│   ├── middleware/      # Auth, validation middleware
│   ├── utils/          # Helper functions and utilities
│   ├── index.js        # Express server entry
│   └── package.json
│
├── frontend/
│   ├── public/         # Static files
│   ├── src/
│   │   ├── pages/      # Full-page components
│   │   ├── components/ # Reusable components
│   │   ├── services/   # API calls (api.js, supabase.js)
│   │   ├── context/    # React Context
│   │   ├── styles/     # CSS files
│   │   ├── App.js      # Main app with routing
│   │   └── index.js    # React entry point
│   └── package.json
│
├── database/
│   └── schema.sql      # Database schema
│
├── README.md           # Main documentation
├── SETUP.md           # Quick setup guide
├── FEATURES.md        # Feature documentation
├── DEPLOYMENT.md      # Deployment guide
└── DEVELOPMENT.md     # This file
```

---

## Code Standards

### JavaScript/React Style Guide

#### Naming Conventions
```javascript
// Files
- ComponentName.js (PascalCase for components)
- utilityFunction.js (camelCase for utilities)
- CONSTANT_NAME.js (UPPER_SNAKE_CASE for constants)

// Variables
const userName = "John"; // camelCase
const MAX_ATTEMPTS = 5;  // UPPER_SNAKE_CASE

// Functions
const fetchUserData = () => {}; // camelCase
const handleSubmit = () => {};  // handleX for event handlers
const isValidEmail = () => {};  // isX, hasX for booleans
```

#### React Components
```javascript
// Functional components only (hooks-based)
const MyComponent = ({ prop1, prop2 }) => {
  const [state, setState] = useState('');
  
  const handleEvent = () => {
    // logic
  };
  
  return <div>{state}</div>;
};

export default MyComponent;
```

#### Imports Organization
```javascript
// 1. React and external libraries
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// 2. Internal components/services
import { someAPI } from '../services/api';
import MyComponent from '../components/MyComponent';

// 3. Styles (last)
import './styles.css';
```

### Backend Code Standards

#### Route Organization
```javascript
// routes/endpoint.js
const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// GET
router.get('/', async (req, res) => {
  // logic
});

// POST (protected)
router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  // logic
});

module.exports = router;
```

#### Error Handling
```javascript
try {
  // operation
  res.json({ success: true, data: result });
} catch (err) {
  console.error('Detailed error info:', err);
  res.status(500).json({ error: 'User-friendly message' });
}
```

---

## Git Workflow

### Branching Strategy
```bash
# Main branches
main/          - Production-ready code
develop/       - Development version

# Feature branches
feature/feature-name    - New features
bugfix/bug-name        - Bug fixes
hotfix/issue-name      - Production hotfixes
```

### Commit Messages
```
Format: <type>: <subject>

Types:
  feat:    New feature
  fix:     Bug fix
  refactor: Code refactoring
  style:   Code formatting
  docs:    Documentation
  test:    Tests
  chore:   Build/dependency changes

Examples:
  feat: Add quiz submission endpoint
  fix: Fix leaderboard calculation bug
  refactor: Simplify auth middleware
  docs: Update API documentation
```

### Workflow Example
```bash
# Update develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/add-quiz-timer

# Make changes
# ... edit files ...

# Commit changes
git add .
git commit -m "feat: Add timer functionality to quiz"

# Push branch
git push origin feature/add-quiz-timer

# Create Pull Request on GitHub
# After review and approval:
git checkout develop
git pull origin develop
git merge feature/add-quiz-timer
git push origin develop
```

---

## API Development

### Creating New Endpoints

1. **Create Route File**
```javascript
// backend/routes/newFeature.js
const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    // your logic
    res.json({ data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

2. **Import in index.js**
```javascript
const newFeatureRoutes = require('./routes/newFeature');
app.use('/api/newfeature', newFeatureRoutes);
```

3. **Add API Service in Frontend**
```javascript
// frontend/src/services/api.js
export const newFeatureAPI = {
  getItems: () => API.get('/newfeature'),
  createItem: (data) => API.post('/newfeature', data),
  updateItem: (id, data) => API.put(`/newfeature/${id}`, data),
};
```

### Testing Endpoints

Using Postman:
1. Set request type (GET, POST, etc.)
2. Enter URL: `http://localhost:5000/api/endpoint`
3. Add headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer <your_jwt_token>`
4. Add body (for POST/PUT)
5. Send request

---

## Frontend Development

### Creating New Pages

1. **Create Component**
```javascript
// frontend/src/pages/NewPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/NewPage.css';

const NewPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    // fetch data
  }, []);

  return <div className="container">{/* UI */}</div>;
};

export default NewPage;
```

2. **Create Styles**
```css
/* frontend/src/styles/NewPage.css */
.new-page-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
```

3. **Add Route**
```javascript
// frontend/src/App.js
<Route 
  path="/student/newpage" 
  element={<ProtectedRoute component={<NewPage />} requiredRole="student" />}
/>
```

4. **Add Navigation Link**
```javascript
// Update dashboard or navbar
<a href="/student/newpage">New Feature</a>
```

---

## Database Modifications

### Adding New Table

1. **Create migration**
```sql
-- Run in Supabase SQL Editor
CREATE TABLE new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_new_table_user ON new_table(user_id);
```

2. **Update schema.sql** with new table

3. **Update Supabase client** if special queries needed

### Query Examples

```sql
-- Standard CREATE
INSERT INTO table_name (col1, col2) VALUES ($1, $2);

-- READ with JOIN
SELECT u.full_name, t.data
FROM table_name t
JOIN users u ON t.user_id = u.id
WHERE t.user_id = $1;

-- UPDATE
UPDATE table_name SET data = $1 WHERE id = $2;

-- DELETE
DELETE FROM table_name WHERE id = $1;
```

---

## Testing

### Backend Testing with Postman

**Test Flow:**
1. Register user
2. Login (get token)
3. Use token in Protected endpoints
4. Test error cases

**Example:**
```
1. POST /api/auth/register
   Body: { email, password, full_name, role }

2. POST /api/auth/login
   Body: { email, password }
   Response: { token, user }

3. POST /api/quizzes
   Headers: Authorization: Bearer <token>
   Body: { title, questions, ... }
```

### Frontend Testing

Manual testing checklist:
- [ ] Register new account
- [ ] Login/logout flow
- [ ] Admin dashboard loads
- [ ] Student dashboard loads
- [ ] Upload video works
- [ ] Create quiz works
- [ ] Submit quiz works
- [ ] View leaderboard
- [ ] Responsive design (mobile, tablet, desktop)

### Automated Testing

```bash
# Backend tests (future)
npm test

# Frontend tests (future)
npm test
```

---

## Performance Tips

### Frontend
- Lazy load components with React.lazy()
- Memoize expensive components with React.memo()
- Use useCallback for event handlers
- Optimize images
- Avoid unnecessary re-renders

### Backend
- Add indexes on frequently queried columns
- Paginate large result sets
- Cache responses when appropriate
- Use connection pooling
- Monitor query performance

### Database
- Check for N+1 queries
- Add appropriate indexes
- Use joins efficiently
- Archive old data periodically

---

## Debugging

### Frontend
```javascript
// Console logging
console.log('data:', data);

// Conditional breakpoints
debugger; // Pauses if DevTools open

// React DevTools browser extension
// Redux DevTools (if using Redux)
```

### Backend
```javascript
// Console logs
console.log('Request:', req.body);
console.error('Error:', err);

// Use Postman to test endpoints directly
// Enable detailed logging in .env
```

### Database
```sql
-- Test queries in Supabase SQL Editor
SELECT * FROM tables WHERE condition;
```

---

## Common Development Tasks

### Add New Feature Checklist
- [ ] Create backend route
- [ ] Add authentication/authorization
- [ ] Add frontend API service
- [ ] Create frontend component/page
- [ ] Add styling
- [ ] Add to navigation
- [ ] Test functionality
- [ ] Test error cases
- [ ] Update documentation
- [ ] Commit and push code

### Update Dependencies
```bash
# Check outdated packages
npm outdated

# Update all packages
npm update

# Update specific package
npm install package@latest

# Check vulnerabilities
npm audit
npm audit fix
```

---

## Resources

- React Docs: https://react.dev
- Express Docs: https://expressjs.com
- Supabase Docs: https://supabase.com/docs
- Git Guide: https://www.git-scm.com/doc
- JavaScript Guide: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide

---

## Getting Help

- Check documentation in README files
- Review existing code for examples
- Check browser console for frontend errors
- Use Heroku logs for backend errors
- Search GitHub issues for solutions
- Ask team members or community

---

## Code Review Checklist

Before creating a Pull Request:
- [ ] Code follows style guide
- [ ] Tests pass
- [ ] No console errors/warnings
- [ ] Comments explain complex logic
- [ ] Commit messages are clear
- [ ] Documentation updated
- [ ] No hardcoded credentials
- [ ] Error handling implemented

---

**Happy coding! 🚀**
