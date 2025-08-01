# 🔐 Firebase Authentication Setup Guide

## Step 1: Enable Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `portfolio-8cbf9`
3. Go to **Authentication** → **Sign-in method**
4. Click **"Email/Password"**
5. **Enable** Email/Password authentication
6. Click **"Save"**

## Step 2: Create Admin User

1. In Firebase Console, go to **Authentication** → **Users**
2. Click **"Add user"**
3. Enter your admin email and password:
   - **Email**: `admin@yourdomain.com` (replace with your email)
   - **Password**: `YourSecurePassword123!` (use a strong password)
4. Click **"Add user"**

## Step 3: Update Firestore Rules

1. Go to **Firestore Database** → **Rules**
2. **Replace** the current rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to portfolio data (public)
    match /portfolio/{document} {
      allow read: if true;
      allow write: if request.auth != null; // Only authenticated users can write
    }
    
    // Allow read access to projects (public)
    match /projects/{document} {
      allow read: if true;
      allow write: if request.auth != null; // Only authenticated users can write
    }
  }
}
```

3. Click **"Publish"**

## Step 4: Test the Authentication

1. **Start your local server**: `python3 -m http.server 8080`
2. **Go to**: http://localhost:8080
3. **Login first**: Go to http://localhost:8080/login.html and login
4. **Return to portfolio**: Go back to http://localhost:8080
5. **Admin button appears**: You'll now see the "Admin" button in navigation
6. **Direct access**: You can also go directly to http://localhost:8080/admin.html
7. **Test saving data** in the admin panel

## 🔒 Security Features

- ✅ **Conditional Admin Button**: Admin button only shows when logged in
- ✅ **Direct URL Access**: Can access admin.html directly (shows login prompt if not authenticated)
- ✅ **Logout Functionality**: Secure logout with session clearing
- ✅ **Email Display**: Shows logged-in user's email in admin panel
- ✅ **Graceful Access Control**: Clean login prompt instead of redirect

## 🚀 Usage

1. **Public Access**: Anyone can view your portfolio at `/index.html`
2. **Admin Access**: Only authenticated users can access `/admin.html`
3. **Login Page**: `/login.html` handles authentication
4. **Secure Data**: Only authenticated users can save data to Firebase

## 🔧 Troubleshooting

### "User not found" error
- Make sure you created the user in Firebase Console
- Check that email/password match exactly

### "Permission denied" error
- Ensure Firestore rules are updated and published
- Verify user is logged in before accessing admin

### "Firebase not initialized" error
- Check that `firebase-config.js` has correct project settings
- Ensure Firebase SDK scripts are loaded

## 📝 Admin Credentials

**Email**: `admin@yourdomain.com` (replace with your email)
**Password**: `YourSecurePassword123!` (use your own strong password)

**Remember**: Keep your admin credentials secure and don't share them publicly! 