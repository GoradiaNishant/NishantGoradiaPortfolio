# Portfolio Website

A dynamic, customizable portfolio website for mobile developers with Firebase integration and image proxy server.

## 🚀 Live Demo

Visit: [Your Portfolio](https://yourusername.github.io/portfolio)

## 📋 Features

- **Dynamic Content Management** - Admin panel for easy content updates
- **Firebase Integration** - Real-time data persistence
- **Image Proxy Server** - Prevents Google CDN rate limiting
- **Responsive Design** - Works on all devices
- **Project Showcase** - Detailed project pages with screenshots
- **Contact Integration** - Direct contact links
- **Resume Download** - PDF resume generation

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Deployment**: GitHub Pages, Firebase Hosting

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- GitHub account

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/portfolio.git
cd portfolio
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Enable Authentication (Email/Password)
4. Copy your Firebase config to `config/firebase-config.js`

### 4. Start Development Server
```bash
# Start the image proxy server
npm start

# For development with auto-restart
npm run dev
```

## 🌐 GitHub Pages Deployment

### Method 1: Automatic Deployment (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial portfolio setup"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Select **Source**: "Deploy from a branch"
   - Select **Branch**: "gh-pages" (will be created automatically)
   - Click **Save**

3. **Configure Secrets (Optional):**
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Add these secrets if you want custom domain or Firebase deployment:
     - `CUSTOM_DOMAIN`: Your custom domain (optional)
     - `FIREBASE_TOKEN`: Firebase CI token
     - `FIREBASE_PROJECT_ID`: Your Firebase project ID

4. **Automatic Deployment:**
   - Every push to `main` branch will automatically deploy to GitHub Pages
   - Your site will be available at: `https://yourusername.github.io/portfolio`

### Method 2: Manual Deployment

1. **Build and Deploy:**
   ```bash
   # Install GitHub Pages deployment tool
   npm install -g gh-pages

   # Deploy to GitHub Pages
   gh-pages -d . -t true
   ```

2. **Enable GitHub Pages** (same as Method 1, step 2)

## 🔧 Configuration

### Firebase Configuration
Update `config/firebase-config.js` with your Firebase project details:

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

### Image Proxy Server
The proxy server runs on port 3000 by default. For production:

1. **Deploy to a cloud service** (Heroku, Vercel, Railway, etc.)
2. **Update the proxy URL** in `assets/js/image-cache.js`:

```javascript
// Change from localhost to your deployed server URL
const proxyUrl = `https://your-proxy-server.com/proxy/image?url=${encodeURIComponent(url)}`;
```

## 📁 Project Structure

```
portfolio/
├── assets/
│   ├── css/
│   │   ├── main.css
│   │   ├── admin.css
│   │   └── project-detail.css
│   ├── js/
│   │   ├── main.js
│   │   └── image-cache.js
│   └── images/
├── config/
│   └── firebase-config.js
├── pages/
│   ├── admin.html
│   └── project-detail.html
├── cache/
│   └── images/
├── server.js
├── package.json
├── firebase.json
└── README.md
```

## 🔐 Admin Access

1. **Access Admin Panel:**
   - Navigate to: `https://yourusername.github.io/portfolio/pages/admin.html`
   - Or locally: `http://localhost:3000/pages/admin.html`

2. **Login:**
   - Use the email/password you set up in Firebase Authentication
   - Or create a new user in Firebase Console

3. **Manage Content:**
   - Update portfolio information
   - Add/edit projects
   - Manage images and screenshots
   - Monitor cache statistics

## 🚀 Production Deployment

### Option 1: GitHub Pages (Static Files Only)
- ✅ Free hosting
- ✅ Automatic deployment
- ❌ No server-side features (image proxy won't work)

### Option 2: Firebase Hosting + Cloud Functions
1. **Deploy static files:**
   ```bash
   npm run deploy:firebase
   ```

2. **Deploy proxy server as Cloud Function:**
   - Convert `server.js` to Firebase Cloud Function
   - Update proxy URLs in frontend

### Option 3: Vercel/Netlify + Separate Backend
1. **Deploy frontend to Vercel/Netlify**
2. **Deploy proxy server to Railway/Render/Heroku**
3. **Update proxy URLs**

## 🔍 Troubleshooting

### Common Issues

1. **Images not loading:**
   - Check if proxy server is running
   - Verify Firebase configuration
   - Check browser console for errors

2. **Admin panel not working:**
   - Ensure Firebase Authentication is enabled
   - Check Firebase config in `config/firebase-config.js`
   - Verify user exists in Firebase Console

3. **GitHub Pages not updating:**
   - Check GitHub Actions tab for deployment status
   - Verify branch name (main/master)
   - Clear browser cache

4. **Rate limiting errors:**
   - Start the proxy server: `npm start`
   - Check proxy server logs
   - Clear image cache from admin panel

### Debug Commands

```bash
# Check server status
curl http://localhost:3000/health

# View cache stats
curl http://localhost:3000/cache/stats

# Clear cache
curl -X DELETE http://localhost:3000/cache/clear

# Test proxy
curl "http://localhost:3000/proxy/image?url=https://play-lh.googleusercontent.com/example.jpg"
```

## 📝 Customization

### Styling
- Edit `assets/css/main.css` for general styles
- Modify Tailwind classes in HTML files
- Update color scheme in CSS variables

### Content
- Use admin panel for dynamic content
- Edit HTML files for static content
- Update Firebase data structure as needed

### Features
- Add new sections in `index.html`
- Create new pages in `pages/` directory
- Extend Firebase functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Firebase for backend services
- Tailwind CSS for styling
- GitHub for hosting
- Express.js for proxy server

## 📞 Support

If you encounter any issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review Firebase Console for errors
3. Check browser console for JavaScript errors
4. Create an issue on GitHub

---

**Happy coding! 🚀**
