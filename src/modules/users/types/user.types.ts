
import type { UserRole } from '../../auth/types/auth.types.js';

export interface CreateUserInput {
  email?: string;
  username?: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserInput {
  email?: string;
  username?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface PublicUser {
  id: string;
  email: string | null;
  username: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
