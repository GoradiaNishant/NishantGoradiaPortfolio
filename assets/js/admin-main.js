// ===================================
// ADMIN PAGE MAIN FUNCTIONALITY (CONTINUED)
// ===================================

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

        // Add to Firebase
        const success = await FirebaseDB.addProject(project);
        
        if (success) {
            // Clear form
            clearProjectForm();
            
            // Refresh projects list
            loadProjects();
            
            alert('Project added successfully to Firebase!');
        } else {
            alert('Error adding project. Please try again.');
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

// Load existing projects
async function loadProjects() {
    const projects = await FirebaseDB.getProjects();
    const projectsList = document.getElementById('projects-list');
    
    console.log('Loading projects from Firebase:', projects);
    console.log('Projects list element:', projectsList);
    
    projectsList.innerHTML = '';
    
    if (projects.length === 0) {
        projectsList.innerHTML = '<p class="text-gray-500 text-center py-4">No projects found. Add your first project above!</p>';
        return;
    }
    
    projects.forEach((project, index) => {
        const projectDiv = document.createElement('div');
        projectDiv.className = 'border border-gray-200 rounded-lg p-4';
        projectDiv.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <h3 class="font-semibold text-lg">${project.name}</h3>
                    <p class="text-gray-600">${project.description}</p>
                </div>
                <div class="flex space-x-2">
                    <button onclick="editProject(${index})" class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Edit</button>
                    <button onclick="deleteProject(${index})" class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">Delete</button>
                </div>
            </div>
        `;
        projectsList.appendChild(projectDiv);
    });
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
        addButton.onclick = function() { updateProject(index); };
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
        addButton.onclick = function() { addProject(); };
        addButton.className = 'bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-300';
    }
    
    // Hide cancel button
    document.getElementById('cancel-edit-btn').classList.add('hidden');
}

// Delete project
async function deleteProject(index) {
    if (confirm('Are you sure you want to delete this project?')) {
        const success = await FirebaseDB.deleteProject(index);
        if (success) {
            loadProjects();
            alert('Project deleted successfully from Firebase!');
        } else {
            alert('Error deleting project. Please try again.');
        }
    }
}
