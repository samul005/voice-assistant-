# Deploying Vyra Backend to Render (Free)

This guide will help you deploy the Python backend to Render for free hosting.

## Option 1: Deploy to Render (Recommended - Free)

### Step 1: Prepare Your Backend

1. The backend is already configured in `app.py`
2. Update `script.js` line 12 with your deployed URL after deployment

### Step 2: Create Render Account

1. Go to [Render.com](https://render.com/)
2. Sign up with GitHub (easiest option)

### Step 3: Deploy Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `samul005/voice-assistant-`
3. Configure the service:

   **Name**: `vyra-backend` (or your choice)
   
   **Region**: Choose closest to you
   
   **Branch**: `main`
   
   **Root Directory**: Leave blank (or `.` if needed)
   
   **Runtime**: `Python 3`
   
   **Build Command**: 
   ```
   pip install -r requirements.txt
   ```
   
   **Start Command**:
   ```
   python app.py
   ```
   
   **Instance Type**: `Free`

4. Add Environment Variables (Optional):
   - Key: `OPENROUTER_API_KEY`
   - Value: Your API key (or use the default in code)

5. Click **"Create Web Service"**

### Step 4: Wait for Deployment

- Render will build and deploy your app
- Takes 2-5 minutes
- You'll get a URL like: `https://vyra-backend.onrender.com`

### Step 5: Update Frontend

1. Open `script.js`
2. Find line 12:
   ```javascript
   const BACKEND_URL = 'https://voice-assistant-backend.onrender.com';
   ```
3. Replace with your actual Render URL:
   ```javascript
   const BACKEND_URL = 'https://vyra-backend.onrender.com';
   ```
4. Save and push to GitHub:
   ```powershell
   git add script.js
   git commit -m "Updated backend URL to Render deployment"
   git push
   ```

### Step 6: Test Your Deployment

1. Visit your GitHub Pages site: https://samul005.github.io/voice-assistant-/
2. Open Settings (gear icon)
3. Enable "AI Mode"
4. Backend status should show "Online (AI Enabled)"

## Option 2: Deploy to Railway (Alternative - Free)

### Step 1: Create Railway Account

1. Go to [Railway.app](https://railway.app/)
2. Sign up with GitHub

### Step 2: Deploy

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose `samul005/voice-assistant-`
4. Railway auto-detects Python
5. Add environment variables if needed
6. Click **"Deploy"**

### Step 3: Get URL

1. Go to Settings → Domains
2. Generate domain
3. Copy URL (e.g., `https://vyra-backend.up.railway.app`)

### Step 4: Update Frontend

Same as Render Step 5 above.

## Option 3: Deploy to PythonAnywhere (Alternative)

### Step 1: Create Account

1. Go to [PythonAnywhere.com](https://www.pythonanywhere.com/)
2. Sign up for free account

### Step 2: Upload Code

1. Open Bash console
2. Clone your repo:
   ```bash
   git clone https://github.com/samul005/voice-assistant-.git
   cd voice-assistant-
   pip install --user -r requirements.txt
   ```

### Step 3: Create Web App

1. Go to Web tab
2. Add new web app
3. Choose Flask
4. Set source code path
5. Configure WSGI file to point to app.py

### Step 4: Enable HTTPS and CORS

Update WSGI configuration and restart.

## Important Notes

### ⚠️ Free Tier Limitations:

**Render**:
- Spins down after 15 minutes of inactivity
- First request after sleeping takes 30-60 seconds
- 750 hours/month free

**Railway**:
- $5 free credit per month
- No auto-sleep

**PythonAnywhere**:
- Always on
- Limited CPU
- Good for basic usage

### 🔧 Troubleshooting

**Backend shows "Offline"**:
1. Check if Render service is running
2. Verify the URL in script.js matches your deployment
3. Check browser console for errors
4. Ensure CORS is enabled (already done in app.py)

**First request is slow**:
- This is normal for free tier (cold start)
- Subsequent requests will be fast

**AI responses not working**:
- Check Render logs for errors
- Verify API key is set
- Test backend directly: `https://your-url.onrender.com/api/health`

### 🎯 Testing Backend

Visit in browser:
```
https://your-backend-url.onrender.com/api/health
```

Should return:
```json
{
  "status": "healthy",
  "ai_enabled": true,
  "ai_model": "google/gemini-2.0-flash-exp:free",
  "timestamp": "2025-11-17T..."
}
```

## Security Best Practices

1. **Never commit .env file** (already in .gitignore)
2. **Use environment variables** for sensitive data
3. **Keep API keys secret**
4. **Enable HTTPS** (automatic on Render/Railway)

## Keeping Backend Alive

For Render free tier, you can use a service like:
- [UptimeRobot](https://uptimerobot.com/) - Ping your backend every 5 minutes
- [Cron-job.org](https://cron-job.org/) - Schedule health checks

This prevents the cold start delay.

## Alternative: Run Backend Locally

If you don't want to deploy:

1. Keep backend URL as `http://localhost:5000` in script.js
2. Run `python app.py` on your computer
3. Share your local site (won't work for others)

---

**Recommended**: Use Render - it's free, easy, and reliable!

After deployment, your Vyra assistant will have full AI capabilities available to everyone! 🚀
