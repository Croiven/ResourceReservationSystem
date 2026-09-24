import type {
  AuthTokens,
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
  User,
} from '../types/user';
import { apiRequest } from './apiClient';
import { refreshAuthTokens } from './sessionRefresh';

export async function register(data: RegisterInput): Promise<User> {
  return apiRequest<User>('/auth/register', { method: 'POST', body: data });
}

export async function login(data: LoginInput): Promise<AuthTokens> {
  return apiRequest<AuthTokens>('/auth/login', { method: 'POST', body: data });
}

export async function logout(refreshToken: string): Promise<void> {
  await apiRequest<{ message: string }>('/auth/logout', {
    method: 'POST',
    body: { refreshToken },
  });
}

export async function refresh(refreshToken: string): Promise<AuthTokens> {
  return refreshAuthTokens(refreshToken);
}

export async function getMe(accessToken: string): Promise<User> {
  return apiRequest<User>('/auth/me', { accessToken });
}

export async function changePassword(
  accessToken: string,
  data: ChangePasswordInput,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>('/auth/change-password', {
    method: 'POST',
    body: data,
    accessToken,
  });
}
