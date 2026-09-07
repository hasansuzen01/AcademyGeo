import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { toNodeHandler } from 'better-auth/node';
import express, { type Express } from 'express';
import helmet from 'helmet';

import { AppModule } from './app.module.js';
import { type Auth } from './auth/auth.js';
import { AUTH } from './auth/auth.tokens.js';
import { mountAuthHandler } from './auth/mount-auth.js';

async function bootstrap() {
  // Better Auth reads the raw request body itself, so Nest's parser is mounted
  // manually after the auth handler instead of globally.
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const config = app.get(ConfigService);

  const server = app.getHttpAdapter().getInstance() as Express;

  // In production the API sits behind the platform's reverse proxy. Without
  // this Express reads the proxy's own address and scheme, so every session is
  // logged from one IP and nothing that infers HTTPS from the request works.
  server.set('trust proxy', 1);

  app.enableCors({
    origin: (config.get<string>('CORS_ORIGIN') ?? 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim()),
    credentials: true,
  });

  // The API answers JSON to a separate web origin, so the page-oriented
  // defaults are turned off and the transport headers kept.
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  mountAuthHandler(server, toNodeHandler(app.get<Auth>(AUTH)));
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

  // A redeploy sends SIGTERM. Without this the Prisma and Redis connections
  // are never closed, so every deploy leaks them and drops what was in flight.
  app.enableShutdownHooks();

  const port = Number(config.get('PORT') ?? 3001);
  await app.listen(port);
  Logger.log(`AcademyGeo API listening on port ${port}`, 'Bootstrap');
}

await bootstrap();
