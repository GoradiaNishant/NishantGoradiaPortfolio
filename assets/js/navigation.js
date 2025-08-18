// ===================================
// SIMPLE NAVIGATION SYSTEM
// ===================================

// Global configuration
const NAV_CONFIG = {
    // Detect environment
    isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    isGitHubPages: window.location.hostname === 'goradianishant.github.io',
    
    // Base paths
    getBasePath() {
        if (this.isGitHubPages) {
            return '/NishantGoradiaPortfolio/';
        } else if (this.isLocalhost) {
            return '/';
        } else {
            return '/';
        }
    },
    
    // Get correct path for any page
    getPath(page) {
        const base = this.getBasePath();
        if (page === 'home') {
            return base + 'index.html';
        } else if (page === 'admin') {
            return base + 'admin/';
        } else if (page === 'login') {
            return base + 'pages/login.html';
        } else if (page === 'project-detail') {
            return base + 'pages/project-detail.html';
        } else {
            return base + page;
        }
    }
};

// Navigation class
class Navigation {
    constructor() {
        this.config = NAV_CONFIG;
        this.init();
    }
    
    init() {
        console.log('🚀 Navigation system initializing...');
        this.renderNavigation();
        this.setupEventListeners();
        this.setupAuthNavigation();
    }
    
    renderNavigation() {
        const navContainer = document.getElementById('nav-container');
        if (!navContainer) {
            console.error('❌ Nav container not found!');
            return;
        }
        
        const navHTML = this.generateNavigationHTML();
        navContainer.innerHTML = navHTML;
        console.log('✅ Navigation rendered');
    }
    
    generateNavigationHTML() {
        const basePath = this.config.getBasePath();
        const homePath = this.config.getPath('home');
        
        return `
            <nav class="bg-white shadow-lg fixed w-full top-0 z-50" role="navigation" aria-label="Main navigation">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between h-16">
                        <!-- Logo and Brand -->
                        <div class="flex items-center">
                            <a href="${homePath}#home" class="flex-shrink-0">
                                <h1 class="text-2xl font-bold text-indigo-600">Er. Nishant G.</h1>
                            </a>
                        </div>

                        <!-- Desktop Navigation -->
                        <div class="hidden md:flex items-center space-x-8" role="menubar">
                            <a href="${homePath}#home" class="nav-link">Home</a>
                            <a href="${homePath}#about" class="nav-link">About</a>
                            <a href="${homePath}#career" class="nav-link">Career</a>
                            <a href="${homePath}#projects" class="nav-link">Projects</a>
                            <a href="${homePath}#resume" class="nav-link">Resume</a>
                            <a href="${homePath}#contact" class="nav-link">Contact</a>
                            <a href="${this.config.getPath('admin')}" id="admin-link" class="nav-link admin-link hidden">Admin</a>
                        </div>

                        <!-- Mobile menu button -->
                        <div class="md:hidden flex items-center">
                            <button id="mobile-menu-toggle" class="text-gray-600 hover:text-indigo-600 focus:outline-none" aria-label="Toggle mobile menu">
                                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Mobile Navigation -->
                <div id="mobile-menu" class="hidden md:hidden bg-white shadow-md">
                    <div class="px-4 pt-2 pb-3 space-y-1">
                        <a href="${homePath}#home" class="mobile-nav-link">Home</a>
                        <a href="${homePath}#about" class="mobile-nav-link">About</a>
                        <a href="${homePath}#career" class="mobile-nav-link">Career</a>
                        <a href="${homePath}#projects" class="mobile-nav-link">Projects</a>
                        <a href="${homePath}#resume" class="mobile-nav-link">Resume</a>
                        <a href="${homePath}#contact" class="mobile-nav-link">Contact</a>
                        <a href="${this.config.getPath('admin')}" id="admin-link-mobile" class="mobile-nav-link admin-link hidden">Admin</a>
                    </div>
                </div>
            </nav>
        `;
    }
    
    setupEventListeners() {
        // Mobile menu toggle
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileToggle && mobileMenu) {
            mobileToggle.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }
        
        // Smooth scrolling for anchor links
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const target = document.querySelector(e.target.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Close mobile menu
                    if (mobileMenu) {
                        mobileMenu.classList.add('hidden');
                    }
                }
            }
        });
    }
    
    setupAuthNavigation() {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged((user) => {
                this.updateAdminLinks(user);
            });
        } else {
            // Wait for Firebase to load
            window.addEventListener('load', () => {
                if (typeof firebase !== 'undefined' && firebase.auth) {
                    firebase.auth().onAuthStateChanged((user) => {
                        this.updateAdminLinks(user);
                    });
                }
            });
        }
    }
    
    updateAdminLinks(user) {
        const adminLink = document.getElementById('admin-link');
        const adminLinkMobile = document.getElementById('admin-link-mobile');
        
        if (user) {
            // User is logged in - show admin links
            if (adminLink) {
                adminLink.classList.remove('hidden');
                adminLink.href = this.config.getPath('admin');
            }
            if (adminLinkMobile) {
                adminLinkMobile.classList.remove('hidden');
                adminLinkMobile.href = this.config.getPath('admin');
            }
        } else {
            // User is not logged in - hide admin links
            if (adminLink) {
                adminLink.classList.add('hidden');
            }
            if (adminLinkMobile) {
                adminLinkMobile.classList.add('hidden');
            }
        }
    }
}

// Make navigation utilities available immediately
window.NavigationUtils = {
    // Get correct path for any page
    getPath(page) {
        return NAV_CONFIG.getPath(page);
    },
    
    // Navigate to a page
    navigateTo(page) {
        window.location.href = this.getPath(page);
    },
    
    // Navigate to home with specific section
    navigateToSection(section) {
        const homePath = NAV_CONFIG.getPath('home');
        window.location.href = homePath + '#' + section;
    },
    
    // Get base path
    getBasePath() {
        return NAV_CONFIG.getBasePath();
    }
};

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Navigation();
});

// Export for use in other files
window.Navigation = Navigation;
