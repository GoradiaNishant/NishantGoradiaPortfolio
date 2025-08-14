// ===================================
// SCREENSHOT MODAL FUNCTIONALITY
// ===================================

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

        // Get all screenshots for navigation
        const screenshotCards = document.querySelectorAll('#screenshots-gallery img[data-screenshot-index]');
        console.log('🔍 Found screenshot cards:', screenshotCards.length);

        currentScreenshots = Array.from(screenshotCards).map((img, index) => ({
            url: img.dataset.originalSrc, // Always use the original source URL
            title: img.alt,
            description: img.dataset.description || '',
            index: parseInt(img.dataset.screenshotIndex)
        }));

        console.log('📋 Built screenshots array:', currentScreenshots);
        console.log('🎯 Current screenshot URL:', screenshot.url);

        // Find current screenshot index
        currentScreenshotIndex = currentScreenshots.findIndex(s => s.url === screenshot.url);
        if (currentScreenshotIndex === -1) {
            console.log('⚠️ Screenshot not found in array, using index 0');
            currentScreenshotIndex = 0;
        } else {
            console.log('✅ Found screenshot at index:', currentScreenshotIndex);
        }

        console.log('🖼️ Updating modal with screenshot:', currentScreenshots[currentScreenshotIndex]);

        // Update modal content
        updateModalContent(currentScreenshots[currentScreenshotIndex], currentScreenshotIndex + 1, currentScreenshots.length);

        // Also set the modal image directly as a fallback
        if (modalImage) {
            console.log('🔄 Setting modal image directly as fallback:', screenshot.url);
            modalImage.src = screenshot.url;
            modalImage.alt = screenshot.title || 'Screenshot';

            // Check if this is a failed image and show appropriate state
            if (screenshot.url.includes('assets/images/appstore.png')) {
                console.log('⚠️ Screenshot failed, showing failed state in modal');
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

    } catch (error) {
        console.error('Error opening screenshot modal:', error);
    }
}

// Update modal content
function updateModalContent(screenshot, currentNumber, totalNumber) {
    console.log('🔄 Updating modal content:', screenshot);

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
    }

    if (modalTitle) modalTitle.textContent = screenshot.title || 'Screenshot';
    if (modalDescription) modalDescription.textContent = screenshot.description || '';
    if (modalCounter) modalCounter.textContent = `${currentNumber} of ${totalNumber}`;

    console.log('✅ Modal content updated successfully');
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
