# Deployment Guide

This guide covers deploying the Student Learning Platform to various platforms.

## Prerequisites

- GitHub account (for version control)
- Supabase account (database)
- Hosting account (Vercel, Heroku, AWS, etc.)

---

## Quick Deployment Checklist

- [ ] Create and test all .env files locally
- [ ] Push code to GitHub
- [ ] Set up Supabase project
- [ ] Configure environment variables on hosting platform
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Test API connectivity
- [ ] Update frontend API URL if needed
- [ ] Verify database connections
- [ ] Test core features

---

## 1. Vercel (Recommended for Frontend)

### Step 1: Prepare Code
```bash
cd frontend
npm run build
# Test production build locally
npm install -g serve
serve -s build
```

### Step 2: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 3: Connect to Vercel
1. Go to https://vercel.com
2. Click "Import Project"
3. Select your GitHub repository
4. Configure:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`

### Step 4: Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
```
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

### Step 5: Deploy
- Click "Deploy"
- Wait for deployment to complete
- Frontend URL will be provided

---

## 2. Heroku (Backend)

### Prerequisites
```bash
npm install -g heroku
heroku login
```

### Step 1: Create Heroku App
```bash
cd backend
heroku create your-app-name
```

### Step 2: Set Environment Variables
```bash
heroku config:set PORT=5000
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_ANON_KEY=your_key
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_key
heroku config:set JWT_SECRET=your_secret
heroku config:set NODE_ENV=production
```

### Step 3: Deploy
```bash
git push heroku main
```

### Step 4: View Logs
```bash
heroku logs --tail
```

### Step 5: Update Frontend
Update `REACT_APP_API_URL` to point to your Heroku app:
```
https://your-app-name.herokuapp.com/api
```

---

## 3. AWS (Full Stack)

### Frontend Deployment (S3 + CloudFront)

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Create S3 Bucket**
   - S3 → Create bucket (not public)
   - Upload build/ contents

3. **Setup CloudFront**
   - Point to S3 bucket
   - Set default index.html

4. **Get CloudFront URL**
   - Use as frontend domain

### Backend Deployment (EC2 or Beanstalk)

1. **Create EC2 Instance**
   - Ubuntu 20.04 LTS
   - t2.micro (free tier)

2. **Setup Server**
   ```bash
   sudo apt update
   sudo apt install nodejs npm
   git clone your-repo
   cd backend
   npm install
   ```

3. **Create .env File**
   ```bash
   nano .env
   # Add all credentials
   ```

4. **Start Server**
   ```bash
   npm start
   # Or use PM2 for production
   npm install -g pm2
   pm2 start index.js --name "slp-api"
   ```

5. **Setup Security Group**
   - Allow port 5000 for backend
   - Allow port 443 for HTTPS

6. **Get Public IP**
   - Use as backend URL

---

## 4. Docker Deployment

### Create Dockerfile for Backend
```dockerfile
FROM node:16
WORKDIR /app
COPY . .
RUN npm install
ENV NODE_ENV=production
EXPOSE 5000
CMD ["npm", "start"]
```

### Create Dockerfile for Frontend
```dockerfile
FROM node:16 as build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - JWT_SECRET=${JWT_SECRET}

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      - REACT_APP_API_URL=http://localhost:5000/api
```

### Run with Docker Compose
```bash
docker-compose up -d
```

---

## 5. Digital Ocean (Alternative)

### 1. Create Droplet
- Ubuntu 20.04
- 1GB RAM (basic)
- $4-5/month

### 2. SSH into Server
```bash
ssh root@your_ip
```

### 3. Install Dependencies
```bash
apt update && apt upgrade
apt install nodejs npm git
```

### 4. Clone and Deploy Backend
```bash
git clone your-repo
cd SLP/backend
npm install
npm start
```

### 5. Deploy Frontend with Nginx
```bash
apt install nginx
cd ../frontend
npm run build
cp -r build/* /var/www/html/
systemctl restart nginx
```

---

## 6. Environment Variables Reference

### Backend Production
```
PORT=5000
NODE_ENV=production
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyXXX...
SUPABASE_SERVICE_ROLE_KEY=eyXXX...
JWT_SECRET=your_strong_secret_here_min_16_chars
```

### Frontend Production
```
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyXXX...
```

---

## 7. Custom Domain Setup

### Using Vercel (Frontend)
1. Get domain from Namecheap, GoDaddy, etc.
2. In Vercel Settings → Domains
3. Add your domain
4. Update DNS records (Vercel provides instructions)

### Using Heroku (Backend)
1. Add domain in Heroku Settings
2. Update DNS with Heroku DNS target

---

## 8. SSL/HTTPS Setup

### Automatic (Vercel)
- Vercel provides free SSL certificates

### Using Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com
```

---

## 9. CI/CD Pipeline Example (GitHub Actions)

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy Backend
        run: |
          git push heroku main
        env:
          HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
      
      - name: Build Frontend
        run: |
          cd frontend
          npm install
          npm run build
      
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

---

## 10. Post-Deployment Checklist

- [ ] Test backend health endpoint
- [ ] Test frontend loads
- [ ] Test user registration
- [ ] Test user login
- [ ] Test admin features
- [ ] Test student features
- [ ] Test quiz system
- [ ] Verify database connection
- [ ] Check SSL certificate
- [ ] Setup monitoring/alerts
- [ ] Setup backups
- [ ] Document deployment process

---

## 11. Monitoring & Maintenance

### Application Monitoring
```bash
# Check logs
heroku logs -t

# Monitor performance
# - New Relic
# - Datadog
# - Scout
```

### Database Backups
- Supabase: Automatic daily backups
- Enable point-in-time recovery

### Updates
```bash
# Keep dependencies updated
npm outdated
npm update
```

---

## 12. Troubleshooting Deployment

### Error: "Cannot find module"
```bash
# Rebuild node_modules
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port already in use"
```bash
# Change PORT environment variable
export PORT=5000
```

### Error: "Database connection failed"
- Verify .env credentials
- Check Supabase IP whitelist
- Verify schema exists

### Error: "CORS issues after deployment"
- Update REACT_APP_API_URL
- Verify backend CORS configuration
- Check if backend is accessible

---

For more help, refer to specific platform documentation:
- https://vercel.com/docs
- https://devcenter.heroku.com/
- https://docs.aws.amazon.com/
- https://docs.digitalocean.com/
