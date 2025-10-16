# Cloudflare Pages Deployment Guide

## 🚀 Fixing Node.js Compatibility Error

### The Problem
You're getting this error because Cloudflare Pages needs the `nodejs_compat` compatibility flag to run Next.js applications properly.

### Solution Steps

#### 1. Add Compatibility Flag in Cloudflare Dashboard
1. Go to your Cloudflare Pages project dashboard
2. Navigate to **Settings** → **Compatibility Flags**
3. Add `nodejs_compat` flag to both:
   - **Production Environment**
   - **Preview Environment**
4. Save the changes

#### 2. Alternative: Use wrangler.toml (Already Added)
The project now includes a `wrangler.toml` file that automatically sets the compatibility flag.

#### 3. Redeploy
After adding the compatibility flag, trigger a new deployment:
- Push a new commit to your repository, OR
- Go to Pages dashboard and click "Retry deployment"

### Build Configuration

The project is configured for Cloudflare Pages with:
- Static export (`output: 'export'`)
- Unoptimized images for static hosting
- ESM compatibility for Cloudflare Workers

### Environment Variables

If you need environment variables:
1. Go to Pages dashboard → Settings → Environment Variables
2. Add your variables for both Production and Preview environments

### Build Command
```bash
bun run build
```

### Build Output Directory
```
.next
```

### Node.js Version
Use Node.js 18+ (Cloudflare Pages supports up to Node.js 18)

## ✅ Verification

After deployment, your site should work without the Node.js compatibility error!
