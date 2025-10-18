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
      <header className="sticky top-0 z-50 shadow-lg bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Top Row - Logo and Refresh */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2.5 rounded-lg shadow-lg">
                <Newspaper className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white tracking-tight">Hitky</h1>
            </div>
            <button
              onClick={fetchNews}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh News</span>
            </button>
          </div>
          
          {/* Bottom Row - Subtitle and Last Updated */}
          <div className="flex items-center justify-between text-white/90 border-t border-white/10 pt-3">
            <p className="text-base font-medium">Breaking News & Global Updates</p>
            {lastUpdated && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-white/60">Last Updated:</span>
                <span className="font-semibold text-blue-400">
                  {new Date(lastUpdated).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading && articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="w-12 h-12 text-slate-700 animate-spin mb-4" />
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
            <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Latest Headlines</h2>
                <p className="text-slate-600 mt-1">
                  {articles.length} article{articles.length !== 1 ? 's' : ''} from trusted global sources
                </p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Coverage</p>
                <p className="text-sm font-semibold text-slate-700">US Politics • Global Events • Russia • China • Middle East</p>
              </div>
            </div>
            {/* Table View */}
            <div className="bg-white rounded-lg shadow ring-1 ring-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-800 text-white">
                    <tr>
                      <th scope="col" className="px-5 py-3 text-left font-semibold uppercase tracking-wide text-[11px] sticky top-0 z-10">
                        Headline
                      </th>
                      <th scope="col" className="px-5 py-3 text-left font-semibold uppercase tracking-wide text-[11px] sticky top-0 z-10">
                        Source
                      </th>
                      <th scope="col" className="px-5 py-3 text-left font-semibold uppercase tracking-wide text-[11px] sticky top-0 z-10">
                        Published
                      </th>
                      <th scope="col" className="px-5 py-3 text-left font-semibold uppercase tracking-wide text-[11px] sticky top-0 z-10">
                        Image
                      </th>
                      <th scope="col" className="px-5 py-3 text-left font-semibold uppercase tracking-wide text-[11px] sticky top-0 z-10">
                        Article
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {articles.map((article, idx) => (
                      <tr key={article.id} className={`even:bg-slate-50 hover:bg-slate-100`}>
                        <td className="px-5 py-3 align-top max-w-3xl">
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-slate-900 hover:text-blue-700 hover:underline"
                          >
                            {article.title}
                          </a>
                          {article.description && (
                            <p className="mt-1 text-xs text-slate-600 truncate">
                              {article.description}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className="source-badge">
                            {article.source.name}
                          </span>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap align-top">
                          <span className="text-slate-600">
                            {new Date(article.publishedAt).toLocaleDateString()}
                          </span>
                          <br />
                          <span className="text-[11px] text-slate-400">
                            {new Date(article.publishedAt).toLocaleTimeString()}
                          </span>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap align-top text-center">
                          {article.urlToImage ? (
                            <a
                              href={article.urlToImage}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-700 hover:text-blue-800 inline-flex items-center gap-1"
                            >
                              View
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap align-top text-center">
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 hover:text-blue-800 inline-flex items-center gap-1 font-medium"
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
