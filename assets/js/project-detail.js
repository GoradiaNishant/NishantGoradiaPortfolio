// ===================================
// PROJECT DETAIL PAGE JAVASCRIPT
// ===================================

// Global variables for modal navigation
let currentScreenshotIndex = 0;
let currentScreenshots = [];

// Load project data from Firebase
async function loadProjectData() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const projectIndex = urlParams.get('project');

        if (projectIndex !== null) {
            const projects = await FirebaseDB.getProjects();
            const project = projects[parseInt(projectIndex)];

            if (project) {
                // Update hero section
                const heroTitle = document.querySelector('.md\\:w-1\\/2 h1');
                const heroDescription = document.querySelector('.md\\:w-1\\/2 p');
                const heroImage = document.querySelector('section img');

                if (heroTitle) heroTitle.textContent = project.name;
                if (heroDescription) heroDescription.textContent = project.description;
                if (heroImage && project.image) heroImage.src = project.image;

                // Update tech stack tags
                if (project.tech) {
                    const techTags = project.tech.split(',').map(tech => tech.trim());
                    const tagsContainer = document.querySelector('.md\\:w-1\\/2 .flex.flex-wrap.gap-2');
                    if (tagsContainer) {
                        tagsContainer.innerHTML = '';

                        techTags.forEach(tech => {
                            const tag = document.createElement('span');
                            tag.className = 'bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm';
                            tag.textContent = tech;
                            tagsContainer.appendChild(tag);
                        });
                    }
                }

                // Update store buttons - only show if URLs exist
                const storeButtonsContainer = document.getElementById('store-buttons');
                if (storeButtonsContainer) {
                    storeButtonsContainer.innerHTML = '';

                    // Add Google Play button if demo URL exists
                    if (project.demo && project.demo.trim() !== '') {
                        const playStoreLink = document.createElement('a');
                        playStoreLink.href = project.demo;
                        playStoreLink.className = 'hover:opacity-80 transition duration-300';
                        playStoreLink.innerHTML = `<img src="../assets/images/playstore.png" alt="Get it on Google Play" class="h-12">`;
                        storeButtonsContainer.appendChild(playStoreLink);
                    }

                    // Add App Store button if source URL exists
                    if (project.source && project.source.trim() !== '') {
                        const appStoreLink = document.createElement('a');
                        appStoreLink.href = project.source;
                        appStoreLink.className = 'hover:opacity-80 transition duration-300';
                        appStoreLink.innerHTML = `<img src="../assets/images/appstore.png" alt="Download on the App Store" class="h-12">`;
                        storeButtonsContainer.appendChild(appStoreLink);
                    }
                }

                // Check multiple possible field names for tech stack
                const techStackData = project.techStack || project.tech || project.technicalStack;

                if (techStackData) {
                    // Handle both comma-separated and newline-separated formats
                    const techStackItems = techStackData.includes('\n')
                        ? techStackData.split('\n')
                        : techStackData.split(',');

                    const techStackContainer = document.getElementById('tech-stack-container');

                    if (techStackContainer) {
                        techStackContainer.innerHTML = '';

                        techStackItems.forEach(item => {
                            if (item.trim()) {
                                const [technology, description] = item.split('|');
                                if (technology && description) {
                                    const techDiv = document.createElement('div');
                                    techDiv.className = 'flex justify-between items-center p-4 bg-gray-50 rounded-lg';
                                    techDiv.innerHTML = `
                                        <span class="font-semibold">${technology.trim()}</span>
                                        <span class="text-indigo-600">${description.trim()}</span>
                                    `;
                                    techStackContainer.appendChild(techDiv);
                                }
                            }
                        });
                    } else {
                        console.error('Tech stack container not found');
                    }
                }

                // Check multiple possible field names for development process
                const developmentProcessData = project.developmentProcess || project.process || project.development;

                if (developmentProcessData) {
                    // Handle both comma-separated and newline-separated formats
                    const processItems = developmentProcessData.includes('\n')
                        ? developmentProcessData.split('\n')
                        : developmentProcessData.split(',');

                    const processContainer = document.getElementById('development-process-container');

                    if (processContainer) {
                        processContainer.innerHTML = '';

                        processItems.forEach((item, index) => {
                            if (item.trim()) {
                                const [step, description] = item.split('|');
                                if (step && description) {
                                    const processDiv = document.createElement('div');
                                    processDiv.className = 'flex items-start mb-6';
                                    processDiv.innerHTML = `
                                        <div class="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm mr-6 flex-shrink-0 shadow-md">${index + 1}</div>
                                        <div class="flex-1">
                                            <h4 class="font-semibold text-lg mb-2 text-gray-800">${step.trim()}</h4>
                                            <p class="text-gray-600 leading-relaxed">${description.trim()}</p>
                                        </div>
                                    `;
                                    processContainer.appendChild(processDiv);
                                }
                            }
                        });
                    } else {
                        console.error('Development process container not found');
                    }
                }

                // Load project overview and key features
                loadProjectOverview(project);
                loadKeyFeatures(project);
                loadResultsAndImpact(project);

                // Load challenges and solutions
                loadChallengesAndSolutions(project);

                // Load screenshots
                await loadScreenshots(project);

                // Update footer with portfolio owner name
                try {
                    const portfolioData = await FirebaseDB.getPortfolioData();
                    if (portfolioData.heroName) {
                        document.querySelector('footer p').textContent = `© 2025 ${portfolioData.heroName}. All rights reserved.`;
                    }
                } catch (error) {
                    console.error('Error updating footer:', error);
                }
            } else {
                console.error('Project not found for index:', projectIndex);
            }
        } else {
            console.error('No project index provided in URL');
        }
    } catch (error) {
        console.error('Error loading project data:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
    }
}

// Load project overview for the project
function loadProjectOverview(project) {
    try {
        console.log('Loading project overview for project:', project);
        const overviewContainer = document.getElementById('project-overview-container');

        if (!overviewContainer) {
            console.error('Project overview container element not found');
            return;
        }

        overviewContainer.innerHTML = '';

        if (project.detailDescription && project.detailDescription.trim()) {
            console.log('Found project overview data:', project.detailDescription);
            overviewContainer.innerHTML = `
                <p class="text-lg text-gray-600 leading-relaxed mb-6">${project.detailDescription}</p>
            `;
        } else {
            console.log('No project overview data found');
            overviewContainer.innerHTML = '<p class="text-lg text-gray-600 leading-relaxed">No project overview available.</p>';
        }
    } catch (error) {
        console.error('Error loading project overview:', error);
    }
}

// Load key features for the project
function loadKeyFeatures(project) {
    try {
        console.log('Loading key features for project:', project);
        const featuresContainer = document.getElementById('key-features-container');

        if (!featuresContainer) {
            console.error('Key features container element not found');
            return;
        }

        featuresContainer.innerHTML = '';

        if (project.features && project.features.trim()) {
            console.log('Found features data:', project.features);
            const features = project.features.split('\n');

            const featuresList = document.createElement('ul');
            featuresList.className = 'space-y-3';

            features.forEach(feature => {
                if (feature.trim()) {
                    const li = document.createElement('li');
                    li.className = 'flex items-start mb-4';
                    li.innerHTML = `
                        <div class="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0 shadow-sm">
                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                            </svg>
                        </div>
                        <div class="flex-1">
                            <span class="text-gray-800 font-medium leading-relaxed">${feature.trim()}</span>
                        </div>
                    `;
                    featuresList.appendChild(li);
                }
            });

            featuresContainer.appendChild(featuresList);
        } else {
            console.log('No features data found');
            featuresContainer.innerHTML = '<p class="text-gray-600">No key features available.</p>';
        }
    } catch (error) {
        console.error('Error loading key features:', error);
    }
}

// Load results and impact for the project
function loadResultsAndImpact(project) {
    try {
        console.log('Loading results and impact for project:', project);
        const resultsContainer = document.getElementById('results-container');

        if (!resultsContainer) {
            console.error('Results container element not found');
            return;
        }

        resultsContainer.innerHTML = '';

        // Create result cards based on available data
        const resultCards = [];

        if (project.users) {
            resultCards.push({
                value: project.users,
                label: 'Active Users'
            });
        }

        if (project.rating) {
            const ratingValue = parseFloat(project.rating);
            if (!isNaN(ratingValue)) {
                resultCards.push({
                    value: generateStarRating(ratingValue),
                    label: 'App Store Rating'
                });
            } else {
                resultCards.push({
                    value: project.rating,
                    label: 'App Store Rating'
                });
            }
        }

        if (project.retention) {
            resultCards.push({
                value: project.retention,
                label: 'User Retention'
            });
        }

        if (resultCards.length > 0) {
            resultCards.forEach(card => {
                const cardDiv = document.createElement('div');
                cardDiv.className = 'bg-indigo-50 rounded-lg p-6';
                cardDiv.innerHTML = `
                    <div class="text-4xl font-bold text-indigo-600 mb-2">${card.value}</div>
                    <p class="text-gray-600">${card.label}</p>
                `;
                resultsContainer.appendChild(cardDiv);
            });
        } else {
            console.log('No results data found');
            const noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'col-span-full text-center text-gray-500 py-8';
            noResultsDiv.innerHTML = '<p>No results and impact data available for this project.</p>';
            resultsContainer.appendChild(noResultsDiv);
        }
    } catch (error) {
        console.error('Error loading results and impact:', error);
    }
}

// Load challenges and solutions for the project
function loadChallengesAndSolutions(project) {
    try {
        console.log('Loading challenges and solutions for project:', project);
        const challengesContainer = document.getElementById('challenges-container');

        if (!challengesContainer) {
            console.error('Challenges container element not found');
            return;
        }

        challengesContainer.innerHTML = '';

        if (project.challenges && project.challenges.trim()) {
            console.log('Found challenges data:', project.challenges);
            const challenges = project.challenges.split('\n');

            challenges.forEach(challenge => {
                if (challenge.trim()) {
                    const [challengeText, solutionText] = challenge.split('|');
                    if (challengeText && solutionText) {
                        const challengeCard = document.createElement('div');
                        challengeCard.className = 'bg-white rounded-lg p-6 shadow-md';
                        challengeCard.innerHTML = `
                            <h3 class="text-xl font-bold mb-4 text-red-600">Challenge</h3>
                            <p class="text-gray-600 mb-4">${challengeText.trim()}</p>
                            <h4 class="font-semibold mb-2">Solution</h4>
                            <p class="text-gray-600">${solutionText.trim()}</p>
                        `;
                        challengesContainer.appendChild(challengeCard);
                        console.log('Added challenge card:', challengeText, solutionText);
                    }
                }
            });
        } else {
            console.log('No challenges data found in project');
            // Show a default message if no challenges are available
            const noChallengesCard = document.createElement('div');
            noChallengesCard.className = 'col-span-full text-center text-gray-500 py-8';
            noChallengesCard.innerHTML = '<p>No challenges and solutions data available for this project.</p>';
            challengesContainer.appendChild(noChallengesCard);
        }
    } catch (error) {
        console.error('Error loading challenges and solutions:', error);
    }
}

// Generate star rating display
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starsHTML = '';

    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<span class="text-yellow-400">★</span>';
    }

    // Half star
    if (hasHalfStar) {
        starsHTML += '<span class="text-yellow-400">☆</span>';
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<span class="text-gray-300">☆</span>';
    }

    return starsHTML;
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

// Test function for manual scrolling
function testScroll() {
    const gallery = document.getElementById('screenshots-gallery');
    if (gallery) {
        console.log('Testing scroll functionality');
        console.log('Current scroll position:', gallery.scrollLeft);
        gallery.scrollBy({ left: 272, behavior: 'smooth' });
        console.log('Scroll test completed');
    } else {
        console.error('Gallery not found');
    }
}
