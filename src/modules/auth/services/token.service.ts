
import jwt, { type SignOptions } from 'jsonwebtoken';

import { AUTH_CONFIG } from '../auth.config.js';
import type { AuthTokenPayload } from '../types/auth.types.js';

type TokenUser = Omit<AuthTokenPayload, 'tokenType'>;

export const generateAccessToken = (
  user: TokenUser
): string => {
  if (!AUTH_CONFIG.ACCESS_TOKEN_SECRET) {
    throw new Error('Access token secret is not configured.');
  }

  return jwt.sign(
    { ...user, tokenType: 'access' },
    AUTH_CONFIG.ACCESS_TOKEN_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: AUTH_CONFIG.ACCESS_TOKEN_EXPIRES_IN as SignOptions['expiresIn']
    }
  );
};

export const generateRefreshToken = (
  user: TokenUser
): string => {
  if (!AUTH_CONFIG.REFRESH_TOKEN_SECRET) {
    throw new Error('Refresh token secret is not configured.');
  }

  return jwt.sign(
    { ...user, tokenType: 'refresh' },
    AUTH_CONFIG.REFRESH_TOKEN_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: AUTH_CONFIG.REFRESH_TOKEN_EXPIRES_IN as SignOptions['expiresIn']
    }
  );
};
