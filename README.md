# Mobile Developer Portfolio

A dynamic, customizable portfolio website for mobile developers with Firebase integration for data persistence.

## Features

- **Dynamic Content Management**: Admin dashboard to update portfolio content
- **Project Management**: Add, edit, and delete projects with detailed information
- **Image Upload**: Upload profile and project images directly from the admin panel
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Firebase Integration**: Real-time data persistence across devices and browsers
- **Horizontal Scroll**: Edge-to-edge project showcase with smooth scrolling

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "portfolio-project")
4. Follow the setup wizard

### 2. Enable Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database

### 3. Get Firebase Configuration

1. In Firebase Console, go to "Project settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select "Web"
4. Register your app with a nickname
5. Copy the configuration object

### 4. Update Firebase Configuration

1. Open `firebase-config.js`
2. Replace the placeholder configuration with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};
```

### 5. Set Firestore Rules

In Firebase Console > Firestore Database > Rules, set the following rules for development:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Note**: These rules allow public read/write access. For production, implement proper authentication and security rules.

### 6. Firebase Hosting Setup

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting**:
   ```bash
   firebase init hosting
   ```
   - Select your project
   - Use "." as public directory
   - Configure as single-page app: Yes
   - Don't overwrite index.html

4. **Update Project ID**:
   - Open `.firebaserc`
   - Replace `"your-portfolio-project"` with your actual Firebase project ID

5. **Deploy to Firebase Hosting**:
   ```bash
   firebase deploy
   ```

Your portfolio will be available at: `https://your-project-id.web.app`

## File Structure

```
portfolio/
├── index.html              # Main portfolio page
├── admin.html              # Admin dashboard
├── project-detail.html     # Individual project details
├── firebase-config.js      # Firebase configuration
├── firebase.json           # Firebase hosting configuration
├── .firebaserc            # Firebase project configuration
└── README.md              # This file
```

## Usage

### 1. Setup
1. Follow the Firebase setup instructions above
2. Update `firebase-config.js` with your Firebase credentials
3. Open `index.html` in a web browser

### 2. Admin Dashboard
1. Click "Admin" in the navigation
2. Use the "Main Page" tab to update:
   - Hero section (name, tagline, title)
   - About section (profile image, text, experience)
   - Skills (comma-separated list)
   - Contact information (email, phone, LinkedIn, GitHub)

3. Use the "Projects" tab to:
   - Add new projects with detailed information
   - Edit existing projects
   - Delete projects
   - Upload project images

### 3. Data Structure

The portfolio uses two main collections in Firestore:

#### Portfolio Data (`portfolio/main`)
```javascript
{
    heroName: "Your Name",
    heroTagline: "A Passionate Mobile Developer...",
    portfolioTitle: "My Portfolio",
    profileImage: "image-url-or-data",
    aboutText: "About me description...",
    experienceYears: "5",
    skillsList: "Swift, Kotlin, Flutter...",
    contactEmail: "email@example.com",
    contactPhone: "+1 (234) 567-890",
    linkedinUrl: "https://linkedin.com/...",
    githubUrl: "https://github.com/..."
}
```

#### Projects Data (`portfolio/projects`)
```javascript
{
    projects: [
        {
            name: "Project Name",
            image: "project-image-url",
            description: "Short description",
            tech: "Tech stack",
            detailDescription: "Detailed description",
            duration: "3 months",
            demo: "demo-url",
            source: "source-url",
            rating: "4.8★",
            users: "10K+",
            retention: "95%",
            features: "Feature 1\nFeature 2\nFeature 3",
            challenges: "Challenge|Solution\nChallenge|Solution"
        }
    ]
}
```

## Features in Detail

### Admin Dashboard
- **Tabbed Interface**: Main Page, Projects, and Preview tabs
- **Image Upload**: Support for both file uploads and URL inputs
- **Real-time Updates**: Changes reflect immediately on the main page
- **Form Validation**: Input validation and error handling
- **CRUD Operations**: Create, Read, Update, Delete projects

### Main Portfolio Page
- **Dynamic Content**: All content loads from Firebase
- **Responsive Design**: Optimized for all screen sizes
- **Horizontal Scroll**: Projects section with edge-to-edge scrolling
- **Smooth Navigation**: Anchor links with smooth scrolling

### Project Detail Pages
- **Dynamic Loading**: Project details loaded from Firebase
- **Rich Content**: Detailed project information with metrics
- **Responsive Layout**: Optimized for all devices

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Development Notes

- Uses Firebase Firestore for data persistence
- Tailwind CSS for styling
- Vanilla JavaScript for functionality
- No build process required - pure HTML/CSS/JS
- Images stored as Base64 data URLs in Firebase

## Security Considerations

For production deployment:

1. **Implement Authentication**: Add user authentication to admin access
2. **Update Firestore Rules**: Restrict read/write access appropriately
3. **Image Storage**: Consider using Firebase Storage for images instead of Base64
4. **HTTPS**: Deploy on HTTPS-enabled hosting
5. **Rate Limiting**: Implement rate limiting for admin operations

## Troubleshooting

### Common Issues

1. **Firebase Connection Error**: Check your Firebase configuration in `firebase-config.js`
2. **Data Not Loading**: Verify Firestore rules allow read access
3. **Images Not Displaying**: Check if image URLs are accessible or data URLs are valid
4. **Admin Not Working**: Ensure Firestore rules allow write access

### Debug Mode

Open browser console (F12) to see detailed logs for:
- Firebase connection status
- Data loading operations
- Error messages

## License

This project is open source and available under the MIT License. 