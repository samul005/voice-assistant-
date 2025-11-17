# Deploying Vyra Web Assistant to GitHub Pages

This guide will help you deploy the Vyra Web Assistant to GitHub Pages.

## Prerequisites

- Git installed on your computer
- GitHub account
- Command line/terminal access

## Step-by-Step Deployment

### 1. Initialize Git Repository (If not already done)

Open PowerShell in your project folder and run:

```powershell
# Initialize git repository
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: Vyra Web Assistant"
```

### 2. Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click the **+** icon in the top right
3. Select **"New repository"**
4. Fill in the details:
   - **Repository name**: `vyra-web-assistant` (or your preferred name)
   - **Description**: "AI-powered voice assistant for the web"
   - **Public** (required for free GitHub Pages)
   - **Do NOT** initialize with README (we already have one)
5. Click **"Create repository"**

### 3. Connect Local Repository to GitHub

Copy the commands from GitHub (they look like this):

```powershell
# Add remote repository
git remote add origin https://github.com/YOUR-USERNAME/vyra-web-assistant.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Important**: Replace `YOUR-USERNAME` with your actual GitHub username!

### 4. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**, select:
   - **Branch**: `main`
   - **Folder**: `/ (root)`
5. Click **Save**

### 5. Wait for Deployment

- GitHub will build and deploy your site
- This usually takes 1-2 minutes
- You'll see a message: "Your site is published at https://YOUR-USERNAME.github.io/vyra-web-assistant/"

### 6. Access Your Live Website

Visit: `https://YOUR-USERNAME.github.io/vyra-web-assistant/`

## 🎉 You're Done!

Your Vyra Web Assistant is now live on the internet!

## Making Updates

When you make changes to your code:

```powershell
# Add changes
git add .

# Commit with a message
git commit -m "Updated feature X"

# Push to GitHub
git push
```

GitHub Pages will automatically redeploy your site (takes 1-2 minutes).

## Important Notes for GitHub Pages

### ✅ What Works on GitHub Pages:
- ✅ All frontend features (voice recognition, TTS, animations)
- ✅ Basic commands (time, date, jokes, web searches)
- ✅ Settings panel and UI features
- ✅ Chat history (stored locally in browser)

### ❌ What Doesn't Work on GitHub Pages:
- ❌ Python backend (GitHub Pages only serves static files)
- ❌ AI-powered responses via backend
- ❌ Server-side chat history

### To Use AI Features:

You have two options:

1. **Run locally**: Users can clone the repo and run the Python backend locally
2. **Deploy backend separately**: Deploy `app.py` to:
   - [Heroku](https://www.heroku.com/) (Free tier available)
   - [Railway](https://railway.app/) (Free tier available)
   - [Render](https://render.com/) (Free tier available)
   - [PythonAnywhere](https://www.pythonanywhere.com/) (Free tier available)

Then update the `BACKEND_URL` in `script.js` to point to your deployed backend.

## Custom Domain (Optional)

1. Buy a domain from a registrar (Namecheap, GoDaddy, etc.)
2. In GitHub repository Settings → Pages
3. Add your custom domain
4. Update your DNS settings with your domain registrar

## Troubleshooting

**Site not showing up:**
- Wait 2-5 minutes after enabling Pages
- Check Settings → Pages for deployment status
- Ensure repository is public

**404 Error:**
- Verify `index.html` is in the root folder
- Check the repository name matches the URL

**Microphone not working:**
- GitHub Pages uses HTTPS by default (required for microphone)
- Grant microphone permissions when prompted
- Use Chrome or Edge browser

## Files to Exclude from GitHub

Create a `.gitignore` file:

```
# Python
.venv/
__pycache__/
*.pyc
.env

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

## Need Help?

- Check [GitHub Pages Documentation](https://docs.github.com/en/pages)
- Open an issue in the repository
- Check if the site is live: `https://YOUR-USERNAME.github.io/vyra-web-assistant/`

---

Happy Deploying! 🚀
