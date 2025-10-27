/* ===================================
   PORTFOLIO WEBSITE - MAIN JAVASCRIPT
   =================================== */

// ===================================
// GLOBAL VARIABLES
// ===================================
let currentUser = null;

// ===================================
// INITIALIZATION
// ===================================
// Initialize immediately when script loads
setTimeout(() => {
    initializeApp();
}, 100);

// Fallback: if loading takes too long, show default content
setTimeout(() => {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay && loadingOverlay.style.display !== 'none') {
        console.log('Loading timeout - showing default content');
        hideLoading();
        loadDefaultContent();
    }
}, 5000); // 5 second timeout

// Start typing animation after a short delay for smooth experience
setTimeout(() => {
    initTypingAnimation();
}, 1500);

// ===================================
// INITIALIZATION
// ===================================
async function initializeApp() {
    try {
        showLoading('Loading portfolio data...');

        // Check if Firebase is available
        if (typeof FirebaseDB === 'undefined') {
            throw new Error('Firebase is not loaded yet');
        }

        // Test Firebase connection first
        const connectionTest = await FirebaseDB.testConnection();
        if (!connectionTest) {
            throw new Error('Firebase connection failed');
        }

        // Load portfolio data
        showLoading('Loading portfolio information...');
        await loadPortfolioData();

        // Load projects
        showLoading('Loading projects...');
        await loadProjects();

    } catch (error) {
        console.error('❌ Error loading data:', error);
        // Show error message but don't alert
        const loadingText = document.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = 'Error loading data. Please refresh the page.';
        }
        // Hide loading after a delay and show default content
        setTimeout(() => {
            hideLoading();
            // Load default content if Firebase fails
            loadDefaultContent();
        }, 3000);
    } finally {
        hideLoading();
        
        // Update admin link visibility after app loads
        if (window.CommonNav && window.CommonNav.updateAdminLinkVisibility) {
            setTimeout(() => {
                window.CommonNav.updateAdminLinkVisibility();
            }, 100);
        }
    }
}

// ===================================
// PORTFOLIO DATA LOADING
// ===================================
async function loadPortfolioData() {
    const savedData = await FirebaseDB.getPortfolioData();

    // Update hero section
    updateHeroSection(savedData);

    // Update about section
    updateAboutSection(savedData);

    // Update contact section
    updateContactSection(savedData);

    // Update resume section
    updateResumeSection(savedData);

    // Update career timeline
    if (savedData.careerTimeline && savedData.careerTimeline.length > 0) {
        loadCareerTimeline(savedData.careerTimeline);
    }

    // Update footer
    updateFooter(savedData);
}

// ===================================
// HERO SECTION
// ===================================
function updateHeroSection(savedData) {
    const heroNameElement = document.getElementById('hero-heading');
    if (savedData.heroName && heroNameElement) {
        heroNameElement.textContent = `Hi, I'm ${savedData.heroName}`;
    }

    const heroTaglineElement = document.getElementById('hero-tagline');
    if (savedData.heroTagline && heroTaglineElement) {
        heroTaglineElement.textContent = savedData.heroTagline;
    }

    if (savedData.portfolioTitle) {
        const navTitle = document.querySelector('nav h1');
        if (navTitle) {
            navTitle.textContent = savedData.portfolioTitle;
        }
    }
}

// ===================================
// ABOUT SECTION
// ===================================
function updateAboutSection(savedData) {
    // Update profile image with caching
    if (savedData.profileImage) {
        const aboutImg = document.getElementById('profile-image');
        if (aboutImg) {
            // Check if it's an external URL that needs caching
            if (savedData.profileImage.startsWith('http') && !savedData.profileImage.startsWith('data:')) {
                loadImageWithCache(aboutImg, savedData.profileImage, {
                    onLoad: (imgElement, loadedUrl) => {
                        console.log('✅ Profile image loaded successfully');
                    },
                    onError: (imgElement, failedUrl, error) => {
                        console.log('❌ Profile image failed to load:', failedUrl, error);
                        // Keep the original src as fallback
                    }
                });
            } else {
                // Direct assignment for data URLs or relative paths
                aboutImg.src = savedData.profileImage;
            }
        }
    }

    // Update about text
    const aboutTextContainer = document.getElementById('about-text-container');
    if (aboutTextContainer) {
        if (savedData.aboutText) {
            // Convert line breaks to paragraphs for better formatting
            const paragraphs = savedData.aboutText.split('\n').filter(para => para.trim() !== '');
            const paragraphsHtml = paragraphs.map(para =>
                `<p class="text-lg text-gray-700 leading-relaxed text-justify mb-4">${para.trim()}</p>`
            ).join('');

            aboutTextContainer.innerHTML = `
                <div class="space-y-6">
                    <div class="space-y-4">
                        ${paragraphsHtml}
                    </div>
                    
                    <!-- Key Highlights -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div class="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                            <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span class="text-sm font-medium text-green-700">Available for projects</span>
                        </div>
                        <div class="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                            <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                            <span class="text-sm font-medium text-blue-700">Open to opportunities</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            aboutTextContainer.innerHTML = `
                <div class="space-y-6">
                    <div class="space-y-4">
                        <p class="text-lg text-gray-700 leading-relaxed text-justify">I'm a passionate mobile developer with over 5 years of experience crafting innovative applications for iOS and Android platforms. Specializing in Flutter, Dart, and Firebase, I create seamless user experiences that combine cutting-edge technology with intuitive design. My expertise spans from cross-platform development to native mobile solutions, delivering robust applications that users love. I thrive on turning complex ideas into elegant, user-friendly mobile experiences.</p>
                    </div>
                    
                    <!-- Key Highlights -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div class="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                            <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span class="text-sm font-medium text-green-700">Available for projects</span>
                        </div>
                        <div class="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                            <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                            <span class="text-sm font-medium text-blue-700">Open to opportunities</span>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // Update skills in Profile section (under profile image)
    const profileSkillsContainer = document.getElementById('profile-skills-container');
    if (profileSkillsContainer) {
        if (savedData.skillsList) {
            const skills = savedData.skillsList.split(',').map(skill => skill.trim());
            profileSkillsContainer.innerHTML = '';

            const colors = [
                'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
                'bg-purple-100 text-purple-700 hover:bg-purple-200',
                'bg-pink-100 text-pink-700 hover:bg-pink-200',
                'bg-blue-100 text-blue-700 hover:bg-blue-200',
                'bg-green-100 text-green-700 hover:bg-green-200',
                'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
                'bg-red-100 text-red-700 hover:bg-red-200',
                'bg-teal-100 text-teal-700 hover:bg-teal-200'
            ];

            skills.forEach((skill, index) => {
                const colorClass = colors[index % colors.length];
                const skillSpan = document.createElement('span');
                skillSpan.className = `px-3 py-1 ${colorClass} rounded-full text-xs font-medium transition duration-300`;
                skillSpan.textContent = skill;
                profileSkillsContainer.appendChild(skillSpan);
            });
        } else {
            profileSkillsContainer.innerHTML = '<p class="text-gray-500 text-xs">No skills data available.</p>';
        }
    }
}

// ===================================
// CONTACT SECTION
// ===================================
function updateContactSection(savedData) {
    const contactLinksContainer = document.getElementById('contact-links');
    if (contactLinksContainer) {
        contactLinksContainer.innerHTML = '';

        if (savedData.contactEmail) {
            const emailLink = document.createElement('p');
            emailLink.className = 'text-center break-all';
            emailLink.innerHTML = `<a href="mailto:${savedData.contactEmail}" class="text-indigo-600 hover:underline">${savedData.contactEmail}</a>`;
            contactLinksContainer.appendChild(emailLink);
        }

        if (savedData.contactPhone) {
            const phoneLink = document.createElement('p');
            phoneLink.className = 'text-center break-all';
            phoneLink.innerHTML = `<a href="tel:${savedData.contactPhone}" class="text-indigo-600 hover:underline">${savedData.contactPhone}</a>`;
            contactLinksContainer.appendChild(phoneLink);
        }

        if (savedData.linkedinUrl) {
            const linkedinLink = document.createElement('p');
            linkedinLink.className = 'text-center break-all';
            linkedinLink.innerHTML = `<a href="${savedData.linkedinUrl}" class="text-indigo-600 hover:underline break-all">LinkedIn</a>`;
            contactLinksContainer.appendChild(linkedinLink);
        }

        if (savedData.githubUrl) {
            const githubLink = document.createElement('p');
            githubLink.className = 'text-center break-all';
            githubLink.innerHTML = `<a href="${savedData.githubUrl}" class="text-indigo-600 hover:underline break-all">GitHub</a>`;
            contactLinksContainer.appendChild(githubLink);
        }

        if (contactLinksContainer.children.length === 0) {
            contactLinksContainer.innerHTML = '<p class="text-center text-gray-500">No contact information available.</p>';
        }
    }
}

// ===================================
// RESUME SECTION
// ===================================
function updateResumeSection(savedData) {
    if (savedData.resumeUrl) {
        const resumeDownload = document.getElementById('resume-download');
        if (resumeDownload) {
            // Check if it's a base64 data URL
            if (savedData.resumeUrl.startsWith('data:')) {
                resumeDownload.href = '#';
                resumeDownload.onclick = function (e) {
                    e.preventDefault();
                    downloadBase64File(savedData.resumeUrl, 'resume.pdf');
                };
            } else {
                // Regular URL
                resumeDownload.href = savedData.resumeUrl;
                resumeDownload.download = 'resume.pdf';
            }
        }
    }
}

// ===================================
// FOOTER
// ===================================
function updateFooter(savedData) {
    if (savedData.heroName) {
        const footerText = document.querySelector('footer p');
        if (footerText) {
            footerText.textContent = `© 2025 ${savedData.heroName}. All rights reserved.`;
        }
    }
}

// ===================================
// CAREER TIMELINE
// ===================================
function loadCareerTimeline(timelineData) {
    const timelineContainer = document.getElementById('timeline-container');
    if (!timelineContainer) return;

    timelineContainer.innerHTML = '';

    timelineData.forEach((item, index) => {
        const isEven = index % 2 === 0;
        const timelineItem = document.createElement('div');
        timelineItem.className = `relative flex items-center justify-center md:${isEven ? 'justify-start' : 'justify-end'} mb-8`;

        timelineItem.innerHTML = `
            <div class="w-full md:w-5/12 ${isEven ? 'md:pr-8' : 'md:pl-8'} px-4 md:px-0">
                <div class="bg-white p-4 md:p-6 rounded-lg shadow-md relative">
                    <div class="absolute ${isEven ? 'md:-right-3 -right-3' : 'md:-left-3 -left-3'} top-4 md:top-6 w-4 h-4 md:w-6 md:h-6 bg-indigo-600 rounded-full border-2 md:border-4 border-white shadow-md"></div>
                    <div class="mb-2">
                        <span class="text-xs md:text-sm text-indigo-600 font-semibold">${item.period}</span>
                    </div>
                    <h3 class="text-lg md:text-xl font-bold text-gray-800 mb-2">${item.title}</h3>
                    <h4 class="text-base md:text-lg font-semibold text-indigo-600 mb-2">${item.company}</h4>
                    <p class="text-sm md:text-base text-gray-600 mb-3">${item.description}</p>
                    ${item.technologies ? `<div class="flex flex-wrap gap-1 md:gap-2">
                        ${item.technologies.split(',').map(tech => `<span class="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs md:text-sm">${tech.trim()}</span>`).join('')}
                    </div>` : ''}
                </div>
            </div>
        `;

        timelineContainer.appendChild(timelineItem);
    });
}

// ===================================
// PROJECTS LOADING
// ===================================
async function loadProjects() {
    try {
        const projects = await FirebaseDB.getProjects();
        const projectsContainer = document.getElementById('projects-container');

        if (projectsContainer) {
            projectsContainer.innerHTML = '';

            if (projects.length > 0) {
                projects.forEach((project, index) => {
                    const projectDiv = document.createElement('div');
                    projectDiv.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300 project-card';
                    projectDiv.innerHTML = `
                        <div class="project-image-container">
                            <div class="project-image-skeleton" id="skeleton-${index}">
                                <div class="flex items-center justify-center h-full">
                                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
                                </div>
                            </div>
                            <img src="assets/images/project_image_placeholder.webp" 
                                 alt="${project.name}" 
                                 class="project-image loading"
                                 id="project-image-${index}"
                                 data-original-src="${project.image || 'https://picsum.photos/400/250'}"
                                 data-project-index="${index}"
                                 style="opacity: 0.3;">
                        </div>
                        <div class="p-4 flex flex-col flex-grow bg-gray-100">
                            <h3 class="text-xl font-semibold mb-2">${project.name}</h3>
                            <p class="text-gray-600 mb-4 flex-grow">${project.description}</p>
                            <a href="pages/project-detail.html?project=${index}" class="text-indigo-600 font-semibold hover:underline mt-auto">View Details</a>
                        </div>
                    `;
                    projectsContainer.appendChild(projectDiv);

                    // Load image with caching after a short delay
                    setTimeout(() => {
                        const img = projectDiv.querySelector('img');
                        if (img) {
                            loadProjectImageWithCache(img, index);
                        }
                    }, index * 300); // Stagger loading to avoid overwhelming external CDNs
                });
            } else {
                projectsContainer.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8"><p>No projects available.</p></div>';
            }
        }

        // Update cache statistics after loading projects
        setTimeout(() => {
            updateCacheStats();
        }, 2000);
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// ===================================
// PROJECT IMAGE HANDLING WITH CACHING
// ===================================
function loadProjectImageWithCache(img, index) {
    const url = img.dataset.originalSrc;
    if (!url) return;

    // Check if it's a base64 data URL
    if (url.startsWith('data:')) {
        // For base64 images, load directly and hide skeleton immediately
        img.src = url;
        img.onload = () => handleProjectImageLoad(index);
        img.onerror = () => handleProjectImageError(index);
        return;
    }

    loadImageWithCache(img, url, {
        onLoad: (imgElement, loadedUrl) => {
            handleProjectImageLoad(index);
        },
        onError: (imgElement, failedUrl, error) => {
            console.log('❌ Project image failed to load:', failedUrl, error);
            handleProjectImageError(index);
        },
        onRetry: (imgElement, retryUrl, retryCount, delay) => {
            console.log(`🔄 Retrying project image ${index} (attempt ${retryCount}) in ${delay}ms`);
            // Update loading state to show retry progress
            const skeleton = document.getElementById(`skeleton-${index}`);
            if (skeleton) {
                skeleton.innerHTML = `<div class="text-center text-gray-500 text-sm">Retrying... (${retryCount})</div>`;
            }
        }
    });
}

function handleProjectImageLoad(index) {
    const image = document.getElementById(`project-image-${index}`);
    const skeleton = document.getElementById(`skeleton-${index}`);
    
    if (image) {
        image.classList.remove('loading');
        image.classList.add('loaded');
        image.style.opacity = '1';
    }
    
    if (skeleton) {
        skeleton.style.display = 'none';
        skeleton.style.visibility = 'hidden';
        skeleton.style.opacity = '0';
    }
}

function handleProjectImageError(index) {
    const image = document.getElementById(`project-image-${index}`);
    const skeleton = document.getElementById(`skeleton-${index}`);
    
    if (image) {
        image.classList.remove('loading');
        image.classList.add('error');
        image.style.opacity = '1';
        // Keep the fallback image (project_image_placeholder.webp) that's already set
    }
    
    if (skeleton) {
        skeleton.style.display = 'none';
        skeleton.style.visibility = 'hidden';
        skeleton.style.opacity = '0';
    }
}

// ===================================
// IMAGE PRELOADING & CACHE STATUS
// ===================================
async function preloadCriticalImages() {
    // Preload the main background image
    const mainBgUrl = 'assets/images/main_bg.webp';
    if (window.imageCache) {
        try {
            await window.imageCache.preloadImages([mainBgUrl]);
            console.log('✅ Critical images preloaded');
            showCacheStatus('Images cached successfully');
        } catch (error) {
            console.log('⚠️ Critical image preloading failed:', error);
            showCacheStatus('Image caching available');
        }
    }
}

function showCacheStatus(message) {
    // Create a subtle status indicator
    const statusDiv = document.createElement('div');
    statusDiv.id = 'cache-status';
    statusDiv.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-3 py-2 rounded-lg text-sm shadow-lg z-50 opacity-0 transition-opacity duration-500';
    statusDiv.textContent = message;
    document.body.appendChild(statusDiv);

    // Show and hide with animation
    setTimeout(() => {
        statusDiv.style.opacity = '1';
    }, 100);

    setTimeout(() => {
        statusDiv.style.opacity = '0';
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.parentNode.removeChild(statusDiv);
            }
        }, 500);
    }, 3000);
}

function updateCacheStats() {
    if (window.imageCache) {
        const stats = window.imageCache.getCacheStats();
        console.log('📊 Cache stats:', stats);

        // Update cache status if there are cached images
        if (stats.cached > 0) {
            showCacheStatus(`${stats.cached} images cached`);
        }
    }
}

// ===================================
// NAVIGATION
// ===================================
function initializeNavigation() {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                // Close mobile menu after clicking a link
                if (mobileMenu) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });
}

// ===================================
// AUTHENTICATION
// ===================================
function initializeAuthentication() {
    // Use common navigation's authentication system
    if (window.CommonNav && window.CommonNav.updateAdminLinkVisibility) {
        console.log('🔐 Using common navigation auth system');
        // The common navigation will handle auth state changes
        // Just update the current user for other parts of the app
        firebase.auth().onAuthStateChanged(function (user) {
            currentUser = user;
            console.log('👤 Current user updated:', user ? user.email : 'Not logged in');
        });
    } else {
        console.log('⚠️ Common navigation not available, using fallback auth');
        // Fallback to original authentication logic
        firebase.auth().onAuthStateChanged(function (user) {
            currentUser = user;
            const adminLink = document.getElementById('admin-link');
            const adminLinkMobile = document.getElementById('admin-link-mobile');

            if (user) {
                // User is logged in, show admin button
                if (adminLink) adminLink.classList.remove('hidden');
                if (adminLinkMobile) adminLinkMobile.classList.remove('hidden');
            } else {
                // User is not logged in, hide admin button
                if (adminLink) adminLink.classList.add('hidden');
                if (adminLinkMobile) adminLinkMobile.classList.add('hidden');
            }
        });
    }
}

// ===================================
// UTILITY FUNCTIONS
// ===================================
function showLoading(message = 'Loading...') {
    const overlay = document.getElementById('loading-overlay');
    const loadingText = overlay?.querySelector('.loading-text');

    if (overlay) {
        if (loadingText) {
            loadingText.textContent = message;
        }
        overlay.style.display = 'flex';
    }
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    const mainContent = document.getElementById('main-content');

    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
            overlay.style.opacity = '1';
            if (mainContent) {
                mainContent.classList.remove('hidden');
            }
        }, 300);
    }
}

function refreshData() {
    loadPortfolioData();
    loadProjects();
}

// ===================================
// TYPING ANIMATION
// ===================================
let typingAnimationActive = false;
let typingTimeout = null;

function initTypingAnimation() {
    // Prevent multiple instances
    if (typingAnimationActive) return;

    const typingText = document.querySelector('.typing-text');
    if (!typingText) return;

    typingAnimationActive = true;

    const texts = [
        'Mobile App Developer',
        'Android | Compose | Kotlin Multi Platform | Flutter',
        'Always learning new technologies'
    ];

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function typeText() {
        // Check if animation should continue
        if (!typingAnimationActive) return;

        const currentText = texts[textIndex];

        if (isDeleting) {
            typingText.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typingText.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }

        if (!isDeleting && charIndex === currentText.length) {
            // Pause at end of text
            typingSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            // Move to next text
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typingSpeed = 500;
        }

        typingTimeout = setTimeout(typeText, typingSpeed);
    }

    // Clear any existing timeout
    if (typingTimeout) {
        clearTimeout(typingTimeout);
    }

    // Start typing animation
    typingTimeout = setTimeout(typeText, 1000);
}

function stopTypingAnimation() {
    typingAnimationActive = false;
    if (typingTimeout) {
        clearTimeout(typingTimeout);
        typingTimeout = null;
    }
}

// ===================================
// DEFAULT CONTENT LOADING
// ===================================
function loadDefaultContent() {
    // Load default portfolio data
    const defaultData = {
        heroName: 'Nishant Goradia',
        heroTagline: 'A Passionate Mobile Developer Crafting Seamless Apps',
        portfolioTitle: 'Er. Nishant G.',
        aboutText: 'I\'m a passionate mobile developer with over 5 years of experience crafting innovative applications for iOS and Android platforms. Specializing in Flutter, Dart, and Firebase, I create seamless user experiences that combine cutting-edge technology with intuitive design.',
        skillsList: 'Flutter, Dart, Android, iOS, Firebase, Node.js, Spring Boot, CI/CD',
        contactEmail: 'goradianishant2000@gmail.com',
        contactPhone: '+91 8320901498',
        linkedinUrl: 'https://in.linkedin.com/in/nishant-goradiya-4b3090174',
        githubUrl: 'https://github.com/GoradiaNishant'
    };

    // Update sections with default data
    updateHeroSection(defaultData);
    updateAboutSection(defaultData);
    updateContactSection(defaultData);
    updateFooter(defaultData);

    // Load default projects
    const defaultProjects = [
        {
            name: 'Sample Mobile App',
            description: 'A cross-platform mobile application built with Flutter.',
            image: 'https://picsum.photos/400/250?random=1'
        },
        {
            name: 'E-commerce Platform',
            description: 'A comprehensive e-commerce solution with modern UI/UX.',
            image: 'https://picsum.photos/400/250?random=2'
        },
        {
            name: 'Social Media App',
            description: 'A social networking application with real-time features.',
            image: 'https://picsum.photos/400/250?random=3'
        }
    ];

    // Display default projects
    const projectsContainer = document.getElementById('projects-container');
    if (projectsContainer) {
        projectsContainer.innerHTML = '';
        defaultProjects.forEach((project, index) => {
            const projectDiv = document.createElement('div');
            projectDiv.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300 project-card';
                            projectDiv.innerHTML = `
                    <div class="project-image-container">
                        <div class="project-image-skeleton" id="skeleton-${index}">
                            <div class="flex items-center justify-center h-full">
                                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
                            </div>
                        </div>
                        <img src="assets/images/project_image_placeholder.webp" 
                             alt="${project.name}" 
                             class="project-image loading"
                             id="project-image-${index}"
                             data-original-src="${project.image}"
                             data-project-index="${index}">
                    </div>
                    <div class="p-4 flex flex-col flex-grow bg-gray-100">
                        <h3 class="text-xl font-semibold mb-2">${project.name}</h3>
                        <p class="text-gray-600 mb-4 flex-grow">${project.description}</p>
                        <a href="pages/project-detail.html?project=${index}" class="text-indigo-600 font-semibold hover:underline mt-auto">View Details</a>
                    </div>
                `;
            projectsContainer.appendChild(projectDiv);

            // Load image with caching after a short delay
            setTimeout(() => {
                const img = projectDiv.querySelector('img');
                if (img) {
                    loadProjectImageWithCache(img, index);
                }
            }, index * 300); // Stagger loading to avoid overwhelming external CDNs
        });
    }
}

// ===================================
// BASE64 FILE DOWNLOAD
// ===================================
function downloadBase64File(base64String, filename) {
    try {
        // Create a link element
        const link = document.createElement('a');
        link.href = base64String;
        link.download = filename;

        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error downloading file:', error);
        alert('Error downloading file. Please try again.');
    }
}

// ===================================
// EXPORT FUNCTIONS FOR GLOBAL USE
// ===================================
window.handleProjectImageLoad = handleProjectImageLoad;
window.handleProjectImageError = handleProjectImageError;
window.downloadBase64File = downloadBase64File;
window.refreshData = refreshData;

// ===================================
// INITIALIZE WHEN DOM IS READY
// ===================================
document.addEventListener('DOMContentLoaded', function () {
    initializeNavigation();
    preloadCriticalImages();
    initializeAuthentication();
});
