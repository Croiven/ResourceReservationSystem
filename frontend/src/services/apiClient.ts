import { ApiError, type ApiResponse } from '../types/api';
import { getTokens } from './tokenStorage';
import { notifySessionExpired, refreshAuthTokens } from './sessionRefresh';

const API_BASE_URL = '/api';

interface RequestOptions {
  method?: string;
  body?: unknown;
  accessToken?: string;
  skipAuthRetry?: boolean;
}

async function parseErrorResponse(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as { error?: { message?: string; details?: { field: string; message: string }[] } };
    const message = body.error?.message ?? 'Request failed';
    const details = body.error?.details;
    return new ApiError(message, response.status, details);
  } catch {
    return new ApiError('Request failed', response.status);
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, accessToken, skipAuthRetry = false } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const init: RequestInit = { method, headers };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, init);

  if (response.status === 401 && accessToken && !skipAuthRetry) {
    const tokens = getTokens();
    if (tokens?.refreshToken) {
      try {
        const refreshed = await refreshAuthTokens(tokens.refreshToken);
        return apiRequest<T>(path, {
          ...options,
          accessToken: refreshed.accessToken,
          skipAuthRetry: true,
        });
      } catch {
        notifySessionExpired();
        throw new ApiError('Session expired', 401);
      }
    }
  }

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  const result = (await response.json()) as ApiResponse<T>;
  return result.data;
}
