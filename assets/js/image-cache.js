// ===================================
// IMAGE CACHE MANAGEMENT
// ===================================

class ImageCache {
    constructor() {
        this.cache = new Map();
        this.failedUrls = new Set();
        this.retryDelays = new Map();
        this.maxRetries = 3;
        this.baseDelay = 2000; // 2 seconds base delay
    }

    // Check if URL is from Google's CDN
    isGoogleCDN(url) {
        return url.includes('play-lh.googleusercontent.com') || 
               url.includes('lh3.googleusercontent.com') ||
               url.includes('lh4.googleusercontent.com') ||
               url.includes('lh5.googleusercontent.com') ||
               url.includes('lh6.googleusercontent.com');
    }

    // Get cached image or fetch with retry logic
    async getImage(url, options = {}) {
        const {
            retryCount = 0,
            onLoad = null,
            onError = null,
            onRetry = null
        } = options;

        // Check if URL is already cached
        if (this.cache.has(url)) {
            console.log('✅ Using cached image:', url);
            return this.cache.get(url);
        }

        // Check if URL has failed too many times
        if (this.failedUrls.has(url) && retryCount >= this.maxRetries) {
            console.log('❌ URL failed too many times, using fallback:', url);
            if (onError) onError(url, 'max_retries_exceeded');
            return this.getFallbackImage();
        }

        // Check if we need to delay due to rate limiting
        const lastAttempt = this.retryDelays.get(url);
        const now = Date.now();
        const delay = this.getRetryDelay(retryCount);

        if (lastAttempt && (now - lastAttempt) < delay) {
            const waitTime = delay - (now - lastAttempt);
            console.log(`⏳ Rate limiting: waiting ${waitTime}ms before retry for:`, url);
            await this.sleep(waitTime);
        }

        try {
            console.log(`🔄 Fetching image (attempt ${retryCount + 1}):`, url);
            this.retryDelays.set(url, now);

            // Use proxy server for Google CDN images
            let fetchUrl = url;
            if (this.isGoogleCDN(url)) {
                const proxyUrl = `http://localhost:3000/proxy/image?url=${encodeURIComponent(url)}`;
                fetchUrl = proxyUrl;
                console.log(`🔄 Using proxy server: ${proxyUrl}`);
            }

            const response = await fetch(fetchUrl, {
                method: 'GET',
                mode: 'cors',
                cache: 'force-cache' // Use browser cache aggressively
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);

            // Cache the successful result
            this.cache.set(url, objectUrl);
            console.log('✅ Image cached successfully:', url);

            if (onLoad) onLoad(objectUrl);
            return objectUrl;

        } catch (error) {
            console.error(`❌ Failed to load image (attempt ${retryCount + 1}):`, url, error);

            // Handle 429 rate limiting specifically
            if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
                console.log('🚫 Rate limited by Google CDN, will retry with exponential backoff');
                
                if (retryCount < this.maxRetries) {
                    const nextDelay = this.getRetryDelay(retryCount + 1);
                    console.log(`⏳ Scheduling retry in ${nextDelay}ms`);
                    
                    if (onRetry) onRetry(url, retryCount + 1, nextDelay);
                    
                    setTimeout(() => {
                        this.getImage(url, {
                            retryCount: retryCount + 1,
                            onLoad,
                            onError,
                            onRetry
                        });
                    }, nextDelay);
                    
                    return null; // Return null to indicate retry is scheduled
                }
            }

            // For other errors or max retries reached
            if (retryCount >= this.maxRetries) {
                this.failedUrls.add(url);
                if (onError) onError(url, error.message);
                return this.getFallbackImage();
            }

            // Retry with exponential backoff
            const nextDelay = this.getRetryDelay(retryCount + 1);
            console.log(`⏳ Retrying in ${nextDelay}ms due to error`);
            
            if (onRetry) onRetry(url, retryCount + 1, nextDelay);
            
            setTimeout(() => {
                this.getImage(url, {
                    retryCount: retryCount + 1,
                    onLoad,
                    onError,
                    onRetry
                });
            }, nextDelay);

            return null;
        }
    }

    // Calculate exponential backoff delay
    getRetryDelay(retryCount) {
        return this.baseDelay * Math.pow(2, retryCount);
    }

    // Sleep utility
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get fallback image
    getFallbackImage() {
        return 'assets/images/project_image_placeholder.webp';
    }

    // Preload images for better performance
    async preloadImages(urls) {
        console.log('🔄 Preloading images:', urls.length);
        const promises = urls.map(url => 
            this.getImage(url, {
                onLoad: (objectUrl) => console.log('✅ Preloaded:', url),
                onError: (url, error) => console.log('❌ Failed to preload:', url, error)
            })
        );
        
        await Promise.allSettled(promises);
        console.log('✅ Image preloading complete');
    }

    // Clear cache
    clearCache() {
        // Revoke object URLs to free memory
        for (const objectUrl of this.cache.values()) {
            URL.revokeObjectURL(objectUrl);
        }
        this.cache.clear();
        this.failedUrls.clear();
        this.retryDelays.clear();
        console.log('🗑️ Image cache cleared');
    }

    // Get cache statistics
    getCacheStats() {
        return {
            cached: this.cache.size,
            failed: this.failedUrls.size,
            total: this.cache.size + this.failedUrls.size
        };
    }
}

// Global image cache instance
window.imageCache = new ImageCache();

// ===================================
// IMAGE LOADING UTILITIES
// ===================================

// Enhanced image loading with cache support
function loadImageWithCache(imgElement, url, options = {}) {
    const {
        onLoad = null,
        onError = null,
        onRetry = null,
                    fallbackUrl = 'assets/images/project_image_placeholder.webp'
    } = options;

    // If not a Google CDN URL, load normally
    if (!window.imageCache.isGoogleCDN(url)) {
        imgElement.src = url;
        return;
    }

    // Use cache for Google CDN URLs
    window.imageCache.getImage(url, {
        onLoad: (objectUrl) => {
            imgElement.src = objectUrl;
            imgElement.classList.remove('opacity-50');
            imgElement.style.opacity = '1';
            if (onLoad) onLoad(imgElement, url);
        },
        onError: (failedUrl, error) => {
            console.log('❌ Using fallback for failed image:', failedUrl);
            imgElement.src = fallbackUrl;
            imgElement.classList.add('opacity-50');
            if (onError) onError(imgElement, failedUrl, error);
        },
        onRetry: (retryUrl, retryCount, delay) => {
            console.log(`🔄 Retrying image ${retryCount} in ${delay}ms:`, retryUrl);
            if (onRetry) onRetry(imgElement, retryUrl, retryCount, delay);
        }
    });
}

// Batch load images with intelligent throttling
async function loadImagesWithThrottling(images, batchSize = 3, delayBetweenBatches = 1000) {
    console.log(`🔄 Loading ${images.length} images in batches of ${batchSize}`);
    
    for (let i = 0; i < images.length; i += batchSize) {
        const batch = images.slice(i, i + batchSize);
        
        // Load batch
        const promises = batch.map(img => {
            return new Promise((resolve) => {
                loadImageWithCache(img, img.dataset.originalSrc || img.src, {
                    onLoad: () => resolve({ success: true, img }),
                    onError: () => resolve({ success: false, img }),
                    onRetry: () => resolve({ success: false, img, retrying: true })
                });
            });
        });
        
        await Promise.allSettled(promises);
        
        // Delay between batches (except for the last batch)
        if (i + batchSize < images.length) {
            console.log(`⏳ Waiting ${delayBetweenBatches}ms before next batch`);
            await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }
    }
    
    console.log('✅ Batch image loading complete');
}

// Export for use in other files
window.ImageCache = ImageCache;
window.loadImageWithCache = loadImageWithCache;
window.loadImagesWithThrottling = loadImagesWithThrottling;
