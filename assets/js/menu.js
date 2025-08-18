// ===================================
// SIMPLE MENU SYSTEM
// ===================================

class Menu {
    constructor() {
        this.init();
    }
    
    init() {
        console.log('🚀 Menu system initializing...');
        this.renderMenu();
        this.setupMobileMenu();
        this.setupAuthCheck();
    }
    
    renderMenu() {
        const navContainer = document.getElementById('nav-container');
        if (!navContainer) {
            console.error('❌ Nav container not found!');
            return;
        }
        
        const menuHTML = this.generateMenuHTML();
        navContainer.innerHTML = menuHTML;
        console.log('✅ Menu rendered');
    }
    
    generateMenuHTML() {
        // Get current page to determine correct paths
        const isHomePage = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html');
        const isProjectDetail = window.location.pathname.includes('project-detail');
        
        // Set paths based on current page
        let homePath = '/NishantGoradiaPortfolio/index.html';
        let adminPath = '/NishantGoradiaPortfolio/pages/admin.html';
        
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            homePath = '/index.html';
            adminPath = '/pages/admin.html';
        }
        
        return `
            <nav class="bg-white shadow-lg fixed w-full top-0 z-50" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between h-16">
                        <!-- Logo and Brand -->
                        <div class="flex items-center">
                            <a href="${homePath}" class="flex-shrink-0">
                                <h1 class="text-2xl font-bold text-indigo-600">Er. Nishant G.</h1>
                            </a>
                        </div>

                        <!-- Desktop Navigation -->
                        <div class="desktop-menu items-center space-x-8">
                            <a href="${homePath}#home" class="text-gray-600 hover:text-indigo-600 transition duration-300">Home</a>
                            <a href="${homePath}#about" class="text-gray-600 hover:text-indigo-600 transition duration-300">About</a>
                            <a href="${homePath}#career" class="text-gray-600 hover:text-indigo-600 transition duration-300">Career</a>
                            <a href="${homePath}#projects" class="text-gray-600 hover:text-indigo-600 transition duration-300">Projects</a>
                            <a href="${homePath}#resume" class="text-gray-600 hover:text-indigo-600 transition duration-300">Resume</a>
                            <a href="${homePath}#contact" class="text-gray-600 hover:text-indigo-600 transition duration-300">Contact</a>
                            <a href="${adminPath}" id="admin-link" class="text-indigo-600 hover:text-indigo-700 font-semibold">Admin</a>
                        </div>

                        <!-- Mobile menu button -->
                        <div class="mobile-menu-button flex items-center">
                            <button id="mobile-menu-toggle" class="text-gray-600 hover:text-indigo-600 focus:outline-none">
                                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Mobile Navigation -->
                <div id="mobile-menu" class="mobile-menu hidden bg-white shadow-md">
                    <div class="px-4 pt-2 pb-3 space-y-1">
                        <a href="${homePath}#home" class="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md">Home</a>
                        <a href="${homePath}#about" class="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md">About</a>
                        <a href="${homePath}#career" class="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md">Career</a>
                        <a href="${homePath}#projects" class="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md">Projects</a>
                        <a href="${homePath}#resume" class="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md">Resume</a>
                        <a href="${homePath}#contact" class="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md">Contact</a>
                        <a href="${adminPath}" id="admin-link-mobile" class="block text-indigo-600 hover:text-indigo-700 font-semibold px-3 py-2 rounded-md">Admin</a>
                    </div>
                </div>
            </nav>
        `;
    }
    
    setupMobileMenu() {
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileToggle && mobileMenu) {
            mobileToggle.addEventListener('click', () => {
                mobileMenu.classList.toggle('show');
            });
        }
        
        // Close mobile menu when clicking on links
        document.addEventListener('click', (e) => {
            if (e.target.matches('#mobile-menu a')) {
                mobileMenu.classList.remove('show');
            }
        });
    }
    
    showAdminLinks() {
        const adminLink = document.getElementById('admin-link');
        const adminLinkMobile = document.getElementById('admin-link-mobile');
        
        if (adminLink) {
            adminLink.classList.remove('hidden');
        }
        if (adminLinkMobile) {
            adminLinkMobile.classList.remove('hidden');
        }
    }
    
    hideAdminLinks() {
        const adminLink = document.getElementById('admin-link');
        const adminLinkMobile = document.getElementById('admin-link-mobile');
        
        if (adminLink) {
            adminLink.classList.add('hidden');
        }
        if (adminLinkMobile) {
            adminLinkMobile.classList.add('hidden');
        }
    }
    
    setupAuthCheck() {
        // Check if Firebase is available
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged((user) => {
                console.log('🔐 Auth state changed - User logged in:', !!user);
                if (user) {
                    this.showAdminLinks();
                } else {
                    this.hideAdminLinks();
                }
            });
        } else {
            // Wait for Firebase to load
            window.addEventListener('load', () => {
                if (typeof firebase !== 'undefined' && firebase.auth) {
                    firebase.auth().onAuthStateChanged((user) => {
                        console.log('🔐 Auth state changed - User logged in:', !!user);
                        if (user) {
                            this.showAdminLinks();
                        } else {
                            this.hideAdminLinks();
                        }
                    });
                }
            });
        }
    }
}

// Initialize menu when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Menu();
});

// Export for use in other files
window.Menu = Menu;
