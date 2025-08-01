# 📄 Resume Download Feature

## Overview
The portfolio now includes a dedicated resume section where visitors can download your resume PDF.

## Features

### ✅ Resume Section on Main Page
- **Location**: New section between Skills and Contact
- **Design**: Clean, centered layout with download button
- **Icon**: Download icon for better UX
- **Responsive**: Works on all screen sizes

### ✅ Admin Panel Integration
- **Resume URL Field**: Direct URL input for PDF
- **File Upload**: Upload PDF directly from admin panel
- **Auto-populate**: URL field gets filled when PDF is uploaded
- **Validation**: Only accepts PDF files

### ✅ Navigation Integration
- **Desktop Nav**: Added "Resume" link in navigation
- **Mobile Nav**: Added "Resume" link in mobile menu
- **Smooth Scroll**: Links to resume section

## How to Use

### 1. Upload Resume via Admin Panel
1. Go to `/admin.html` (login required)
2. Navigate to "Main Page" tab
3. Scroll to "Resume Section"
4. Either:
   - **Option A**: Enter direct URL to your PDF
   - **Option B**: Upload PDF file (auto-fills URL field)
5. Click "Save Main Page Content"

### 2. Resume Download Options

#### Option A: Direct URL
- Upload your PDF to a cloud service (Google Drive, Dropbox, etc.)
- Make it publicly accessible
- Enter the direct URL in admin panel

#### Option B: Data URL (Temporary)
- Upload PDF directly in admin panel
- PDF gets converted to data URL
- Works for smaller files (< 10MB)

### 3. Best Practices
- **File Size**: Keep PDF under 5MB for better performance
- **Cloud Storage**: Use Google Drive, Dropbox, or similar
- **Public Access**: Ensure the PDF is publicly accessible
- **File Name**: Use descriptive filename like "John_Doe_Resume_2025.pdf"

## Technical Details

### Data Storage
- Resume URL is stored in Firebase Firestore
- Part of the main portfolio data structure
- Automatically loads on page refresh

### File Handling
- **PDF Validation**: Only accepts `.pdf` files
- **Data URL**: Converts PDF to base64 for storage
- **Download Attribute**: Forces download with proper filename

### Security
- **File Type Check**: Validates PDF mime type
- **Size Limits**: Recommended under 10MB
- **Admin Only**: Only authenticated users can upload

## Example Usage

```javascript
// Resume data structure in Firebase
{
  "resumeUrl": "https://drive.google.com/uc?export=download&id=YOUR_FILE_ID",
  // ... other portfolio data
}
```

## Troubleshooting

### PDF Not Downloading
- Check if URL is publicly accessible
- Verify PDF file exists at the URL
- Test URL in browser directly

### Upload Issues
- Ensure file is PDF format
- Check file size (recommend < 5MB)
- Try different browser if issues persist

### Admin Access
- Make sure you're logged in to admin panel
- Check Firebase authentication status
- Verify Firestore rules allow write access 