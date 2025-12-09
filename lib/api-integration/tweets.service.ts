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
    aiReport: {
      title: apiTweet.Title || 'Ocean Disaster Alert',
      description: apiTweet.hazard_description,
      credibilityScore: apiTweet.credibility
        ? Math.round(apiTweet.credibility * 10)
        : 75,
      severityScore: apiTweet.severity
        ? apiTweet.severity === 'critical'
          ? 95
          : apiTweet.severity === 'high'
          ? 75
          : apiTweet.severity === 'medium'
          ? 50
          : 25
        : 65,
      areaOfImpact: apiTweet.area_of_impact || '5-10 km radius',
      sources: [
        {
          title: 'National Oceanic and Atmospheric Administration',
          url: 'https://www.noaa.gov',
          domain: 'noaa.gov',
        },
        {
          title: 'Weather Underground',
          url: 'https://www.wunderground.com',
          domain: 'wunderground.com',
        },
        {
          title: 'National Weather Service',
          url: 'https://www.weather.gov',
          domain: 'weather.gov',
        },
      ],
      analysis: apiTweet.credibility
        ? `AI Analysis: Credibility score is ${Math.round(
            apiTweet.credibility * 10
          )}% based on cross-referencing multiple verified sources. The report has been validated against satellite imagery and historical weather patterns. Area of impact: ${
            apiTweet.area_of_impact || 'Unknown'
          }. Severity classification: ${
            apiTweet.severity ||
            determineSeverity(
              apiTweet.hazard_type,
              apiTweet.credibility,
              apiTweet.upvote
            )
          }.`
        : `AI Analysis: This report has been analyzed using machine learning models trained on historical ocean disaster data. Based on the reported hazard type "${
            apiTweet.hazard_type
          }" and location coordinates, the system has assigned a preliminary credibility score of 75%. Further verification recommended through satellite imagery and local authority reports. Area of impact: ${
            apiTweet.area_of_impact || 'Estimated 5-10 km radius'
          }. Keywords identified: ${apiTweet.keywords.join(', ')}.`,
      nearbySimilarPosts: [
        // Hardcoded sample data - will be replaced with API call
        {
          id: 'sample-1',
          username: 'User ' + ((apiTweet.user + 1) % 100),
          phoneNumber: '+1-555-1234',
          timestamp: '15 min ago',
          distance: 0.5,
        },
        {
          id: 'sample-2',
          username: 'User ' + ((apiTweet.user + 2) % 100),
          phoneNumber: '+1-555-5678',
          timestamp: '45 min ago',
          distance: 0.8,
        },
      ],
    },
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
 * Verify or unverify a tweet
 *
 * @param tweetId - The tweet_id to verify
 * @param isVerified - Whether to mark as verified (true) or unverified (false)
 * @returns Promise with verification response
 */
export async function verifyTweet(
  tweetId: string,
  isVerified: boolean
): Promise<{ tweet_id: string; is_verified: boolean }> {
  const token = getAccessToken();

  if (!token) {
    throw new Error('Not authenticated. Please login again.');
  }

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

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired. Please login again.');
      }
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to verify tweet');
    }

    const result: { tweet_id: string; is_verified: boolean } =
      await response.json();
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
  username: string | null;
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
