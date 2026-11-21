
import bcrypt from 'bcryptjs';
import { AUTH_CONFIG } from '../auth.config.js';

export const hashPassword = async (
  password: string
): Promise<string> => {
  return bcrypt.hash(
    password,
    AUTH_CONFIG.PASSWORD_HASH_ROUNDS
  );
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
