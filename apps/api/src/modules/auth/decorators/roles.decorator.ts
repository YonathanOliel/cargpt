import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@cargpt/shared';

export const ROLES_KEY = 'roles';

/** Restricts a route to the given roles. Use together with RolesGuard. */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
