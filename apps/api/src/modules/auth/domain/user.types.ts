import type { AuthUser, UserRole } from '@cargpt/shared';

export interface User {
  id: string;
  phone: string;
  email?: string;
  role: UserRole;
  name?: string;
  region?: string;
  createdAt: Date;
}

export interface UserRepository {
  findByPhone(phone: string): Promise<User | undefined>;
  findById(id: string): Promise<User | undefined>;
  create(user: User): Promise<User>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    phone: user.phone,
    role: user.role,
    name: user.name,
    region: user.region,
  };
}
