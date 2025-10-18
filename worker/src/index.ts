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
    const categories = ['politics', 'general'];
    const allArticles: NewsArticle[] = [];
    
    for (const category of categories) {
      const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&pageSize=20&apiKey=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.articles) {
        const articles = data.articles.map((article: any) => ({
          id: `newsapi-org-${article.url}`,
          title: article.title,
          description: article.description || '',
          url: article.url,
          urlToImage: article.urlToImage,
          publishedAt: article.publishedAt,
          source: {
            name: article.source.name,
            id: article.source.id
          },
          author: article.author,
          content: article.content,
          category: category
        }));
        allArticles.push(...articles);
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
      const url = `https://gnews.io/api/v4/top-headlines?category=${topic}&lang=en&country=us&max=10&apikey=${apiKey}`;
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
      const url = `https://api.thenewsapi.com/v1/news/top?api_token=${apiKey}&locale=us&categories=${category}&limit=15`;
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
    const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&country=us&language=en&category=politics,top&size=20`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.results) {
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
        articlesCount: 20,
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
    const url = `https://api.apitube.io/v1/news/everything?q=politics OR breaking&language=en&sortBy=publishedAt&apiKey=${apiKey}`;
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

// Main function to aggregate all news
async function aggregateNews(env: Env): Promise<void> {
  console.log('Starting news aggregation...');
  
  const allArticles: NewsArticle[] = [];
  
  // Fetch from all sources in parallel
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
  
  allArticles.push(
    ...newsAPIArticles,
    ...gNewsArticles,
    ...theNewsAPIArticles,
    ...newsDataArticles,
    ...newsAPIAIArticles,
    ...apiTubeArticles
  );
  
  // Remove duplicates based on title similarity
  const uniqueArticles = allArticles.filter((article, index, self) =>
    index === self.findIndex((a) => 
      a.title.toLowerCase() === article.title.toLowerCase() ||
      a.url === article.url
    )
  );
  
  // Sort by published date (newest first)
  uniqueArticles.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  
  // Take top 100 articles
  const topArticles = uniqueArticles.slice(0, 100);
  
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
