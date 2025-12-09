'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  AlertCircle,
  MapPin,
  Calendar,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import {
  getRedditSources,
  type RedditSourcesResponse,
} from '@/lib/api-integration/reddit.service';

interface AnalyticsPageProps {
  lat: number;
  lon: number;
}

export function AnalyticsPage({ lat, lon }: AnalyticsPageProps) {
  const [data, setData] = useState<RedditSourcesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRedditSources = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getRedditSources(lat, lon, 10, 10, true);
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch Reddit sources'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedditSources();
  }, [lat, lon]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }

    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }

    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Spinner className="w-12 h-12 mx-auto" />
          <p className="text-muted-foreground">
            Loading social media insights...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <CardTitle className="text-destructive">Error</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button
              onClick={fetchRedditSources}
              variant="outline"
              className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Social Media Intelligence
            </h2>
            <p className="text-white/90 text-sm">
              Reddit discussions and insights from your area
            </p>
          </div>
          <Button
            onClick={fetchRedditSources}
            variant="secondary"
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {data && (
          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{data.area}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-white/20 text-white hover:bg-white/30">
                {data.count} {data.count === 1 ? 'Post' : 'Posts'} Found
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Posts Grid */}
      {data && data.results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.results.map((post) => (
            <Card
              key={post.id}
              className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <CardDescription className="text-sm">
                        {post.location_context}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <CardDescription className="text-xs">
                        {formatDate(post.created_at)}
                      </CardDescription>
                    </div>
                  </div>
                  <a
                    href={post.metadata}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {truncateContent(post.content, 250)}
                </p>
                {post.content.length > 250 && (
                  <a
                    href={post.metadata}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 text-xs font-medium mt-2 inline-block">
                    Read more on Reddit →
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No Reddit posts found in this area
            </p>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Try adjusting the search radius or check back later
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
