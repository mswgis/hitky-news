// Cloudflare Pages Function to serve news from KV
export async function onRequest(context: any) {
  try {
    const { NEWS_ARTICLES } = context.env;
    
    // Get articles from KV
    const articlesData = await NEWS_ARTICLES.get('latest-articles', 'json');
    
    if (!articlesData) {
      return new Response(JSON.stringify({
        articles: [],
        lastUpdated: new Date().toISOString(),
        totalResults: 0
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        },
      });
    }
    
    return new Response(JSON.stringify(articlesData), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch news',
      articles: [],
      lastUpdated: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
