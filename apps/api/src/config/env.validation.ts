import { Logger } from '@nestjs/common';

export interface EnvConfig {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  API_PREFIX: string;
  WEB_ORIGIN: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  LLM_PROVIDER: string;
  VISION_PROVIDER: string;
}

const DEFAULT_INSECURE_SECRET = 'change-me-in-production';

/**
 * Validates and normalizes environment variables at boot.
 * Fails fast on misconfiguration so the app never starts in an unsafe state.
 */
export function validateEnv(raw: Record<string, unknown>): EnvConfig {
  const logger = new Logger('EnvValidation');
  const errors: string[] = [];

  const nodeEnv = String(raw.NODE_ENV ?? 'development');
  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    errors.push(`NODE_ENV must be development|test|production (got "${nodeEnv}")`);
  }

  const port = Number(raw.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    errors.push(`PORT must be a valid port number (got "${raw.PORT}")`);
  }

  const jwtSecret = String(raw.JWT_SECRET ?? DEFAULT_INSECURE_SECRET);
  if (nodeEnv === 'production') {
    if (jwtSecret === DEFAULT_INSECURE_SECRET) {
      errors.push('JWT_SECRET must be set to a strong value in production');
    } else if (jwtSecret.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters in production');
    }
  } else if (jwtSecret === DEFAULT_INSECURE_SECRET) {
    logger.warn('Using the default JWT_SECRET — acceptable in dev only.');
  }

  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration:\n - ${errors.join('\n - ')}`);
  }

  return {
    NODE_ENV: nodeEnv as EnvConfig['NODE_ENV'],
    PORT: port,
    API_PREFIX: String(raw.API_PREFIX ?? 'v1'),
    WEB_ORIGIN: String(raw.WEB_ORIGIN ?? 'http://localhost:3001'),
    JWT_SECRET: jwtSecret,
    JWT_EXPIRES_IN: String(raw.JWT_EXPIRES_IN ?? '15m'),
    LLM_PROVIDER: String(raw.LLM_PROVIDER ?? 'mock'),
    VISION_PROVIDER: String(raw.VISION_PROVIDER ?? 'mock'),
  };
}
