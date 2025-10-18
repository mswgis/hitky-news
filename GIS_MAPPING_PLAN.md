# GIS Mapping Integration Plan for Hitky News

## Overview
Add an interactive map view to visualize where news events are occurring globally.

## Implementation Options

### Option 1: Geocoding with OpenCage or Google Geocoding API
**How it works:**
- Extract location mentions from article titles/descriptions
- Use geocoding API to convert location names to coordinates (lat/lon)
- Store coordinates with each article
- Display on interactive map

**APIs to use:**
- **OpenCage Geocoding API** (free tier: 2,500 requests/day)
  - https://opencagedata.com/api
- **Google Geocoding API** (paid, but accurate)
- **Nominatim (OpenStreetMap)** (free, no API key needed)

**Pros:**
- Works with existing news articles
- Can extract locations from text
- No need for special news APIs

**Cons:**
- Location extraction from text can be inaccurate
- Requires NLP or keyword matching
- Some articles won't have clear locations

### Option 2: GDELT Project (Global Database of Events, Language, and Tone)
**How it works:**
- GDELT monitors news from around the world
- Already includes geocoded locations for events
- Free API with real-time data
- Provides lat/lon coordinates automatically

**API:**
- GDELT Event Database: https://blog.gdeltproject.org/gdelt-2-0-our-global-world-in-realtime/
- GDELT GEO API: https://blog.gdeltproject.org/gdelt-geo-2-0-api-debuts/

**Pros:**
- Already geocoded
- Massive global coverage
- Free and real-time
- Includes sentiment analysis

**Cons:**
- Separate from your current news sources
- Would need to integrate alongside existing APIs

### Option 3: Universal Awareness API
**What is it:**
I couldn't find a specific "Universal Awareness API" - could you provide more details? 
- Is this a custom API you have access to?
- Or are you referring to a specific service?

Please share the API documentation or details so I can integrate it.

## Recommended Approach: Hybrid Solution

### Phase 1: Add Location Extraction
1. **Extract locations from articles** using keywords/NLP
   - Look for: country names, city names, regions
   - Use regex patterns: "in [Location]", "[Location] -", etc.
   
2. **Geocode locations** using Nominatim (free, no key needed)
   - API: `https://nominatim.openstreetmap.org/search?q={location}&format=json`
   - Returns lat/lon coordinates
   
3. **Store coordinates** in article metadata

### Phase 2: Add Interactive Map View
1. **Use Leaflet.js** (open-source mapping library)
   - Free, no API keys needed
   - Works with OpenStreetMap tiles
   
2. **Map features:**
   - Cluster markers for nearby events
   - Click marker to see article details
   - Color-code by category (politics, conflict, etc.)
   - Filter by date range
   - Heat map view for event density

3. **UI Layout:**
   ```
   [Header]
   [Toggle: Table View | Map View]
   
   Map View:
   - Full-screen interactive map
   - Sidebar with article list
   - Click marker → highlight article
   - Click article → center map on location
   ```

### Phase 3: Enhanced Features
- **Timeline slider**: See how events evolve over time
- **Search by location**: "Show me news near Ukraine"
- **Geofencing**: Alert when news breaks in specific regions
- **Route visualization**: Track conflicts/events across regions

## Implementation Steps

### Step 1: Add Geocoding to Worker
```typescript
// Add to worker/src/index.ts
async function geocodeLocation(location: string): Promise<{lat: number, lon: number} | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Hitky News Aggregator/1.0' }
    });
    const data = await response.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Extract location from article title/description
function extractLocation(text: string): string | null {
  // Common patterns: "in [Location]", "[Location] -", etc.
  const patterns = [
    /in ([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*[-–—]/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return null;
}
```

### Step 2: Add Map Component to Frontend
```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

### Step 3: Create Map View
- Add toggle between Table and Map view
- Display articles as markers on map
- Click marker to see article details

## Cost Analysis
- **Nominatim (OpenStreetMap)**: FREE
- **Leaflet.js**: FREE
- **OpenStreetMap tiles**: FREE
- **OpenCage Geocoding**: FREE (up to 2,500/day)
- **GDELT**: FREE

## Next Steps
1. **Confirm**: Do you want to proceed with this approach?
2. **Universal Awareness API**: Please provide details/documentation
3. **Entertainment filter**: I'll add filters to exclude entertainment news
4. **Map priority**: Should we add the map view now or after other improvements?

Let me know your preferences and I'll implement!
