import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { JwtPayload } from '../models/auth.model.js';

const ACCESS_EXPIRES_IN_SECONDS = 900;

export function signAccessToken(payload: JwtPayload): string {
  const options = { expiresIn: env.jwtAccessExpiresIn } as SignOptions;
  return jwt.sign(payload, env.jwtAccessSecret, options);
}

export function signRefreshToken(payload: JwtPayload): string {
  const options = { expiresIn: env.jwtRefreshExpiresIn } as SignOptions;
  return jwt.sign(payload, env.jwtRefreshSecret, options);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtAccessSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtRefreshSecret) as JwtPayload;
}

export function getAccessTokenExpiresInSeconds(): number {
  return ACCESS_EXPIRES_IN_SECONDS;
}

export function getRefreshTokenExpiryDate(): Date {
  const expiresIn = env.jwtRefreshExpiresIn;
  const match = /^(\d+)([dhms])$/.exec(expiresIn);
  if (!match) {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  const value = Number(match[1]);
  const unit = match[2] ?? '';
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  const multiplier = multipliers[unit];
  if (multiplier === undefined) {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  return new Date(Date.now() + value * multiplier);
}
