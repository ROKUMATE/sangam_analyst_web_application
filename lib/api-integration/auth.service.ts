/**
 * Authentication API Service
 *
 * Handles all authentication-related API calls including:
 * - Analyst OTP request
 * - OTP verification
 * - Token management
 */

import { AUTH_ENDPOINTS } from '@/lib/constants/api-endpoints';
import {
  storeAuthTokens,
  storeUserData,
  clearAuthData,
} from '@/lib/utils/cookies';

/**
 * Request OTP for analyst login
 *
 * @param mobile - 10-digit mobile number
 * @returns Promise with OTP response
 */
export async function requestAnalystOTP(mobile: string): Promise<{
  message: string;
  OTP: string;
}> {
  try {
    const response = await fetch(AUTH_ENDPOINTS.ANALYST_OTP_REQUEST, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mobile }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send OTP');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error requesting OTP:', error);
    throw error;
  }
}

/**
 * Verify OTP and get authentication tokens
 *
 * @param mobile - 10-digit mobile number
 * @param code - OTP code received
 * @returns Promise with authentication response including tokens and user data
 */
export async function verifyOTP(
  mobile: string,
  code: string
): Promise<{
  message: string;
  access: string;
  refresh: string;
  user: {
    first_name: string;
    last_name: string;
    mobile: string;
    'home address': string;
  };
}> {
  try {
    const response = await fetch(AUTH_ENDPOINTS.OTP_VERIFY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mobile, code }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Invalid or expired OTP');
    }

    const data = await response.json();

    // Store tokens and user data in cookies
    storeAuthTokens(data.access, data.refresh);
    storeUserData(data.user);

    return data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
}

/**
 * Logout user by clearing all authentication data
 */
export function logout(): void {
  clearAuthData();
  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}

/**
 * Refresh access token using refresh token
 *
 * @param refreshToken - Refresh token
 * @returns Promise with new access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  access: string;
}> {
  try {
    const response = await fetch(AUTH_ENDPOINTS.TOKEN_REFRESH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to refresh token');
    }

    const data = await response.json();

    // Update access token in cookies
    if (data.access) {
      storeAuthTokens(data.access, refreshToken);
    }

    return data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    // If refresh fails, logout user
    logout();
    throw error;
  }
}
