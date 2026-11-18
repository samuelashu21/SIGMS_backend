import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import configureExpress from './config/express.js';
import healthRoutes from './routes/health.routes.js';
import apiRoutes from './routes/index.js';
import { env } from './config/env.js';
import { notFoundHandler } from './middleware/not-found.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';


const app = configureExpress();

// Security and utility middleware
app.use(helmet());

app.use(cors({
  origin: env.WEB_URL,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/v1/health', healthRoutes);
app.use(env.API_PREFIX, apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;