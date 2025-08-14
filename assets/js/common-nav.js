// ===================================
// COMMON NAVIGATION BAR FUNCTIONALITY
// ===================================

// Initialize common navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Common navigation initializing...');
    
    // Render navigation bar if container exists
    const navContainer = document.getElementById('nav-container');
    console.log('🔍 Nav container found:', !!navContainer);
    
    if (navContainer) {
        // Check if we're on the main page or a sub-page
        const isProjectDetail = window.location.pathname.includes('/pages/');
        console.log('📍 Is project detail page:', isProjectDetail);
        
        const navHTML = renderNavigationBar(isProjectDetail);
        console.log('📝 Navigation HTML generated:', navHTML.substring(0, 100) + '...');
        
        navContainer.innerHTML = navHTML;
        console.log('✅ Navigation rendered');
        
        // Setup navigation functionality immediately
        setupMobileMenu();
        setupSmoothScrolling();
    } else {
        console.error('❌ Nav container not found!');
    }
    
    // Setup authentication-based navigation when Firebase is available
    if (typeof firebase !== 'undefined' && firebase.auth) {
        console.log('🔥 Firebase auth available, setting up auth navigation');
        setupAuthNavigation();
    } else {
        console.log('⏳ Firebase auth not ready, waiting for load event');
        // Wait for Firebase to load
        window.addEventListener('load', function() {
            if (typeof firebase !== 'undefined' && firebase.auth) {
                console.log('🔥 Firebase auth loaded, setting up auth navigation');
                setupAuthNavigation();
            } else {
                console.log('❌ Firebase auth still not available after load');
            }
        });
    }
});

// Setup common navigation functionality
function setupCommonNavigation() {
    // Setup mobile menu toggle
    setupMobileMenu();
    
    // Setup authentication-based navigation
    setupAuthNavigation();
    
    // Setup smooth scrolling for anchor links
    setupSmoothScrolling();
    
    console.log('✅ Common navigation setup complete');
}

// Setup mobile menu functionality
function setupMobileMenu() {
    // Check for both possible button IDs
    const mobileMenuButton = document.getElementById('mobile-menu-button') || document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            const isHidden = mobileMenu.classList.contains('hidden');
            
            if (isHidden) {
                mobileMenu.classList.remove('hidden');
                mobileMenuButton.innerHTML = `
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                `;
            } else {
                mobileMenu.classList.add('hidden');
                mobileMenuButton.innerHTML = `
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                `;
            }
        });
    }
}

// Setup authentication-based navigation
function setupAuthNavigation() {
    // Check if Firebase is available
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged(function(user) {
            const adminLink = document.getElementById('admin-link');
            const adminLinkMobile = document.getElementById('admin-link-mobile');
            
            console.log('🔐 Auth state changed - User logged in:', !!user);
            
            if (user) {
                // User is logged in - show admin links
                console.log('✅ User authenticated, showing admin links');
                const adminPath = '/admin'; // Use clean URL path
                
                if (adminLink) {
                    adminLink.classList.remove('hidden');
                    adminLink.href = adminPath;
                    console.log('✅ Desktop admin link shown with path:', adminPath);
                }
                if (adminLinkMobile) {
                    adminLinkMobile.classList.remove('hidden');
                    adminLinkMobile.href = adminPath;
                    console.log('✅ Mobile admin link shown with path:', adminPath);
                }
            } else {
                // User is not logged in - hide admin links
                console.log('❌ User not authenticated, hiding admin links');
                if (adminLink) {
                    adminLink.classList.add('hidden');
                    console.log('❌ Desktop admin link hidden');
                }
                if (adminLinkMobile) {
                    adminLinkMobile.classList.add('hidden');
                    console.log('❌ Mobile admin link hidden');
                }
            }
        });
    } else {
        console.log('⚠️ Firebase auth not available');
    }
}

// Setup smooth scrolling for anchor links
function setupSmoothScrolling() {
    // Add smooth scrolling behavior to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu if open
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    const mobileMenuButton = document.getElementById('mobile-menu-button') || document.getElementById('menu-toggle');
                    if (mobileMenuButton) {
                        mobileMenuButton.innerHTML = `
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        `;
                    }
                }
            }
        });
    });
}

// Function to render navigation bar HTML
function renderNavigationBar(isProjectDetail = false) {
    const basePath = isProjectDetail ? '../' : '';
    const adminPath = '/admin'; // Use clean URL path
    
    return `
        <nav class="bg-white shadow-lg fixed w-full top-0 z-50" role="navigation" aria-label="Main navigation">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <!-- Logo and Brand -->
                    <div class="flex items-center">
                        <a href="${basePath}index.html#home" class="flex-shrink-0">
                            <h1 class="text-2xl font-bold text-indigo-600">Er. Nishant G.</h1>
                        </a>
                    </div>

                    <!-- Desktop Navigation -->
                    <div class="hidden md:flex items-center space-x-8" role="menubar">
                        <a href="${basePath}index.html#home"
                            class="text-gray-600 hover:text-indigo-600 transition duration-300" role="menuitem">Home</a>
                        <a href="${basePath}index.html#about"
                            class="text-gray-600 hover:text-indigo-600 transition duration-300" role="menuitem">About</a>
                        <a href="${basePath}index.html#career"
                            class="text-gray-600 hover:text-indigo-600 transition duration-300" role="menuitem">Career</a>
                        <a href="${basePath}index.html#projects"
                            class="text-gray-600 hover:text-indigo-600 transition duration-300" role="menuitem">Projects</a>
                        <a href="${basePath}index.html#resume"
                            class="text-gray-600 hover:text-indigo-600 transition duration-300" role="menuitem">Resume</a>
                        <a href="${basePath}index.html#contact"
                            class="text-gray-600 hover:text-indigo-600 transition duration-300" role="menuitem">Contact</a>
                        <a href="${adminPath}" id="admin-link"
                            class="text-indigo-600 hover:text-indigo-700 font-semibold hidden" role="menuitem" style="display: none;">Admin</a>
                    </div>

                    <!-- Mobile menu button -->
                    <div class="md:hidden flex items-center">
                        <button id="menu-toggle" class="text-gray-600 hover:text-indigo-600 focus:outline-none" aria-label="Toggle mobile menu" aria-expanded="false">
                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Mobile Navigation -->
            <div id="mobile-menu" class="hidden md:hidden bg-white shadow-md" role="menu">
                <div class="px-4 pt-2 pb-3 space-y-1 sm:px-3">
                    <a href="${basePath}index.html#home"
                        class="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md" role="menuitem">Home</a>
                    <a href="${basePath}index.html#about"
                        class="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md" role="menuitem">About</a>
                    <a href="${basePath}index.html#career"
                        class="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md" role="menuitem">Career</a>
                    <a href="${basePath}index.html#skills"
                        class="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md" role="menuitem">Skills</a>
                    <a href="${basePath}index.html#projects"
                        class="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md" role="menuitem">Projects</a>
                    <a href="${basePath}index.html#resume"
                        class="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md" role="menuitem">Resume</a>
                    <a href="${basePath}index.html#contact"
                        class="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md" role="menuitem">Contact</a>
                    <a href="${adminPath}" id="admin-link-mobile"
                        class="block text-indigo-600 hover:text-indigo-700 font-semibold px-3 py-2 rounded-md hidden" role="menuitem" style="display: none;">Admin</a>
                </div>
            </div>
        </nav>
    `;
}

// Function to manually update admin link visibility
function updateAdminLinkVisibility() {
    const adminLink = document.getElementById('admin-link');
    const adminLinkMobile = document.getElementById('admin-link-mobile');
    
    console.log('🔍 Manual admin link visibility check');
    console.log('📍 Admin link found:', !!adminLink);
    console.log('📍 Mobile admin link found:', !!adminLinkMobile);
    
    if (typeof firebase !== 'undefined' && firebase.auth) {
        const user = firebase.auth().currentUser;
        console.log('🔍 Manual check - User logged in:', !!user);
        console.log('👤 User email:', user ? user.email : 'Not logged in');
        
        if (user) {
            // User is logged in - show admin links
            console.log('✅ Showing admin links for authenticated user');
            const adminPath = '/admin'; // Use clean URL path
            
            if (adminLink) {
                adminLink.classList.remove('hidden');
                adminLink.style.display = 'inline-block';
                adminLink.href = adminPath;
                console.log('✅ Desktop admin link shown with path:', adminPath);
            }
            if (adminLinkMobile) {
                adminLinkMobile.classList.remove('hidden');
                adminLinkMobile.style.display = 'block';
                adminLinkMobile.href = adminPath;
                console.log('✅ Mobile admin link shown with path:', adminPath);
            }
        } else {
            // User is not logged in - hide admin links
            console.log('❌ Hiding admin links for unauthenticated user');
            if (adminLink) {
                adminLink.classList.add('hidden');
                adminLink.style.display = 'none';
                console.log('❌ Desktop admin link hidden');
            }
            if (adminLinkMobile) {
                adminLinkMobile.classList.add('hidden');
                adminLinkMobile.style.display = 'none';
                console.log('❌ Mobile admin link hidden');
            }
        }
    } else {
        console.log('⚠️ Firebase auth not available for manual check');
    }
}

// Export functions for use in other files
window.CommonNav = {
    renderNavigationBar,
    setupCommonNavigation,
    setupMobileMenu,
    setupAuthNavigation,
    setupSmoothScrolling,
    updateAdminLinkVisibility
};
