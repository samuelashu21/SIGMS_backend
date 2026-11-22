import 'dotenv/config';

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 5000),
  API_PREFIX: process.env.API_PREFIX || '/api/v1',

  DATABASE_URL: process.env.DATABASE_URL || '',

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || '',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',

  JWT_ACCESS_EXPIRES_IN:
    process.env.JWT_ACCESS_EXPIRES_IN || '15m',

  JWT_REFRESH_EXPIRES_IN:
    process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  WEB_URL: process.env.WEB_URL || 'http://localhost:3000',

  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || 'local',
  STORAGE_PATH: process.env.STORAGE_PATH || 'storage',


  SMTP_HOST: process.env.SMTP_HOST || '',
SMTP_PORT: Number(process.env.SMTP_PORT || 587),
SMTP_USER: process.env.SMTP_USER || '',
SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
SMTP_FROM: process.env.SMTP_FROM || '',
};