
import type { SchoolContext } from './school-auth.types.js';
import type { TenantContext } from './tenant.types.js';

declare global {
  namespace Express {
    interface Request {
      schoolContext?: SchoolContext;
      tenant?: TenantContext;
    }
  }
}

export {};
