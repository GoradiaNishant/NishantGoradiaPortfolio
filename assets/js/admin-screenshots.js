// ===================================
// ADMIN SCREENSHOT MANAGEMENT
// ===================================

// Screenshot management functions
function addScreenshot() {
    const fileInput = document.getElementById('screenshot-file');
    const urlInput = document.getElementById('screenshot-url');
    const titleInput = document.getElementById('screenshot-title');
    const descriptionInput = document.getElementById('screenshot-description');
    const orientationInput = document.getElementById('screenshot-orientation');

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

    // Handle file upload
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            screenshot.url = e.target.result;
            currentScreenshots.push(screenshot);
            updateScreenshotsPreview();
            clearScreenshotForm();
        };
        
        reader.readAsDataURL(file);
    }
    // Handle URL input
    else if (urlInput.value.trim()) {
        screenshot.url = urlInput.value.trim();
        currentScreenshots.push(screenshot);
        updateScreenshotsPreview();
        clearScreenshotForm();
    }
    else {
        alert('Please either upload a file or enter a URL');
        return;
    }
}

// Update screenshots preview
function updateScreenshotsPreview() {
    const previewContainer = document.getElementById('screenshots-preview');
    if (!previewContainer) return;

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
    return [...currentScreenshots];
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
