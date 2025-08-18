const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Create cache directory if it doesn't exist
const CACHE_DIR = path.join(__dirname, 'cache', 'images');
async function ensureCacheDir() {
    try {
        await fs.mkdir(CACHE_DIR, { recursive: true });
    } catch (error) {
        console.error('Error creating cache directory:', error);
    }
}

// Generate cache key from URL
function generateCacheKey(url) {
    return crypto.createHash('md5').update(url).digest('hex');
}

// Get file extension from URL or content-type
function getFileExtension(url, contentType) {
    // Try to get extension from URL first
    const urlExt = path.extname(url.split('?')[0]);
    if (urlExt && urlExt.length > 0) {
        return urlExt;
    }
    
    // Fallback to content-type
    if (contentType) {
        const ext = contentType.split('/')[1];
        if (ext) {
            return `.${ext.split(';')[0]}`;
        }
    }
    
    return '.jpg'; // Default fallback
}

// Check if image is from Google CDN
function isGoogleCDN(url) {
    return url.includes('play-lh.googleusercontent.com') || 
           url.includes('lh3.googleusercontent.com') ||
           url.includes('lh4.googleusercontent.com') ||
           url.includes('lh5.googleusercontent.com') ||
           url.includes('lh6.googleusercontent.com');
}

// Proxy endpoint for images
app.get('/proxy/image', async (req, res) => {
    try {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        // Only proxy Google CDN images
        if (!isGoogleCDN(url)) {
            return res.status(400).json({ error: 'Only Google CDN images are supported' });
        }

        const cacheKey = generateCacheKey(url);
        const cachePath = path.join(CACHE_DIR, cacheKey);
        
        // Check if image exists in cache
        try {
            const stats = await fs.stat(cachePath);
            const fileExtension = path.extname(cachePath);
            
            // Set cache headers for 1 day
            res.set({
                'Cache-Control': 'public, max-age=86400',
                'ETag': `"${cacheKey}"`,
                'Content-Type': getContentType(fileExtension)
            });
            
            // Check if client has cached version
            const ifNoneMatch = req.get('If-None-Match');
            if (ifNoneMatch === `"${cacheKey}"`) {
                return res.status(304).end(); // Not Modified
            }
            
            // Serve cached image
            const imageBuffer = await fs.readFile(cachePath);
            res.send(imageBuffer);
            console.log(`✅ Served cached image: ${url}`);
            return;
            
        } catch (error) {
            // Image not in cache, download it
            console.log(`🔄 Downloading image: ${url}`);
        }

        // Download image from Google CDN
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'arraybuffer',
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const contentType = response.headers['content-type'];
        const fileExtension = getFileExtension(url, contentType);
        const finalCachePath = path.join(CACHE_DIR, cacheKey + fileExtension);

        // Save to cache
        await fs.writeFile(finalCachePath, response.data);
        console.log(`💾 Cached image: ${url}`);

        // Set cache headers
        res.set({
            'Cache-Control': 'public, max-age=86400',
            'ETag': `"${cacheKey}"`,
            'Content-Type': contentType || 'image/jpeg'
        });

        // Send image
        res.send(response.data);
        console.log(`✅ Served fresh image: ${url}`);

    } catch (error) {
        console.error(`❌ Error proxying image: ${req.query.url}`, error.message);
        
        if (error.response?.status === 429) {
            res.status(429).json({ 
                error: 'Rate limited by Google CDN',
                message: 'Please try again later'
            });
        } else {
            res.status(500).json({ 
                error: 'Failed to proxy image',
                message: error.message
            });
        }
    }
});

// Get content type from file extension
function getContentType(extension) {
    const contentTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
    };
    return contentTypes[extension.toLowerCase()] || 'image/jpeg';
}

// Cache management endpoints
app.get('/cache/stats', async (req, res) => {
    try {
        const files = await fs.readdir(CACHE_DIR);
        const stats = await Promise.all(
            files.map(async (file) => {
                const filePath = path.join(CACHE_DIR, file);
                const stat = await fs.stat(filePath);
                return {
                    name: file,
                    size: stat.size,
                    created: stat.birthtime
                };
            })
        );
        
        const totalSize = stats.reduce((sum, file) => sum + file.size, 0);
        
        res.json({
            totalFiles: files.length,
            totalSize: totalSize,
            totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
            files: stats
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get cache stats' });
    }
});

app.delete('/cache/clear', async (req, res) => {
    try {
        const files = await fs.readdir(CACHE_DIR);
        await Promise.all(
            files.map(file => fs.unlink(path.join(CACHE_DIR, file)))
        );
        console.log(`🗑️ Cleared ${files.length} cached images`);
        res.json({ message: `Cleared ${files.length} cached images` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear cache' });
    }
});

// URL routing for clean URLs
app.get('/admin', (req, res) => {
    res.redirect('/pages/admin.html');
});

app.get('/login', (req, res) => {
    res.redirect('/pages/login.html');
});

app.get('/project/:id', (req, res) => {
    const projectId = req.params.id;
    res.redirect(`/pages/project-detail.html?id=${projectId}`);
});

// Root route - serve the main portfolio
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Section routes for better SEO
app.get('/about', (req, res) => {
    res.redirect('/#about');
});

app.get('/projects', (req, res) => {
    res.redirect('/#projects');
});

app.get('/contact', (req, res) => {
    res.redirect('/#contact');
});

app.get('/resume', (req, res) => {
    res.redirect('/#resume');
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Start server
async function startServer() {
    await ensureCacheDir();
    
    app.listen(PORT, () => {
        console.log(`🚀 Portfolio server running on port ${PORT}`);
        console.log(`🏠 Main portfolio: http://localhost:${PORT}/`);
        console.log(`🔐 Admin panel: http://localhost:${PORT}/admin`);
        console.log(`🔑 Login page: http://localhost:${PORT}/login`);
        console.log(`📁 Cache directory: ${CACHE_DIR}`);
        console.log(`🔗 Proxy endpoint: http://localhost:${PORT}/proxy/image?url=<image_url>`);
        console.log(`📊 Cache stats: http://localhost:${PORT}/cache/stats`);
        console.log(`🗑️ Clear cache: DELETE http://localhost:${PORT}/cache/clear`);
    });
}

startServer().catch(console.error);

module.exports = app;
