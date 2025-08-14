// ===================================
// LOGIN PAGE FUNCTIONALITY
// ===================================

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Login page initializing...');
    
    // Check authentication status
    checkAuthenticationStatus();
    
    // Setup event listeners
    setupEventListeners();
});

// Check if user is already logged in
function checkAuthenticationStatus() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in, redirect to admin
            console.log('✅ User already authenticated, redirecting to admin');
            window.location.href = 'pages/admin.html';
        } else {
            console.log('❌ User not authenticated, showing login form');
        }
    });
}

// Setup all event listeners
function setupEventListeners() {
    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginFormSubmission);
    }

    console.log('✅ Login page event listeners setup complete');
}

// Handle login form submission
async function handleLoginFormSubmission(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    // Clear previous messages
    errorMessage.classList.add('hidden');
    successMessage.classList.add('hidden');

    showLoading('Signing in...');

    try {
        // Sign in with Firebase Auth
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        console.log('✅ Login successful:', user.email);
        successMessage.textContent = 'Login successful! Redirecting...';
        successMessage.classList.remove('hidden');

        // Redirect to admin page after short delay
        setTimeout(() => {
            window.location.href = 'pages/admin.html';
        }, 1000);

    } catch (error) {
        console.error('❌ Login error:', error);
        errorMessage.textContent = error.message;
        errorMessage.classList.remove('hidden');
    } finally {
        hideLoading();
    }
}

// Show loading overlay
function showLoading(message = 'Loading...') {
    const overlay = document.getElementById('loading-overlay');
    const loadingText = overlay.querySelector('.loading-text');
    loadingText.textContent = message;
    overlay.classList.remove('hidden');
}

// Hide loading overlay
function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.opacity = '0';
    setTimeout(() => {
        overlay.classList.add('hidden');
        overlay.style.opacity = '1';
    }, 300);
}
