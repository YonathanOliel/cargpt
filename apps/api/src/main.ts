import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);

  const apiPrefix = config.get<string>('API_PREFIX', 'v1');
  app.setGlobalPrefix(apiPrefix);

  app.enableCors({
    origin: config.get<string>('WEB_ORIGIN', 'http://localhost:3001'),
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
  Logger.log(`CarGPT API listening on http://localhost:${port}/${apiPrefix}`, 'Bootstrap');
}

void bootstrap();
