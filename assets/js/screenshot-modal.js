// ===================================
// SCREENSHOT MODAL FUNCTIONALITY
// ===================================

// Global variables for screen resolution
let currentScreenResolution = {
    width: 0,
    height: 0,
    ratio: 0
};

// Get current screen resolution
function getScreenResolution() {
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const ratio = screenWidth / screenHeight;
    
    currentScreenResolution = {
        width: screenWidth,
        height: screenHeight,
        ratio: ratio
    };
    
    return currentScreenResolution;
}

// Get current window resolution
function getWindowResolution() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const ratio = windowWidth / windowHeight;
    
    const windowResolution = {
        width: windowWidth,
        height: windowHeight,
        ratio: ratio
    };
    
    return windowResolution;
}

// Calculate optimal modal size based on screen resolution
function calculateOptimalModalSize() {
    const screenRes = getScreenResolution();
    const windowRes = getWindowResolution();
    
    // Calculate available space (accounting for padding and UI elements)
    const availableWidth = windowRes.width - 80; // 40px padding on each side
    const availableHeight = windowRes.height - 80; // 40px padding on each side
    
    // Use more conservative sizing to prevent over-enlargement
    const useFullScreen = false; // Disable automatic full screen for now
    
    // Calculate optimal size based on available space
    const maxModalWidth = Math.min(availableWidth, 1000); // Cap at 1000px
    const maxModalHeight = Math.min(availableHeight, 700); // Cap at 700px
    
    const optimalSize = {
        width: maxModalWidth,
        height: maxModalHeight,
        useFullScreen: useFullScreen
    };
    
    return optimalSize;
}

// Apply optimal sizing to modal based on screen resolution
function applyModalSizing(modal, optimalSize) {
    if (!modal) return;
    
    const modalContent = modal.querySelector('.modal-content');
    const modalImage = modal.querySelector('.modal-image');
    
    if (optimalSize.useFullScreen) {
        
        // Set modal to full screen
        modal.style.padding = '0';
        modal.classList.add('fullscreen-mode');
        
        if (modalContent) {
            modalContent.style.maxWidth = '100vw';
            modalContent.style.maxHeight = '100vh';
            modalContent.style.width = '100vw';
            modalContent.style.height = '100vh';
            modalContent.style.borderRadius = '0';
            modalContent.style.padding = '0';
        }
        
        if (modalImage) {
            // Full screen mode - use viewport units
            modalImage.style.maxWidth = '98vw';
            modalImage.style.maxHeight = '95vh';
            modalImage.style.width = 'auto';
            modalImage.style.height = 'auto';
            modalImage.style.objectFit = 'contain';
        }
    } else {
        // Constrained mode - use more conservative sizing
        modal.style.padding = '2rem';
        modal.classList.remove('fullscreen-mode');
        
        if (modalContent) {
            modalContent.style.maxWidth = `${optimalSize.width}px`;
            modalContent.style.maxHeight = `${optimalSize.height}px`;
            modalContent.style.width = 'auto';
            modalContent.style.height = 'auto';
            modalContent.style.borderRadius = '1rem';
            modalContent.style.padding = '2rem';
        }
        
        if (modalImage) {
            // Full screen sizing - let CSS handle it
            modalImage.style.maxWidth = '95vw';
            modalImage.style.maxHeight = '90vh';
            modalImage.style.width = 'auto';
            modalImage.style.height = 'auto';
            modalImage.style.objectFit = 'contain';
        }
    }
    
}

// Setup window resize handler for responsive modal
function setupModalResizeHandler(modal) {
    // Remove any existing resize handler
    window.removeEventListener('resize', handleModalResize);
    
    // Add new resize handler
    window.addEventListener('resize', handleModalResize);
    
    function handleModalResize() {
        const optimalSize = calculateOptimalModalSize();
        applyModalSizing(modal, optimalSize);
    }
    
}

// Display current resolution information
function displayResolutionInfo() {
    const screenRes = getScreenResolution();
    const windowRes = getWindowResolution();
    
    // Create or update resolution info element
    let resolutionInfo = document.getElementById('resolution-info');
    if (!resolutionInfo) {
        resolutionInfo = document.createElement('div');
        resolutionInfo.id = 'resolution-info';
        resolutionInfo.className = 'resolution-info';
        document.body.appendChild(resolutionInfo);
    }
    
    resolutionInfo.innerHTML = `
        <div class="resolution-details">
            <h4>📱 Screen Resolution</h4>
            <p>Width: ${screenRes.width}px | Height: ${screenRes.height}px | Ratio: ${screenRes.ratio.toFixed(2)}</p>
            <h4>🪟 Window Resolution</h4>
            <p>Width: ${windowRes.width}px | Height: ${windowRes.height}px | Ratio: ${windowRes.ratio.toFixed(2)}</p>
            <button id="toggle-fullscreen" class="fullscreen-toggle">
                ${windowRes.width >= 1200 && windowRes.height >= 800 ? '📱 Switch to Constrained' : '🖥️ Switch to Full Screen'}
            </button>
        </div>
    `;
    
    // Add toggle functionality
    const toggleBtn = document.getElementById('toggle-fullscreen');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleFullScreenMode);
    }
    
    console.log('📊 Resolution info displayed');
}

// Full screen image sizing
function ensureImageFitsScreen(imageElement) {
    if (!imageElement) return;
    
    // Use viewport units for responsive sizing
    imageElement.style.maxWidth = '95vw';
    imageElement.style.maxHeight = '90vh';
    imageElement.style.width = 'auto';
    imageElement.style.height = 'auto';
    imageElement.style.objectFit = 'contain';
    imageElement.style.opacity = '1';
}

// Toggle between full screen and constrained mode
function toggleFullScreenMode() {
    const modal = document.getElementById('screenshot-modal');
    if (!modal) return;
    
    const isFullScreen = modal.classList.contains('fullscreen-mode');
    const optimalSize = calculateOptimalModalSize();
    
    if (isFullScreen) {
        // Switch to constrained mode
        optimalSize.useFullScreen = false;
        optimalSize.width = Math.min(window.innerWidth - 80, 1000);
        optimalSize.height = Math.min(window.innerHeight - 80, 700);
    } else {
        // Switch to full screen mode
        optimalSize.useFullScreen = true;
        optimalSize.width = window.innerWidth;
        optimalSize.height = window.innerHeight;
    }
    
    applyModalSizing(modal, optimalSize);
    // Resolution info display removed as requested
}

// Clean up resolution info when modal is closed
function cleanupResolutionInfo() {
    const resolutionInfo = document.getElementById('resolution-info');
    if (resolutionInfo) {
        resolutionInfo.remove();
    }
    console.log('🧹 Resolution info cleaned up');
}

// Open screenshot modal
function openScreenshotModal(screenshot) {
    try {
        console.log('Opening screenshot modal:', screenshot);

        if (!screenshot || !screenshot.url) {
            console.error('Invalid screenshot data for modal:', screenshot);
            return;
        }

        const modal = document.getElementById('screenshot-modal');
        const modalImage = document.getElementById('modal-image');

        if (!modal || !modalImage) {
            console.error('Modal elements not found');
            return;
        }

        // Get screen resolution and calculate optimal modal size
        const optimalSize = calculateOptimalModalSize();
        
        // Apply optimal sizing to modal
        applyModalSizing(modal, optimalSize);

        // Get all screenshots for navigation
        const screenshotCards = document.querySelectorAll('#screenshots-gallery img[data-screenshot-index]');
        console.log('🔍 Found screenshot cards:', screenshotCards.length);

        currentScreenshots = Array.from(screenshotCards).map((img, index) => ({
            url: img.dataset.originalSrc, // Always use the original source URL
            title: img.alt,
            description: img.dataset.description || '',
            index: parseInt(img.dataset.screenshotIndex)
        }));

        // Find current screenshot index
        currentScreenshotIndex = currentScreenshots.findIndex(s => s.url === screenshot.url);
        if (currentScreenshotIndex === -1) {
            currentScreenshotIndex = 0;
        } 

        // Update modal content
        updateModalContent(currentScreenshots[currentScreenshotIndex], currentScreenshotIndex + 1, currentScreenshots.length);

        // Also set the modal image directly as a fallback
        if (modalImage) {
            modalImage.src = screenshot.url;
            modalImage.alt = screenshot.title || 'Screenshot';

            // Check if this is a failed image and show appropriate state
            if (screenshot.url.includes('assets/images/appstore.png')) {
                setTimeout(() => {
                    hideModalLoading();
                    showFailedImageInModal();
                }, 500);
            }
        }

        // Show modal
        modal.classList.remove('hidden');

        // Setup modal navigation
        setupModalNavigation();
        
        // Setup window resize handler for responsive modal
        setupModalResizeHandler(modal);
        
        // Resolution info display removed as requested

    } catch (error) {
        console.error('Error opening screenshot modal:', error);
    }
}

// Update modal content
function updateModalContent(screenshot, currentNumber, totalNumber) {

    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalCounter = document.getElementById('modal-counter');
    const modalLoading = document.getElementById('modal-loading');
    const modalFailed = document.getElementById('modal-failed');

    if (modalImage) {
        console.log('📸 Setting modal image source:', screenshot.url);
        // Reset states
        if (modalLoading) modalLoading.style.display = 'flex';
        if (modalFailed) modalFailed.style.display = 'none';
        modalImage.style.opacity = '0';

        modalImage.src = screenshot.url;
        modalImage.alt = screenshot.title || 'Screenshot';
        
        // Simple load event
        modalImage.onload = function() {
            this.style.opacity = '1';
            hideModalLoading();
        };
    }

    if (modalTitle) modalTitle.textContent = screenshot.title || 'Screenshot';
    if (modalDescription) modalDescription.textContent = screenshot.description || '';
    if (modalCounter) modalCounter.textContent = `${currentNumber} of ${totalNumber}`;

}

// Navigate to next screenshot
function nextScreenshot() {
    if (currentScreenshots.length === 0) return;

    currentScreenshotIndex = (currentScreenshotIndex + 1) % currentScreenshots.length;
    const screenshot = currentScreenshots[currentScreenshotIndex];
    updateModalContent(screenshot, currentScreenshotIndex + 1, currentScreenshots.length);
    updateModalNavigationButtons();
}

// Navigate to previous screenshot
function prevScreenshot() {
    if (currentScreenshots.length === 0) return;

    currentScreenshotIndex = (currentScreenshotIndex - 1 + currentScreenshots.length) % currentScreenshots.length;
    const screenshot = currentScreenshots[currentScreenshotIndex];
    updateModalContent(screenshot, currentScreenshotIndex + 1, currentScreenshots.length);
    updateModalNavigationButtons();
}

// Update modal navigation button states
function updateModalNavigationButtons() {
    const prevBtn = document.getElementById('modal-prev');
    const nextBtn = document.getElementById('modal-next');

    if (prevBtn && nextBtn) {
        // Show/hide buttons based on position
        prevBtn.style.opacity = currentScreenshotIndex === 0 ? '0.3' : '1';
        prevBtn.style.pointerEvents = currentScreenshotIndex === 0 ? 'none' : 'auto';

        nextBtn.style.opacity = currentScreenshotIndex === currentScreenshots.length - 1 ? '0.3' : '1';
        nextBtn.style.pointerEvents = currentScreenshotIndex === currentScreenshots.length - 1 ? '0.3' : 'auto';
    }
}

// Setup modal navigation event listeners
function setupModalNavigation() {
    const prevBtn = document.getElementById('modal-prev');
    const nextBtn = document.getElementById('modal-next');

    if (prevBtn && nextBtn) {
        // Remove existing listeners
        prevBtn.replaceWith(prevBtn.cloneNode(true));
        nextBtn.replaceWith(nextBtn.cloneNode(true));

        // Get new references
        const newPrevBtn = document.getElementById('modal-prev');
        const newNextBtn = document.getElementById('modal-next');

        // Add new listeners
        newPrevBtn.addEventListener('click', prevScreenshot);
        newNextBtn.addEventListener('click', nextScreenshot);

        // Update button states
        updateModalNavigationButtons();
    }
}

// Close screenshot modal
function closeScreenshotModal() {
    const modal = document.getElementById('screenshot-modal');
    modal.classList.add('hidden');

    // Reset navigation state
    currentScreenshotIndex = 0;
    currentScreenshots = [];
    
    // Resolution info cleanup removed as requested
    
    // Remove resize handler
    window.removeEventListener('resize', handleModalResize);
}

// Hide modal loading state
function hideModalLoading() {
    const modalLoading = document.getElementById('modal-loading');
    if (modalLoading) {
        modalLoading.style.display = 'none';
    }
}

// Show failed image state in modal
function showFailedImageInModal() {
    const modalFailed = document.getElementById('modal-failed');
    if (modalFailed) {
        modalFailed.style.display = 'flex';
    }
}

// Hide failed image state in modal
function hideFailedImageInModal() {
    const modalFailed = document.getElementById('modal-failed');
    if (modalFailed) {
        modalFailed.style.display = 'none';
    }
}

// Retry the current modal image
function retryCurrentModalImage() {
    if (currentScreenshots.length === 0 || currentScreenshotIndex < 0) return;

    const currentScreenshot = currentScreenshots[currentScreenshotIndex];
    console.log('🔄 Retrying current modal image:', currentScreenshot);

    // Reset modal states
    hideFailedImageInModal();

    // Update modal content (this will trigger loading state)
    updateModalContent(currentScreenshot, currentScreenshotIndex + 1, currentScreenshots.length);

    // Also retry the corresponding gallery image
    const galleryIndex = currentScreenshot.index;
    if (galleryIndex !== undefined) {
        retrySingleImage(galleryIndex);
    }
}

// Function to suggest alternative solutions for rate-limited images
function showImageAlternatives() {
    const helpMessage = document.createElement('div');
    helpMessage.className = 'mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg';
    helpMessage.innerHTML = `
        <div class="flex items-start space-x-3">
            <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
            </svg>
            <div class="flex-1">
                <h3 class="text-sm font-medium text-blue-800">Image Loading Tips</h3>
                <p class="text-sm text-blue-700 mt-1">
                    If screenshots continue to fail, try these solutions:
                </p>
                <ul class="text-sm text-blue-600 mt-2 list-disc list-inside space-y-1">
                    <li>Wait a few minutes and refresh the page</li>
                    <li>Use the "Retry Failed Images" button above</li>
                    <li>Check your internet connection</li>
                    <li>Try accessing the page later when Google's servers are less busy</li>
                </ul>
            </div>
        </div>
    `;

    // Remove any existing help message
    const existingHelp = document.querySelector('.bg-blue-50');
    if (existingHelp) {
        existingHelp.remove();
    }

    // Add the new help message
    const gallery = document.getElementById('screenshots-gallery');
    if (gallery && gallery.parentNode) {
        gallery.parentNode.insertBefore(helpMessage, gallery.nextSibling);
    }
}
