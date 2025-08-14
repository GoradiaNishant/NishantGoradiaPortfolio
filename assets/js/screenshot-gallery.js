// ===================================
// SCREENSHOT GALLERY FUNCTIONALITY
// ===================================

// Load screenshots for the project
async function loadScreenshots(project) {
    try {
        console.log('Loading screenshots for project:', project);
        const gallery = document.getElementById('screenshots-gallery');

        if (!gallery) {
            console.error('Screenshots gallery element not found');
            return;
        }

        gallery.innerHTML = '';

        if (project.screenshots && project.screenshots.length > 0) {
            console.log('Found screenshots:', project.screenshots);

            // Show screenshots immediately with lazy loading
            gallery.innerHTML = '';

            // Create and display all screenshot cards immediately
            project.screenshots.forEach((screenshot, index) => {
                const screenshotCard = createScreenshotCard(screenshot, index, true); // Assume loaded initially
                if (screenshotCard) {
                    gallery.appendChild(screenshotCard);
                }
            });

            // Track which images actually loaded successfully
            const results = project.screenshots.map((screenshot, index) => ({
                screenshot,
                index,
                loaded: false // Will be updated as images load
            }));

            // Setup navigation buttons
            setupScreenshotNavigation();

            // Monitor image loading progress and show helpful message if needed
            let loadedCount = 0;
            const totalCount = project.screenshots.length;

            // Update progress as images load
            const updateProgress = () => {
                // Count only the actual screenshot images, not any other images on the page
                const screenshotImages = document.querySelectorAll('#screenshots-gallery img[data-screenshot-index]');
                const successfulImages = Array.from(screenshotImages).filter(img =>
                    img.src.includes('play-lh.googleusercontent.com') && !img.src.includes('assets/images/appstore.png')
                );
                loadedCount = successfulImages.length;

                updateImageLoadingProgress(loadedCount, totalCount);

                // If all images are loaded, update the progress text
                if (loadedCount === totalCount) {
                    const progressText = document.querySelector('.image-loading-progress');
                    if (progressText) {
                        progressText.textContent = `All ${totalCount} images loaded successfully!`;
                        progressText.className = 'text-sm text-green-600 font-medium';
                    }
                }
            };

            // Check progress every 500ms
            const progressInterval = setInterval(updateProgress, 500);

            // Stop checking after 10 seconds
            setTimeout(() => {
                clearInterval(progressInterval);
                updateProgress(); // Final update

                // Only show warning if there are actually failed images
                const failedImages = document.querySelectorAll('#screenshots-gallery img[src="assets/images/appstore.png"]');
                if (failedImages.length > 0) {
                    const helpMessage = document.createElement('div');
                    helpMessage.className = 'mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg';
                    helpMessage.innerHTML = `
                        <div class="flex items-start space-x-3">
                            <svg class="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                            </svg>
                            <div class="flex-1">
                                <h3 class="text-sm font-medium text-yellow-800">Some screenshots failed to load</h3>
                                <p class="text-sm text-yellow-700 mt-1">
                                    ${failedImages.length} of ${totalCount} screenshots couldn't be loaded due to rate limiting from Google's servers. 
                                    This is a temporary issue and usually resolves itself. <strong>Tip: Wait a few minutes before retrying to avoid further rate limiting.</strong>
                                </p>
                                <div class="mt-3 flex space-x-3">
                                    <button onclick="retryFailedImages()" class="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors">
                                        Retry Failed Images
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;

                    // Remove any existing help message
                    const existingHelp = document.querySelector('.bg-yellow-50');
                    if (existingHelp) {
                        existingHelp.remove();
                    }

                    gallery.parentNode.insertBefore(helpMessage, gallery.nextSibling);
                }
            }, 10000); // Check after 10 seconds
        } else {
            console.log('No screenshots found for project');
            // Show placeholder if no screenshots
            gallery.innerHTML = `
                <div class="flex items-center justify-center w-full py-12">
                    <div class="text-center">
                        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <p class="text-gray-500 text-lg">No screenshots available yet</p>
                        <p class="text-gray-400">Screenshots will appear here once added</p>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading screenshots:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
    }
}

// Create screenshot card
function createScreenshotCard(screenshot, index, loaded = true) {
    try {
        console.log('Creating screenshot card with data:', screenshot);

        if (!screenshot || !screenshot.url || !screenshot.title) {
            console.error('Invalid screenshot data:', screenshot);
            return null;
        }

        // Initial orientation detection - will be updated when image loads
        let initialOrientation = 'portrait'; // Default fallback
        
        // First check if orientation is explicitly set in the data
        if (screenshot.orientation === 'landscape' || screenshot.orientation === 'portrait') {
            initialOrientation = screenshot.orientation;
            console.log(`📱 Using explicit orientation from data: ${initialOrientation}`);
        }
        // Then check if we have width/height data to determine orientation
        else if (screenshot.width && screenshot.height) {
            initialOrientation = screenshot.width > screenshot.height ? 'landscape' : 'portrait';
            console.log(`📱 Using width/height data: ${screenshot.width}x${screenshot.height} -> ${initialOrientation}`);
        }
        // For URLs, try to extract orientation from the URL itself (common patterns)
        else if (screenshot.url) {
            const url = screenshot.url.toLowerCase();
            if (url.includes('landscape') || url.includes('horizontal') || url.includes('wide')) {
                initialOrientation = 'landscape';
                console.log(`📱 Using URL pattern detection: landscape`);
            } else if (url.includes('portrait') || url.includes('vertical') || url.includes('tall')) {
                initialOrientation = 'portrait';
                console.log(`📱 Using URL pattern detection: portrait`);
            } else {
                console.log(`📱 No URL pattern found, using default: portrait`);
            }
        } else {
            console.log(`📱 No orientation data available, using default: portrait`);
        }

        console.log(`📱 Screenshot ${index} initial orientation detection:`, {
            explicitOrientation: screenshot.orientation,
            width: screenshot.width,
            height: screenshot.height,
            url: screenshot.url,
            detectedOrientation: initialOrientation
        });
        
        // Log the card creation
        console.log(`🎴 Creating screenshot card ${index} with class: screenshot-card ${initialOrientation}`);

        const card = document.createElement('div');
        card.className = `screenshot-card ${initialOrientation}`;
        card.setAttribute('data-initial-orientation', initialOrientation);
        card.innerHTML = `
            <div class="relative w-full h-full bg-gray-900 rounded-lg p-0">
                <!-- Device Frame -->
                <div class="w-full h-full bg-gray-800 rounded-lg overflow-hidden relative">
                    <!-- Loading State (shown initially) -->
                    <div class="absolute inset-0 bg-gray-700 flex items-center justify-center z-20" id="loading-${index}">
                        <div class="text-center">
                            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400 mx-auto mb-2"></div>
                            <p class="text-gray-300 text-xs">Loading...</p>
                        </div>
                    </div>
                    
                    <!-- Screenshot Image (Full Size) -->
                    <img src="assets/images/appstore.png" alt="${screenshot.title}" class="w-full h-full object-contain opacity-0 transition-opacity duration-300" 
                         data-screenshot-index="${index}" 
                         data-original-src="${screenshot.url}"
                         data-description="${screenshot.description || ''}"
                         data-initial-orientation="${initialOrientation}"
                         data-url="${screenshot.url}">
                    
                    <!-- Failed State Indicator (shown when image fails) -->
                    <div class="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center z-15 hidden" id="failed-${index}" style="background: rgba(239, 68, 68, 0.3);">
                        <div class="text-center">
                            <svg class="w-8 h-8 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                            </svg>
                            <p class="text-red-600 text-xs font-medium">Failed to load</p>
                            <button onclick="retrySingleImage(${index})" class="mt-2 text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors">
                                Retry
                            </button>
                        </div>
                    </div>
                    
                    <!-- Status Bar Overlay (Portrait Only) -->
                    <div class="absolute top-0 left-0 right-0 h-6 bg-black bg-opacity-80 flex items-center justify-between px-3 z-10 status-bar-overlay ${initialOrientation === 'landscape' ? 'hidden' : ''}">
                        <div class="flex items-center space-x-1">
                            <div class="w-2 h-2 bg-white rounded-full"></div>
                            <div class="w-2 h-2 bg-white rounded-full"></div>
                            <div class="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <div class="text-white text-xs font-medium">9:41</div>
                        <div class="flex items-center space-x-1">
                            <div class="w-3 h-2 bg-white rounded-sm"></div>
                            <div class="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                    </div>
                    
                    <!-- Home Indicator Overlay (Portrait Only) -->
                    <div class="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full opacity-80 home-indicator-overlay ${initialOrientation === 'landscape' ? 'hidden' : ''}"></div>
                </div>
            </div>
        `;

        // Add click event to open modal
        card.addEventListener('click', () => {
            openScreenshotModal(screenshot);
        });

        // Load the image with caching after a short delay
        setTimeout(() => {
            const img = card.querySelector('img');
            if (img) {
                loadScreenshotWithCache(img, index);
            }
        }, index * 200); // Stagger loading to avoid overwhelming the CDN

        return card;
    } catch (error) {
        console.error('Error creating screenshot card:', error);
        console.error('Screenshot data:', screenshot);
        return null;
    }
}

// Handle screenshot image load and orientation detection
function handleScreenshotLoad(img, index, originalUrl) {
    try {
        console.log('Screenshot loaded successfully:', originalUrl);
        console.log('Image dimensions:', img.naturalWidth, 'x', img.naturalHeight);

        // Remove opacity and show image
        img.style.opacity = '1';

        // Hide loading state
        hideLoadingState(index);
        hideFailedState(index);

        // Detect actual orientation from image dimensions using utility function
        const actualOrientation = detectImageOrientation(img.naturalWidth, img.naturalHeight);
        const initialOrientation = img.dataset.initialOrientation;
        const deviceType = getDeviceType(img.naturalWidth, img.naturalHeight);

        console.log(`📸 Screenshot ${index} - Initial: ${initialOrientation}, Actual: ${actualOrientation}, Device: ${deviceType}`);
        console.log(`📐 Image dimensions: ${img.naturalWidth}x${img.naturalHeight} (aspect ratio: ${(img.naturalWidth/img.naturalHeight).toFixed(3)})`);

        // Get the card element
        const card = img.closest('.screenshot-card');
        if (!card) {
            console.error('Card element not found for screenshot', index);
            return;
        }

        // Update orientation if it differs from initial assumption
        if (initialOrientation !== actualOrientation) {
            console.log(`🔄 Updating orientation for screenshot ${index}: ${initialOrientation} -> ${actualOrientation}`);
            console.log(`📐 Image dimensions: ${img.naturalWidth}x${img.naturalHeight} (aspect ratio: ${(img.naturalWidth/img.naturalHeight).toFixed(2)})`);

            // Update the card class
            card.classList.remove('portrait', 'landscape');
            card.classList.add(actualOrientation);
            
            // Add animation class to show the update
            card.classList.add('orientation-updating');
            setTimeout(() => {
                card.classList.remove('orientation-updating');
            }, 500);

            // Update the card data attribute
            card.setAttribute('data-initial-orientation', actualOrientation);
            card.setAttribute('data-device-type', deviceType);

            // Update the image data attribute
            img.dataset.initialOrientation = actualOrientation;
            img.dataset.deviceType = deviceType;

            // Update status bar and home indicator visibility
            const statusBar = card.querySelector('.status-bar-overlay');
            const homeIndicator = card.querySelector('.home-indicator-overlay');

            if (statusBar) {
                if (actualOrientation === 'landscape') {
                    statusBar.classList.add('hidden');
                } else {
                    statusBar.classList.remove('hidden');
                }
            }

            if (homeIndicator) {
                if (actualOrientation === 'landscape') {
                    homeIndicator.classList.add('hidden');
                } else {
                    homeIndicator.classList.remove('hidden');
                }
            }

            console.log(`✅ Orientation updated successfully for screenshot ${index}`);
        } else {
            console.log(`✅ Orientation correct for screenshot ${index}: ${actualOrientation}`);
        }

        // Log detailed resolution information
        const resolution = `${img.naturalWidth}x${img.naturalHeight}`;
        const aspectRatio = (img.naturalWidth / img.naturalHeight).toFixed(2);
        console.log(`📐 Screenshot ${index} resolution: ${resolution} (aspect ratio: ${aspectRatio})`);
        console.log(`📱 Device detected: ${deviceType}`);

    } catch (error) {
        console.error('Error in handleScreenshotLoad:', error);
        // Fallback to basic load handling
        img.style.opacity = '1';
        hideLoadingState(index);
        hideFailedState(index);
    }
}

// Load screenshot with caching
function loadScreenshotWithCache(img, index) {
    const url = img.dataset.url;
    if (!url) return;

    loadImageWithCache(img, url, {
        onLoad: (imgElement, loadedUrl) => {
            handleScreenshotLoad(imgElement, index, loadedUrl);
        },
        onError: (imgElement, failedUrl, error) => {
            console.log('❌ Screenshot failed to load:', failedUrl, error);
            hideLoadingState(index);
            showFailedState(index);
        },
        onRetry: (imgElement, retryUrl, retryCount, delay) => {
            console.log(`🔄 Retrying screenshot ${index} (attempt ${retryCount}) in ${delay}ms`);
            // Update loading state to show retry progress
            const loadingElement = document.getElementById(`loading-${index}`);
            if (loadingElement) {
                const loadingText = loadingElement.querySelector('p');
                if (loadingText) {
                    loadingText.textContent = `Retrying... (${retryCount})`;
                }
            }
        }
    });
}

// Utility function to detect image orientation
function detectImageOrientation(width, height) {
    if (!width || !height) return 'portrait'; // Default fallback
    
    // Check if dimensions might be swapped (common with some image formats)
    let actualWidth = width;
    let actualHeight = height;
    
    // If the "width" is much larger than "height", they might be swapped
    // This is common with mobile screenshots that are actually portrait
    if (width > height * 2) {
        console.log(`🔍 Possible dimension swap detected: ${width}x${height}`);
        console.log(`🔍 Swapping dimensions: ${height}x${width}`);
        actualWidth = height;
        actualHeight = width;
    }
    
    const aspectRatio = actualWidth / actualHeight;
    
    // Define thresholds for orientation detection
    const LANDSCAPE_THRESHOLD = 1.1; // Width is 10% more than height
    const PORTRAIT_THRESHOLD = 0.9;  // Height is 10% more than width
    
    console.log(`🔍 Orientation detection: ${actualWidth}x${actualHeight}, aspect ratio: ${aspectRatio.toFixed(3)}`);
    
    if (aspectRatio >= LANDSCAPE_THRESHOLD) {
        console.log(`🔍 Detected as LANDSCAPE (ratio >= ${LANDSCAPE_THRESHOLD})`);
        return 'landscape';
    } else if (aspectRatio <= PORTRAIT_THRESHOLD) {
        console.log(`🔍 Detected as PORTRAIT (ratio <= ${PORTRAIT_THRESHOLD})`);
        return 'portrait';
    } else {
        // For square-ish images, use a more specific detection
        const result = actualWidth > actualHeight ? 'landscape' : 'portrait';
        console.log(`🔍 Square-ish image, using width > height: ${result}`);
        return result;
    }
}

// Function to get device type based on resolution
function getDeviceType(width, height) {
    const orientation = detectImageOrientation(width, height);
    
    if (orientation === 'portrait') {
        // Portrait device detection
        if (width >= 1170 && height >= 2532) return 'iPhone 13 Pro Max';
        if (width >= 1125 && height >= 2436) return 'iPhone 12/13/14';
        if (width >= 828 && height >= 1792) return 'iPhone XR/11';
        if (width >= 750 && height >= 1334) return 'iPhone 6/7/8';
        return 'Mobile Device';
    } else {
        // Landscape device detection
        if (width >= 2048 && height >= 1536) return 'iPad Pro';
        if (width >= 1668 && height >= 2388) return 'iPad Air';
        if (width >= 1620 && height >= 2160) return 'iPad';
        if (width >= 1920 && height >= 1080) return 'Desktop';
        return 'Tablet/Desktop';
    }
}

// Setup screenshot navigation
function setupScreenshotNavigation() {
    const gallery = document.getElementById('screenshots-gallery');
    const prevBtn = document.getElementById('screenshot-prev');
    const nextBtn = document.getElementById('screenshot-next');

    console.log('Setting up screenshot navigation');
    console.log('Gallery:', gallery);
    console.log('Prev button:', prevBtn);
    console.log('Next button:', nextBtn);

    if (!gallery || !prevBtn || !nextBtn) {
        console.error('Navigation elements not found');
        return;
    }

    // Navigation button click handlers
    prevBtn.addEventListener('click', () => {
        console.log('Previous button clicked');
        gallery.scrollBy({ left: -272, behavior: 'smooth' }); // 256px card + 16px gap
    });

    nextBtn.addEventListener('click', () => {
        console.log('Next button clicked');
        gallery.scrollBy({ left: 272, behavior: 'smooth' }); // 256px card + 16px gap
    });

    // Show/hide navigation buttons based on scroll position
    function updateNavigationButtons() {
        const isAtStart = gallery.scrollLeft === 0;
        const isAtEnd = gallery.scrollLeft >= gallery.scrollWidth - gallery.clientWidth;

        console.log('Scroll position:', gallery.scrollLeft);
        console.log('Scroll width:', gallery.scrollWidth);
        console.log('Client width:', gallery.clientWidth);
        console.log('Is at start:', isAtStart);
        console.log('Is at end:', isAtEnd);

        prevBtn.style.opacity = isAtStart ? '0.3' : '1';
        prevBtn.style.pointerEvents = isAtStart ? 'none' : 'auto';

        nextBtn.style.opacity = isAtEnd ? '0.3' : '1';
        nextBtn.style.pointerEvents = isAtEnd ? 'none' : 'auto';
    }

    // Update buttons on scroll
    gallery.addEventListener('scroll', updateNavigationButtons);

    // Initial button state
    updateNavigationButtons();

    console.log('Screenshot navigation setup complete');
}

// Manual function to retry loading failed images with intelligent rate limiting
async function retryFailedImages() {
            const failedImages = document.querySelectorAll('#screenshots-gallery img[src="assets/images/appstore.png"]');
    console.log(`🔄 Retrying ${failedImages.length} failed images with intelligent rate limiting...`);

    if (failedImages.length === 0) {
        console.log('✅ No failed images to retry');
        return;
    }

    // Show retry progress
    const retryButton = document.querySelector('button[onclick="retryFailedImages()"]');
    if (retryButton) {
        retryButton.textContent = 'Retrying...';
        retryButton.disabled = true;
    }

    // Use batch loading with throttling
    await loadImagesWithThrottling(Array.from(failedImages), 2, 2000);

    // Reset retry button
    setTimeout(() => {
        if (retryButton) {
            retryButton.textContent = 'Retry Failed Images';
            retryButton.disabled = false;
        }
    }, 2000);
}

// Function to manually reload all screenshots
async function reloadAllScreenshots() {
    console.log('🔄 Reloading all screenshots...');
    const project = await getCurrentProject();
    if (project) {
        await loadScreenshots(project);
    }
}

// Helper function to get current project data
async function getCurrentProject() {
    try {
        const projects = await FirebaseDB.getProjects();
        const urlParams = new URLSearchParams(window.location.search);
        const projectIndex = parseInt(urlParams.get('project')) || 0;
        return projects[projectIndex];
    } catch (error) {
        console.error('Error getting current project:', error);
        return null;
    }
}

// Hide loading state for a specific screenshot
function hideLoadingState(index) {
    const loadingElement = document.getElementById(`loading-${index}`);
    if (loadingElement) {
        loadingElement.style.opacity = '0';
        setTimeout(() => {
            loadingElement.style.display = 'none';
        }, 300);
    }
}

// Show loading state for a specific screenshot (for retry)
function showLoadingState(index) {
    const loadingElement = document.getElementById(`loading-${index}`);
    const failedElement = document.getElementById(`failed-${index}`);
    if (loadingElement) {
        loadingElement.style.display = 'flex';
        loadingElement.style.opacity = '1';
    }
    // Hide failed state when retrying
    if (failedElement) {
        failedElement.style.display = 'none';
    }
}

// Show failed state for a specific screenshot
function showFailedState(index) {
    const failedElement = document.getElementById(`failed-${index}`);
    if (failedElement) {
        failedElement.style.display = 'flex';
    }
}

// Hide failed state for a specific screenshot
function hideFailedState(index) {
    const failedElement = document.getElementById(`failed-${index}`);
    if (failedElement) {
        failedElement.style.display = 'none';
    }
}

// Show loading progress for individual images
function updateImageLoadingProgress(loadedCount, totalCount) {
    const progressText = document.querySelector('.image-loading-progress');
    if (progressText) {
        if (loadedCount === totalCount) {
            progressText.textContent = `All ${totalCount} images loaded successfully!`;
            progressText.className = 'text-sm text-green-600 font-medium';
        }
    }
}

// Retry a single image
async function retrySingleImage(index) {
    console.log(`🔄 Retrying single image at index ${index}`);

    const img = document.querySelector(`img[data-screenshot-index="${index}"]`);
    if (!img) {
        console.error('Image element not found for retry');
        return;
    }

    // Show loading state
    showLoadingState(index);
    hideFailedState(index);

    // Use the caching system to retry
    loadScreenshotWithCache(img, index);
}
