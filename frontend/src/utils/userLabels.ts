import type { UserRole } from '../types/user';

export function getUserRoleLabel(role: UserRole): string {
  return role === 'ADMIN' ? 'Admin' : 'User';
}

export function getUserRoleChipColor(role: UserRole): 'primary' | 'default' {
  return role === 'ADMIN' ? 'primary' : 'default';
}
