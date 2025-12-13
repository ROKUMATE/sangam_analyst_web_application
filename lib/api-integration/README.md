# API Integration Documentation

## Overview

This document explains the API integration structure for the AquaX Analyst Platform.

## Structure

```
lib/
├── api-integration/
│   ├── index.ts           # Main export file
│   └── auth.service.ts    # Authentication API calls
├── constants/
│   └── api-endpoints.ts   # All API endpoint URLs
├── types/
│   └── api.types.ts       # TypeScript type definitions
└── utils/
    └── cookies.ts         # Cookie management utilities
```

## Files Description

### 1. `lib/constants/api-endpoints.ts`

Contains all API endpoint URLs organized by category:

- `AUTH_ENDPOINTS` - Authentication endpoints
- `ANALYST_ENDPOINTS` - Analyst/Tweet endpoints
- `AI_ENDPOINTS` - AI analysis endpoints

The `BASE_URL` is configured from environment variable `NEXT_PUBLIC_API_BASE_URL`.

### 2. `lib/utils/cookies.ts`

Cookie management utilities for storing authentication tokens:

- `storeAuthTokens()` - Store access and refresh tokens
- `getAccessToken()` - Retrieve access token
- `getRefreshToken()` - Retrieve refresh token
- `storeUserData()` - Store user information
- `getUserData()` - Retrieve user information
- `clearAuthData()` - Clear all authentication data
- `isAuthenticated()` - Check if user is authenticated

### 3. `lib/api-integration/auth.service.ts`

Authentication service methods:

- `requestAnalystOTP(mobile)` - Request OTP for analyst login
- `verifyOTP(mobile, code)` - Verify OTP and get tokens
- `logout()` - Logout and clear authentication
- `refreshAccessToken(refreshToken)` - Refresh access token

### 4. `lib/types/api.types.ts`

TypeScript interfaces for type safety:

- Request/Response types for all API calls
- Type definitions for tweets, AI analysis, etc.

## Usage Examples

### Authentication Flow

```typescript
import { requestAnalystOTP, verifyOTP, logout } from '@/lib/api-integration';

// 1. Request OTP
const handleSendOTP = async (mobile: string) => {
  try {
    const response = await requestAnalystOTP(mobile);
    console.log('OTP sent:', response.OTP); // For testing
    // Show success message to user
  } catch (error) {
    console.error('Failed to send OTP:', error);
    // Show error message to user
  }
};

// 2. Verify OTP
const handleVerifyOTP = async (mobile: string, code: string) => {
  try {
    const response = await verifyOTP(mobile, code);
    // Tokens are automatically stored in cookies
    // User data is available in response.user
    console.log('Login successful:', response.user);
    // Redirect to dashboard
  } catch (error) {
    console.error('Verification failed:', error);
    // Show error message to user
  }
};

// 3. Logout
const handleLogout = () => {
  logout(); // Clears cookies and redirects to login
};
```

### Checking Authentication Status

```typescript
import {
  isAuthenticated,
  getAccessToken,
  getUserData,
} from '@/lib/api-integration';

// Check if user is logged in
if (isAuthenticated()) {
  const token = getAccessToken();
  const user = getUserData();
  console.log('User is authenticated:', user);
} else {
  // Redirect to login
}
```

### Making Authenticated API Calls

```typescript
import { getAccessToken } from '@/lib/api-integration';
import { ANALYST_ENDPOINTS } from '@/lib/api-integration';

const fetchTweets = async (lat: number, lon: number, radius: number) => {
  const token = getAccessToken();

  const response = await fetch(ANALYST_ENDPOINTS.GET_TWEETS, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lat, lon, radius }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tweets');
  }

  return await response.json();
};
```

## Token Management

### Access Token

- Short-lived (expires in ~1 hour)
- Used for API authentication
- Stored in cookies with 1-day expiration
- Included in `Authorization: Bearer <token>` header

### Refresh Token

- Long-lived (expires in 7 days)
- Used to get new access token when it expires
- Stored in cookies with 7-day expiration
- Automatically used when access token expires

### Cookie Security

All cookies are set with:

- `SameSite=Strict` - Prevents CSRF attacks
- `Secure` - Only sent over HTTPS (in production)
- `path=/` - Available site-wide

## Environment Variables

Add to `.env` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

For production, update to your production API URL.

## Error Handling

All API calls should be wrapped in try-catch blocks:

```typescript
try {
  const result = await apiCall();
  // Handle success
} catch (error) {
  // Handle error
  console.error('API Error:', error);
  // Show user-friendly error message
}
```

## Next Steps

The following services need to be implemented:

1. ✅ Authentication Service (auth.service.ts) - **DONE**
2. ⏳ Analyst Service (analyst.service.ts) - For tweets and details
3. ⏳ AI Service (ai.service.ts) - For AI analysis

## Testing

Use the master OTP `123456` for testing any mobile number during development.

## API Response Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `500` - Internal Server Error
