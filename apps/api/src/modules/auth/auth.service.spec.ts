import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { OtpStore } from './application/otp.store';
import { InMemoryUserRepository } from './infrastructure/in-memory-user.repository';

function makeAuth(): { auth: AuthService; otp: OtpStore; users: InMemoryUserRepository } {
  const users = new InMemoryUserRepository();
  const otp = new OtpStore();
  const jwt = new JwtService({ secret: 'test-secret' });
  const config = new ConfigService({ NODE_ENV: 'test', JWT_EXPIRES_IN: '15m' });
  const auth = new AuthService(users, otp, jwt, config);
  return { auth, otp, users };
}

describe('AuthService', () => {
  it('creates a user and issues tokens on valid OTP', async () => {
    const { auth, otp } = makeAuth();
    const phone = '0501234567';
    const code = otp.issue(phone);

    const tokens = await auth.verifyOtp(phone, code);

    expect(tokens.accessToken).toBeTruthy();
    expect(tokens.refreshToken).toBeTruthy();
  });

  it('rejects an invalid OTP', async () => {
    const { auth } = makeAuth();
    await expect(auth.verifyOtp('0501234567', '000000')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('refreshes tokens with a valid refresh token', async () => {
    const { auth, otp } = makeAuth();
    const phone = '0501234567';
    const tokens = await auth.verifyOtp(phone, otp.issue(phone));

    const refreshed = await auth.refresh(tokens.refreshToken);

    expect(refreshed.accessToken).toBeTruthy();
  });

  it('rejects refresh when an access token is used instead', async () => {
    const { auth, otp } = makeAuth();
    const phone = '0501234567';
    const tokens = await auth.verifyOtp(phone, otp.issue(phone));

    await expect(auth.refresh(tokens.accessToken)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
