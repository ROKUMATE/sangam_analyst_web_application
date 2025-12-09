/**
 * Tweets API Service
 *
 * Handles all tweets-related API calls
 */

import { ANALYST_ENDPOINTS } from '@/lib/constants/api-endpoints';
import { getAccessToken } from '@/lib/utils/cookies';

/**
 * API Response Types
 */
interface APITweetImage {
  image_id: string;
  image_url: string;
}

interface APITweet {
  id: number;
  images: APITweetImage[];
  tweet_id: string;
  upvote: number;
  downvote: number;
  lat: number;
  lon: number;
  hazard_type: string;
  Title: string;
  hazard_description: string;
  area: string;
  severity: string | null;
  credibility: number | null;
  area_of_impact: string | null;
  keywords: string[];
  is_verified: boolean;
  created_at: string;
  user: number;
}

/**
 * Frontend Tweet Interface (matches dashboard-page.tsx)
 */
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
  // Original API data needed for send to admin
  hazardType?: string;
  title?: string;
  area?: string;
  aiReport?: {
    reportId?: string;
    title: string;
    description: string;
    reasoning?: string;
    credibilityAnalysis?: string;
    credibilityScore: number;
    severityScore: number;
    areaOfImpact: string;
    areaOfImpactScore?: number;
    socialPostCount?: number | null;
    keyIndicators?: string[];
    sources: Array<{ title: string; url: string; domain: string }>;
    analysis: string;
    relatedPosts?: Array<{
      id: string;
      username: string;
      phoneNumber: string;
      timestamp: string;
      distance: number;
    }>;
  };
}

/**
 * Calculate time ago from ISO timestamp
 */
function getTimeAgo(isoTimestamp: string): string {
  const now = new Date();
  const created = new Date(isoTimestamp);
  const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hr ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} d ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 604800)} w ago`;
  return `${Math.floor(diffInSeconds / 2592000)} mo ago`;
}

/**
 * Determine severity based on hazard type and credibility
 *
 * Critical: Life-threatening hazards or high credibility urgent issues
 * High: Serious hazards requiring immediate attention
 * Medium: Moderate hazards or unverified serious issues
 * Low: Minor issues or low credibility reports
 */
function determineSeverity(
  hazardType: string | null,
  credibility: number | null,
  upvotes: number
): 'critical' | 'high' | 'medium' | 'low' {
  // Handle null hazardType
  if (!hazardType) {
    return 'low';
  }

  const criticalHazards = [
    'tsunami',
    'severe flooding',
    'oil spill',
    'chemical spill',
    'major storm',
    'hurricane',
    'cyclone',
  ];

  const highHazards = [
    'flood',
    'flooding',
    'ocean pollution',
    'marine life threat',
    'rip current',
    'strong currents',
    'coral bleaching',
  ];

  const mediumHazards = [
    'algae bloom',
    'water quality',
    'beach erosion',
    'minor pollution',
  ];

  const hazardLower = hazardType.toLowerCase();

  // Critical: High credibility + critical hazard OR very high upvotes
  if (
    criticalHazards.some((h) => hazardLower.includes(h)) &&
    ((credibility && credibility > 0.7) || upvotes > 50)
  ) {
    return 'critical';
  }

  // Critical: High upvotes regardless of type
  if (upvotes > 100) {
    return 'critical';
  }

  // High: High hazard types or moderate credibility
  if (
    highHazards.some((h) => hazardLower.includes(h)) ||
    (credibility && credibility > 0.6)
  ) {
    return 'high';
  }

  // High: Significant community validation
  if (upvotes > 30) {
    return 'high';
  }

  // Medium: Medium hazards or some credibility
  if (
    mediumHazards.some((h) => hazardLower.includes(h)) ||
    (credibility && credibility > 0.4) ||
    upvotes > 10
  ) {
    return 'medium';
  }

  // Low: Everything else
  return 'low';
}

/**
 * Generate avatar URL based on user ID
 */
function generateAvatarUrl(userId: number): string {
  const seeds = [
    'John',
    'Maria',
    'Ahmed',
    'Lisa',
    'Robert',
    'Sarah',
    'James',
    'Chen',
  ];
  const seed = seeds[userId % seeds.length];
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}${userId}`;
}

/**
 * Map API tweet to frontend Tweet interface
 */
function mapAPITweetToTweet(
  apiTweet: APITweet,
  userLocation?: { lat: number; lon: number }
): Tweet {
  // Calculate distance from user location (if provided)
  let distance = 0;
  if (userLocation) {
    const R = 6371; // Earth's radius in km
    const dLat = ((userLocation.lat - apiTweet.lat) * Math.PI) / 180;
    const dLon = ((userLocation.lon - apiTweet.lon) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((apiTweet.lat * Math.PI) / 180) *
        Math.cos((userLocation.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    distance = R * c;
  }

  return {
    id: apiTweet.tweet_id,
    userId: apiTweet.user,
    author: `User ${apiTweet.user}`, // Default name, can be enhanced later
    phone: '+1-555-0000', // Placeholder, not provided by API
    avatar: generateAvatarUrl(apiTweet.user),
    content: apiTweet.hazard_description,
    image:
      apiTweet.images.length > 0 ? apiTweet.images[0].image_url : undefined,
    timestamp: getTimeAgo(apiTweet.created_at),
    latitude: apiTweet.lat,
    longitude: apiTweet.lon,
    votes: apiTweet.upvote - apiTweet.downvote,
    distance: Math.round(distance * 10) / 10, // Round to 1 decimal
    severity: determineSeverity(
      apiTweet.hazard_type,
      apiTweet.credibility,
      apiTweet.upvote
    ),
    verificationStatus: apiTweet.is_verified ? 'verified_true' : 'unverified',
    // Store original API data for send to admin
    hazardType: apiTweet.hazard_type,
    title: apiTweet.Title,
    area: apiTweet.area,
    // aiReport is undefined initially - will be populated after verification API call
  };
}

/**
 * Fetch tweets nearby based on user's location
 *
 * @param lat - User's latitude
 * @param lon - User's longitude
 * @returns Promise with array of tweets
 */
export async function getNearbyTweets(
  lat: number,
  lon: number
): Promise<Tweet[]> {
  const token = getAccessToken();

  if (!token) {
    throw new Error('Not authenticated. Please login again.');
  }

  try {
    const url = `${ANALYST_ENDPOINTS.GET_NEARBY_TWEETS}?lat=${lat}&lon=${lon}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired. Please login again.');
      }
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch tweets');
    }

    const apiTweets: APITweet[] = await response.json();

    // Map API response to frontend Tweet interface with user location for distance calculation
    const userLocation = { lat, lon };
    const tweets = apiTweets.map((apiTweet) =>
      mapAPITweetToTweet(apiTweet, userLocation)
    );

    return tweets;
  } catch (error) {
    console.error('Error fetching nearby tweets:', error);
    throw error;
  }
}

/**
 * Fetch all tweets created by the analyst
 *
 * @returns Promise with array of tweets
 */
export async function getMyTweets(userLocation?: {
  lat: number;
  lon: number;
}): Promise<Tweet[]> {
  const token = getAccessToken();

  if (!token) {
    throw new Error('Not authenticated. Please login again.');
  }

  try {
    const response = await fetch(ANALYST_ENDPOINTS.GET_MY_TWEETS, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired. Please login again.');
      }
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch tweets');
    }

    const apiTweets: APITweet[] = await response.json();

    // Map API response to frontend Tweet interface
    const tweets = apiTweets.map((apiTweet) =>
      mapAPITweetToTweet(apiTweet, userLocation)
    );

    return tweets;
  } catch (error) {
    console.error('Error fetching tweets:', error);
    throw error;
  }
}

/**
 * API Verification Response Interface
 */
interface APIVerificationReport {
  report_id: string;
  title: string;
  description: string;
  reasoning: string;
  credibility_analysis: string;
  severity_score: number;
  credibility_score: number;
  social_post_count: number | null;
  area_of_impact_score: number;
  key_indicators: string[];
  related_posts: any[];
}

interface APIVerificationResponse {
  tweet_id: string;
  is_verified: boolean;
  report?: APIVerificationReport;
}

/**
 * Verify or unverify a tweet
 *
 * @param tweetId - The tweet_id to verify
 * @param isVerified - Whether to mark as verified (true) or unverified (false)
 * @returns Promise with verification response including AI report if verified
 */
export async function verifyTweet(
  tweetId: string,
  isVerified: boolean
): Promise<APIVerificationResponse> {
  const token = getAccessToken();

  if (!token) {
    throw new Error('Not authenticated. Please login again.');
  }

  console.log('🔐 Verify Tweet API Call:', {
    endpoint: ANALYST_ENDPOINTS.VERIFY_TWEET,
    tweetId,
    isVerified,
  });

  try {
    const response = await fetch(ANALYST_ENDPOINTS.VERIFY_TWEET, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tweet_id: tweetId,
        is_verified: isVerified,
      }),
    });

    console.log('📥 Verify Tweet Response Status:', response.status);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired. Please login again.');
      }
      const errorData = await response.json();
      console.error('❌ Verify Tweet Error:', errorData);
      throw new Error(errorData.error || 'Failed to verify tweet');
    }

    const result: APIVerificationResponse = await response.json();
    console.log('✅ Verify Tweet Success:', {
      tweet_id: result.tweet_id,
      is_verified: result.is_verified,
      has_report: !!result.report,
      report_id: result.report?.report_id,
    });
    console.log('📊 Full Report Data:', result.report);
    return result;
  } catch (error) {
    console.error('Error verifying tweet:', error);
    throw error;
  }
}

/**
 * User Information Interface
 */
export interface UserInfo {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string;
  is_analyst: boolean;
}

/**
 * Get user information by tweet ID
 *
 * @param tweetId - The tweet ID
 * @returns Promise with user information
 */
export async function getUserInfo(tweetId: string): Promise<UserInfo> {
  const token = getAccessToken();

  if (!token) {
    throw new Error('Not authenticated. Please login again.');
  }

  try {
    const response = await fetch(
      `${ANALYST_ENDPOINTS.GET_USER}?id=${tweetId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired. Please login again.');
      }
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch user information');
    }

    const result: { user: UserInfo } = await response.json();
    return result.user;
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
}

/**
 * Send to Admin Response Interface
 */
interface SendToAdminResponse {
  success: boolean;
  message: string;
  tweet_id: string;
  send_admin: boolean;
}

/**
 * Send tweet to administrator
 *
 * @param tweet - The tweet to send to admin
 * @param userId - The analyst's user ID
 * @returns Promise with send to admin response
 */
export async function sendTweetToAdmin(
  tweet: Tweet,
  userId: number
): Promise<SendToAdminResponse> {
  const token = getAccessToken();

  if (!token) {
    throw new Error('Not authenticated. Please login again.');
  }

  console.log('📤 Sending tweet to admin:', {
    tweetId: tweet.id,
    userId,
    hazardType: tweet.hazardType,
    title: tweet.title,
  });

  try {
    const formData = new FormData();

    // Add required fields
    formData.append('hazard_type', tweet.hazardType || 'Unknown');
    formData.append('Title', tweet.title || 'Alert');
    formData.append('hazard_description', tweet.content);
    formData.append('lat', tweet.latitude.toString());
    formData.append('lon', tweet.longitude.toString());
    formData.append('area', tweet.area || 'Unknown');

    // Handle image - fetch from URL and convert to blob
    if (tweet.image) {
      try {
        console.log('📷 Fetching image from:', tweet.image);
        const imageResponse = await fetch(tweet.image);
        const imageBlob = await imageResponse.blob();
        formData.append('images', imageBlob, 'tweet-image.jpg');
        console.log('✅ Image added to FormData');
      } catch (imageError) {
        console.warn(
          '⚠️ Failed to fetch image, continuing without it:',
          imageError
        );
      }
    }

    const url = `${ANALYST_ENDPOINTS.SEND_TO_ADMIN}?id=${userId}`;
    console.log('📡 Sending request to:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type header - browser will set it with boundary for FormData
      },
      body: formData,
    });

    console.log('📥 Send to Admin Response Status:', response.status);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired. Please login again.');
      }
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Send to Admin Error:', errorData);
      throw new Error(
        errorData.error || errorData.detail || 'Failed to send tweet to admin'
      );
    }

    const result: SendToAdminResponse = await response.json();
    console.log('✅ Send to Admin Success:', result);
    return result;
  } catch (error) {
    console.error('❌ Error sending tweet to admin:', error);
    throw error;
  }
}
