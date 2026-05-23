# Production Asset Storage Guide (YIF Capital)

This guide provides instructions on how to ensure that uploaded images (banners, profile pictures, etc.) are persistent in your production environment.

## The Problem
By default, files uploaded via the `/api/upload` route are saved to the `public/uploads` directory. In many modern hosting environments (like Vercel, Heroku, or non-persistent Docker containers), the filesystem is **ephemeral**, meaning all files created during runtime are deleted when the application is redeployed or restarted.

## Solution 1: Persistent Volumes (VPS/Docker)
If you are hosting on a VPS (like DigitalOcean, Linode, or AWS EC2) using Docker:
1. Ensure the `public/uploads` directory is mapped to a **persistent volume**.
2. Example `docker-compose.yml` snippet:
   ```yaml
   services:
     app:
       volumes:
         - ./uploads:/var/www/yif-capital-platform/public/uploads
   ```

## Solution 2: External Cloud Storage (Recommended)
For the most stable production experience, we recommend using a cloud storage provider.

### Option A: Vercel Blob (Easiest for Next.js)
1. Install the package: `npm install @vercel/blob`
2. Update `app/api/upload/route.ts` to use `put()` from `@vercel/blob`.
3. Add `BLOB_READ_WRITE_TOKEN` to your `.env.production`.

### Option B: Amazon S3 / DigitalOcean Spaces
1. Set up an S3 bucket or a Space.
2. Use the `@aws-sdk/client-s3` package to upload files.
3. Update the upload API to return the full S3 URL instead of a local path.

## Current Fix (UI Fallbacks)
I have implemented **Automatic Fallbacks** in the Expert Dashboard and Academy landing page. 
- If an image fails to load (e.g., file was deleted), the UI will now automatically show a professional placeholder (initial-based avatar for experts or icon-based banner for courses).
- This prevents the "broken image" icon from ever appearing to users.
