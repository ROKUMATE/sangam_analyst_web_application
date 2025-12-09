/**
 * API Endpoints Configuration
 *
 * All API endpoints used in the application are defined here.
 * Change BASE_URL for different environments (development, staging, production)
 */

// Base URL for the API
export const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Authentication Endpoints
 */
export const AUTH_ENDPOINTS = {
  // Analyst Login - Request OTP
  ANALYST_OTP_REQUEST: `${BASE_URL}/api/auth/analyst/otp/request`,

  // Analyst/Citizen Login - Verify OTP
  OTP_VERIFY: `${BASE_URL}/api/auth/otp/verify`,

  // Refresh Token (if needed)
  TOKEN_REFRESH: `${BASE_URL}/api/auth/token/refresh`,
} as const;

/**
 * Analyst/Tweet Endpoints
 */
export const ANALYST_ENDPOINTS = {
  // Get tweets nearby based on lat/lon query parameters
  GET_NEARBY_TWEETS: `${BASE_URL}/api/tweets/nearby`,

  // Get all tweets created by the analyst
  GET_MY_TWEETS: `${BASE_URL}/api/tweets/me`,

  // Get tweets within radius from analyser's location
  GET_TWEETS: `${BASE_URL}/api/tweets/analyser`,

  // Get detailed tweet information with AI analysis
  GET_TWEET_DETAIL: `${BASE_URL}/api/tweet/analyser/detail`,

  // Verify tweet (mark as verified or unverified)
  VERIFY_TWEET: `${BASE_URL}/api/tweet/verify`,

  // Get user information by user ID
  GET_USER: `${BASE_URL}/api/user`,
} as const;

/**
 * AI Analysis Endpoints
 */
export const AI_ENDPOINTS = {
  // AI Image Detector
  IMAGE_DETECTOR: `${BASE_URL}/api/ai-image-detector/`,

  // Fake News Detector
  NEWS_DETECTOR: `${BASE_URL}/api/fake-news-detector/`,
} as const;

/**
 * Export all endpoints
 */
export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  ANALYST: ANALYST_ENDPOINTS,
  AI: AI_ENDPOINTS,
} as const;
