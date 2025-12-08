'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  MapPin,
  Calendar,
  ThumbsUp,
  Phone,
  Send,
  CheckCircle2,
  XCircle,
  ExternalLink,
  X,
  Zap,
  Settings,
  Map,
} from 'lucide-react';
import type { Tweet } from './dashboard-page';

interface TweetDetailsPanelProps {
  tweet: Tweet;
  verificationStatus: 'unverified' | 'verified_true' | 'verified_false';
  isSentToAdmin: boolean;
  onVerify: () => void;
  onSendToAdmin: () => void;
  onClose: () => void;
}

export default function TweetDetailsPanel({
  tweet,
  verificationStatus,
  isSentToAdmin,
  onVerify,
  onSendToAdmin,
  onClose,
}: TweetDetailsPanelProps) {
  const [showManualVerification, setShowManualVerification] = useState(false);

  const severityColors = {
    critical: 'bg-destructive text-destructive-foreground',
    high: 'bg-secondary text-secondary-foreground',
    medium: 'bg-accent text-accent-foreground',
    low: 'bg-primary text-primary-foreground',
  };

  return (
    <Card className="h-full border-2 rounded-lg flex flex-col overflow-hidden shadow-sm">
      <CardHeader className="pb-3 border-b flex-shrink-0 flex flex-row items-start justify-between px-4 py-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <CardTitle>Tweet Details</CardTitle>
            <Badge className={severityColors[tweet.severity]}>
              {tweet.severity.charAt(0).toUpperCase() + tweet.severity.slice(1)}
            </Badge>
            {verificationStatus === 'verified_true' ? (
              <Badge className="bg-green-600 text-white">Verified</Badge>
            ) : (
              <Badge variant="outline">Unverified</Badge>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0"
          aria-label="Close details panel">
          <X className="w-5 h-5" />
        </button>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto space-y-4 pt-4 px-4 pb-4">
        {/* Author Info */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={tweet.avatar || '/placeholder.svg'} />
              <AvatarFallback>{tweet.author[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-sm">{tweet.author}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Phone className="w-3 h-3" />
                <span>{tweet.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content and Image */}
        <div>
          <p className="text-sm text-foreground leading-relaxed mb-3">
            {tweet.content}
          </p>
          {tweet.image && (
            <img
              src={tweet.image || '/placeholder.svg'}
              alt="Tweet content"
              className="w-full rounded-lg border border-border object-cover max-h-48"
            />
          )}
        </div>

        {/* Location & Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm py-3 border-y">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{tweet.distance} km away</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{tweet.timestamp}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground col-span-2">
            <ThumbsUp className="w-4 h-4" />
            <span>{tweet.votes} upvotes</span>
          </div>
        </div>

        {/* Coordinates */}
        <div className="bg-muted/50 rounded p-2 text-xs font-mono text-muted-foreground">
          <p>Lat: {tweet.latitude.toFixed(4)}</p>
          <p>Lon: {tweet.longitude.toFixed(4)}</p>
        </div>

        {tweet.aiReport && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              AI Analysis Report
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <p className="text-muted-foreground">Credibility Score</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary to-secondary h-full"
                      style={{ width: `${tweet.aiReport.credibilityScore}%` }}
                    />
                  </div>
                  <span className="font-semibold">
                    {tweet.aiReport.credibilityScore}%
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {tweet.aiReport.analysis}
              </p>
              <div>
                <p className="text-muted-foreground font-semibold mb-2">
                  Sources Researched
                </p>
                <div className="space-y-1">
                  {tweet.aiReport.sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-xs">
                      <ExternalLink className="w-3 h-3" />
                      {source.title}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verification Section */}
        {verificationStatus === 'unverified' ? (
          <div className="space-y-3 border-t pt-3">
            <h4 className="text-sm font-semibold">Verify This Tweet</h4>
            <Tabs defaultValue="ai" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ai" className="text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  AI Verification
                </TabsTrigger>
                <TabsTrigger value="manual" className="text-xs">
                  <Settings className="w-3 h-3 mr-1" />
                  Manual Verification
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ai" className="space-y-3 mt-3">
                <p className="text-xs text-muted-foreground">
                  Review the AI analysis report above and verify this tweet
                </p>
                <Button
                  onClick={onVerify}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-sm">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Verify Tweet
                </Button>
              </TabsContent>

              <TabsContent value="manual" className="space-y-3 mt-3">
                {!showManualVerification ? (
                  <>
                    <p className="text-xs text-muted-foreground">
                      Manually review the poster's information and content
                    </p>
                    <Button
                      onClick={() => setShowManualVerification(true)}
                      className="w-full bg-primary text-xs">
                      <Settings className="w-3 h-3 mr-1" />
                      Start Manual Verification
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="bg-muted/50 rounded-lg p-3 mb-3">
                      <h5 className="font-semibold text-xs mb-2">
                        Poster Information
                      </h5>
                      <div className="space-y-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Name</p>
                          <p className="font-medium">{tweet.author}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Phone Number</p>
                          <p className="font-medium">{tweet.phone}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Posted</p>
                          <p className="font-medium">{tweet.timestamp}</p>
                        </div>
                      </div>
                    </div>

                    <a
                      href={`https://www.google.com/maps?q=${tweet.latitude},${tweet.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full">
                      <Button
                        variant="outline"
                        className="w-full text-xs mb-3 bg-transparent">
                        <Map className="w-3 h-3 mr-2" />
                        View Location on Google Maps
                      </Button>
                    </a>

                    <Button
                      onClick={() => {
                        onVerify();
                        setShowManualVerification(false);
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-sm">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Verify Tweet
                    </Button>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="space-y-3 border-t pt-3">
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-300 text-xs">
                This tweet has been verified
              </AlertDescription>
            </Alert>
            <Button
              onClick={onVerify}
              variant="outline"
              className="w-full border-muted-foreground/30 text-xs">
              <XCircle className="w-3 h-3 mr-2" />
              Unverify Tweet
            </Button>

            {/* Only show Send to Administrator button if verified */}
            {!isSentToAdmin && (
              <Button
                onClick={onSendToAdmin}
                className="w-full bg-secondary hover:bg-secondary/90 text-xs">
                <Send className="w-3 h-3 mr-2" />
                Send to Administrator
              </Button>
            )}

            {isSentToAdmin && (
              <Alert className="border-secondary/50 bg-secondary/10">
                <Send className="h-4 w-4 text-secondary" />
                <AlertDescription className="text-secondary text-xs">
                  Sent to administrator for further action
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
