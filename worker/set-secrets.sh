#!/bin/bash

# Script to set all API keys as Cloudflare Worker secrets
# Run this from the worker directory

echo "Setting API keys as Cloudflare Worker secrets..."
echo ""

echo "Setting NEWSAPI_ORG_KEY..."
echo "cdcfa291b6734d32a763473b5136e44a" | wrangler secret put NEWSAPI_ORG_KEY

echo "Setting NEWSAPI_AI_KEY..."
echo "1c8340e0-b06f-4b01-96dd-055b73ac8c79" | wrangler secret put NEWSAPI_AI_KEY

echo "Setting THENEWSAPI_KEY..."
echo "ELbD8VEyTGB74WpV799NnMpVPDPbWJNAXf2HdLOX" | wrangler secret put THENEWSAPI_KEY

echo "Setting GNEWS_KEY..."
echo "001a22efa9b7e098a44103b82a409025" | wrangler secret put GNEWS_KEY

echo "Setting NEWSDATA_KEY..."
echo "pub_fde14614442f458abe067f9e5573b1f1" | wrangler secret put NEWSDATA_KEY

echo "Setting APITUBE_KEY..."
echo "api_live_wHyT4KdVsrDxW7SHmM2KNvjrKlEnqIBYeWa72i9Wb0wYvBQ5AH0QzBP" | wrangler secret put APITUBE_KEY

echo ""
echo "✅ All secrets set successfully!"
