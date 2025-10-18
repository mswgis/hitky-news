# Authentication Setup for Hitky News

## Basic Authentication is Now Enabled

Your site is now protected with HTTP Basic Authentication. Users will see a browser login prompt when accessing the site.

## Setting Up Username & Password

### Via Cloudflare Dashboard (Recommended):

1. Go to your Cloudflare Pages project
2. Click **Settings** → **Environment variables**
3. Add these variables for **Production**:
   - Variable name: `AUTH_USERNAME`
   - Value: Your desired username (e.g., `hitky`)
   - Click **Add variable**
   
   - Variable name: `AUTH_PASSWORD`
   - Value: Your desired password (e.g., a strong password)
   - Click **Add variable**

4. Click **Save**
5. **Redeploy** your site for changes to take effect

### Via Wrangler CLI:

```bash
# Set environment variables
wrangler pages secret put AUTH_USERNAME
# Enter your username when prompted

wrangler pages secret put AUTH_PASSWORD
# Enter your password when prompted
```

## Default Credentials (CHANGE THESE!)

If you don't set environment variables, the defaults are:
- **Username**: `admin`
- **Password**: `changeme`

**⚠️ IMPORTANT**: Change these immediately in production!

## How It Works

- All pages require authentication
- `/api/*` endpoints are excluded (so the frontend can fetch news)
- Browser will show a login prompt
- Credentials are checked against environment variables
- Invalid credentials show "Invalid credentials" message

## Testing

1. Visit your site: `https://your-site.pages.dev`
2. You'll see a browser login prompt
3. Enter your username and password
4. If correct, you'll see the news site
5. If incorrect, you'll see an error

## Security Notes

- Uses HTTP Basic Auth (credentials sent with each request)
- **Always use HTTPS** (Cloudflare Pages provides this automatically)
- Consider using a password manager to generate strong passwords
- You can change credentials anytime by updating environment variables

## Removing Authentication

To disable authentication, simply delete the file:
`functions/_middleware.ts`

Then redeploy your site.
