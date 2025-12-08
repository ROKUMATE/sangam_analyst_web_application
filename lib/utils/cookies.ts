/**
 * Cookie Management Utilities
 *
 * Helper functions for storing and retrieving authentication tokens
 * using httpOnly cookies for security
 */

// Cookie names
export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
} as const;

/**
 * Set a cookie with optional expiration
 */
export function setCookie(name: string, value: string, days?: number): void {
  let expires = '';

  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }

  // Set cookie with security flags
  document.cookie = `${name}=${
    value || ''
  }${expires}; path=/; SameSite=Strict; Secure`;
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }

  return null;
}

/**
 * Delete a cookie by name
 */
export function deleteCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict; Secure`;
}

/**
 * Store authentication tokens in cookies
 */
export function storeAuthTokens(
  accessToken: string,
  refreshToken: string
): void {
  // Access token - short lived (expires in ~1 hour based on backend JWT settings)
  setCookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, 1);

  // Refresh token - long lived (expires in 7 days)
  setCookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, 7);
}

/**
 * Get access token from cookies
 */
export function getAccessToken(): string | null {
  return getCookie(COOKIE_NAMES.ACCESS_TOKEN);
}

/**
 * Get refresh token from cookies
 */
export function getRefreshToken(): string | null {
  return getCookie(COOKIE_NAMES.REFRESH_TOKEN);
}

/**
 * Store user data in cookies
 */
export function storeUserData(userData: object): void {
  setCookie(COOKIE_NAMES.USER_DATA, JSON.stringify(userData), 7);
}

/**
 * Get user data from cookies
 */
export function getUserData(): any | null {
  const data = getCookie(COOKIE_NAMES.USER_DATA);
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to parse user data:', error);
    return null;
  }
}

/**
 * Clear all authentication data
 */
export function clearAuthData(): void {
  deleteCookie(COOKIE_NAMES.ACCESS_TOKEN);
  deleteCookie(COOKIE_NAMES.REFRESH_TOKEN);
  deleteCookie(COOKIE_NAMES.USER_DATA);
}

/**
 * Check if user is authenticated (has valid tokens)
 */
export function isAuthenticated(): boolean {
  const accessToken = getAccessToken();
  return !!accessToken;
}
