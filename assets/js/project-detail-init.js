// ===================================
// PROJECT DETAIL PAGE INITIALIZATION
// ===================================

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Project detail page initializing...');
    
    // Setup event listeners
    setupEventListeners();
    
    // Check authentication
    checkAuthentication();
});

// Setup all event listeners
function setupEventListeners() {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Screenshot modal event listeners
    const closeModalBtn = document.getElementById('close-modal');
    const screenshotModal = document.getElementById('screenshot-modal');

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeScreenshotModal);
    }

    // Close modal when clicking outside
    if (screenshotModal) {
        screenshotModal.addEventListener('click', (e) => {
            if (e.target === screenshotModal) {
                closeScreenshotModal();
            }
        });
    }

    // Modal keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (screenshotModal && !screenshotModal.classList.contains('hidden')) {
            switch (e.key) {
                case 'Escape':
                    closeScreenshotModal();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    prevScreenshot();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    nextScreenshot();
                    break;
            }
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
            // Close mobile menu after clicking a link
            if (mobileMenu) {
                mobileMenu.classList.add('hidden');
            }
        });
    });

    console.log('✅ Event listeners setup complete');
}

// Check authentication and show/hide admin button
function checkAuthentication() {
    firebase.auth().onAuthStateChanged(function (user) {
        const adminLink = document.getElementById('admin-link');
        const adminLinkMobile = document.getElementById('admin-link-mobile');

        if (user) {
            // User is logged in, show admin button
            if (adminLink) adminLink.classList.remove('hidden');
            if (adminLinkMobile) adminLinkMobile.classList.remove('hidden');
            console.log('✅ User authenticated, showing admin button');
        } else {
            // User is not logged in, hide admin button
            if (adminLink) adminLink.classList.add('hidden');
            if (adminLinkMobile) adminLinkMobile.classList.add('hidden');
            console.log('❌ User not authenticated, hiding admin button');
        }
    });
}

// Load project data when page loads
window.onload = async function () {
    showLoading('Loading project details...');

    try {
        await loadProjectData();
        console.log('✅ Project details loaded successfully');
    } catch (error) {
        console.error('❌ Error loading project details:', error);
        alert('Error loading project details. Please refresh the page.');
    } finally {
        hideLoading();
    }
};
