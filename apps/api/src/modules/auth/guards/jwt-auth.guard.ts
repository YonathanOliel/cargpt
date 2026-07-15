import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { AuthUser } from '@cargpt/shared';

interface AccessPayload {
  sub: string;
  phone: string;
  role: AuthUser['role'];
  type: 'access' | 'refresh';
}

/** Verifies the Bearer access token and attaches the user to the request. */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException('חסר טוקן הרשאה');

    let payload: AccessPayload;
    try {
      payload = await this.jwt.verifyAsync<AccessPayload>(token);
    } catch {
      throw new UnauthorizedException('טוקן לא תקין או שפג תוקפו');
    }
    if (payload.type !== 'access') {
      throw new UnauthorizedException('סוג טוקן שגוי');
    }

    request.user = { id: payload.sub, phone: payload.phone, role: payload.role };
    return true;
  }

  private extractToken(request: Request): string | undefined {
    const header = request.headers.authorization;
    if (!header) return undefined;
    const [scheme, value] = header.split(' ');
    return scheme === 'Bearer' ? value : undefined;
  }
}
