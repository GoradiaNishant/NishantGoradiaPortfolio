// ===================================
// SCREENSHOT MODAL FUNCTIONALITY
// ===================================

// Global variables for screen resolution
let currentScreenResolution = {
    width: 0,
    height: 0,
    ratio: 0
};

// Zoom functionality variables
let zoomState = {
    scale: 1,
    translateX: 0,
    translateY: 0,
    isZoomed: false,
    isDragging: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    initialDistance: 0,
    initialScale: 1
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
        
        // Initialize zoom functionality after modal is shown
        setTimeout(() => {
            initializeZoom();
        }, 100);
        
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
    
    // Reset zoom state
    resetZoom();
    
    // Remove zoom container if it exists
    const zoomContainer = modal.querySelector('.zoom-container');
    if (zoomContainer) {
        const image = zoomContainer.querySelector('#modal-image');
        if (image) {
            // Move image back to original position
            const originalContainer = modal.querySelector('.relative');
            if (originalContainer) {
                originalContainer.appendChild(image);
            }
        }
        zoomContainer.remove();
    }
    
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

// ===================================
// ZOOM FUNCTIONALITY
// ===================================

// Initialize zoom functionality for modal image
function initializeZoom() {
    const modalImage = document.getElementById('modal-image');
    const modalContainer = document.querySelector('#screenshot-modal .relative');
    
    if (!modalImage || !modalContainer) return;
    
    // Reset zoom state
    resetZoom();
    
    // Add zoom container wrapper
    if (!modalContainer.querySelector('.zoom-container')) {
        const zoomContainer = document.createElement('div');
        zoomContainer.className = 'zoom-container';
        zoomContainer.style.cssText = `
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
            cursor: grab;
        `;
        
        // Move image into zoom container
        modalImage.parentNode.insertBefore(zoomContainer, modalImage);
        zoomContainer.appendChild(modalImage);
        
        // Add zoom controls
        addZoomControls(zoomContainer);
    }
    
    // Setup event listeners
    setupZoomEventListeners(modalImage);
}

// Add zoom controls
function addZoomControls(container) {
    const controls = document.createElement('div');
    controls.className = 'zoom-controls';
    controls.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 30;
        display: flex;
        gap: 8px;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    controls.innerHTML = `
        <button id="zoom-in" class="zoom-btn" title="Zoom In">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
        </button>
        <button id="zoom-out" class="zoom-btn" title="Zoom Out">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13H5v-2h14v2z"/>
            </svg>
        </button>
        <button id="zoom-reset" class="zoom-btn" title="Reset Zoom">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
            </svg>
        </button>
    `;
    
    container.appendChild(controls);
    
    // Add control event listeners
    document.getElementById('zoom-in').addEventListener('click', () => zoomIn());
    document.getElementById('zoom-out').addEventListener('click', () => zoomOut());
    document.getElementById('zoom-reset').addEventListener('click', () => resetZoom());
}

// Setup zoom event listeners
function setupZoomEventListeners(image) {
    const container = image.closest('.zoom-container');
    if (!container) return;
    
    // Mouse events for desktop
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('wheel', handleWheel);
    
    // Touch events for mobile
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    
    // Show/hide controls on hover
    container.addEventListener('mouseenter', () => {
        const controls = container.querySelector('.zoom-controls');
        if (controls) controls.style.opacity = '1';
    });
    
    container.addEventListener('mouseleave', () => {
        const controls = container.querySelector('.zoom-controls');
        if (controls) controls.style.opacity = '0';
    });
    
    // Prevent context menu
    container.addEventListener('contextmenu', (e) => e.preventDefault());
}

// Mouse event handlers
function handleMouseDown(e) {
    if (zoomState.scale > 1) {
        zoomState.isDragging = true;
        zoomState.startX = e.clientX - zoomState.translateX;
        zoomState.startY = e.clientY - zoomState.translateY;
        e.preventDefault();
    }
}

function handleMouseMove(e) {
    if (zoomState.isDragging && zoomState.scale > 1) {
        zoomState.translateX = e.clientX - zoomState.startX;
        zoomState.translateY = e.clientY - zoomState.startY;
        applyZoomTransform();
        e.preventDefault();
    }
}

function handleMouseUp() {
    zoomState.isDragging = false;
}

function handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    const newScale = Math.max(0.5, Math.min(3, zoomState.scale + delta));
    
    if (newScale !== zoomState.scale) {
        // Calculate zoom center
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = e.clientX - rect.left;
        const centerY = e.clientY - rect.top;
        
        zoomAtPoint(newScale, centerX, centerY);
    }
}

// Touch event handlers
let lastTapTime = 0;
let tapCount = 0;

function handleTouchStart(e) {
    if (e.touches.length === 1) {
        // Single touch - check for double tap
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTapTime;
        
        if (tapLength < 500 && tapLength > 0) {
            // Double tap detected - reset zoom
            resetZoom();
            e.preventDefault();
            return;
        }
        
        lastTapTime = currentTime;
        
        // Single touch - start dragging
        if (zoomState.scale > 1) {
            zoomState.isDragging = true;
            zoomState.startX = e.touches[0].clientX - zoomState.translateX;
            zoomState.startY = e.touches[0].clientY - zoomState.translateY;
        }
    } else if (e.touches.length === 2) {
        // Two touches - start pinch zoom
        zoomState.initialDistance = getDistance(e.touches[0], e.touches[1]);
        zoomState.initialScale = zoomState.scale;
        e.preventDefault();
    }
}

function handleTouchMove(e) {
    if (e.touches.length === 1 && zoomState.isDragging && zoomState.scale > 1) {
        // Single touch dragging
        zoomState.translateX = e.touches[0].clientX - zoomState.startX;
        zoomState.translateY = e.touches[0].clientY - zoomState.startY;
        applyZoomTransform();
        e.preventDefault();
    } else if (e.touches.length === 2) {
        // Two touches - pinch zoom
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const scale = (currentDistance / zoomState.initialDistance) * zoomState.initialScale;
        const newScale = Math.max(0.5, Math.min(3, scale));
        
        if (newScale !== zoomState.scale) {
            // Calculate zoom center
            const rect = e.currentTarget.getBoundingClientRect();
            const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
            const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
            
            zoomAtPoint(newScale, centerX, centerY);
        }
        e.preventDefault();
    }
}

function handleTouchEnd(e) {
    if (e.touches.length === 0) {
        zoomState.isDragging = false;
    }
}

// Utility functions
function getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function zoomAtPoint(newScale, centerX, centerY) {
    const oldScale = zoomState.scale;
    zoomState.scale = newScale;
    
    // Calculate new translation to zoom at the point
    const scaleRatio = newScale / oldScale;
    zoomState.translateX = centerX - (centerX - zoomState.translateX) * scaleRatio;
    zoomState.translateY = centerY - (centerY - zoomState.translateY) * scaleRatio;
    
    applyZoomTransform();
}

function applyZoomTransform() {
    const image = document.getElementById('modal-image');
    if (!image) return;
    
    // Constrain translation to keep image visible
    const container = image.closest('.zoom-container');
    if (container) {
        const containerRect = container.getBoundingClientRect();
        const imageRect = image.getBoundingClientRect();
        
        const maxTranslateX = Math.max(0, (imageRect.width * zoomState.scale - containerRect.width) / 2);
        const maxTranslateY = Math.max(0, (imageRect.height * zoomState.scale - containerRect.height) / 2);
        
        zoomState.translateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, zoomState.translateX));
        zoomState.translateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, zoomState.translateY));
    }
    
    // Apply transform
    image.style.transform = `translate(${zoomState.translateX}px, ${zoomState.translateY}px) scale(${zoomState.scale})`;
    image.style.cursor = zoomState.scale > 1 ? 'grab' : 'default';
    
    // Update zoom state
    zoomState.isZoomed = zoomState.scale > 1;
    
    // Show/hide zoom controls
    const controls = container?.querySelector('.zoom-controls');
    if (controls) {
        controls.style.opacity = zoomState.isZoomed ? '1' : '0';
    }
    
    // Show zoom level indicator
    showZoomLevelIndicator();
}

// Show zoom level indicator
function showZoomLevelIndicator() {
    let indicator = document.getElementById('zoom-level-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'zoom-level-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;
        document.body.appendChild(indicator);
    }
    
    const zoomPercent = Math.round(zoomState.scale * 100);
    indicator.textContent = `${zoomPercent}%`;
    indicator.style.opacity = '1';
    
    // Hide indicator after 2 seconds
    clearTimeout(indicator.hideTimeout);
    indicator.hideTimeout = setTimeout(() => {
        indicator.style.opacity = '0';
    }, 2000);
}

// Zoom control functions
function zoomIn() {
    const newScale = Math.min(3, zoomState.scale + 0.5);
    zoomAtPoint(newScale, 0, 0);
}

function zoomOut() {
    const newScale = Math.max(0.5, zoomState.scale - 0.5);
    zoomAtPoint(newScale, 0, 0);
}

function resetZoom() {
    zoomState.scale = 1;
    zoomState.translateX = 0;
    zoomState.translateY = 0;
    zoomState.isZoomed = false;
    zoomState.isDragging = false;
    
    const image = document.getElementById('modal-image');
    if (image) {
        image.style.transform = 'translate(0px, 0px) scale(1)';
        image.style.cursor = 'default';
    }
    
    // Hide zoom controls
    const controls = document.querySelector('.zoom-controls');
    if (controls) {
        controls.style.opacity = '0';
    }
    
    // Hide zoom level indicator
    const indicator = document.getElementById('zoom-level-indicator');
    if (indicator) {
        indicator.style.opacity = '0';
    }
}
