import { ApiError, type ApiResponse } from '../types/api';
import type { AuthTokens } from '../types/user';
import { clearTokens, getTokens, setTokens } from './tokenStorage';

const API_BASE_URL = '/api';

export const AUTH_SESSION_EXPIRED_EVENT = 'auth:session-expired';

let inFlightRefresh: Promise<AuthTokens> | null = null;

export function notifySessionExpired(): void {
  clearTokens();
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
}

export async function refreshAuthTokens(refreshToken?: string): Promise<AuthTokens> {
  const token = refreshToken ?? getTokens()?.refreshToken;
  if (!token) {
    throw new ApiError('Not authenticated', 401);
  }

  if (inFlightRefresh) {
    return inFlightRefresh;
  }

  inFlightRefresh = (async () => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token }),
    });

    if (!response.ok) {
      throw new ApiError('Session expired', response.status);
    }

    const body = (await response.json()) as ApiResponse<AuthTokens>;
    setTokens(
      {
        accessToken: body.data.accessToken,
        refreshToken: body.data.refreshToken,
      },
      body.data.expiresIn,
    );
    return body.data;
  })();

  try {
    return await inFlightRefresh;
  } finally {
    inFlightRefresh = null;
  }
}
