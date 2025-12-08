'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ThumbsUp, MapPin, CheckCircle2, XCircle, Flag } from 'lucide-react';
import type { Tweet } from './dashboard-page';

interface TweetListProps {
  tweets: Tweet[];
  onSelectTweet: (tweet: Tweet) => void;
  selectedTweetId?: string;
  verificationStatuses: Map<
    string,
    'unverified' | 'verified_true' | 'verified_false'
  >;
  sentToAdmin: Set<string>;
}

const severityConfig = {
  critical: { color: 'destructive', label: 'Critical' },
  high: { color: 'secondary', label: 'High' },
  medium: { color: 'accent', label: 'Medium' },
  low: { color: 'muted', label: 'Low' },
};

export default function TweetList({
  tweets,
  onSelectTweet,
  selectedTweetId,
  verificationStatuses,
  sentToAdmin,
}: TweetListProps) {
  return (
    <div className="space-y-2">
      {tweets.map((tweet) => {
        const status = verificationStatuses.get(tweet.id) || 'unverified';
        let borderColor = 'border-border';
        let bgColor = '';
        if (status === 'verified_true') {
          borderColor = 'border-green-500';
          bgColor = 'bg-green-50 dark:bg-green-950/30';
        } else if (status === 'verified_false') {
          borderColor = 'border-red-500';
          bgColor = 'bg-red-50 dark:bg-red-950/30';
        } else if (selectedTweetId === tweet.id) {
          borderColor = 'border-primary';
          bgColor = 'bg-primary/5';
        }

        return (
          <Card
            key={tweet.id}
            data-tweet-id={tweet.id}
            onClick={() => onSelectTweet(tweet)}
            className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01] border-2 ${borderColor} ${bgColor} overflow-hidden`}>
            <div className="flex gap-3 p-3">
              {/* Left: Image Preview (if exists) */}
              {tweet.image && (
                <div className="w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden border border-border bg-muted shadow-sm">
                  <img
                    src={tweet.image || '/placeholder.svg'}
                    alt="Tweet preview"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              {/* Right: Content */}
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                {/* Header: Avatar and Author Info */}
                <div className="flex items-start gap-2">
                  <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-background shadow-sm">
                    <AvatarImage src={tweet.avatar || '/placeholder.svg'} />
                    <AvatarFallback className="text-xs font-semibold">
                      {tweet.author[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-tight truncate">
                      {tweet.author}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tweet.timestamp}
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-xs flex-shrink-0 font-medium ${
                      severityConfig[tweet.severity].color === 'destructive'
                        ? 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                        : severityConfig[tweet.severity].color === 'secondary'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400'
                        : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400'
                    }`}>
                    {severityConfig[tweet.severity].label}
                  </Badge>
                </div>

                {/* Content */}
                <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
                  {tweet.content}
                </p>

                {/* Footer: Stats and Status */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-auto">
                  <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span className="font-medium">{tweet.votes}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="font-medium">{tweet.distance} km</span>
                  </div>

                  <div className="flex gap-1.5 ml-auto">
                    {status === 'verified_true' && (
                      <Badge className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium shadow-sm">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verified True
                      </Badge>
                    )}
                    {status === 'verified_false' && (
                      <Badge className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium shadow-sm">
                        <XCircle className="w-3 h-3 mr-1" />
                        Verified False
                      </Badge>
                    )}
                    {status === 'unverified' && (
                      <Badge
                        variant="outline"
                        className="text-xs border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 font-medium">
                        <Flag className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
