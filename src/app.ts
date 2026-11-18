
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import healthRoutes from './routes/health.routes.js';
import { env } from './config/env.js';

const app = express();

app.use(helmet());

app.use(cors({
  origin: env.WEB_URL,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/v1/health', healthRoutes);

export default app;
