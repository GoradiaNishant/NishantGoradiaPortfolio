// ===================================
// ADMIN PAGE MAIN FUNCTIONALITY
// ===================================

// Global variables
let currentScreenshots = [];
let draggedIndex = null;
let sortableInstance = null;
let isReorderMode = false;

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Admin page initializing...');

    // Check authentication
    checkAuthentication();

    // Setup event listeners
    setupEventListeners();

    // Initialize tabs
    initializeTabs();

    // Initialize cache stats
    refreshCacheStats();

    // Load saved data
    loadSavedData();
});

// Authentication check
function checkAuthentication() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (!user) {

            const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

            const baseHref = isLocalhost
                ? '/'
                : '/NishantGoradiaPortfolio/';


            // User is not logged in, show login prompt instead of redirect
            document.body.innerHTML = `
                <div class="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div class="max-w-md w-full space-y-8 text-center">
                    <div>
                        <h2 class="text-3xl font-bold text-gray-900">Admin Access Required</h2>
                        <p class="mt-2 text-sm text-gray-600">You need to be logged in to access the admin panel.</p>
                    </div>
                    <div class="space-y-4">
                        <a href="${baseHref}pages/login.html"
                        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                        Go to Login
                        </a>
                        <a href="${baseHref}index.html"
                        class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        Back to Portfolio
                        </a>
                    </div>
                    </div>
                </div>
                `;
        } else {
            // User is logged in, show their email
            const userEmailElement = document.getElementById('userEmail');
            if (userEmailElement) {
                userEmailElement.textContent = user.email;
            }
            console.log('✅ User authenticated:', user.email);

            // Hide loading overlay
            hideLoading();
        }
    });
}

// Setup all event listeners
function setupEventListeners() {
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Cache management buttons
    const clearCacheBtn = document.getElementById('clearCacheBtn');
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', clearImageCache);
    }

    const clearServerCacheBtn = document.getElementById('clearServerCacheBtn');
    if (clearServerCacheBtn) {
        clearServerCacheBtn.addEventListener('click', clearServerCache);
    }

    // Setup image uploads
    setupImageUploads();

    console.log('✅ Admin page event listeners setup complete');
}

// Load saved data on page load
async function loadSavedData() {
    showLoading('Loading admin panel...');

    try {
        // Initialize tabs first
        initializeTabs();

        showLoading('Loading portfolio data...');
        const savedData = await FirebaseDB.getPortfolioData();

        // Populate form fields with saved data
        if (savedData.heroName) document.getElementById('hero-name').value = savedData.heroName;
        if (savedData.heroTagline) document.getElementById('hero-tagline').value = savedData.heroTagline;
        if (savedData.portfolioTitle) document.getElementById('portfolio-title').value = savedData.portfolioTitle;
        if (savedData.profileImage) {
            document.getElementById('profile-image').value = savedData.profileImage;
            // If it's a data URL (uploaded image), show preview
            if (savedData.profileImage.startsWith('data:image')) {
                document.getElementById('profile-preview-img').src = savedData.profileImage;
                document.getElementById('profile-preview').classList.remove('hidden');
                localStorage.setItem('profile-preview_data', savedData.profileImage);
            }
        }
        if (savedData.aboutText) document.getElementById('about-text').value = savedData.aboutText;
        if (savedData.experienceYears) document.getElementById('experience-years').value = savedData.experienceYears;
        if (savedData.skillsList) document.getElementById('skills-list').value = savedData.skillsList;
        if (savedData.contactEmail) document.getElementById('contact-email').value = savedData.contactEmail;
        if (savedData.contactPhone) document.getElementById('contact-phone').value = savedData.contactPhone;
        if (savedData.linkedinUrl) document.getElementById('linkedin-url').value = savedData.linkedinUrl;
        if (savedData.githubUrl) document.getElementById('github-url').value = savedData.githubUrl;
        if (savedData.resumeUrl) document.getElementById('resume-url').value = savedData.resumeUrl;
        if (savedData.careerTimeline) loadTimelineItems(savedData.careerTimeline);

        // Setup image uploads and load previews
        setupImageUploads();
        loadImagePreviews();

        // Load projects
        showLoading('Loading projects...');
        loadProjects();

        // Debug: Check if projects are saved
        const projects = await FirebaseDB.getProjects();
        console.log('Projects in Firebase:', projects);
        console.log('Number of projects:', projects.length);

        console.log('✅ Admin panel loaded successfully');

    } catch (error) {
        console.error('❌ Error loading admin panel:', error);
        alert('Error loading admin panel. Please refresh the page.');
    } finally {
        hideLoading();
    }
}

// Timeline management functions
function addTimelineItem() {
    const container = document.getElementById('timeline-items-container');
    const itemId = Date.now();

    const timelineItem = document.createElement('div');
    timelineItem.className = 'timeline-item bg-gray-50 p-4 rounded-lg border';
    timelineItem.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h4 class="font-semibold text-gray-700">Timeline Item</h4>
            <button onclick="removeTimelineItem(this)" class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">Remove</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Period (e.g., 2023 - Present)</label>
                <input type="text" class="timeline-period w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="2023 - Present">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                <input type="text" class="timeline-title w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Senior Mobile Developer">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <input type="text" class="timeline-company w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Tech Company Inc.">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Technologies (comma separated)</label>
                <input type="text" class="timeline-technologies w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Swift, Kotlin, Flutter">
            </div>
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea class="timeline-description w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" rows="3" placeholder="Describe your role, achievements, and responsibilities..."></textarea>
            </div>
        </div>
    `;

    container.appendChild(timelineItem);
}

function removeTimelineItem(button) {
    button.closest('.timeline-item').remove();
}

function loadTimelineItems(timelineData) {
    const container = document.getElementById('timeline-items-container');
    container.innerHTML = '';

    if (timelineData && timelineData.length > 0) {
        timelineData.forEach(item => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item bg-gray-50 p-4 rounded-lg border';
            timelineItem.innerHTML = `
                <div class="flex justify-between items-center mb-4">
                    <h4 class="font-semibold text-gray-700">Timeline Item</h4>
                    <button onclick="removeTimelineItem(this)" class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">Remove</button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Period (e.g., 2023 - Present)</label>
                        <input type="text" class="timeline-period w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" value="${item.period || ''}" placeholder="2023 - Present">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                        <input type="text" class="timeline-title w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" value="${item.title || ''}" placeholder="Senior Mobile Developer">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Company</label>
                        <input type="text" class="timeline-company w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" value="${item.company || ''}" placeholder="Tech Company Inc.">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Technologies (comma separated)</label>
                        <input type="text" class="timeline-technologies w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" value="${item.technologies || ''}" placeholder="Swift, Kotlin, Flutter">
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea class="timeline-description w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" rows="3" placeholder="Describe your role, achievements, and responsibilities...">${item.description || ''}</textarea>
                    </div>
                </div>
            `;

            container.appendChild(timelineItem);
        });
    }
}

// Handle file uploads and image previews
function handleImageUpload(fileInput, previewId, previewImgId) {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.getElementById(previewId);
            const previewImg = document.getElementById(previewImgId);
            previewImg.src = e.target.result;
            preview.classList.remove('hidden');

            // Store the image data in localStorage
            localStorage.setItem(`${previewId}_data`, e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

// Load image previews from localStorage
function loadImagePreviews() {
    const profileData = localStorage.getItem('profile-preview_data');
    const projectData = localStorage.getItem('project-preview_data');

    if (profileData) {
        document.getElementById('profile-preview-img').src = profileData;
        document.getElementById('profile-preview').classList.remove('hidden');
    }

    if (projectData) {
        document.getElementById('project-preview-img').src = projectData;
        document.getElementById('project-preview').classList.remove('hidden');
    }
}

// Add event listeners for file uploads
function setupImageUploads() {
    const profileImageFile = document.getElementById('profile-image-file');
    const projectImageFile = document.getElementById('project-image-file');
    const resumeFile = document.getElementById('resume-file');

    if (profileImageFile) {
        profileImageFile.addEventListener('change', function () {
            handleImageUpload(this, 'profile-preview', 'profile-preview-img');
        });
    }

    if (projectImageFile) {
        projectImageFile.addEventListener('change', function () {
            handleImageUpload(this, 'project-preview', 'project-preview-img');
        });
    }

    if (resumeFile) {
        resumeFile.addEventListener('change', function () {
            handlePDFUpload(this, document.getElementById('resume-url'));
        });
    }
}

// Handle PDF file uploads
function handlePDFUpload(fileInput, urlInput) {
    const file = fileInput.files[0];
    if (file) {
        if (file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = function (e) {
                // For PDF files, we'll store the data URL
                // In a real application, you'd upload to a cloud storage service
                urlInput.value = e.target.result;
                alert('PDF uploaded successfully! The data URL has been set in the URL field.');
            };
            reader.readAsDataURL(file);
        } else {
            alert('Please select a PDF file.');
            fileInput.value = '';
        }
    }
}

// Tab functionality
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section-content').forEach(section => {
        section.classList.add('hidden');
    });

    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-indigo-600', 'text-white');
        btn.classList.add('bg-gray-100', 'text-gray-700');
    });

    // Show selected section
    document.getElementById(sectionId).classList.remove('hidden');

    // Add active class to clicked tab
    event.target.classList.add('active', 'bg-indigo-600', 'text-white');
    event.target.classList.remove('bg-gray-100', 'text-gray-700');
}

// Initialize tabs on page load
function initializeTabs() {
    // Show main-page section by default
    document.getElementById('main-page').classList.remove('hidden');
    document.getElementById('cache').classList.add('hidden');
    document.getElementById('projects').classList.add('hidden');
    document.getElementById('preview').classList.add('hidden');

    // Initialize cache stats if available
    setTimeout(() => {
        refreshCacheStats();
    }, 1000);
}

// Load saved data on page load
async function loadSavedData() {
    showLoading('Loading admin panel...');

    try {
        // Initialize tabs first
        initializeTabs();

        showLoading('Loading portfolio data...');
        const savedData = await FirebaseDB.getPortfolioData();

        // Populate form fields with saved data
        if (savedData.heroName) document.getElementById('hero-name').value = savedData.heroName;
        if (savedData.heroTagline) document.getElementById('hero-tagline').value = savedData.heroTagline;
        if (savedData.portfolioTitle) document.getElementById('portfolio-title').value = savedData.portfolioTitle;
        if (savedData.profileImage) {
            document.getElementById('profile-image').value = savedData.profileImage;
            // If it's a data URL (uploaded image), show preview
            if (savedData.profileImage.startsWith('data:image')) {
                document.getElementById('profile-preview-img').src = savedData.profileImage;
                document.getElementById('profile-preview').classList.remove('hidden');
                localStorage.setItem('profile-preview_data', savedData.profileImage);
            }
        }
        if (savedData.aboutText) document.getElementById('about-text').value = savedData.aboutText;
        if (savedData.experienceYears) document.getElementById('experience-years').value = savedData.experienceYears;
        if (savedData.skillsList) document.getElementById('skills-list').value = savedData.skillsList;
        if (savedData.contactEmail) document.getElementById('contact-email').value = savedData.contactEmail;
        if (savedData.contactPhone) document.getElementById('contact-phone').value = savedData.contactPhone;
        if (savedData.linkedinUrl) document.getElementById('linkedin-url').value = savedData.linkedinUrl;
        if (savedData.githubUrl) document.getElementById('github-url').value = savedData.githubUrl;
        if (savedData.resumeUrl) document.getElementById('resume-url').value = savedData.resumeUrl;
        if (savedData.careerTimeline) loadTimelineItems(savedData.careerTimeline);

        // Setup image uploads and load previews
        setupImageUploads();
        loadImagePreviews();

        // Load projects
        showLoading('Loading projects...');
        loadProjects();

        // Debug: Check if projects are saved
        const projects = await FirebaseDB.getProjects();
        console.log('Projects in Firebase:', projects);
        console.log('Number of projects:', projects.length);

        console.log('✅ Admin panel loaded successfully');

    } catch (error) {
        console.error('❌ Error loading admin panel:', error);
        alert('Error loading admin panel. Please refresh the page.');
    } finally {
        hideLoading();
    }
}

// Logout functionality
async function handleLogout() {
    try {
        await firebase.auth().signOut();
        console.log('✅ Logout successful');

        const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
        const baseHref = isLocalhost 
            ? '/' 
            : '/NishantGoradiaPortfolio/';

        window.location.href = `${baseHref}pages/login.html`;
    } catch (error) {
        console.error('❌ Logout error:', error);
        alert('Error logging out. Please try again.');
    }
}

// Show loading overlay
function showLoading(message = 'Loading...') {
    const overlay = document.getElementById('loading-overlay');
    const loadingText = overlay.querySelector('.loading-text');
    loadingText.textContent = message;
    overlay.style.display = 'flex';
}

// Hide loading overlay
function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.opacity = '0';
    setTimeout(() => {
        overlay.style.display = 'none';
        overlay.style.opacity = '1';
    }, 300);
}

// Cache management functions
function clearImageCache() {
    if (window.imageCache) {
        window.imageCache.clearCache();
        alert('Image cache cleared successfully!');
        refreshCacheStats();
    } else {
        alert('Image cache system not available');
    }
}

function refreshCacheStats() {
    if (window.imageCache) {
        const stats = window.imageCache.getCacheStats();
        const cachedCountElement = document.getElementById('cached-count');
        const failedCountElement = document.getElementById('failed-count');
        const totalCountElement = document.getElementById('total-count');

        if (cachedCountElement) cachedCountElement.textContent = stats.cached;
        if (failedCountElement) failedCountElement.textContent = stats.failed;
        if (totalCountElement) totalCountElement.textContent = stats.total;
    } else {
        const cachedCountElement = document.getElementById('cached-count');
        const failedCountElement = document.getElementById('failed-count');
        const totalCountElement = document.getElementById('total-count');

        if (cachedCountElement) cachedCountElement.textContent = '0';
        if (failedCountElement) failedCountElement.textContent = '0';
        if (totalCountElement) totalCountElement.textContent = '0';
    }
}

async function clearServerCache() {
    try {
        // Check if we're on localhost (development) or production
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        if (isLocalhost) {
            // Try to connect to local server
            const response = await fetch('http://localhost:3000/cache/clear', {
                method: 'DELETE'
            });

            if (response.ok) {
                const result = await response.json();
                alert(`Server cache cleared: ${result.message}`);
                refreshCacheStats();
            } else {
                alert('Failed to clear server cache. Make sure the proxy server is running.');
            }
        } else {
            // On production (GitHub Pages), server cache is not available
            alert('Server cache management is only available in development mode. On GitHub Pages, only browser cache can be cleared.');
        }
    } catch (error) {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            alert('Error clearing server cache. Make sure the proxy server is running on port 3000.');
        } else {
            alert('Server cache management is not available on GitHub Pages. Use browser cache clearing instead.');
        }
    }
}

// Save main page content
async function saveMainPageContent() {
    showLoading('Saving portfolio data...');

    try {
        // Get uploaded image data if available
        const profileImageData = localStorage.getItem('profile-preview_data');

        // Get timeline items
        const timelineItems = [];
        const timelineContainers = document.querySelectorAll('.timeline-item');
        timelineContainers.forEach(container => {
            const item = {
                period: container.querySelector('.timeline-period').value,
                title: container.querySelector('.timeline-title').value,
                company: container.querySelector('.timeline-company').value,
                description: container.querySelector('.timeline-description').value,
                technologies: container.querySelector('.timeline-technologies').value
            };
            timelineItems.push(item);
        });

        const data = {
            heroName: document.getElementById('hero-name').value,
            heroTagline: document.getElementById('hero-tagline').value,
            portfolioTitle: document.getElementById('portfolio-title').value,
            profileImage: profileImageData || document.getElementById('profile-image').value,
            aboutText: document.getElementById('about-text').value,
            experienceYears: document.getElementById('experience-years').value,
            skillsList: document.getElementById('skills-list').value,
            contactEmail: document.getElementById('contact-email').value,
            contactPhone: document.getElementById('contact-phone').value,
            linkedinUrl: document.getElementById('linkedin-url').value,
            githubUrl: document.getElementById('github-url').value,
            resumeUrl: document.getElementById('resume-url').value,
            careerTimeline: timelineItems
        };

        // Save to Firebase
        const success = await FirebaseDB.savePortfolioData(data);

        if (success) {
            alert('Main page content saved successfully to Firebase!');
        } else {
            alert('Error saving content. Please try again.');
        }
    } catch (error) {
        console.error('❌ Error saving portfolio data:', error);
        alert('Error saving content. Please try again.');
    } finally {
        hideLoading();
    }
}

// Test fields function
function testFields() {
    console.log('🧪 Testing field capture...');

    const techStackField = document.getElementById('project-tech-stack');
    const developmentProcessField = document.getElementById('project-development-process');

    console.log('🔍 Tech Stack field element:', techStackField);
    console.log('🔍 Development Process field element:', developmentProcessField);

    if (techStackField) {
        console.log('✅ Tech Stack field found');
        console.log('🔍 Tech Stack field value:', techStackField.value);
        console.log('🔍 Tech Stack field type:', typeof techStackField.value);
        console.log('🔍 Tech Stack field length:', techStackField.value.length);
    } else {
        console.log('❌ Tech Stack field NOT found');
    }

    if (developmentProcessField) {
        console.log('✅ Development Process field found');
        console.log('🔍 Development Process field value:', developmentProcessField.value);
        console.log('🔍 Development Process field type:', typeof developmentProcessField.value);
        console.log('🔍 Development Process field length:', developmentProcessField.value.length);
    } else {
        console.log('❌ Development Process field NOT found');
    }

    // Test creating project object
    const testProject = {
        techStack: techStackField ? techStackField.value : 'FIELD_NOT_FOUND',
        developmentProcess: developmentProcessField ? developmentProcessField.value : 'FIELD_NOT_FOUND'
    };

    console.log('🧪 Test project object:', testProject);
}

// Add new project
async function addProject() {
    showLoading('Adding project...');

    try {
        // Get uploaded project image data if available
        const projectImageData = localStorage.getItem('project-preview_data');

        // Get screenshots from the preview area
        const screenshots = getScreenshotsFromPreview();

        // Capture field values first
        const techStackValue = document.getElementById('project-tech-stack').value;
        const developmentProcessValue = document.getElementById('project-development-process').value;

        console.log('🔍 Raw field values:');
        console.log('Tech Stack field value:', techStackValue);
        console.log('Development Process field value:', developmentProcessValue);
        console.log('Tech Stack field type:', typeof techStackValue);
        console.log('Development Process field type:', typeof developmentProcessValue);

        const project = {
            name: document.getElementById('project-name').value,
            image: projectImageData || document.getElementById('project-image').value,
            description: document.getElementById('project-description').value,
            tech: document.getElementById('project-tech').value,
            detailDescription: document.getElementById('project-detail-description').value,
            duration: document.getElementById('project-duration').value,
            demo: document.getElementById('project-demo').value,
            source: document.getElementById('project-source').value,
            rating: document.getElementById('project-rating').value,
            users: document.getElementById('project-users').value,
            retention: document.getElementById('project-retention').value,
            features: document.getElementById('project-features').value,
            challenges: document.getElementById('project-challenges').value,
            techStack: techStackValue,
            developmentProcess: developmentProcessValue,
            screenshots: screenshots
        };

        // Debug: Check if technical data is captured
        console.log('🔍 Checking technical data capture:');
        console.log('Tech Stack field value:', document.getElementById('project-tech-stack').value);
        console.log('Development Process field value:', document.getElementById('project-development-process').value);
        console.log('Tech Stack in project object:', project.techStack);
        console.log('Development Process in project object:', project.developmentProcess);
        console.log('🔍 Tech Stack field element:', document.getElementById('project-tech-stack'));
        console.log('🔍 Development Process field element:', document.getElementById('project-development-process'));
        
        // Check project size before saving
        const projectSize = new Blob([JSON.stringify(project)]).size;
        console.log(`📊 Project size before optimization: ${projectSize} bytes (${(projectSize / 1024 / 1024).toFixed(2)} MB)`);
        
        if (projectSize > 800000) { // 800KB warning threshold
            const shouldContinue = confirm(`⚠️ Warning: Project size is ${(projectSize / 1024 / 1024).toFixed(2)} MB. This might cause Firebase size limit issues.\n\nScreenshots will be automatically compressed, but you may want to reduce the number or quality of screenshots.\n\nContinue anyway?`);
            if (!shouldContinue) {
                hideLoading();
                return;
            }
        }
        
        console.log('🔍 Full project object being sent to Firebase:', JSON.stringify(project, null, 2));

        // Add to Firebase
        const success = await FirebaseDB.addProject(project);

        if (success) {
            console.log('✅ Project added successfully');
            
            // Clear form
            clearProjectForm();

            // Refresh projects list
            await loadProjects();

            alert('✅ Project added successfully! Your project is now live on your portfolio.');
        } else {
            console.error('❌ Failed to add project');
            alert('❌ Error adding project. Please try again.');
        }
    } catch (error) {
        console.error('❌ Error adding project:', error);
        alert('Error adding project. Please try again.');
    } finally {
        hideLoading();
    }
}

// Clear project form
function clearProjectForm() {
    document.getElementById('project-name').value = '';
    document.getElementById('project-image').value = '';
    document.getElementById('project-description').value = '';
    document.getElementById('project-tech').value = '';
    document.getElementById('project-detail-description').value = '';
    document.getElementById('project-duration').value = '';
    document.getElementById('project-demo').value = '';
    document.getElementById('project-source').value = '';
    document.getElementById('project-rating').value = '';
    document.getElementById('project-users').value = '';
    document.getElementById('project-retention').value = '';
    document.getElementById('project-features').value = '';
    document.getElementById('project-challenges').value = '';
    document.getElementById('project-tech-stack').value = '';
    document.getElementById('project-development-process').value = '';

    // Clear screenshots
    clearScreenshots();

    // Clear project image preview
    document.getElementById('project-image-file').value = '';
    document.getElementById('project-preview').classList.add('hidden');
    localStorage.removeItem('project-preview_data');

    // Reset button to add state
    resetAddButton();
}

// Migrate projects to individual documents
async function migrateProjects() {
    const shouldMigrate = confirm('This will migrate your projects from the old single-document storage to individual project documents. This will solve the Firebase size limit issues.\n\nContinue with migration?');
    
    if (!shouldMigrate) return;
    
    showLoading('Migrating projects...');
    
    try {
        const success = await FirebaseDB.migrateToIndividualDocuments();
        
        if (success) {
            alert('✅ Migration completed successfully! Your projects are now stored as individual documents and should no longer have size limit issues.');
            // Refresh the projects list
            loadProjects();
        } else {
            alert('❌ Migration failed. Please try again or contact support.');
        }
    } catch (error) {
        console.error('Migration error:', error);
        alert('❌ Migration failed: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Load existing projects
async function loadProjects() {
    try {
        showLoading('Loading projects...');
        const projects = await FirebaseDB.getProjects();
        const projectsList = document.getElementById('projects-list');

        console.log('📁 Loading projects from Firebase:', projects);
        console.log('📁 Projects list element:', projectsList);

        projectsList.innerHTML = '';

        if (projects.length === 0) {
            projectsList.innerHTML = `
                <div class="text-center py-8">
                    <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                    </svg>
                    <p class="text-gray-500 text-lg">No projects found</p>
                    <p class="text-gray-400">Add your first project using the form above!</p>
                </div>
            `;
            return;
        }

        projects.forEach((project, index) => {
            const projectDiv = document.createElement('div');
            projectDiv.className = 'border border-gray-200 rounded-lg p-4 mb-4 hover:shadow-md transition-shadow';
            
            // Count screenshots
            const screenshotCount = project.screenshots ? project.screenshots.length : 0;
            
            // Get project image preview
            const projectImage = project.image || 'assets/images/project_image_placeholder.webp';
            
            projectDiv.innerHTML = `
                <div class="flex items-start space-x-4">
                    <div class="flex-shrink-0">
                        <img src="${projectImage}" alt="${project.name}" class="w-16 h-16 rounded-lg object-cover border border-gray-200">
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="font-semibold text-lg text-gray-900">${project.name || 'Unnamed Project'}</h3>
                                <p class="text-gray-600 text-sm mt-1">${project.description || 'No description'}</p>
                                <div class="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                    <span>📸 ${screenshotCount} screenshots</span>
                                    <span>🛠️ ${project.tech || 'No tech stack'}</span>
                                    ${project.rating ? `<span>⭐ ${project.rating}/5</span>` : ''}
                                </div>
                            </div>
                            <div class="flex space-x-2">
                                <button onclick="editProject(${index})" class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                                    <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                    </svg>
                                    Edit
                                </button>
                                <button onclick="deleteProject(${index})" class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors">
                                    <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            projectsList.appendChild(projectDiv);
        });
        
        console.log(`✅ Loaded ${projects.length} projects successfully`);
    } catch (error) {
        console.error('❌ Error loading projects:', error);
        const projectsList = document.getElementById('projects-list');
        projectsList.innerHTML = `
            <div class="text-center py-8">
                <svg class="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <p class="text-red-600 text-lg">Error loading projects</p>
                <p class="text-gray-500">Please try refreshing the page</p>
                <button onclick="loadProjects()" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Retry
                </button>
            </div>
        `;
    } finally {
        hideLoading();
    }
}

// Edit project
async function editProject(index) {
    const projects = await FirebaseDB.getProjects();
    const project = projects[index];

    if (project) {
        // Store the current editing index
        window.currentEditingIndex = index;

        // Populate form fields with project data
        document.getElementById('project-name').value = project.name || '';
        document.getElementById('project-image').value = project.image || '';
        document.getElementById('project-description').value = project.description || '';
        document.getElementById('project-tech').value = project.tech || '';
        document.getElementById('project-detail-description').value = project.detailDescription || '';
        document.getElementById('project-duration').value = project.duration || '';
        document.getElementById('project-demo').value = project.demo || '';
        document.getElementById('project-source').value = project.source || '';
        document.getElementById('project-rating').value = project.rating || '';
        document.getElementById('project-users').value = project.users || '';
        document.getElementById('project-retention').value = project.retention || '';
        document.getElementById('project-features').value = project.features || '';
        document.getElementById('project-challenges').value = project.challenges || '';
        document.getElementById('project-tech-stack').value = project.techStack || '';
        document.getElementById('project-development-process').value = project.developmentProcess || '';

        // Load screenshots
        loadScreenshotsToPreview(project.screenshots || []);

        // Show project image preview if it's a data URL
        if (project.image && project.image.startsWith('data:image')) {
            document.getElementById('project-preview-img').src = project.image;
            document.getElementById('project-preview').classList.remove('hidden');
            localStorage.setItem('project-preview_data', project.image);
        } else {
            document.getElementById('project-preview').classList.add('hidden');
        }

        // Change the add button to update button
        const addButton = document.querySelector('button[onclick="addProject()"]');
        addButton.textContent = 'Update Project';
        addButton.onclick = function () { updateProject(index); };
        addButton.className = 'bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition duration-300';

        // Show cancel button
        document.getElementById('cancel-edit-btn').classList.remove('hidden');

        // Scroll to the form
        document.querySelector('#projects .form-section').scrollIntoView({ behavior: 'smooth' });
    }
}

// Update project
async function updateProject(index) {
    // Get uploaded project image data if available
    const projectImageData = localStorage.getItem('project-preview_data');

    // Get screenshots from the preview area
    const screenshots = getScreenshotsFromPreview();

    // Capture field values first
    const techStackValue = document.getElementById('project-tech-stack').value;
    const developmentProcessValue = document.getElementById('project-development-process').value;

    const project = {
        name: document.getElementById('project-name').value,
        image: projectImageData || document.getElementById('project-image').value,
        description: document.getElementById('project-description').value,
        tech: document.getElementById('project-tech').value,
        detailDescription: document.getElementById('project-detail-description').value,
        duration: document.getElementById('project-duration').value,
        demo: document.getElementById('project-demo').value,
        source: document.getElementById('project-source').value,
        rating: document.getElementById('project-rating').value,
        users: document.getElementById('project-users').value,
        retention: document.getElementById('project-retention').value,
        features: document.getElementById('project-features').value,
        challenges: document.getElementById('project-challenges').value,
        techStack: techStackValue,
        developmentProcess: developmentProcessValue,
        screenshots: screenshots
    };

    // Update in Firebase
    const success = await FirebaseDB.updateProject(index, project);

    if (success) {
        // Clear form and reset button
        clearProjectForm();
        resetAddButton();

        // Clear editing index
        window.currentEditingIndex = null;

        // Refresh projects list
        loadProjects();

        alert('Project updated successfully in Firebase!');
    } else {
        alert('Error updating project. Please try again.');
    }
}

// Cancel edit and return to add mode
function cancelEdit() {
    // Clear the form
    clearProjectForm();

    // Reset button to add state
    resetAddButton();

    // Hide cancel button
    document.getElementById('cancel-edit-btn').classList.add('hidden');

    // Clear editing index
    window.currentEditingIndex = null;

    // Scroll to top of form
    document.querySelector('#projects .form-section').scrollIntoView({ behavior: 'smooth' });
}

// Reset add button to original state
function resetAddButton() {
    const addButton = document.querySelector('button[onclick="updateProject()"]') || document.querySelector('button[onclick*="Project"]');
    if (addButton) {
        addButton.textContent = 'Add Project';
        addButton.onclick = function () { addProject(); };
        addButton.className = 'bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-300';
    }

    // Hide cancel button
    document.getElementById('cancel-edit-btn').classList.add('hidden');
}

// Delete project
async function deleteProject(index) {
    const shouldDelete = confirm(`Are you sure you want to delete this project?\n\nThis action cannot be undone and will permanently remove the project from your portfolio.`);
    
    if (!shouldDelete) return;
    
    showLoading('Deleting project...');
    
    try {
        const success = await FirebaseDB.deleteProject(index);
        
        if (success) {
            console.log(`✅ Project ${index} deleted successfully`);
            await loadProjects(); // Refresh the list
            alert('✅ Project deleted successfully!');
        } else {
            console.error('❌ Failed to delete project');
            alert('❌ Error deleting project. Please try again.');
        }
    } catch (error) {
        console.error('❌ Error deleting project:', error);
        alert('❌ Error deleting project: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Handle file uploads and image previews
function handleImageUpload(fileInput, previewId, previewImgId) {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.getElementById(previewId);
            const previewImg = document.getElementById(previewImgId);
            previewImg.src = e.target.result;
            preview.classList.remove('hidden');

            // Store the image data in localStorage
            localStorage.setItem(`${previewId}_data`, e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

// Load image previews from localStorage
function loadImagePreviews() {
    const profileData = localStorage.getItem('profile-preview_data');
    const projectData = localStorage.getItem('project-preview_data');

    if (profileData) {
        document.getElementById('profile-preview-img').src = profileData;
        document.getElementById('profile-preview').classList.remove('hidden');
    }

    if (projectData) {
        document.getElementById('project-preview-img').src = projectData;
        document.getElementById('project-preview').classList.remove('hidden');
    }
}

// Timeline management functions
function addTimelineItem() {
    const container = document.getElementById('timeline-items-container');
    const itemId = Date.now();

    const timelineItem = document.createElement('div');
    timelineItem.className = 'timeline-item bg-gray-50 p-4 rounded-lg border';
    timelineItem.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h4 class="font-semibold text-gray-700">Timeline Item</h4>
            <button onclick="removeTimelineItem(this)" class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">Remove</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Period (e.g., 2023 - Present)</label>
                <input type="text" class="timeline-period w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="2023 - Present">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                <input type="text" class="timeline-title w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Senior Mobile Developer">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <input type="text" class="timeline-company w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Tech Company Inc.">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Technologies (comma separated)</label>
                <input type="text" class="timeline-technologies w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Swift, Kotlin, Flutter">
            </div>
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea class="timeline-description w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" rows="3" placeholder="Describe your role, achievements, and responsibilities..."></textarea>
            </div>
        </div>
    `;

    container.appendChild(timelineItem);

    // If in reorder mode, add drag handle and update sortable
    if (isReorderMode && sortableInstance) {
        const newItem = container.lastElementChild;
        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle absolute top-2 right-2 w-6 h-6 bg-gray-200 rounded cursor-move flex items-center justify-center';
        dragHandle.innerHTML = '⋮⋮';
        dragHandle.style.zIndex = '10';
        newItem.style.position = 'relative';
        newItem.appendChild(dragHandle);
    }
}

function removeTimelineItem(button) {
    button.closest('.timeline-item').remove();
}

// Reorder functionality
function toggleReorderMode() {
    const reorderBtn = document.getElementById('reorder-btn');
    const instructions = document.getElementById('reorder-instructions');
    const container = document.getElementById('timeline-items-container');

    isReorderMode = !isReorderMode;

    if (isReorderMode) {
        // Enable reorder mode
        reorderBtn.textContent = 'Save Order';
        reorderBtn.className = 'bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition duration-300';
        instructions.classList.remove('hidden');
        container.classList.add('reorder-mode');

        // Initialize Sortable
        sortableInstance = new Sortable(container, {
            animation: 150,
            ghostClass: 'bg-blue-100',
            chosenClass: 'bg-blue-200',
            dragClass: 'bg-blue-300',
            onEnd: function () {
                console.log('Timeline items reordered');
            }
        });

        // Add drag handles to all timeline items
        document.querySelectorAll('.timeline-item').forEach(item => {
            if (!item.querySelector('.drag-handle')) {
                const dragHandle = document.createElement('div');
                dragHandle.className = 'drag-handle absolute top-2 right-2 w-6 h-6 bg-gray-200 rounded cursor-move flex items-center justify-center';
                dragHandle.innerHTML = '⋮⋮';
                dragHandle.style.zIndex = '10';
                item.style.position = 'relative';
                item.appendChild(dragHandle);
            }
        });

    } else {
        // Disable reorder mode
        reorderBtn.textContent = 'Reorder';
        reorderBtn.className = 'bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-300';
        instructions.classList.add('hidden');
        container.classList.remove('reorder-mode');

        // Destroy Sortable instance
        if (sortableInstance) {
            sortableInstance.destroy();
            sortableInstance = null;
        }

        // Remove drag handles
        document.querySelectorAll('.drag-handle').forEach(handle => {
            handle.remove();
        });
    }
}

function loadTimelineItems(timelineData) {
    const container = document.getElementById('timeline-items-container');
    container.innerHTML = '';

    if (timelineData && timelineData.length > 0) {
        timelineData.forEach(item => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item bg-gray-50 p-4 rounded-lg border';
            timelineItem.innerHTML = `
                <div class="flex justify-between items-center mb-4">
                    <h4 class="font-semibold text-gray-700">Timeline Item</h4>
                    <button onclick="removeTimelineItem(this)" class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">Remove</button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Period (e.g., 2023 - Present)</label>
                        <input type="text" class="timeline-period w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" value="${item.period || ''}" placeholder="2023 - Present">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                        <input type="text" class="timeline-title w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" value="${item.title || ''}" placeholder="Senior Mobile Developer">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Company</label>
                        <input type="text" class="timeline-company w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" value="${item.company || ''}" placeholder="Tech Company Inc.">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Technologies (comma separated)</label>
                        <input type="text" class="timeline-technologies w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" value="${item.technologies || ''}" placeholder="Swift, Kotlin, Flutter">
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea class="timeline-description w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" rows="3" placeholder="Describe your role, achievements, and responsibilities...">${item.description || ''}</textarea>
                    </div>
                </div>
            `;

            container.appendChild(timelineItem);
        });
    }

    // If in reorder mode, reinitialize sortable
    if (isReorderMode && sortableInstance) {
        setTimeout(() => {
            sortableInstance.destroy();
            sortableInstance = new Sortable(container, {
                animation: 150,
                ghostClass: 'bg-blue-100',
                chosenClass: 'bg-blue-200',
                dragClass: 'bg-blue-300',
                onEnd: function () {
                    console.log('Timeline items reordered');
                }
            });

            // Add drag handles
            document.querySelectorAll('.timeline-item').forEach(item => {
                if (!item.querySelector('.drag-handle')) {
                    const dragHandle = document.createElement('div');
                    dragHandle.className = 'drag-handle absolute top-2 right-2 w-6 h-6 bg-gray-200 rounded cursor-move flex items-center justify-center';
                    dragHandle.innerHTML = '⋮⋮';
                    dragHandle.style.zIndex = '10';
                    item.style.position = 'relative';
                    item.appendChild(dragHandle);
                }
            });
        }, 100);
    }
}

// Handle PDF file uploads
function handlePDFUpload(fileInput, urlInput) {
    const file = fileInput.files[0];
    if (file) {
        if (file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = function (e) {
                // For PDF files, we'll store the data URL
                // In a real application, you'd upload to a cloud storage service
                urlInput.value = e.target.result;
                alert('PDF uploaded successfully! The data URL has been set in the URL field.');
            };
            reader.readAsDataURL(file);
        } else {
            alert('Please select a PDF file.');
            fileInput.value = '';
        }
    }
}

// Add event listeners for file uploads
function setupImageUploads() {
    const profileImageFile = document.getElementById('profile-image-file');
    const projectImageFile = document.getElementById('project-image-file');
    const resumeFile = document.getElementById('resume-file');

    if (profileImageFile) {
        profileImageFile.addEventListener('change', function () {
            handleImageUpload(this, 'profile-preview', 'profile-preview-img');
        });
    }

    if (projectImageFile) {
        projectImageFile.addEventListener('change', function () {
            handleImageUpload(this, 'project-preview', 'project-preview-img');
        });
    }

    if (resumeFile) {
        resumeFile.addEventListener('change', function () {
            handlePDFUpload(this, document.getElementById('resume-url'));
        });
    }
}
