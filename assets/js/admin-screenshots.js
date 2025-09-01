// ===================================
// ADMIN SCREENSHOT MANAGEMENT
// ===================================

// Ensure currentScreenshots is available globally
if (typeof currentScreenshots === 'undefined') {
    window.currentScreenshots = [];
}

// Screenshot management functions
function addScreenshot() {
    console.log('🖼️ Adding screenshot...');
    
    const fileInput = document.getElementById('screenshot-file');
    const urlInput = document.getElementById('screenshot-url');
    const titleInput = document.getElementById('screenshot-title');
    const descriptionInput = document.getElementById('screenshot-description');
    const orientationInput = document.getElementById('screenshot-orientation');

    // Check if elements exist
    if (!fileInput || !urlInput || !titleInput || !descriptionInput || !orientationInput) {
        console.error('❌ Screenshot form elements not found');
        alert('Error: Screenshot form elements not found. Please refresh the page.');
        return;
    }

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const orientation = orientationInput.value;

    if (!title) {
        alert('Please enter a title for the screenshot');
        return;
    }

    let screenshot = {
        title: title,
        description: description,
        orientation: orientation === 'auto' ? null : orientation
    };

    console.log('📝 Screenshot data:', screenshot);

    // Handle file upload
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        console.log('📁 File selected:', file.name, file.size, 'bytes');
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file (JPG, PNG, WebP, etc.)');
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            console.log('✅ File loaded successfully');
            screenshot.url = e.target.result;
            currentScreenshots.push(screenshot);
            updateScreenshotsPreview();
            clearScreenshotForm();
            console.log('📸 Screenshot added. Total screenshots:', currentScreenshots.length);
            
            // Check sizes after adding
            checkScreenshotSizes();
        };
        
        reader.onerror = function() {
            console.error('❌ Error reading file');
            alert('Error reading the file. Please try again.');
        };
        
        reader.readAsDataURL(file);
    }
    // Handle URL input
    else if (urlInput.value.trim()) {
        const url = urlInput.value.trim();
        console.log('🔗 URL provided:', url);
        
        // Basic URL validation
        try {
            new URL(url);
        } catch (e) {
            alert('Please enter a valid URL');
            return;
        }
        
        screenshot.url = url;
        currentScreenshots.push(screenshot);
        updateScreenshotsPreview();
        clearScreenshotForm();
        console.log('📸 Screenshot added. Total screenshots:', currentScreenshots.length);
    }
    else {
        alert('Please either upload a file or enter a URL');
        return;
    }
}

// Update screenshots preview
function updateScreenshotsPreview() {
    console.log('🔄 Updating screenshots preview...');
    
    const previewContainer = document.getElementById('screenshots-preview');
    if (!previewContainer) {
        console.error('❌ Screenshots preview container not found');
        return;
    }

    console.log('📸 Total screenshots to display:', currentScreenshots.length);
    previewContainer.innerHTML = '';

    currentScreenshots.forEach((screenshot, index) => {
        const screenshotElement = document.createElement('div');
        screenshotElement.className = 'relative bg-white rounded-lg shadow-md p-4 mb-4 cursor-move';
        screenshotElement.draggable = true;
        screenshotElement.dataset.index = index;

        // Add drag event listeners
        screenshotElement.addEventListener('dragstart', handleDragStart);
        screenshotElement.addEventListener('dragover', handleDragOver);
        screenshotElement.addEventListener('dragenter', handleDragEnter);
        screenshotElement.addEventListener('dragleave', handleDragLeave);
        screenshotElement.addEventListener('drop', handleDrop);
        screenshotElement.addEventListener('dragend', handleDragEnd);

        screenshotElement.innerHTML = `
            <div class="flex items-center space-x-4">
                <div class="flex-shrink-0">
                    <img src="${screenshot.url}" alt="${screenshot.title}" class="w-16 h-16 object-cover rounded">
                </div>
                <div class="flex-1">
                    <h4 class="text-lg font-semibold">${screenshot.title}</h4>
                    <p class="text-gray-600">${screenshot.description || 'No description'}</p>
                    <p class="text-sm text-gray-500">Orientation: ${screenshot.orientation || 'Auto'}</p>
                </div>
                <button onclick="removeScreenshot(${index})" class="text-red-600 hover:text-red-800">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        `;

        previewContainer.appendChild(screenshotElement);
    });
}

// Drag and drop functionality
function handleDragStart(e) {
    draggedIndex = parseInt(this.dataset.index);
    this.style.opacity = '0.5';
    console.log('Drag start from index:', draggedIndex);
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDragEnter(e) {
    e.preventDefault();
    this.classList.add('border-blue-500', 'border-2');
}

function handleDragLeave(e) {
    this.classList.remove('border-blue-500', 'border-2');
}

function handleDrop(e) {
    e.preventDefault();
    console.log('Drop event');
    this.classList.remove('border-blue-500', 'border-2');
    
    const dropIndex = parseInt(this.dataset.index);
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
        console.log('Moving from index', draggedIndex, 'to index', dropIndex);
        
        // Reorder the screenshots array
        const [movedScreenshot] = currentScreenshots.splice(draggedIndex, 1);
        currentScreenshots.splice(dropIndex, 0, movedScreenshot);
        
        // Update the preview
        updateScreenshotsPreview();
    }
}

function handleDragEnd(e) {
    console.log('Drag end');
    this.style.opacity = '1';
    draggedIndex = null;
}

// Remove screenshot
function removeScreenshot(index) {
    currentScreenshots.splice(index, 1);
    updateScreenshotsPreview();
}

// Clear screenshot form
function clearScreenshotForm() {
    const fileInput = document.getElementById('screenshot-file');
    const urlInput = document.getElementById('screenshot-url');
    const titleInput = document.getElementById('screenshot-title');
    const descriptionInput = document.getElementById('screenshot-description');
    const orientationInput = document.getElementById('screenshot-orientation');

    if (fileInput) fileInput.value = '';
    if (urlInput) urlInput.value = '';
    if (titleInput) titleInput.value = '';
    if (descriptionInput) descriptionInput.value = '';
    if (orientationInput) orientationInput.value = 'auto';
}

// Clear all screenshots
function clearScreenshots() {
    currentScreenshots = [];
    updateScreenshotsPreview();
}

// Get screenshots from preview
function getScreenshotsFromPreview() {
    console.log('📸 Getting screenshots from preview...');
    console.log('📸 Current screenshots array:', currentScreenshots);
    console.log('📸 Number of screenshots:', currentScreenshots.length);
    
    const screenshots = [...currentScreenshots];
    console.log('📸 Returning screenshots:', screenshots);
    
    return screenshots;
}

// Load screenshots to preview
function loadScreenshotsToPreview(screenshots) {
    currentScreenshots = [...screenshots];
    updateScreenshotsPreview();
}

// Test function to add sample screenshots for testing drag-and-drop
function addTestScreenshots() {
    const testScreenshots = [
        {
            title: 'Mobile Home Screen',
            description: 'Portrait mobile screenshot',
            url: 'https://picsum.photos/300/600?random=1',
            orientation: 'portrait'
        },
        {
            title: 'Tablet Dashboard',
            description: 'Landscape tablet screenshot',
            url: 'https://picsum.photos/600/400?random=2',
            orientation: 'landscape'
        },
        {
            title: 'Desktop Settings',
            description: 'Landscape desktop screenshot',
            url: 'https://picsum.photos/800/450?random=3',
            orientation: 'landscape'
        },
        {
            title: 'Mobile Profile',
            description: 'Portrait mobile screenshot',
            url: 'https://picsum.photos/300/600?random=4',
            orientation: 'portrait'
        }
    ];
    
    currentScreenshots = [...testScreenshots];
    updateScreenshotsPreview();
    console.log('Added test screenshots for drag-and-drop testing');
}

// Initialize screenshots functionality
function initializeScreenshots() {
    console.log('🚀 Initializing screenshots functionality...');
    
    // Ensure currentScreenshots is available
    if (typeof currentScreenshots === 'undefined') {
        window.currentScreenshots = [];
    }
    
    // Initialize the preview
    updateScreenshotsPreview();
    
    console.log('✅ Screenshots functionality initialized');
}

// Debug function to check screenshot state
function debugScreenshots() {
    console.log('🔍 Debugging screenshots...');
    console.log('📸 Current screenshots array:', currentScreenshots);
    console.log('📸 Number of screenshots:', currentScreenshots.length);
    console.log('📸 Screenshots preview container:', document.getElementById('screenshots-preview'));
    console.log('📸 Screenshots preview container children:', document.getElementById('screenshots-preview')?.children?.length);
    
    // Check form elements
    const fileInput = document.getElementById('screenshot-file');
    const urlInput = document.getElementById('screenshot-url');
    const titleInput = document.getElementById('screenshot-title');
    
    console.log('📝 Form elements:');
    console.log('File input:', fileInput);
    console.log('URL input:', urlInput);
    console.log('Title input:', titleInput);
    
    if (fileInput) console.log('File input files:', fileInput.files.length);
    if (urlInput) console.log('URL input value:', urlInput.value);
    if (titleInput) console.log('Title input value:', titleInput.value);
    
    // Calculate total size
    let totalSize = 0;
    currentScreenshots.forEach((screenshot, index) => {
        if (screenshot.url && screenshot.url.startsWith('data:')) {
            const size = screenshot.url.length;
            totalSize += size;
            console.log(`📸 Screenshot ${index + 1} size: ${size} bytes (${(size / 1024).toFixed(1)} KB)`);
        }
    });
    
    console.log(`📊 Total screenshots size: ${totalSize} bytes (${(totalSize / 1024 / 1024).toFixed(2)} MB)`);
    
    alert(`Debug Info:\n- Screenshots in array: ${currentScreenshots.length}\n- Preview elements: ${document.getElementById('screenshots-preview')?.children?.length || 0}\n- Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB\n- Check console for details`);
}

// Check screenshot sizes and warn if too large
function checkScreenshotSizes() {
    let totalSize = 0;
    const largeScreenshots = [];
    
    currentScreenshots.forEach((screenshot, index) => {
        if (screenshot.url && screenshot.url.startsWith('data:')) {
            const size = screenshot.url.length;
            totalSize += size;
            
            if (size > 200000) { // 200KB threshold
                largeScreenshots.push({
                    index: index + 1,
                    title: screenshot.title,
                    size: size,
                    sizeKB: (size / 1024).toFixed(1)
                });
            }
        }
    });
    
    const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
    
    if (largeScreenshots.length > 0) {
        const warningMessage = `⚠️ Large Screenshots Detected!\n\nTotal size: ${totalSizeMB} MB\n\nLarge screenshots:\n${largeScreenshots.map(s => `• ${s.title}: ${s.sizeKB} KB`).join('\n')}\n\nConsider reducing image quality or removing some screenshots to avoid Firebase size limits.`;
        alert(warningMessage);
    }
    
    return { totalSize, largeScreenshots };
}

// Compress all screenshots to reduce size
async function compressAllScreenshots() {
    console.log('🔄 Compressing all screenshots...');
    
    const compressedScreenshots = [];
    let totalOriginalSize = 0;
    let totalCompressedSize = 0;
    
    for (let i = 0; i < currentScreenshots.length; i++) {
        const screenshot = currentScreenshots[i];
        const compressedScreenshot = { ...screenshot };
        
        if (screenshot.url && screenshot.url.startsWith('data:image/')) {
            try {
                const originalSize = screenshot.url.length;
                totalOriginalSize += originalSize;
                
                // Compress the image
                const compressedUrl = await compressImage(screenshot.url);
                compressedScreenshot.url = compressedUrl;
                
                const compressedSize = compressedUrl.length;
                totalCompressedSize += compressedSize;
                
                const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
                console.log(`📸 Screenshot ${i + 1} (${screenshot.title}): ${compressionRatio}% reduction (${(originalSize / 1024).toFixed(1)} KB → ${(compressedSize / 1024).toFixed(1)} KB)`);
                
            } catch (error) {
                console.warn(`⚠️ Failed to compress screenshot ${i + 1}:`, error);
                // Keep original if compression fails
            }
        }
        
        compressedScreenshots.push(compressedScreenshot);
    }
    
    currentScreenshots = compressedScreenshots;
    updateScreenshotsPreview();
    
    const totalReduction = ((totalOriginalSize - totalCompressedSize) / totalOriginalSize * 100).toFixed(1);
    const message = `✅ Compression complete!\n\nTotal size reduction: ${totalReduction}%\n${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB → ${(totalCompressedSize / 1024 / 1024).toFixed(2)} MB\n\nSaved: ${((totalOriginalSize - totalCompressedSize) / 1024 / 1024).toFixed(2)} MB`;
    
    alert(message);
    console.log('✅ Screenshot compression completed');
}

// Compress a single image
async function compressImage(dataUrl, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Calculate new dimensions while maintaining aspect ratio
            let { width, height } = img;
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to compressed JPEG
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedDataUrl);
        };
        
        img.onerror = reject;
        img.src = dataUrl;
    });
}

// Call initialization when the script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeScreenshots);
} else {
    initializeScreenshots();
}
