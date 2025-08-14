# 🚀 GitHub Pages Deployment Guide

This guide will help you deploy your portfolio website to GitHub Pages.

## 📋 Prerequisites

- GitHub account
- Git installed on your computer
- Node.js and npm installed

## 🔧 Step-by-Step Deployment

### 1. Create GitHub Repository

1. **Go to GitHub** and create a new repository
2. **Name it** `portfolio` (or your preferred name)
3. **Make it public** (required for free GitHub Pages)
4. **Don't initialize** with README, .gitignore, or license

### 2. Initialize Local Repository

```bash
# Navigate to your portfolio directory
cd /path/to/your/portfolio

# Initialize git repository
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial portfolio setup"

# Add remote repository (replace with your GitHub username)
git remote add origin https://github.com/yourusername/portfolio.git

# Push to GitHub
git push -u origin main
```

### 3. Enable GitHub Pages

1. **Go to your repository** on GitHub
2. **Navigate to Settings** → **Pages**
3. **Configure source:**
   - **Source**: "Deploy from a branch"
   - **Branch**: "gh-pages" (will be created automatically)
   - **Folder**: "/ (root)"
4. **Click Save**

### 4. Configure GitHub Actions (Automatic Deployment)

The repository includes a GitHub Actions workflow that will automatically deploy your site when you push to the main branch.

1. **Push your code** to trigger the first deployment:
   ```bash
   git push origin main
   ```

2. **Check deployment status:**
   - Go to your repository on GitHub
   - Click on **Actions** tab
   - Monitor the deployment progress

3. **Your site will be available at:**
   ```
   https://yourusername.github.io/portfolio
   ```

## 🔐 Firebase Configuration

### 1. Set Up Firebase Project

1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. **Create a new project** or use existing one
3. **Enable Firestore Database**
4. **Enable Authentication** (Email/Password)
5. **Get your Firebase config**

### 2. Update Firebase Config

1. **Open** `config/firebase-config.js`
2. **Replace** the config object with your Firebase project details:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 3. Set Up Admin User

1. **Go to Firebase Console** → **Authentication**
2. **Add user** with email and password
3. **Use these credentials** to log into your admin panel

## 🌐 Custom Domain (Optional)

### 1. Buy a Domain
Purchase a domain from providers like:
- Namecheap
- GoDaddy
- Google Domains
- Cloudflare

### 2. Configure DNS
Add a CNAME record pointing to `yourusername.github.io`

### 3. Update GitHub Settings
1. **Go to repository Settings** → **Pages**
2. **Add custom domain** in the Custom domain field
3. **Check "Enforce HTTPS"**

### 4. Update GitHub Actions
Add your custom domain as a secret:
1. **Go to Settings** → **Secrets and variables** → **Actions**
2. **Add secret** named `CUSTOM_DOMAIN`
3. **Value**: your custom domain (e.g., `portfolio.yourname.com`)

## 🔧 Image Proxy Server Deployment

Since GitHub Pages only serves static files, you'll need to deploy the image proxy server separately.

### Option 1: Railway (Recommended)

1. **Go to [Railway](https://railway.app/)**
2. **Connect your GitHub account**
3. **Deploy from GitHub** (select your portfolio repository)
4. **Set environment variables:**
   - `PORT`: 3000
5. **Get your deployment URL** (e.g., `https://your-app.railway.app`)

### Option 2: Render

1. **Go to [Render](https://render.com/)**
2. **Create new Web Service**
3. **Connect your GitHub repository**
4. **Configure:**
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. **Deploy**

### Option 3: Heroku

1. **Install Heroku CLI**
2. **Login to Heroku**
3. **Create app:**
   ```bash
   heroku create your-portfolio-proxy
   ```
4. **Deploy:**
   ```bash
   git push heroku main
   ```

### Update Proxy URL

After deploying the proxy server, update the URL in `assets/js/image-cache.js`:

```javascript
// Change from localhost to your deployed server URL
const proxyUrl = `https://your-proxy-server.com/proxy/image?url=${encodeURIComponent(url)}`;
```

## 📝 Content Management

### 1. Access Admin Panel
Navigate to: `https://yourusername.github.io/portfolio/pages/admin.html`

### 2. Login
Use the Firebase credentials you set up earlier

### 3. Update Content
- **Portfolio Information**: Name, title, about text
- **Projects**: Add/edit projects with screenshots
- **Contact Information**: Email, phone, social links
- **Resume**: Upload and manage resume file

## 🔍 Troubleshooting

### Common Issues

1. **Site not loading:**
   - Check GitHub Actions for deployment errors
   - Verify branch name is `main` or `master`
   - Wait 5-10 minutes for first deployment

2. **Images not loading:**
   - Ensure proxy server is deployed and running
   - Check proxy URL in `image-cache.js`
   - Verify Firebase configuration

3. **Admin panel not working:**
   - Check Firebase Authentication is enabled
   - Verify user exists in Firebase Console
   - Check browser console for errors

4. **Rate limiting errors:**
   - Deploy the proxy server
   - Update proxy URL in frontend
   - Clear image cache from admin panel

### Debug Commands

```bash
# Check if proxy server is running
curl https://your-proxy-server.com/health

# Test image proxy
curl "https://your-proxy-server.com/proxy/image?url=https://play-lh.googleusercontent.com/example.jpg"

# View cache stats
curl https://your-proxy-server.com/cache/stats
```

## 🔄 Updating Your Site

### Automatic Updates
Every time you push to the `main` branch, your site will automatically update:

```bash
git add .
git commit -m "Update portfolio content"
git push origin main
```

### Manual Updates
If you need to force a rebuild:

1. **Go to GitHub repository**
2. **Navigate to Actions**
3. **Click "Run workflow"**
4. **Select "Deploy Portfolio to GitHub Pages"**

## 📊 Monitoring

### GitHub Actions
- **Monitor deployments** in the Actions tab
- **Check for errors** in workflow logs
- **View deployment history**

### Firebase Console
- **Monitor Firestore** usage and errors
- **Check Authentication** logs
- **View real-time data**

### Custom Analytics
Add Google Analytics or other tracking:

1. **Get tracking code** from Google Analytics
2. **Add to** `<head>` section of `index.html`
3. **Deploy** to see analytics

## 🎉 Success!

Your portfolio is now live at:
```
https://yourusername.github.io/portfolio
```

### Next Steps

1. **Customize content** through the admin panel
2. **Add your projects** with screenshots
3. **Update contact information**
4. **Share your portfolio** with potential employers
5. **Monitor performance** and analytics

---

**Need help?** Check the [main README](../README.md) for more detailed information.
