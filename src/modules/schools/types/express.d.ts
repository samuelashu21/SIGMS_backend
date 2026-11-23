
import type { SchoolContext } from './school-auth.types.js';

declare global {
  namespace Express {
    interface Request {
      schoolContext?: SchoolContext;
    }
  }
}

export {};
