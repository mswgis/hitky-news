export interface NewsArticle {
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

export interface NewsResponse {
  articles: NewsArticle[];
  totalResults: number;
  lastUpdated: string;
}
