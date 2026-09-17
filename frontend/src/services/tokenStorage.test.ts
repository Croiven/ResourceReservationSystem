import { beforeEach, describe, expect, it } from 'vitest';
import { clearTokens, getTokens, setTokens } from './tokenStorage';

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
});
