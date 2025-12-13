'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { getUserInfo, type UserInfo } from '@/lib/api-integration';

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
  const [showImageModal, setShowImageModal] = useState(false);
  const [showAiReport, setShowAiReport] = useState(false);
  const [isLoadingAiReport, setIsLoadingAiReport] = useState(false);
  const [isSendingToAdmin, setIsSendingToAdmin] = useState(false);
  const [previewPost, setPreviewPost] = useState<Tweet | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<
    'ai' | 'manual' | null
  >(null);

  // Show AI report when tweet has aiReport data (after verification)
  useEffect(() => {
    console.log('🔍 AI Report State Check:', {
      tweetId: tweet.id,
      hasAiReport: !!tweet.aiReport,
      showAiReport,
      aiReportTitle: tweet.aiReport?.title,
    });
    if (tweet.aiReport) {
      console.log('✨ Setting showAiReport to true');
      setShowAiReport(true);
    } else {
      console.log('❌ No AI report available');
      setShowAiReport(false);
    }
  }, [tweet.aiReport, tweet.id]);

  // Fetch user information when tweet changes
  useEffect(() => {
    const fetchUserInfo = async () => {
      setIsLoadingUserInfo(true);
      try {
        const info = await getUserInfo(tweet.id);
        setUserInfo(info);
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        // Keep using default tweet.author and tweet.phone if API fails
      } finally {
        setIsLoadingUserInfo(false);
      }
    };

    fetchUserInfo();
  }, [tweet.id]);

  // Use fetched user info or fallback to tweet defaults
  const displayName = userInfo
    ? `${userInfo.first_name} ${userInfo.last_name}`.trim()
    : tweet.author;
  const displayPhone = userInfo?.phone || tweet.phone;

  // Check if tweet is already verified from API
  const isVerifiedFromAPI = tweet.verificationStatus === 'verified_true';
  const isCurrentlyVerified =
    verificationStatus === 'verified_true' || isVerifiedFromAPI;

  console.log('🎯 Verification Status:', {
    tweetId: tweet.id,
    verificationStatus,
    isVerifiedFromAPI,
    isCurrentlyVerified,
    tweetVerificationStatus: tweet.verificationStatus,
  });

  const severityColors = {
    critical: 'bg-destructive text-destructive-foreground',
    high: 'bg-secondary text-secondary-foreground',
    medium: 'bg-accent text-accent-foreground',
    low: 'bg-primary text-primary-foreground',
  };

  return (
    <Card
      className={`border-2 rounded-lg flex flex-col overflow-hidden shadow-sm max-h-[700px] transition-colors ${
        isCurrentlyVerified
          ? 'border-green-500 bg-green-50/30 dark:bg-green-950/30'
          : ''
      }`}>
      <CardHeader className="pb-3 border-b flex-shrink-0 flex flex-row items-start justify-between px-4 py-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <CardTitle>Tweet Details</CardTitle>
            <Badge className={severityColors[tweet.severity]}>
              {tweet.severity.charAt(0).toUpperCase() + tweet.severity.slice(1)}
            </Badge>
            {isCurrentlyVerified ? (
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
              <AvatarFallback>{displayName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-sm">
                {isLoadingUserInfo ? 'Loading...' : displayName}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Phone className="w-3 h-3" />
                <span>{displayPhone}</span>
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
              className="w-full rounded-lg border border-border object-cover max-h-48 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setShowImageModal(true)}
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

        {/* Credibility Score - Only visible when AI report exists */}
        {tweet.aiReport && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Credibility Score
            </h4>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-secondary h-full"
                  style={{
                    width: `${(tweet.aiReport.credibilityScore / 10) * 100}%`,
                  }}
                />
              </div>
              <span className="font-semibold text-sm">
                {tweet.aiReport.credibilityScore}/10
              </span>
            </div>
          </div>
        )}

        {/* Full AI Report - Only visible after AI verification */}
        {showAiReport && tweet.aiReport && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-5 space-y-5 shadow-lg">
            {/* Header */}
            <div className="flex items-center gap-3 pb-3 border-b-2 border-blue-300 dark:border-blue-700">
              <div className="p-2 bg-blue-600 dark:bg-blue-500 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-blue-900 dark:text-blue-100">
                  AI Analysis Report
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Comprehensive disaster assessment
                </p>
              </div>
            </div>

            {/* Title */}
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold mb-1 uppercase tracking-wide">
                Title
              </p>
              <p className="text-base font-bold text-blue-950 dark:text-blue-50">
                {tweet.aiReport.title || 'Ocean Disaster Alert'}
              </p>
            </div>

            {/* Description */}
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold mb-3 uppercase tracking-wide">
                AI Analysis Report
              </p>
              <div className="space-y-4 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                {/* Description */}
                {tweet.aiReport.description && (
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Description:
                    </p>
                    <p className="whitespace-pre-wrap">
                      {tweet.aiReport.description}
                    </p>
                  </div>
                )}

                {/* Reasoning */}
                {tweet.aiReport.reasoning && (
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Reasoning:
                    </p>
                    <p className="whitespace-pre-wrap">
                      {tweet.aiReport.reasoning}
                    </p>
                  </div>
                )}

                {/* Credibility Analysis */}
                {tweet.aiReport.credibilityAnalysis && (
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Credibility Analysis:
                    </p>
                    <p className="whitespace-pre-wrap">
                      {tweet.aiReport.credibilityAnalysis}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Scores Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Credibility Score */}
              <div className="bg-white/60 dark:bg-black/30 rounded-lg p-3 border border-green-200 dark:border-green-800">
                <p className="text-xs text-green-700 dark:text-green-300 font-semibold mb-2 uppercase tracking-wide">
                  Credibility Score
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                      <div
                        className="bg-gradient-to-r from-green-500 via-emerald-500 to-blue-500 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            (tweet.aiReport.credibilityScore / 10) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="font-bold text-lg text-green-700 dark:text-green-300 min-w-[3rem] text-right">
                      {tweet.aiReport.credibilityScore}/10
                    </span>
                  </div>
                </div>
              </div>

              {/* Severity Score */}
              <div className="bg-white/60 dark:bg-black/30 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                <p className="text-xs text-orange-700 dark:text-orange-300 font-semibold mb-2 uppercase tracking-wide">
                  Severity Score
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                      <div
                        className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            (tweet.aiReport.severityScore / 10) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="font-bold text-lg text-orange-700 dark:text-orange-300 min-w-[3rem] text-right">
                      {tweet.aiReport.severityScore}/10
                    </span>
                  </div>
                </div>
              </div>

              {/* Area of Impact Score */}
              {tweet.aiReport.areaOfImpactScore !== undefined && (
                <div className="bg-white/60 dark:bg-black/30 rounded-lg p-3 border border-indigo-200 dark:border-indigo-800">
                  <p className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold mb-2 uppercase tracking-wide">
                    Area Impact Score
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              (tweet.aiReport.areaOfImpactScore / 10) * 100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="font-bold text-lg text-indigo-700 dark:text-indigo-300 min-w-[3rem] text-right">
                        {tweet.aiReport.areaOfImpactScore}/10
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Social Post Count */}
              {tweet.aiReport.socialPostCount !== undefined &&
                tweet.aiReport.socialPostCount !== null && (
                  <div className="bg-white/60 dark:bg-black/30 rounded-lg p-3 border border-cyan-200 dark:border-cyan-800">
                    <p className="text-xs text-cyan-700 dark:text-cyan-300 font-semibold mb-2 uppercase tracking-wide">
                      Social Posts Found
                    </p>
                    <div className="flex items-center justify-center h-full">
                      <span className="font-bold text-3xl text-cyan-700 dark:text-cyan-300">
                        {tweet.aiReport.socialPostCount}
                      </span>
                    </div>
                  </div>
                )}
            </div>

            {/* Key Indicators */}
            {tweet.aiReport.keyIndicators &&
              tweet.aiReport.keyIndicators.length > 0 && (
                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold mb-2 uppercase tracking-wide">
                    Key Indicators
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tweet.aiReport.keyIndicators.map((indicator, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs">
                        {indicator}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            {/* Area of Impact */}
            {tweet.aiReport.areaOfImpact && (
              <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold mb-1 uppercase tracking-wide">
                  Area of Impact
                </p>
                <p className="text-sm font-medium text-blue-950 dark:text-blue-50">
                  {tweet.aiReport.areaOfImpact}
                </p>
              </div>
            )}

            {/* Sources Researched - Only show if sources exist */}
            {tweet.aiReport.sources && tweet.aiReport.sources.length > 0 && (
              <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold mb-3 uppercase tracking-wide flex items-center gap-2">
                  <ExternalLink className="w-3 h-3" />
                  Sources Researched
                </p>
                <div className="space-y-2">
                  {tweet.aiReport.sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline text-xs group bg-blue-100/50 dark:bg-blue-900/30 p-2 rounded transition-colors">
                      <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <div>
                        <p className="font-medium">{source.title}</p>
                        <p className="text-[10px] text-blue-500 dark:text-blue-400">
                          {source.domain}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Creator of Post */}
            <div className="bg-white/60 dark:bg-black/30 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
              <p className="text-xs text-purple-700 dark:text-purple-300 font-semibold mb-3 uppercase tracking-wide">
                Creator of Post
              </p>
              <div className="flex items-center justify-between bg-purple-50/50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
                <div className="flex-1">
                  <p className="text-sm font-bold text-purple-900 dark:text-purple-100">
                    {displayName}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    {displayPhone}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewPost(tweet)}
                  className="text-xs border-purple-300 hover:bg-purple-100 dark:border-purple-600 dark:hover:bg-purple-900/50">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View Post
                </Button>
              </div>
            </div>

            {/* Nearby Similar Posts / Related Posts */}
            {tweet.aiReport.relatedPosts &&
              tweet.aiReport.relatedPosts.length > 0 && (
                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold mb-3 uppercase tracking-wide">
                    Related Posts
                    <span className="ml-2 text-[10px] normal-case font-normal bg-blue-200 dark:bg-blue-800 px-2 py-0.5 rounded">
                      {tweet.aiReport.relatedPosts.length} found
                    </span>
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {tweet.aiReport.relatedPosts.map((post) => (
                      <div
                        key={post.id}
                        className="flex items-center justify-between bg-blue-50/50 dark:bg-blue-900/20 rounded-lg p-2 border border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                            {post.username}
                          </p>
                          <p className="text-[10px] text-blue-600 dark:text-blue-400">
                            {post.phoneNumber}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            alert(`View post ${post.id} from ${post.username}`);
                          }}
                          className="text-xs h-7 px-2 hover:bg-blue-200 dark:hover:bg-blue-800">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Verification Section */}
        {!isCurrentlyVerified ? (
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
                  Verify this tweet using AI analysis. The detailed AI report
                  will be displayed after verification.
                </p>
                <Button
                  onClick={async () => {
                    console.log(
                      '🔘 Verify button clicked for tweet:',
                      tweet.id
                    );
                    setIsLoadingAiReport(true);
                    setVerificationMethod('ai');
                    try {
                      console.log('📞 Calling onVerify handler...');
                      await onVerify(); // Call parent's verify handler which updates tweet with AI report
                      console.log('✅ onVerify completed successfully');
                    } catch (error) {
                      console.error('❌ Verification failed:', error);
                    } finally {
                      setIsLoadingAiReport(false);
                      console.log('🏁 Verification process finished');
                    }
                  }}
                  disabled={isLoadingAiReport || isCurrentlyVerified}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-sm disabled:opacity-50">
                  {isLoadingAiReport ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying with AI...
                    </>
                  ) : isCurrentlyVerified ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Already Verified
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Verify Tweet with AI
                    </>
                  )}
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
                          <p className="font-medium">{displayName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Phone Number</p>
                          <p className="font-medium">{displayPhone}</p>
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
                        setVerificationMethod('manual');
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
                onClick={async () => {
                  setIsSendingToAdmin(true);
                  try {
                    await onSendToAdmin();
                  } catch (error) {
                    console.error('Failed to send to admin:', error);
                  } finally {
                    setIsSendingToAdmin(false);
                  }
                }}
                disabled={isSendingToAdmin}
                className="w-full bg-secondary hover:bg-secondary/90 text-xs disabled:opacity-50">
                {isSendingToAdmin ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3 mr-2" />
                    Send to Administrator
                  </>
                )}
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

      {/* Image Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          <div className="w-full flex items-center justify-center px-6 pb-6 overflow-auto max-h-[calc(90vh-80px)]">
            <img
              src={tweet.image || '/placeholder.svg'}
              alt="Tweet content full size"
              className="w-auto h-auto max-w-full max-h-full rounded-lg object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Post Preview Modal */}
      <Dialog
        open={previewPost !== null}
        onOpenChange={() => setPreviewPost(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Post Preview</DialogTitle>
          </DialogHeader>
          {previewPost && (
            <div className="space-y-4">
              {/* Author Info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={previewPost.avatar || '/placeholder.svg'} />
                  <AvatarFallback>{previewPost.author[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{previewPost.author}</p>
                  <p className="text-sm text-muted-foreground">
                    {previewPost.phone}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {previewPost.timestamp}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div>
                <p className="text-sm leading-relaxed">{previewPost.content}</p>
              </div>

              {/* Image */}
              {previewPost.image && (
                <img
                  src={previewPost.image || '/placeholder.svg'}
                  alt="Post content"
                  className="w-full rounded-lg border object-cover max-h-96"
                />
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-3 border-t text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{previewPost.distance} km</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{previewPost.votes} votes</span>
                </div>
                <div>
                  <Badge className={severityColors[previewPost.severity]}>
                    {previewPost.severity}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
