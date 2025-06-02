# Automatic Token Refresh System

## Overview

This document describes the comprehensive automatic token refresh system implemented in the Korpor mobile application. The system handles token expiration gracefully by automatically refreshing access tokens using refresh tokens, and redirects users to the login screen when refresh tokens expire.

## Architecture

### Core Components

1. **AuthService** (`front-mobile/src/app/auth/services/authService.ts`)

   - Central authentication management
   - Automatic token refresh logic
   - Session state management

2. **ApiService** (`front-mobile/src/app/services/apiService.ts`)

   - Centralized API communication
   - Automatic authentication header injection
   - Token refresh on 401 errors

3. **useAuth Hook** (`front-mobile/src/app/hooks/useAuth.ts`)
   - React hook for authentication state
   - Component-level auth management

## How It Works

### 1. Token Expiration Detection

The system monitors token expiration in two ways:

- **Proactive Check**: Before each API request, checks if token expires within 5 minutes
- **Reactive Check**: Handles 401 responses from the server

```typescript
private isTokenExpiringSoon(token: string): boolean {
  const tokenInfo = this.decodeToken(token);
  if (!tokenInfo) return true;

  const currentTime = Date.now();
  const expirationTime = tokenInfo.exp * 1000;
  const timeUntilExpiry = expirationTime - currentTime;

  return timeUntilExpiry <= TOKEN_REFRESH_THRESHOLD; // 5 minutes
}
```

### 2. Automatic Token Refresh

When a token is expired or expiring soon:

1. **Check for concurrent refresh**: Prevents multiple simultaneous refresh attempts
2. **Call refresh endpoint**: Uses refresh token to get new access token
3. **Update storage**: Stores new tokens in AsyncStorage
4. **Retry failed requests**: Automatically retries the original request with new token

```typescript
private async refreshAccessToken(): Promise<string> {
  const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

  const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("REFRESH_TOKEN_EXPIRED");
    }
    throw new Error(`Token refresh failed: ${response.status}`);
  }

  const data = await response.json();

  // Store new tokens
  await Promise.all([
    AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken),
    AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken),
  ]);

  return data.accessToken;
}
```

### 3. Refresh Token Expiration Handling

When refresh token expires:

1. **Clear all authentication data** from AsyncStorage
2. **Reset authentication state**
3. **Redirect to login screen** using `router.replace()`

```typescript
private async handleAuthFailure(reason: string = "Session expired"): Promise<void> {
  console.log(`[AuthService] 🚪 Handling auth failure: ${reason}`);

  await this.clearAuthData();

  this.isRefreshing = false;
  this.refreshPromise = null;

  try {
    router.replace("/auth/screens/Login");
  } catch (error) {
    console.error("[AuthService] Error redirecting to login:", error);
  }
}
```

## Usage Examples

### Making Authenticated API Calls

#### Using ApiService (Recommended)

```typescript
import { apiService } from "../services/apiService";

// GET request with automatic token refresh
const userData = await apiService.get("/api/user/profile");

// POST request with automatic token refresh
const result = await apiService.post("/api/investments", investmentData);
```

#### Using AuthService Directly

```typescript
import { authService } from "../auth/services/authService";

// Get auth headers with automatic token refresh
const headers = await authService.getAuthHeaders();

// Make authenticated request with automatic retry on 401
const response = await authService.authenticatedFetch(url, options);
```

### Using Authentication Hook in Components

```typescript
import { useAuth } from "../hooks/useAuth";

function MyComponent() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return (
    <View>
      <Text>Welcome, {user?.name}!</Text>
      <Button onPress={logout} title="Logout" />
    </View>
  );
}
```

## Configuration

### Token Expiration Settings

```typescript
// In authService.ts
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes

// Backend token settings (in authController.js)
const accessTokenExpiry = "1h"; // 1 hour
const refreshTokenExpiry = "7d"; // 7 days
```

### Storage Keys

```typescript
const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER_DATA: "userData",
  USER_ROLE: "userRole",
} as const;
```

## Security Features

### 1. Concurrent Request Protection

- Prevents multiple simultaneous refresh attempts
- Queues concurrent requests during refresh
- Ensures single refresh token usage

### 2. Automatic Cleanup

- Clears all auth data on refresh token expiration
- Resets internal state on authentication failure
- Removes sensitive data from AsyncStorage

### 3. Error Handling

- Graceful degradation on network errors
- Proper error propagation to calling code
- Automatic retry with exponential backoff

## Backend Integration

### Required Endpoints

The system requires these backend endpoints:

1. **POST /api/auth/refresh-token**

   ```json
   {
     "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
   }
   ```

2. **POST /api/auth/logout**
   - Headers: `Authorization: Bearer <accessToken>`
   - Invalidates tokens on backend

### Token Format

Tokens must be JWT format with these claims:

```json
{
  "userId": 123,
  "email": "user@example.com",
  "role": "user",
  "exp": 1640995200
}
```

## Migration Guide

### Updating Existing Services

Replace manual token handling:

```typescript
// OLD WAY ❌
const token = await AsyncStorage.getItem("accessToken");
const response = await fetch(url, {
  headers: { Authorization: `Bearer ${token}` },
});

// NEW WAY ✅
const response = await apiService.get(endpoint);
```

### Updating Authentication Logic

Replace manual auth checks:

```typescript
// OLD WAY ❌
const token = await AsyncStorage.getItem("accessToken");
const isAuth = !!token;

// NEW WAY ✅
const isAuth = await authService.isAuthenticated();
```

## Testing

### Test Scenarios

1. **Normal Operation**: Token refresh before expiration
2. **Token Expired**: Automatic refresh on 401 response
3. **Refresh Token Expired**: Redirect to login
4. **Network Error**: Proper error handling
5. **Concurrent Requests**: Single refresh for multiple calls

### Testing Commands

```bash
# Test token refresh endpoint
curl -X POST http://localhost:3000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"your-refresh-token"}'

# Test authenticated endpoint
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer your-access-token"
```

## Troubleshooting

### Common Issues

1. **Infinite Refresh Loop**

   - Check token expiration times
   - Verify backend refresh endpoint
   - Check AsyncStorage persistence

2. **Premature Logout**

   - Verify TOKEN_REFRESH_THRESHOLD setting
   - Check network connectivity
   - Review error logs

3. **Token Not Refreshing**
   - Confirm refresh token validity
   - Check backend refresh endpoint
   - Verify token storage

### Debug Logging

Enable detailed logging by setting log levels:

```typescript
// In authService.ts
console.log(
  `[AuthService] Token expires in: ${timeUntilExpiry / 1000} seconds`
);
```

## Performance Considerations

- **Background Refresh**: Proactive refresh doesn't block current requests
- **Single Refresh**: Prevents multiple concurrent refresh calls
- **Efficient Storage**: Minimal AsyncStorage operations
- **Memory Management**: Proper cleanup of promises and timers

## Future Enhancements

- [ ] Biometric authentication integration
- [ ] Token rotation strategies
- [ ] Offline token validation
- [ ] Advanced security monitoring
- [ ] Multi-device session management

---

**Last Updated**: January 2025  
**Version**: 1.0.0
