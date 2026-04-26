# Deployment Guide: Backend (Render) + Frontend (Vercel)

This guide will help you deploy your UniEvents application to production.

## Prerequisites

- GitHub account with your code pushed to a repository
- MongoDB Atlas account (free tier available)
- Cloudinary account (free tier available)
- Render account (free tier available for backend)
- Vercel account (free tier available for frontend)

---

## Step 1: Prepare MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. In Database Access, create a database user with username and password
4. In Network Access, allow access from anywhere (0.0.0.0/0) or add Vercel/Render IPs
5. Click "Connect" → "Connect your application"
6. Copy the connection string (format: `mongodb+srv://<username>:<password>@cluster.mongodb.net/uni_events`)
7. **Save this string** - you'll need it for environment variables

---

## Step 2: Prepare Cloudinary

1. Go to [Cloudinary](https://cloudinary.com)
2. Create a free account
3. Go to Dashboard → Account Details
4. Note down:
   - Cloud name
   - API Key
   - API Secret
5. **Save these values** - you'll need them for environment variables

---

## Step 3: Set up Email (Optional)

For email notifications, you can use:
- **Gmail** with App Password (recommended for testing)
- **SendGrid** (recommended for production)
- Any other SMTP service

**For Gmail with App Password:**
1. Enable 2-factor authentication on your Google account
2. Go to Google Account → Security → App Passwords
3. Generate a new app password for "Mail"
4. Use:
   - SMTP_HOST: `smtp.gmail.com`
   - SMTP_PORT: `587`
   - SMTP_USER: your@gmail.com
   - SMTP_PASS: the app password (16 characters)

---

## Step 4: Push Code to GitHub

1. Initialize git (if not already):
```bash
cd c:\uni info
git init
git add .
git commit -m "Initial commit"
```

2. Create a new repository on GitHub
3. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/uni-events.git
git branch -M main
git push -u origin main
```

---

## Step 5: Deploy Backend to Render

### 5.1 Create `render.yaml` in Backend Root

Create a new file `c:\uni info\backend\render.yaml`:

```yaml
services:
  - type: web
    name: unievents-backend
    env: node
    region: oregon
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
      - key: MONGO_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: JWT_EXPIRE
        value: 7d
      - key: ALLOWED_EMAIL_DOMAIN
        value: jainuniversity.ac.in
      - key: CLOUDINARY_CLOUD_NAME
        sync: false
      - key: CLOUDINARY_API_KEY
        sync: false
      - key: CLOUDINARY_API_SECRET
        sync: false
      - key: SMTP_HOST
        sync: false
      - key: SMTP_PORT
        value: 587
      - key: SMTP_USER
        sync: false
      - key: SMTP_PASS
        sync: false
      - key: FROM_EMAIL
        sync: false
      - key: FROM_NAME
        value: UniEvents
      - key: CLIENT_URL
        sync: false
```

### 5.2 Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "New Web Service"
3. Connect your GitHub repository
4. Select only the `backend` folder (or configure root directory)
5. **Build & Deploy Settings:**
   - Root Directory: `backend` (if monorepo) or leave empty if backend-only repo
   - Build Command: `npm install`
   - Start Command: `npm start`
6. **Environment Variables** (add these manually):
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/uni_events
   JWT_SECRET=your_super_secret_jwt_key_here_change_this
   JWT_EXPIRE=7d
   ALLOWED_EMAIL_DOMAIN=jainuniversity.ac.in
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   FROM_EMAIL=no-reply@jainuniversity.ac.in
   FROM_NAME=UniEvents
   CLIENT_URL=https://your-frontend.vercel.app
   ```
7. Click "Deploy Web Service"
8. Wait for deployment (2-5 minutes)
9. **Copy the backend URL** (e.g., `https://unievents-backend.onrender.com`)

---

## Step 6: Deploy Frontend to Vercel

### 6.1 Update Frontend Environment Variables

The frontend will use Vercel environment variables. No `.env.local` file needed in production.

### 6.2 Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. **Configure Project:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend` (if monorepo) or leave empty if frontend-only repo
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
5. **Environment Variables** (add these):
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
   ```
   - Replace `your-backend-url.onrender.com` with your actual Render backend URL
6. Click "Deploy"
7. Wait for deployment (1-3 minutes)
8. **Copy the frontend URL** (e.g., `https://unievents.vercel.app`)

---

## Step 7: Update CORS and Client URL

### 7.1 Update Backend CORS

Go to your Render dashboard → Edit the backend service → Environment Variables:

Update `CLIENT_URL` to your actual Vercel URL:
```
CLIENT_URL=https://your-frontend.vercel.app
```

Also add the URL to the CORS origin list in `backend/server.js` if needed (currently it reads from env).

### 7.2 Redeploy Backend

After updating environment variables, trigger a manual redeploy in Render:
- Go to your backend service
- Click "Manual Deploy" → "Clear build cache & deploy"

---

## Step 8: Test the Deployment

1. Visit your frontend URL: `https://your-frontend.vercel.app`
2. Try to register a new user with `@jainuniversity.ac.in` email
3. Try logging in
4. Check browser console for any errors
5. Check Render logs for backend errors
6. Test creating an event (if you have admin access)

---

## Step 9: Set Up Superior Admin

Since the superior admin is hardcoded to `premvellogi@gmail.com`, you need to:

1. Register/login with `premvellogi@gmail.com`
2. The backend will auto-assign `superior_admin` role (see `auth.controller.js` line 60-63)
3. Use this account to create secondary admins and manage events

---

## Important Notes

### MongoDB Connection Issues
If you face MongoDB connection issues on Render:
- Ensure IP whitelist allows all IPs (0.0.0.0/0)
- Check if your cluster is in the same region as Render (Oregon recommended)
- Use `mongodb+srv://` connection string

### Email Issues
- Gmail may block emails from new deployments
- Consider using SendGrid for production reliability
- You can skip email config initially - the app will work without it

### Cloudinary Issues
- Ensure your Cloudinary account allows uploads from your domain
- Check if upload folder 'uni-events' exists in Cloudinary

### Free Tier Limitations
- **Render Free Tier:** Spins down after 15 min of inactivity (cold start ~30s)
- **Vercel Free Tier:** No spin-down, but 100GB bandwidth/month
- **MongoDB Atlas Free Tier:** 512MB storage

### Monitoring
- **Render Logs:** Available in dashboard for backend
- **Vercel Logs:** Available in dashboard for frontend
- **MongoDB Atlas:** Check metrics in Atlas dashboard

---

## Troubleshooting

### Backend Returns 503 or 502
- Check Render logs
- Ensure MongoDB connection string is correct
- Verify all environment variables are set

### Frontend Can't Connect to Backend
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend CORS settings
- Ensure backend is deployed and running

### Images Not Uploading
- Verify Cloudinary credentials
- Check if multer is configured correctly
- Ensure folder 'uni-events' exists in Cloudinary

### Email Not Sending
- Verify SMTP credentials
- Check if app password is correct (for Gmail)
- Try SendGrid as alternative

---

## Post-Deployment Checklist

- [ ] Backend deployed to Render and accessible
- [ ] Frontend deployed to Vercel and accessible
- [ ] User registration works
- [ ] User login works
- [ ] Admin can create events
- [ ] Event images upload to Cloudinary
- [ ] Email notifications work (optional)
- [ ] CORS properly configured
- [ ] MongoDB connected
- [ ] All environment variables set

---

## Custom Domain (Optional)

### For Vercel (Frontend)
1. Go to project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed by Vercel

### For Render (Backend)
1. Go to service Settings → Custom Domains
2. Add your custom domain
3. Update DNS records as instructed by Render
4. Update `CLIENT_URL` in backend env vars

---

## Cost Summary (Free Tier)

- **Render:** $0/month (free tier)
- **Vercel:** $0/month (free tier)
- **MongoDB Atlas:** $0/month (free tier)
- **Cloudinary:** $0/month (free tier)
- **SendGrid:** $0/month (free tier, 100 emails/day)

**Total: $0/month for basic usage**
