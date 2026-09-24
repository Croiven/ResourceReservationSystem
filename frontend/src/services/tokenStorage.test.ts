import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearTokens, getAccessTokenExpiresAt, getTokens, setTokens } from './tokenStorage';

describe('tokenStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when no tokens stored', () => {
    expect(getTokens()).toBeNull();
  });

  it('stores and retrieves tokens', () => {
    setTokens({ accessToken: 'access', refreshToken: 'refresh' });
    expect(getTokens()).toEqual({ accessToken: 'access', refreshToken: 'refresh' });
  });

  it('clears tokens', () => {
    setTokens({ accessToken: 'access', refreshToken: 'refresh' });
    clearTokens();
    expect(getTokens()).toBeNull();
  });

  it('stores access token expiry when expiresIn is provided', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-01-01T00:00:00.000Z'));

    setTokens({ accessToken: 'access', refreshToken: 'refresh' }, 900);

    expect(getAccessTokenExpiresAt()).toBe(new Date('2030-01-01T00:15:00.000Z').getTime());

    vi.useRealTimers();
  });
});
