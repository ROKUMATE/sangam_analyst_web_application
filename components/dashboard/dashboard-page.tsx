'use client';

import { useState, useMemo, useRef } from 'react';
import TweetList from './tweet-list';
import TweetDetailsPanel from './tweet-details-panel';
import DashboardHeader from './dashboard-header';
import MapSection from './map-section';
import StatsOverview from './stats-overview';
import NotificationStack from './notification-stack';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export interface Tweet {
  id: string;
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
    credibilityScore: number;
    sources: Array<{ title: string; url: string; domain: string }>;
    analysis: string;
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
  const [selectedTweet, setSelectedTweet] = useState<Tweet | null>(null);
  const [sortBy, setSortBy] = useState<'votes' | 'distance'>('votes');
  const [verificationStatuses, setVerificationStatuses] = useState<
    Map<string, 'unverified' | 'verified_true' | 'verified_false'>
  >(new Map());
  const [sentToAdminTweets, setSentToAdminTweets] = useState<Set<string>>(
    new Set()
  );
  const [notifications, setNotifications] = useState<
    Array<{ id: string; message: string; type: 'critical' | 'verified' }>
  >([]);
  const tweetListRef = useRef<HTMLDivElement>(null);

  const tweets: Tweet[] = [
    {
      id: '1',
      author: 'John Smith',
      phone: '+1-555-0101',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      content:
        'Severe flooding reported in the harbor district. Water level rising rapidly. Emergency response needed immediately.',
      image: '/flooding-disaster-harbor.jpg',
      timestamp: '2 hours ago',
      latitude: 40.7128,
      longitude: -74.006,
      votes: 342,
      distance: 2.3,
      severity: 'critical',
      verificationStatus: 'unverified',
      aiReport: {
        credibilityScore: 94,
        sources: [
          {
            title: 'Harbor Authority Reports Flooding',
            url: 'https://harbor.gov/reports',
            domain: 'harbor.gov',
          },
          {
            title: 'Reddit: r/flooding discussions',
            url: 'https://reddit.com/r/flooding',
            domain: 'reddit.com',
          },
          {
            title: 'Twitter: @WeatherAlert updates',
            url: 'https://twitter.com/weatheralert',
            domain: 'twitter.com',
          },
        ],
        analysis:
          'Multiple corroborating reports from official sources and social media. Consistent timestamps and location data suggest high credibility.',
      },
    },
    {
      id: '2',
      author: 'Maria Garcia',
      phone: '+1-555-0102',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      content:
        'Oil spill detected near coastal zone. Marine life at risk. Containment efforts underway.',
      image: '/oil-spill-ocean-pollution.jpg',
      timestamp: '1 hour ago',
      latitude: 40.715,
      longitude: -74.002,
      votes: 298,
      distance: 3.1,
      severity: 'critical',
      verificationStatus: 'unverified',
      aiReport: {
        credibilityScore: 87,
        sources: [
          {
            title: 'EPA Oil Spill Reports',
            url: 'https://epa.gov/oil-spill',
            domain: 'epa.gov',
          },
          {
            title: 'X: Environmental agencies',
            url: 'https://x.com/envagencies',
            domain: 'x.com',
          },
        ],
        analysis:
          'Confirmed by environmental monitoring agencies. Some media coverage with consistent details about location and scale.',
      },
    },
    {
      id: '3',
      author: 'Ahmed Hassan',
      phone: '+1-555-0103',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
      content:
        'Strong rip currents warning issued. Multiple swimmers rescued by coast guard.',
      image: '/ocean-rip-currents-warning.jpg',
      timestamp: '3 hours ago',
      latitude: 40.72,
      longitude: -74.008,
      votes: 187,
      distance: 4.5,
      severity: 'high',
      verificationStatus: 'unverified',
      aiReport: {
        credibilityScore: 76,
        sources: [
          {
            title: 'Coast Guard Alerts',
            url: 'https://uscg.gov/alerts',
            domain: 'uscg.gov',
          },
          {
            title: 'Reddit: r/swimming',
            url: 'https://reddit.com/r/swimming',
            domain: 'reddit.com',
          },
        ],
        analysis:
          'Partially verified through official channels. Some unconfirmed details about number of rescues.',
      },
    },
    {
      id: '4',
      author: 'Lisa Chen',
      phone: '+1-555-0104',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
      content:
        'Coral bleaching event observed in reef area. Water temperature anomaly detected.',
      image: '/coral-bleaching-event-ocean-reef.jpg',
      timestamp: '4 hours ago',
      latitude: 40.73,
      longitude: -73.99,
      votes: 156,
      distance: 5.2,
      severity: 'high',
      verificationStatus: 'unverified',
      aiReport: {
        credibilityScore: 82,
        sources: [
          {
            title: 'Marine Biology Institute',
            url: 'https://marinebio.org',
            domain: 'marinebio.org',
          },
          {
            title: 'X: Ocean Research',
            url: 'https://x.com/oceanresearch',
            domain: 'x.com',
          },
        ],
        analysis:
          "Consistent with seasonal patterns. Temperature readings align with research institutions' data.",
      },
    },
    {
      id: '5',
      author: 'Robert Wilson',
      phone: '+1-555-0105',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
      content:
        'Unusual algae bloom in coastal waters. Testing samples for toxicity.',
      image: '/algae-bloom-coastal-waters-ocean.jpg',
      timestamp: '5 hours ago',
      latitude: 40.74,
      longitude: -74.01,
      votes: 92,
      distance: 6.8,
      severity: 'medium',
      verificationStatus: 'unverified',
      aiReport: {
        credibilityScore: 71,
        sources: [
          {
            title: 'Water Quality Monitoring',
            url: 'https://waterquality.gov',
            domain: 'waterquality.gov',
          },
          {
            title: 'Reddit: r/oceanlife',
            url: 'https://reddit.com/r/oceanlife',
            domain: 'reddit.com',
          },
        ],
        analysis:
          'Some concerns about toxicity claims without lab confirmation. Sources are limited.',
      },
    },
  ];

  const sortedTweets = useMemo(() => {
    return [...tweets].sort((a, b) => {
      if (sortBy === 'votes') {
        return b.votes - a.votes;
      } else {
        return a.distance - b.distance;
      }
    });
  }, [sortBy]);

  const handleVerifyTweet = (isTrue: boolean) => {
    if (!selectedTweet) return;
    const status = isTrue ? 'verified_true' : 'verified_false';
    setVerificationStatuses(
      new Map(verificationStatuses).set(selectedTweet.id, status)
    );

    const notification: {
      id: string;
      message: string;
      type: 'critical' | 'verified';
    } = {
      id: Date.now().toString(),
      message: `Tweet marked as ${isTrue ? 'verified true' : 'verified false'}`,
      type: isTrue ? 'verified' : 'critical',
    };
    setNotifications((prev) => [...prev, notification]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    }, 3000);
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
    verified: Array.from(verificationStatuses.values()).length,
    sentToAdmin: sentToAdminTweets.size,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader analyst={analyst} onLogout={onLogout} />
      <NotificationStack notifications={notifications} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Section: Map (50%) and Stats (50%) */}
        <div className="flex flex-1 gap-6 p-6 border-b">
          {/* Left: Map */}
          <div className="flex-1 min-w-0">
            <MapSection
              tweets={tweets}
              selectedTweetId={selectedTweet?.id}
              onSelectTweet={handleMapHotspotClick}
            />
          </div>

          {/* Right: Stats 2x2 Grid */}
          <div className="w-80">
            <StatsOverview stats={stats} />
          </div>
        </div>

        {/* Bottom Section: Tweets List (full when closed, 40% when open) and Details Panel (60% when open) */}
        <div className="flex-1 flex overflow-hidden gap-0">
          {/* Left: Tweet List - Full width when no selection, 40% when selection exists */}
          <div
            className={`flex flex-col ${
              selectedTweet ? 'w-2/5' : 'w-full'
            } transition-all duration-300`}>
            <Card
              className="h-full border-0 rounded-none flex flex-col"
              style={
                selectedTweet ? { borderRight: '1px solid var(--border)' } : {}
              }>
              <CardHeader className="pb-3 border-b flex-shrink-0">
                <div className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-lg">Tweets in Area</CardTitle>
                    <CardDescription className="text-xs">
                      40 km radius
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
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
              </CardHeader>
              <CardContent
                ref={tweetListRef}
                className="flex-1 overflow-y-auto p-3">
                <TweetList
                  tweets={sortedTweets}
                  onSelectTweet={setSelectedTweet}
                  selectedTweetId={selectedTweet?.id}
                  verificationStatuses={verificationStatuses}
                  sentToAdmin={sentToAdminTweets}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right: Details Panel (60%, smooth slide-in) - Only shows when tweet selected */}
          {selectedTweet && (
            <div className="w-3/5 overflow-hidden animate-in slide-in-from-right-96 duration-300">
              <TweetDetailsPanel
                tweet={selectedTweet}
                verificationStatus={
                  verificationStatuses.get(selectedTweet.id) || 'unverified'
                }
                isSentToAdmin={sentToAdminTweets.has(selectedTweet.id)}
                onVerify={handleVerifyTweet}
                onSendToAdmin={handleSendToAdmin}
                onClose={() => setSelectedTweet(null)}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
