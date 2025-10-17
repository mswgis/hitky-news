# Hitky.com - Breaking News Aggregator

A modern news aggregation website that pulls breaking news from multiple sources and displays them in a clean, responsive interface.

## Features

- 🔄 Automated news fetching every 15 minutes via Cloudflare Workers
- 📰 Aggregates from 6 major news APIs
- 🎯 Focus on US & global political news, events, law, and military
- 🚀 Deployed on Cloudflare Pages
- ⚡ Fast, modern UI built with React + TypeScript + Vite
- 🎨 Beautiful design with TailwindCSS + shadcn/ui

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS, shadcn/ui components
- **Backend**: Cloudflare Workers (scheduled cron jobs)
- **Storage**: Cloudflare KV
- **Deployment**: Cloudflare Pages
- **Icons**: Lucide React

## News Sources

- NewsAPI.org
- NewsAPI.ai
- TheNewsAPI.com
- GNews.io
- NewsData.io
- APITube.io

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Cloudflare Setup

### 1. Create KV Namespace
```bash
wrangler kv:namespace create "NEWS_ARTICLES"
```

### 2. Deploy Worker
```bash
cd worker
wrangler deploy
```

### 3. Deploy to Cloudflare Pages
Connect your GitHub repository to Cloudflare Pages with these settings:
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Framework preset**: Vite

## Environment Variables

API keys are stored securely in Cloudflare Workers secrets. Never commit API keys to the repository.

## License

MIT
