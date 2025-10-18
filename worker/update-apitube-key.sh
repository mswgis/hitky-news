#!/bin/bash

# Update APITube.io API key

echo "Updating APITUBE_KEY secret..."
echo "api_live_wiPkvWD3CPanU6mzURWpjalBNdBASnxEu6OImJXErR97QbMMDNFdaHE3gHs" | wrangler secret put APITUBE_KEY

echo "✅ APITube key updated successfully!"
