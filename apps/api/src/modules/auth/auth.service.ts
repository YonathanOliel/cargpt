import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import type { AuthTokens, AuthUser } from '@cargpt/shared';
import {
  USER_REPOSITORY,
  toAuthUser,
  type User,
  type UserRepository,
} from './domain/user.types';
import { OtpStore } from './application/otp.store';

interface JwtPayload {
  sub: string;
  phone: string;
  role: string;
  type: 'access' | 'refresh';
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    private readonly otp: OtpStore,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /** Issues an OTP. In dev (no SMS provider) the code is logged. */
  async requestOtp(phone: string): Promise<void> {
    const code = this.otp.issue(phone);
    if (this.config.get('NODE_ENV') !== 'production') {
      this.logger.log(`OTP for ${phone}: ${code}`);
    }
    // TODO: integrate SMS provider (e.g. Twilio / Israeli gateway).
  }

  async verifyOtp(phone: string, code: string): Promise<AuthTokens> {
    if (!this.otp.verify(phone, code)) {
      throw new UnauthorizedException('קוד אימות שגוי או שפג תוקפו');
    }
    const user = await this.getOrCreateUser(phone);
    return this.issueTokens(toAuthUser(user));
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException('Refresh token לא תקין');
    }
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('סוג טוקן שגוי');
    }
    const user = await this.users.findById(payload.sub);
    if (!user) throw new UnauthorizedException('משתמש לא קיים');
    return this.issueTokens(toAuthUser(user));
  }

  private async getOrCreateUser(phone: string): Promise<User> {
    const existing = await this.users.findByPhone(phone);
    if (existing) return existing;
    return this.users.create({
      id: randomUUID(),
      phone,
      role: 'driver',
      createdAt: new Date(),
    });
  }

  private async issueTokens(user: AuthUser): Promise<AuthTokens> {
    const base = { sub: user.id, phone: user.phone, role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        { ...base, type: 'access' },
        { expiresIn: this.config.get('JWT_EXPIRES_IN', '15m') },
      ),
      this.jwt.signAsync({ ...base, type: 'refresh' }, { expiresIn: '7d' }),
    ]);
    return { accessToken, refreshToken };
  }
}
