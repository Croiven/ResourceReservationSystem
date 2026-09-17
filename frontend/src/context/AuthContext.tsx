import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as authApi from '../services/authApi';
import { clearTokens, getTokens, setTokens } from '../services/tokenStorage';
import type { ChangePasswordInput, LoginInput, RegisterInput, User } from '../types/user';
import { ApiError } from '../types/api';
import { AuthContext, type AuthContextValue } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const tokens = getTokens();
    if (!tokens) {
      setUser(null);
      return;
    }

    try {
      const profile = await authApi.getMe(tokens.accessToken);
      setUser(profile);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401 && tokens.refreshToken) {
        try {
          const refreshed = await authApi.refresh(tokens.refreshToken);
          setTokens({
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken,
          });
          const profile = await authApi.getMe(refreshed.accessToken);
          setUser(profile);
          return;
        } catch {
          clearTokens();
          setUser(null);
          return;
        }
      }
      clearTokens();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void refreshUser().finally(() => {
      setIsLoading(false);
    });
  }, [refreshUser]);

  const login = useCallback(async (data: LoginInput) => {
    const tokens = await authApi.login(data);
    setTokens({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
    const profile = await authApi.getMe(tokens.accessToken);
    setUser(profile);
  }, []);

  const register = useCallback(async (data: RegisterInput) => {
    await authApi.register(data);
  }, []);

  const logout = useCallback(async () => {
    const tokens = getTokens();
    if (tokens?.refreshToken) {
      try {
        await authApi.logout(tokens.refreshToken);
      } catch {
        // Clear local session even if server logout fails
      }
    }
    clearTokens();
    setUser(null);
  }, []);

  const changePassword = useCallback(async (data: ChangePasswordInput) => {
    const tokens = getTokens();
    if (!tokens?.accessToken) {
      throw new ApiError('Not authenticated', 401);
    }
    await authApi.changePassword(tokens.accessToken, data);
    clearTokens();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
      changePassword,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, changePassword, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
