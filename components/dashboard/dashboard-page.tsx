'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import TweetList from './tweet-list';
import TweetDetailsPanel from './tweet-details-panel';
import DashboardHeader from './dashboard-header';
import MapSection from './map-section';
import StatsOverview from './stats-overview';
import NotificationStack from './notification-stack';
import { AnalyticsPage } from './analytics-page';
import { RefreshCw } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  getNearbyTweets,
  verifyTweet,
  Tweet as APITweet,
} from '@/lib/api-integration';
import { clearAuthData } from '@/lib/utils/cookies';

export interface Tweet {
  id: string;
  userId: number; // User ID to fetch user info
  author: string;
  phone: string;
  avatar: string;
  content: string;
  image?: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  votes: number;
  distance: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  verificationStatus: 'unverified' | 'verified_true' | 'verified_false';
  verifiedBy?: string;
  sentToAdmin?: boolean;
  aiReport?: {
    title: string;
    description: string;
    credibilityScore: number;
    severityScore: number;
    areaOfImpact: string;
    sources: Array<{ title: string; url: string; domain: string }>;
    analysis: string;
    nearbySimilarPosts?: Array<{
      id: string;
      username: string;
      phoneNumber: string;
      timestamp: string;
      distance: number;
    }>;
  };
}

interface DashboardPageProps {
  analyst: { name: string; phone: string } | null;
  onLogout: () => void;
}

export default function DashboardPage({
  analyst,
  onLogout,
}: DashboardPageProps) {
  const handleLogout = () => {
    clearAuthData();
    onLogout();
  };

  const [selectedTweet, setSelectedTweet] = useState<Tweet | null>(null);
  const [sortBy, setSortBy] = useState<'votes' | 'distance' | 'time'>('time');
  const [verificationStatuses, setVerificationStatuses] = useState<
    Map<string, 'unverified' | 'verified_true' | 'verified_false'>
  >(new Map());
  const [sentToAdminTweets, setSentToAdminTweets] = useState<Set<string>>(
    new Set()
  );
  const [notifications, setNotifications] = useState<
    Array<{ id: string; message: string; type: 'critical' | 'verified' }>
  >([]);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'tweets' | 'analytics'>('tweets');
  const tweetListRef = useRef<HTMLDivElement>(null);

  // User location (used for both tweets and analytics)
  const userLat = 17.4059406;
  const userLon = 78.6210593;

  // Fetch tweets on component mount
  useEffect(() => {
    const fetchTweets = async () => {
      try {
        setLoading(true);
        setError(null);

        const fetchedTweets = await getNearbyTweets(userLat, userLon);
        setTweets(fetchedTweets);
      } catch (err) {
        console.error('Failed to fetch tweets:', err);
        setError(err instanceof Error ? err.message : 'Failed to load tweets');
      } finally {
        setLoading(false);
      }
    };

    fetchTweets();
  }, []);

  const handleRefreshTweets = async () => {
    try {
      setRefreshing(true);
      setError(null);

      const fetchedTweets = await getNearbyTweets(userLat, userLon);
      setTweets(fetchedTweets);

      const notification: {
        id: string;
        message: string;
        type: 'critical' | 'verified';
      } = {
        id: Date.now().toString(),
        message: 'Tweets refreshed successfully',
        type: 'verified',
      };
      setNotifications((prev) => [...prev, notification]);
      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== notification.id)
        );
      }, 3000);
    } catch (err) {
      console.error('Failed to refresh tweets:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh tweets');
    } finally {
      setRefreshing(false);
    }
  };

  const sortedTweets = useMemo(() => {
    return [...tweets].sort((a, b) => {
      // Parse timestamps
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();

      if (sortBy === 'time') {
        // Sort by time (newest first)
        return dateB - dateA;
      } else if (sortBy === 'votes') {
        // If votes are equal, use timestamp
        if (b.votes === a.votes) {
          return dateB - dateA;
        }
        return b.votes - a.votes;
      } else {
        // If distance is equal, use timestamp
        if (a.distance === b.distance) {
          return dateB - dateA;
        }
        return a.distance - b.distance;
      }
    });
  }, [sortBy, tweets]);

  const handleVerifyTweet = async () => {
    if (!selectedTweet) return;

    const currentStatus =
      verificationStatuses.get(selectedTweet.id) || 'unverified';
    const newStatus =
      currentStatus === 'verified_true' ? 'unverified' : 'verified_true';
    const isVerified = newStatus === 'verified_true';

    try {
      // Call the API to verify/unverify the tweet
      await verifyTweet(selectedTweet.id, isVerified);

      // Update local state on success
      setVerificationStatuses(
        new Map(verificationStatuses).set(selectedTweet.id, newStatus)
      );

      const notification: {
        id: string;
        message: string;
        type: 'critical' | 'verified';
      } = {
        id: Date.now().toString(),
        message: isVerified
          ? 'Tweet verified successfully'
          : 'Tweet verification removed',
        type: isVerified ? 'verified' : 'critical',
      };
      setNotifications((prev) => [...prev, notification]);
      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== notification.id)
        );
      }, 3000);
    } catch (error) {
      console.error('Failed to verify tweet:', error);
      const errorNotification: {
        id: string;
        message: string;
        type: 'critical' | 'verified';
      } = {
        id: Date.now().toString(),
        message:
          error instanceof Error ? error.message : 'Failed to verify tweet',
        type: 'critical',
      };
      setNotifications((prev) => [...prev, errorNotification]);
      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== errorNotification.id)
        );
      }, 3000);
    }
  };

  const handleSendToAdmin = () => {
    if (!selectedTweet) return;
    setSentToAdminTweets((prev) => new Set([...prev, selectedTweet.id]));

    const notification: {
      id: string;
      message: string;
      type: 'critical' | 'verified';
    } = {
      id: Date.now().toString(),
      message: `Tweet sent to administrator for review`,
      type: 'verified',
    };
    setNotifications((prev) => [...prev, notification]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    }, 3000);
  };

  const handleMapHotspotClick = (tweet: Tweet) => {
    setSelectedTweet(tweet);

    setTimeout(() => {
      const tweetElement = tweetListRef.current?.querySelector(
        `[data-tweet-id="${tweet.id}"]`
      );
      if (tweetElement) {
        tweetElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 0);
  };

  const stats = {
    total: tweets.length,
    criticalCount: tweets.filter((t) => t.severity === 'critical').length,
    verified: tweets.filter(
      (t) =>
        t.verificationStatus === 'verified_true' ||
        verificationStatuses.get(t.id) === 'verified_true'
    ).length,
    sentToAdmin: sentToAdminTweets.size,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader analyst={analyst} onLogout={handleLogout} />
      <NotificationStack notifications={notifications} />

      <main className="flex-1 flex flex-col">
        {/* Top Section: Map (75vh) and Stats */}
        <div className="h-[75vh] flex gap-6 p-6 border-b">
          {/* Left: Map */}
          <div className="flex-1 min-w-0">
            <MapSection
              tweets={tweets}
              selectedTweetId={selectedTweet?.id}
              onSelectTweet={handleMapHotspotClick}
            />
          </div>

          {/* Right: Stats 2x2 Grid */}
          <div className="w-80 h-full">
            <StatsOverview stats={stats} />
          </div>
        </div>

        {/* Bottom Section: Tabs for Tweets List and Analytics */}
        <div className="flex gap-0 p-6 pt-0">
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as 'tweets' | 'analytics')
            }
            className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="tweets">Tweets Monitor</TabsTrigger>
              <TabsTrigger value="analytics">
                Social Media Analytics
              </TabsTrigger>
            </TabsList>

            {/* Tweets Tab */}
            <TabsContent value="tweets" className="mt-0">
              <div className="flex gap-0">
                {/* Left: Tweet List - Full width when no selection, 40% when selection exists */}
                <div
                  className={`flex flex-col ${
                    selectedTweet ? 'w-2/5' : 'w-full'
                  } transition-all duration-300`}>
                  <Card
                    className="border-2 rounded-lg flex flex-col shadow-sm"
                    style={
                      selectedTweet
                        ? { borderRight: '1px solid var(--border)' }
                        : {}
                    }>
                    <CardHeader className="pb-3 border-b flex-shrink-0">
                      <div className="flex flex-row items-center justify-between space-y-0">
                        <div>
                          <CardTitle className="text-lg">
                            Tweets in Area
                          </CardTitle>
                          <CardDescription className="text-xs">
                            40 km radius
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleRefreshTweets}
                            disabled={refreshing}
                            className="p-1.5 rounded border border-border hover:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Refresh tweets">
                            <RefreshCw
                              className={`w-4 h-4 ${
                                refreshing ? 'animate-spin' : ''
                              }`}
                            />
                          </button>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setSortBy('time')}
                              className={`px-2 py-1 text-xs rounded border transition-colors ${
                                sortBy === 'time'
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'border-border hover:border-primary/50'
                              }`}>
                              Time
                            </button>
                            <button
                              onClick={() => setSortBy('votes')}
                              className={`px-2 py-1 text-xs rounded border transition-colors ${
                                sortBy === 'votes'
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'border-border hover:border-primary/50'
                              }`}>
                              Votes
                            </button>
                            <button
                              onClick={() => setSortBy('distance')}
                              className={`px-2 py-1 text-xs rounded border transition-colors ${
                                sortBy === 'distance'
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'border-border hover:border-primary/50'
                              }`}>
                              Distance
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent
                      ref={tweetListRef}
                      className="overflow-y-auto p-3 max-h-[550px]">
                      {loading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center space-y-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="text-sm text-muted-foreground">
                              Loading tweets...
                            </p>
                          </div>
                        </div>
                      ) : error ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center space-y-3">
                            <p className="text-sm text-destructive">{error}</p>
                            <button
                              onClick={() => window.location.reload()}
                              className="text-xs text-primary hover:underline">
                              Retry
                            </button>
                          </div>
                        </div>
                      ) : tweets.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-sm text-muted-foreground">
                            No tweets found in your area
                          </p>
                        </div>
                      ) : (
                        <TweetList
                          tweets={sortedTweets}
                          onSelectTweet={setSelectedTweet}
                          selectedTweetId={selectedTweet?.id}
                          verificationStatuses={verificationStatuses}
                          sentToAdmin={sentToAdminTweets}
                        />
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Right: Details Panel (60%, smooth slide-in) - Only shows when tweet selected */}
                {selectedTweet && (
                  <div className="w-3/5 overflow-hidden animate-in slide-in-from-right-96 duration-300 pl-6">
                    <TweetDetailsPanel
                      tweet={selectedTweet}
                      verificationStatus={
                        verificationStatuses.get(selectedTweet.id) ||
                        'unverified'
                      }
                      isSentToAdmin={sentToAdminTweets.has(selectedTweet.id)}
                      onVerify={handleVerifyTweet}
                      onSendToAdmin={handleSendToAdmin}
                      onClose={() => setSelectedTweet(null)}
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="mt-0">
              <AnalyticsPage lat={userLat} lon={userLon} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
