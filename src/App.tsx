import { useEffect, useState } from 'react';
import { Newspaper, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';
import { NewsArticle } from './types/news';

function App() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // This will fetch from Cloudflare KV via a Cloudflare Function
      // For now, we'll use a placeholder endpoint
      const response = await fetch('/api/news');
      
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      
      const data = await response.json();
      setArticles(data.articles || []);
      setLastUpdated(data.lastUpdated || new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    
    // Refresh every 5 minutes to check for new articles
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg">
                <Newspaper className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Hitky</h1>
                <p className="text-xs text-slate-600">Breaking News & Updates</p>
              </div>
            </div>
            <button
              onClick={fetchNews}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
          {lastUpdated && (
            <p className="text-xs text-slate-500 mt-2">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading && articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-lg text-slate-600">Loading latest news...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <h2 className="text-lg font-semibold text-red-900">Error Loading News</h2>
              </div>
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchNews}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Newspaper className="w-16 h-16 text-slate-300 mb-4" />
            <p className="text-lg text-slate-600">No articles available</p>
            <p className="text-sm text-slate-500 mt-2">Check back soon for breaking news</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Latest Headlines</h2>
              <p className="text-slate-600">
                {articles.length} article{articles.length !== 1 ? 's' : ''} from trusted sources
              </p>
            </div>
            {/* Table View */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Headline
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Published
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Link
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {articles.map((article) => (
                      <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            {article.urlToImage && (
                              <img
                                src={article.urlToImage}
                                alt=""
                                className="w-20 h-14 object-cover rounded flex-shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-gray-900 hover:text-primary line-clamp-2"
                              >
                                {article.title}
                              </a>
                              {article.description && (
                                <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                  {article.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-primary">
                            {article.source.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500">
                            {new Date(article.publishedAt).toLocaleDateString()}
                          </span>
                          <br />
                          <span className="text-xs text-gray-400">
                            {new Date(article.publishedAt).toLocaleTimeString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 inline-flex items-center gap-1"
                          >
                            Read
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-20">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-slate-600">
            <p>© 2025 Hitky.com - Breaking News Aggregator</p>
            <p className="mt-1">News updated every 15 minutes from multiple sources</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
