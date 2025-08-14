# Image Proxy Server

This is a Node.js/Express server that acts as a proxy for Google CDN images, preventing 429 rate limiting errors by downloading and caching images locally.

## 🚀 Features

- **Proxy Google CDN Images**: Automatically detects and proxies Google Play Store images
- **Local Caching**: Downloads images to server and serves them locally
- **Cache Headers**: Sets proper cache headers for browser caching
- **Rate Limiting Protection**: Handles 429 errors gracefully
- **Cache Management**: View stats and clear cache via API endpoints

## 📦 Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **For development (auto-restart):**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

The server runs on port 3000 by default. You can change this by setting the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## 📡 API Endpoints

### Proxy Images
```
GET /proxy/image?url=<image_url>
```

**Example:**
```
GET /proxy/image?url=https://play-lh.googleusercontent.com/example.jpg
```

### Cache Management
```
GET /cache/stats          # View cache statistics
DELETE /cache/clear       # Clear all cached images
GET /health              # Health check
```

## 🗂️ Cache Directory

Images are cached in `cache/images/` directory with MD5 hash filenames.

## 🔄 How It Works

1. **Request comes in** for a Google CDN image
2. **Check cache** - if image exists locally, serve it
3. **Download** - if not cached, download from Google CDN
4. **Save locally** - store image in cache directory
5. **Serve** - return image with proper cache headers

## 🛡️ Rate Limiting Protection

- **Server-side caching** prevents repeated requests to Google CDN
- **Browser caching** with ETags and Cache-Control headers
- **Graceful error handling** for 429 responses

## 📊 Cache Statistics

View cache stats at `http://localhost:3000/cache/stats`:

```json
{
  "totalFiles": 15,
  "totalSize": 2048576,
  "totalSizeMB": "1.95",
  "files": [
    {
      "name": "abc123.jpg",
      "size": 45678,
      "created": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

## 🧹 Cache Management

**Clear all cached images:**
```bash
npm run cache:clear
```

**View cache stats:**
```bash
npm run cache:stats
```

## 🔧 Integration with Frontend

The frontend automatically uses the proxy server for Google CDN images. The image cache system detects Google CDN URLs and routes them through the proxy.

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### With PM2
```bash
pm2 start server.js --name "image-proxy"
```

## 📝 Environment Variables

- `PORT` - Server port (default: 3000)
- `CACHE_DIR` - Cache directory path (default: ./cache/images)

## 🔍 Monitoring

- **Health check**: `GET /health`
- **Logs**: Server logs show cache hits/misses
- **Cache stats**: Monitor cache size and file count

## 🛠️ Troubleshooting

### Port already in use
```bash
PORT=3001 npm start
```

### Cache directory issues
```bash
mkdir -p cache/images
```

### Permission issues
```bash
chmod 755 cache/images
```

## 📈 Performance Benefits

- **Faster loading** - cached images serve instantly
- **No rate limiting** - Google CDN requests are minimized
- **Reduced bandwidth** - images cached locally
- **Better UX** - consistent image loading experience

## 🔒 Security

- Only Google CDN URLs are proxied
- CORS enabled for cross-origin requests
- Input validation on URLs
- Rate limiting protection

## 📚 Dependencies

- `express` - Web framework
- `axios` - HTTP client for downloading images
- `cors` - Cross-origin resource sharing
- `nodemon` - Development auto-restart (dev dependency)
