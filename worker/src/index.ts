// Cloudflare Worker with Cron Trigger for News Aggregation

interface Env {
  NEWS_ARTICLES: KVNamespace;
  NEWSAPI_ORG_KEY: string;
  NEWSAPI_AI_KEY: string;
  THENEWSAPI_KEY: string;
  GNEWS_KEY: string;
  NEWSDATA_KEY: string;
  APITUBE_KEY: string;
}

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: {
    name: string;
    id?: string;
  };
  author: string | null;
  content: string | null;
  category?: string;
}

// Fetch from NewsAPI.org
async function fetchNewsAPIOrg(apiKey: string): Promise<NewsArticle[]> {
  try {
    const allArticles: NewsArticle[] = [];
    
    // US Politics
    const usUrl = `https://newsapi.org/v2/top-headlines?country=us&category=politics&language=en&pageSize=50&apiKey=${apiKey}`;
    const usResponse = await fetch(usUrl);
    const usData = await usResponse.json();
    
    if (usData.status === 'error') {
      console.error('NewsAPI.org error:', usData.message);
      return [];
    }
    
    if (usData.articles) {
      allArticles.push(...usData.articles.map((article: any) => ({
        id: `newsapi-org-${article.url}`,
        title: article.title,
        description: article.description || '',
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: { name: article.source.name, id: article.source.id },
        author: article.author,
        content: article.content,
        category: 'US Politics'
      })));
    }
    
    // Global news with keywords
    const keywords = ['Russia', 'China', 'Middle East', 'Ukraine', 'Israel', 'Iran', 'Syria'];
    for (const keyword of keywords) {
      const globalUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(keyword)}&language=en&sortBy=publishedAt&pageSize=15&apiKey=${apiKey}`;
      const response = await fetch(globalUrl);
      const data = await response.json();
      if (data.articles) {
        allArticles.push(...data.articles.map((article: any) => ({
          id: `newsapi-org-${keyword}-${article.url}`,
          title: article.title,
          description: article.description || '',
          url: article.url,
          urlToImage: article.urlToImage,
          publishedAt: article.publishedAt,
          source: { name: article.source.name, id: article.source.id },
          author: article.author,
          content: article.content,
          category: keyword
        })));
      }
    }
    
    return allArticles;
  } catch (error) {
    console.error('Error fetching from NewsAPI.org:', error);
    return [];
  }
}

// Fetch from GNews.io
async function fetchGNews(apiKey: string): Promise<NewsArticle[]> {
  try {
    const topics = ['breaking-news', 'world', 'nation'];
    const allArticles: NewsArticle[] = [];
    
    for (const topic of topics) {
      const url = `https://gnews.io/api/v4/top-headlines?category=${topic}&lang=en&country=us&max=15&apikey=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.articles) {
        const articles = data.articles.map((article: any) => ({
          id: `gnews-${article.url}`,
          title: article.title,
          description: article.description || '',
          url: article.url,
          urlToImage: article.image,
          publishedAt: article.publishedAt,
          source: {
            name: article.source.name,
            id: article.source.url
          },
          author: null,
          content: article.content,
          category: topic
        }));
        allArticles.push(...articles);
      }
    }
    
    return allArticles;
  } catch (error) {
    console.error('Error fetching from GNews:', error);
    return [];
  }
}

// Fetch from TheNewsAPI.com
async function fetchTheNewsAPI(apiKey: string): Promise<NewsArticle[]> {
  try {
    const categories = ['politics', 'general', 'world'];
    const allArticles: NewsArticle[] = [];
    
    for (const category of categories) {
      const url = `https://api.thenewsapi.com/v1/news/top?api_token=${apiKey}&locale=us&language=en&categories=${category}&limit=20`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.data) {
        const articles = data.data.map((article: any) => ({
          id: `thenewsapi-${article.uuid}`,
          title: article.title,
          description: article.description || '',
          url: article.url,
          urlToImage: article.image_url,
          publishedAt: article.published_at,
          source: {
            name: article.source || 'TheNewsAPI'
          },
          author: null,
          content: article.snippet,
          category: category
        }));
        allArticles.push(...articles);
      }
    }
    
    return allArticles;
  } catch (error) {
    console.error('Error fetching from TheNewsAPI:', error);
    return [];
  }
}

// Fetch from NewsData.io
async function fetchNewsData(apiKey: string): Promise<NewsArticle[]> {
  try {
    const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&country=us&language=en&category=politics,top,world&size=30`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.results && Array.isArray(data.results)) {
      return data.results.map((article: any) => ({
        id: `newsdata-${article.article_id}`,
        title: article.title,
        description: article.description || '',
        url: article.link,
        urlToImage: article.image_url,
        publishedAt: article.pubDate,
        source: {
          name: article.source_id || 'NewsData'
        },
        author: article.creator ? article.creator[0] : null,
        content: article.content,
        category: article.category ? article.category[0] : 'general'
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching from NewsData:', error);
    return [];
  }
}

// Fetch from NewsAPI.ai
async function fetchNewsAPIAI(apiKey: string): Promise<NewsArticle[]> {
  try {
    const url = `https://eventregistry.org/api/v1/article/getArticles`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: apiKey,
        keyword: 'politics OR breaking OR government OR military',
        sourceLocationUri: 'http://en.wikipedia.org/wiki/United_States',
        lang: 'eng',
        articlesPage: 1,
        articlesCount: 30,
        articlesSortBy: 'date',
        resultType: 'articles'
      })
    });
    
    const data = await response.json();
    
    if (data.articles && data.articles.results) {
      return data.articles.results.map((article: any) => ({
        id: `newsapi-ai-${article.uri}`,
        title: article.title,
        description: article.body ? article.body.substring(0, 200) : '',
        url: article.url,
        urlToImage: article.image,
        publishedAt: article.dateTime,
        source: {
          name: article.source?.title || 'NewsAPI.ai'
        },
        author: null,
        content: article.body,
        category: 'politics'
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching from NewsAPI.ai:', error);
    return [];
  }
}

// Fetch from APITube.io
async function fetchAPITube(apiKey: string): Promise<NewsArticle[]> {
  try {
    const url = `https://api.apitube.io/v1/news/everything?q=politics OR breaking&language=en&sortBy=publishedAt&pageSize=30&apiKey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.articles) {
      return data.articles.map((article: any) => ({
        id: `apitube-${article.url}`,
        title: article.title,
        description: article.description || '',
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: {
          name: article.source?.name || 'APITube'
        },
        author: article.author,
        content: article.content,
        category: 'general'
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching from APITube:', error);
    return [];
  }
}

// Helper function to detect if text is in English
function isEnglish(text: string): boolean {
  if (!text) return true; // Allow if no text
  
  // Check for common Spanish/non-English characters and patterns
  const nonEnglishPatterns = [
    /[áéíóúñü]/i, // Spanish accented characters
    /[àèìòù]/i,   // French/Italian accents
    /[äöüß]/i,    // German characters
    /[çğışö]/i,   // Turkish characters
    /[\u0400-\u04FF]/, // Cyrillic
    /[\u4E00-\u9FFF]/, // Chinese
    /[\u3040-\u309F\u30A0-\u30FF]/, // Japanese
    /[\uAC00-\uD7AF]/  // Korean
  ];
  
  // If any non-English pattern is found, it's not English
  return !nonEnglishPatterns.some(pattern => pattern.test(text));
}

// Fetch from Reddit (no API key needed for public read)
async function fetchReddit(): Promise<NewsArticle[]> {
  try {
    // Comprehensive subreddit list focused on news and politics (NO ENTERTAINMENT/SPORTS)
    const subreddits = [
      'news', 'worldnews', 'breakingnews', 'qualitynews', 'inthenews',
      'AnythingGoesNews', 'politics', 'PoliticalDiscussion', 'NeutralPolitics',
      'geopolitics', 'worldevents', 'technology', 'technews', 'tech',
      'science', 'Futurology', 'business', 'Economics', 'OutOfTheLoop',
      'TrueReddit', 'Journalism', 'fednews', 'law', 'anime_titties' // anime_titties is actually world politics
    ];
    
    // Keywords to filter out entertainment/sports content
    const excludeKeywords = [
      'movie', 'film', 'actor', 'actress', 'celebrity', 'album', 'song', 'music',
      'concert', 'tour', 'grammy', 'oscar', 'emmy', 'nfl', 'nba', 'mlb', 'nhl',
      'soccer', 'football', 'basketball', 'baseball', 'hockey', 'sports', 'game',
      'playoff', 'championship', 'super bowl', 'world series', 'world cup'
    ];
    
    const allArticles: NewsArticle[] = [];
    
    for (const subreddit of subreddits) {
      try {
        const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=20`;
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Hitky News Aggregator/1.0'
          }
        });
        
        // Check if response is OK and is JSON
        if (!response.ok) {
          console.log(`Reddit ${subreddit}: HTTP ${response.status}`);
          continue;
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.log(`Reddit ${subreddit}: Not JSON response`);
          continue;
        }
        
        const data = await response.json();
      
      if (data.data && data.data.children) {
        const posts = data.data.children
          .filter((child: any) => {
            const post = child.data;
            // Skip stickied posts, removed posts, and posts without URLs
            if (post.stickied || !post.url || post.removed) return false;
            // Skip if it's a reddit self-post without external link
            if (post.is_self && !post.selftext) return false;
            
            // Filter out entertainment/sports content
            const titleLower = post.title.toLowerCase();
            const hasExcludedKeyword = excludeKeywords.some(keyword => 
              titleLower.includes(keyword.toLowerCase())
            );
            if (hasExcludedKeyword) return false;
            
            return true;
          })
          .map((child: any) => {
            const post = child.data;
            // For Reddit posts, link to the Reddit discussion page so users can see comments
            const articleUrl = post.is_self || post.url.includes('reddit.com') 
              ? `https://reddit.com${post.permalink}`
              : post.url;
            
            return {
              id: `reddit-${post.id}`,
              title: post.title,
              description: post.selftext ? post.selftext.substring(0, 200) : `${post.num_comments} comments on Reddit`,
              url: articleUrl,
              urlToImage: post.thumbnail && post.thumbnail.startsWith('http') ? post.thumbnail : null,
              publishedAt: new Date(post.created_utc * 1000).toISOString(),
              source: {
                name: `r/${subreddit}`,
                id: subreddit
              },
              author: post.author,
              content: post.selftext || `Reddit discussion: ${post.num_comments} comments`,
              category: subreddit
            };
          });
        allArticles.push(...posts);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      } catch (subredditError) {
        console.log(`Error fetching r/${subreddit}:`, subredditError);
        continue;
      }
    }
    
    return allArticles;
  } catch (error) {
    console.error('Error fetching from Reddit:', error);
    return [];
  }
}

// Main function to aggregate all news
async function aggregateNews(env: Env): Promise<void> {
  console.log('Starting news aggregation...');
  
  const allArticles: NewsArticle[] = [];
  
  // Fetch from all sources in parallel (Reddit temporarily disabled due to 403 blocks)
  const [
    newsAPIArticles,
    gNewsArticles,
    theNewsAPIArticles,
    newsDataArticles,
    newsAPIAIArticles,
    apiTubeArticles
  ] = await Promise.all([
    fetchNewsAPIOrg(env.NEWSAPI_ORG_KEY),
    fetchGNews(env.GNEWS_KEY),
    fetchTheNewsAPI(env.THENEWSAPI_KEY),
    fetchNewsData(env.NEWSDATA_KEY),
    fetchNewsAPIAI(env.NEWSAPI_AI_KEY),
    fetchAPITube(env.APITUBE_KEY)
  ]);
  
  console.log(`API Results: NewsAPI.org=${newsAPIArticles.length}, GNews=${gNewsArticles.length}, TheNewsAPI=${theNewsAPIArticles.length}, NewsData=${newsDataArticles.length}, NewsAPI.ai=${newsAPIAIArticles.length}, APITube=${apiTubeArticles.length}`);
  
  allArticles.push(
    ...newsAPIArticles,
    ...gNewsArticles,
    ...theNewsAPIArticles,
    ...newsDataArticles,
    ...newsAPIAIArticles,
    ...apiTubeArticles
  );
  
  console.log(`Fetched ${allArticles.length} total articles before filtering`);
  
  // Filter out non-English articles (only check title, description can be empty)
  const englishArticles = allArticles.filter(article => 
    isEnglish(article.title)
  );
  
  // Remove duplicates with better similarity detection
  const uniqueArticles = englishArticles.filter((article, index, self) => {
    // Keep first occurrence
    return index === self.findIndex((a) => {
      // Exact URL match
      if (a.url === article.url) return true;
      
      // Exact title match (case insensitive)
      if (a.title.toLowerCase() === article.title.toLowerCase()) return true;
      
      // Similar title match (first 50 chars)
      const titleA = a.title.toLowerCase().substring(0, 50);
      const titleB = article.title.toLowerCase().substring(0, 50);
      if (titleA === titleB && titleA.length > 20) return true;
      
      return false;
    });
  });
  
  // Sort by published date (newest first)
  uniqueArticles.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  
  // Take top 200 articles
  const topArticles = uniqueArticles.slice(0, 200);
  
  // Store in KV
  await env.NEWS_ARTICLES.put('latest-articles', JSON.stringify({
    articles: topArticles,
    lastUpdated: new Date().toISOString(),
    totalResults: topArticles.length
  }));
  
  console.log(`Successfully aggregated ${topArticles.length} articles`);
}

export default {
  // Scheduled event (cron trigger)
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(aggregateNews(env));
  },
  
  // HTTP request handler (for manual triggers)
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/trigger-update') {
      ctx.waitUntil(aggregateNews(env));
      return new Response('News aggregation triggered', { status: 200 });
    }
    
    return new Response('Hitky News Worker - Use /trigger-update to manually trigger news fetch', {
      status: 200,
    });
  },
};
