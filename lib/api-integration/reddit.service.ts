/**
 * Reddit Sources API Service
 *
 * Handles social media monitoring via Reddit sources API
 */

import { ANALYST_ENDPOINTS } from '@/lib/constants/api-endpoints';
import { getAccessToken } from '@/lib/utils/cookies';

/**
 * API Response Types
 */
export interface RedditPost {
  id: number;
  location_context: string;
  created_at: string;
  content: string;
  metadata: string; // Reddit URL
}

export interface RedditSourcesResponse {
  count: number;
  area: string;
  results: RedditPost[];
}

/**
 * Fetch Reddit sources for social media monitoring
 */
export async function getRedditSources(
  lat: number,
  lon: number,
  radius: number = 10,
  limit: number = 10,
  includeContent: boolean = true
): Promise<RedditSourcesResponse> {
  const token = getAccessToken();

  if (!token) {
    throw new Error('Authentication required');
  }

  const url = new URL(ANALYST_ENDPOINTS.GET_REDDIT_SOURCES);
  url.searchParams.append('lat', lat.toString());
  url.searchParams.append('lon', lon.toString());
  url.searchParams.append('radius', radius.toString());
  url.searchParams.append('limit', limit.toString());
  url.searchParams.append('include_content', includeContent.toString());

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail ||
        `Failed to fetch Reddit sources: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data;
}
