import type { UpdateUserInput, User } from '../types/user';
import { apiRequest } from './apiClient';

function requireAccessToken(accessToken: string | undefined): string {
  if (!accessToken) {
    throw new Error('Not authenticated');
  }
  return accessToken;
}

export async function listUsers(accessToken: string): Promise<User[]> {
  return apiRequest<User[]>('/users', {
    accessToken: requireAccessToken(accessToken),
  });
}

export async function getUser(id: string, accessToken: string): Promise<User> {
  return apiRequest<User>(`/users/${id}`, {
    accessToken: requireAccessToken(accessToken),
  });
}

export async function updateUser(
  id: string,
  data: UpdateUserInput,
  accessToken: string,
): Promise<User> {
  return apiRequest<User>(`/users/${id}`, {
    method: 'PATCH',
    body: data,
    accessToken: requireAccessToken(accessToken),
  });
}

export async function deactivateUser(id: string, accessToken: string): Promise<User> {
  return apiRequest<User>(`/users/${id}`, {
    method: 'DELETE',
    accessToken: requireAccessToken(accessToken),
  });
}
