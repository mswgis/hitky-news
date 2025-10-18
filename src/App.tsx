import { useEffect, useState } from 'react';
import { Newspaper, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';
import type { NewsArticle } from './types/news';

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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 sticky top-0 z-50 shadow">
        <div className="container mx-auto px-4 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Newspaper className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Hitky</h1>
                <p className="text-xs text-white/80">Breaking News & Updates</p>
              </div>
            </div>
            <button
              onClick={fetchNews}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/40 bg-white/10 hover:bg-white/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
          {lastUpdated && (
            <p className="text-xs text-white/80 mt-2">
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
                  <thead className="bg-blue-600">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Headline
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Source
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Published
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Image
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Article
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {articles.map((article, idx) => (
                      <tr key={article.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50 hover:bg-slate-100'}>
                        <td className="px-6 py-4 align-top">
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-slate-900 hover:text-blue-700 hover:underline"
                          >
                            {article.title}
                          </a>
                          {article.description && (
                            <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                              {article.description}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1">
                            {article.source.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-top">
                          <span className="text-sm text-slate-600">
                            {new Date(article.publishedAt).toLocaleDateString()}
                          </span>
                          <br />
                          <span className="text-xs text-slate-400">
                            {new Date(article.publishedAt).toLocaleTimeString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-top text-center">
                          {article.urlToImage ? (
                            <a
                              href={article.urlToImage}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-700 hover:text-blue-800 inline-flex items-center gap-1 text-sm"
                            >
                              View
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-top text-center">
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 hover:text-blue-800 inline-flex items-center gap-1 text-sm font-medium"
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
