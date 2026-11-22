import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './env.js';
import {
  requestLogger,
  developmentLogger
} from './logger.js';

import cookieParser from 'cookie-parser';
import { sanitizeRequest } from '../middleware/sanitize.middleware.js';

const configureExpress = () => {
  const app = express();

  app.disable('x-powered-by');

  app.use(helmet());

  app.use(cors({
    origin: env.WEB_URL,
    credentials: true
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(sanitizeRequest);

  // Logging middleware
  app.use(morgan('dev'));
  app.use(developmentLogger);
  app.use(requestLogger);

  return app;
};

export default configureExpress;