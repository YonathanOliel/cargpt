import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpStore } from './application/otp.store';
import { USER_REPOSITORY } from './domain/user.types';
import { InMemoryUserRepository } from './infrastructure/in-memory-user.repository';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

/**
 * Global so JwtModule / guards are available to feature modules (e.g. Vehicles)
 * without re-importing.
 */
@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'change-me-in-production'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    OtpStore,
    JwtAuthGuard,
    RolesGuard,
    { provide: USER_REPOSITORY, useClass: InMemoryUserRepository },
  ],
  exports: [JwtModule, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
