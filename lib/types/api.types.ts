/**
 * API Response Types
 *
 * TypeScript interfaces for API requests and responses
 */

/**
 * Authentication Types
 */
export interface OTPRequestPayload {
  mobile: string;
}

export interface OTPRequestResponse {
  message: string;
  OTP: string;
}

export interface OTPVerifyPayload {
  mobile: string;
  code: string;
}

export interface UserData {
  first_name: string;
  last_name: string;
  mobile: string;
  'home address': string;
}

export interface OTPVerifyResponse {
  message: string;
  access: string;
  refresh: string;
  user: UserData;
}

export interface TokenRefreshPayload {
  refresh: string;
}

export interface TokenRefreshResponse {
  access: string;
}

/**
 * Tweet Types
 */
export interface GetTweetsPayload {
  lat: number;
  lon: number;
  radius: number;
}

export interface TweetListItem {
  tweet_id: string;
  user_uploaded_name: string;
  time: string;
  image_url: string;
  upvotes: number;
  lat: number;
  lon: number;
  distance_from_analyser: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_verified: boolean;
  title: string;
  hazard_type: string;
  area: string;
}

export type GetTweetsResponse = TweetListItem[];

/**
 * Tweet Detail Types
 */
export interface GetTweetDetailPayload {
  tweet_id: string;
  lat: number;
  lon: number;
}

export interface TweetInfo {
  tweet_id: string;
  user_uploaded_name: string;
  user_uploaded_phone_number: string;
  time: string;
  image_urls: string[];
  upvotes: number;
  lat: number;
  lon: number;
  distance_from_analyser: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_verified: boolean;
  title: string;
  hazard_type: string;
  hazard_description: string;
  area: string;
  created_at: string;
}

export interface ImageCredibilityScore {
  image_url: string;
  image_index: number;
  credibility_score: number;
  prediction: {
    LABEL_0: number;
    LABEL_1: number;
  };
  is_real: boolean;
}

export interface AIAnalysisReport {
  image_credibility_scores: ImageCredibilityScore[];
  text_credibility_score: number;
  overall_credibility: number;
  is_credible: boolean;
  summary: string;
}

export interface GetTweetDetailResponse {
  tweet_info: TweetInfo;
  ai_analysis_report: AIAnalysisReport;
}

/**
 * AI Analysis Types
 */
export interface ImageDetectorPayload {
  image_url: string;
}

export interface ImageDetectorResponse {
  image_url: string;
  credibility_score: number;
  prediction: {
    LABEL_0: number;
    LABEL_1: number;
  };
  is_real: boolean;
  message: string;
}

export interface NewsDetectorPayload {
  text: string;
  image_url?: string;
}

export interface NewsDetectorResponse {
  text_credibility_score: number;
  image_credibility_score?: number;
  overall_credibility: number;
  is_credible: boolean;
  message: string;
}

/**
 * Error Response Type
 */
export interface APIError {
  error?: string;
  message?: string;
  [key: string]: any;
}
