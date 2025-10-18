import { ExternalLink, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { NewsArticle } from '../types/news';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/Card';

interface NewsCardProps {
  article: NewsArticle;
}

export function NewsCard({ article }: NewsCardProps) {
  const timeAgo = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true });

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {article.urlToImage && (
        <div className="relative h-48 overflow-hidden bg-muted">
          <img
            src={article.urlToImage}
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <span className="font-semibold text-primary">{article.source.name}</span>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{timeAgo}</span>
          </div>
        </div>
        <CardTitle className="text-xl line-clamp-2 hover:text-primary transition-colors">
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            {article.title}
          </a>
        </CardTitle>
        {article.description && (
          <CardDescription className="line-clamp-3 mt-2">
            {article.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {article.author && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>{article.author}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Read full article
          <ExternalLink className="w-4 h-4" />
        </a>
      </CardFooter>
    </Card>
  );
}
