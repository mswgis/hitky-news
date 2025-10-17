# Deployment Guide for Hitky.com News Aggregator

This guide will walk you through deploying your news aggregation site to Cloudflare Pages with automated news fetching via Cloudflare Workers.

## Prerequisites

1. A Cloudflare account (free tier works)
2. Node.js installed (v18 or higher recommended)
3. Git repository created on GitHub
4. Wrangler CLI installed globally: `npm install -g wrangler`

## Step 1: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install worker dependencies
cd worker
npm install
cd ..
```

## Step 2: Set Up Cloudflare KV Namespace

KV (Key-Value) storage will hold your news articles.

```bash
# Login to Cloudflare
wrangler login

# Create KV namespace for production
wrangler kv:namespace create "NEWS_ARTICLES"

# Note the ID that's returned - you'll need it for wrangler.toml
```

You'll see output like:
```
{ binding = "NEWS_ARTICLES", id = "abc123def456..." }
```

## Step 3: Configure Worker

```bash
cd worker

# Copy the example config
cp wrangler.toml.example wrangler.toml

# Edit wrangler.toml and replace YOUR_KV_NAMESPACE_ID_HERE with the ID from Step 2
```

## Step 4: Set API Keys as Secrets

Store your API keys securely as Cloudflare Worker secrets:

```bash
# Still in the worker directory
wrangler secret put NEWSAPI_ORG_KEY
# Paste: cdcfa291b6734d32a763473b5136e44a

wrangler secret put NEWSAPI_AI_KEY
# Paste: 1c8340e0-b06f-4b01-96dd-055b73ac8c79

wrangler secret put THENEWSAPI_KEY
# Paste: ELbD8VEyTGB74WpV799NnMpVPDPbWJNAXf2HdLOX

wrangler secret put GNEWS_KEY
# Paste: 001a22efa9b7e098a44103b82a409025

wrangler secret put NEWSDATA_KEY
# Paste: pub_fde14614442f458abe067f9e5573b1f1

wrangler secret put APITUBE_KEY
# Paste: api_live_wHyT4KdVsrDxW7SHmM2KNvjrKlEnqIBYeWa72i9Wb0wYvBQ5AH0QzBP
```

## Step 5: Deploy the Worker

```bash
# Deploy the worker with cron trigger
wrangler deploy

# Test the worker manually
curl https://hitky-news-worker.YOUR_SUBDOMAIN.workers.dev/trigger-update
```

The worker will now automatically fetch news every 15 minutes via the cron trigger.

## Step 6: Set Up Cloudflare Pages

### Option A: Via Cloudflare Dashboard (Recommended)

1. Go to https://dash.cloudflare.com/
2. Select your account
3. Click "Workers & Pages" > "Create application" > "Pages" > "Connect to Git"
4. Authorize GitHub and select your `hitky-news` repository
5. Configure build settings:
   - **Project name**: `hitky-news` (or your preferred name)
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Framework preset**: Vite

6. Click "Save and Deploy"

### Option B: Via Wrangler CLI

```bash
# From project root
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=hitky-news
```

## Step 7: Bind KV Namespace to Pages

Your Cloudflare Pages Functions need access to the same KV namespace:

1. In Cloudflare Dashboard, go to your Pages project
2. Click "Settings" > "Functions"
3. Scroll to "KV namespace bindings"
4. Click "Add binding"
   - **Variable name**: `NEWS_ARTICLES`
   - **KV namespace**: Select the namespace you created in Step 2
5. Click "Save"

## Step 8: Set Up Custom Domain

1. In your Pages project, go to "Custom domains"
2. Click "Set up a custom domain"
3. Enter `hitky.com`
4. Follow the DNS instructions to point your domain to Cloudflare Pages
5. SSL certificate will be automatically provisioned

## Step 9: Test Everything

1. Visit your site: `https://hitky.com` (or the Cloudflare Pages URL)
2. Manually trigger a news fetch: Visit your worker URL at `/trigger-update`
3. Refresh your site to see the articles

## Monitoring & Maintenance

### View Worker Logs
```bash
cd worker
wrangler tail
```

### Manually Trigger News Update
```bash
curl https://hitky-news-worker.YOUR_SUBDOMAIN.workers.dev/trigger-update
```

### Check KV Storage
```bash
wrangler kv:key get --binding=NEWS_ARTICLES "latest-articles"
```

### Update Worker
```bash
cd worker
wrangler deploy
```

### Update Frontend
Just push to your GitHub repository - Cloudflare Pages will automatically rebuild and deploy.

## Troubleshooting

### No articles showing up?
1. Check worker logs: `wrangler tail`
2. Manually trigger update: Visit `/trigger-update` endpoint
3. Verify KV binding is correct in both worker and Pages

### API rate limits?
The free tiers of news APIs have rate limits. The worker is designed to handle failures gracefully. If one API fails, others will still work.

### Build failures?
- Ensure Node.js version is 18 or higher
- Run `npm install` to ensure all dependencies are installed
- Check build logs in Cloudflare Pages dashboard

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Cloudflare Worker                        │
│                  (Cron: Every 15 minutes)                    │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │NewsAPI.org│ │ GNews.io │  │TheNewsAPI│  │NewsData.io│   │
│  └─────┬────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│        │            │             │             │           │
│        └────────────┴─────────────┴─────────────┘           │
│                         │                                    │
│                    Aggregate &                               │
│                    Deduplicate                               │
│                         │                                    │
│                         ▼                                    │
│                  ┌─────────────┐                            │
│                  │ Cloudflare  │                            │
│                  │     KV      │                            │
│                  └──────┬──────┘                            │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          │ Read
                          │
                          ▼
                ┌──────────────────┐
                │ Cloudflare Pages │
                │   (Frontend +    │
                │    Functions)    │
                └────────┬─────────┘
                         │
                         │ HTTPS
                         │
                         ▼
                   ┌──────────┐
                   │  User's  │
                   │ Browser  │
                   └──────────┘
```

## Cost Estimate

With Cloudflare's free tier:
- **Pages**: 500 builds/month, unlimited requests
- **Workers**: 100,000 requests/day
- **KV**: 100,000 reads/day, 1,000 writes/day
- **Total**: $0/month for typical usage

This setup should handle thousands of visitors per day at no cost!

## Next Steps

- Monitor your news sources and adjust categories as needed
- Add more news APIs if desired
- Customize the UI theme in `tailwind.config.js`
- Add analytics (Cloudflare Web Analytics is free)
- Set up email alerts for worker failures

Enjoy your automated news aggregation site! 🎉
