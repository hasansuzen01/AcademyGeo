import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { toNodeHandler } from 'better-auth/node';
import express from 'express';

import { AppModule } from './app.module.js';
import { AUTH_BASE_PATH, type Auth } from './auth/auth.js';
import { AUTH } from './auth/auth.tokens.js';

async function bootstrap() {
  // Better Auth reads the raw request body itself, so Nest's parser is mounted
  // manually after the auth handler instead of globally.
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const config = app.get(ConfigService);

  app.enableCors({
    origin: (config.get<string>('CORS_ORIGIN') ?? 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim()),
    credentials: true,
  });

  app.use(AUTH_BASE_PATH + '/*splat', toNodeHandler(app.get<Auth>(AUTH)));
  app.use(express.json({ limit: '256kb' }));

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = Number(config.get('PORT') ?? 3001);
  await app.listen(port);
  Logger.log(`AcademyGeo API listening on http://localhost:${port}`, 'Bootstrap');
}

await bootstrap();
