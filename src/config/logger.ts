
import morgan from 'morgan';

export const requestLogger = morgan(
  ':method :url :status :response-time ms',
  {
    skip: (_req, res) => res.statusCode < 400
  }
);

export const developmentLogger = morgan('dev');
