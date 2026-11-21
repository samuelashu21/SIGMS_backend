
import type { AuthTokenPayload } from '../modules/auth/types/auth.types.js';

declare global {
  namespace Express {
    interface Request {
      auth?: AuthTokenPayload;
    }
  }
}

export {};
