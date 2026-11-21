
import jwt from 'jsonwebtoken';

import { AUTH_CONFIG } from '../auth.config.js';
import type {
  AuthTokenPayload
} from '../types/auth.types.js';

const isValidPayload = (
  payload: unknown,
  expectedType: 'access' | 'refresh'
): payload is AuthTokenPayload => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const data = payload as Record<string, unknown>;

  return (
    typeof data.sub === 'string' &&
    typeof data.sessionId === 'string' &&
    typeof data.role === 'string' &&
    [
      'SUPER_ADMIN',
      'SCHOOL_ADMIN',
      'PRINCIPAL',
      'VICE_PRINCIPAL',
      'REGISTRAR',
      'TEACHER',
      'STUDENT',
      'PARENT'
    ].includes(data.role) &&
    (data.schoolId === undefined || typeof data.schoolId === 'string') &&
    data.tokenType === expectedType
  );
};

const verifyToken = (
  token: string,
  secret: string,
  expectedType: 'access' | 'refresh'
): AuthTokenPayload => {
  if (!secret) {
    throw new Error('JWT verification secret is not configured.');
  }

  const decoded = jwt.verify(token, secret, {
    algorithms: ['HS256']
  });

  if (!isValidPayload(decoded, expectedType)) {
    throw new jwt.JsonWebTokenError('Invalid token payload or type.');
  }

  return decoded;
};

export const verifyAccessToken = (
  token: string
): AuthTokenPayload => {
  return verifyToken(
    token,
    AUTH_CONFIG.ACCESS_TOKEN_SECRET,
    'access'
  );
};

export const verifyRefreshToken = (
  token: string
): AuthTokenPayload => {
  return verifyToken(
    token,
    AUTH_CONFIG.REFRESH_TOKEN_SECRET,
    'refresh'
  );
};
