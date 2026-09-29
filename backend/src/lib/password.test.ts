import { describe, expect, it, vi } from 'vitest';

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(async (plain: string) => `hash:${plain}`),
    compare: vi.fn(async (plain: string, hash: string) => hash === `hash:${plain}`),
  },
}));

import bcrypt from 'bcrypt';
import { hashPassword, verifyPassword } from './password.js';

describe('password helpers', () => {
  it('hashes passwords with bcrypt', async () => {
    await expect(hashPassword('secret')).resolves.toBe('hash:secret');
    expect(bcrypt.hash).toHaveBeenCalledWith('secret', 12);
  });

  it('verifies password hashes', async () => {
    await expect(verifyPassword('secret', 'hash:secret')).resolves.toBe(true);
    await expect(verifyPassword('secret', 'hash:wrong')).resolves.toBe(false);
  });
});
