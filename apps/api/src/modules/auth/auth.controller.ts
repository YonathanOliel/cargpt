import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { AuthTokens, AuthUser } from '@cargpt/shared';
import { AuthService } from './auth.service';
import { RefreshDto, RequestOtpDto, VerifyOtpDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // Tight rate limit on OTP issuance to prevent SMS abuse.
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('otp/request')
  async requestOtp(@Body() dto: RequestOtpDto): Promise<{ sent: true; devCode?: string }> {
    const devCode = await this.auth.requestOtp(dto.phone);
    return { sent: true, devCode };
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('otp/verify')
  verifyOtp(@Body() dto: VerifyOtpDto): Promise<AuthTokens> {
    return this.auth.verifyOtp(dto.phone, dto.code);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto): Promise<AuthTokens> {
    return this.auth.refresh(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me')
  me(@CurrentUser() user: AuthUser): AuthUser {
    return user;
  }
}
