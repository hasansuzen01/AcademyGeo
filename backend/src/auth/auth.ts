import { ConfigService } from '@nestjs/config';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

import type { PrismaService } from '../prisma/prisma.service.js';
import { USER_ADDITIONAL_FIELDS, parseAdminEmails, resolveInitialRole } from './admin-bootstrap.js';
import { needsCrossSiteCookie } from './cross-site.js';

export type Auth = ReturnType<typeof createAuth>;

export const AUTH_BASE_PATH = '/api/auth';

export function createAuth(prisma: PrismaService, config: ConfigService) {
  const webUrl = config.get<string>('WEB_URL') ?? 'http://localhost:3000';
  const cookieDomain = config.get<string>('AUTH_COOKIE_DOMAIN');
  const adminEmails = parseAdminEmails(config.get<string>('ADMIN_EMAILS'));
  const apiUrl = config.get<string>('BETTER_AUTH_URL') ?? config.get<string>('API_URL') ?? '';
  const crossSite = needsCrossSiteCookie({ webUrl, apiUrl });

  return betterAuth({
    appName: 'AcademyGeo',
    baseURL: apiUrl,
    basePath: AUTH_BASE_PATH,
    secret: required(config, 'BETTER_AUTH_SECRET'),
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    trustedOrigins: webUrl.split(',').map((origin) => origin.trim()),
    emailAndPassword: { enabled: false },
    socialProviders: {
      google: {
        clientId: required(config, 'GOOGLE_CLIENT_ID'),
        clientSecret: required(config, 'GOOGLE_CLIENT_SECRET'),
      },
    },
    // Without this the role column is invisible to the adapter and the hook
    // below writes into nothing.
    user: { additionalFields: USER_ADDITIONAL_FIELDS },
    databaseHooks: {
      user: {
        create: {
          // Bootstraps the first admin. Everyone after that is promoted from
          // the admin panel, or with `npm run admin:grant`.
          before: async (user) => ({
            data: { ...user, role: resolveInitialRole(user.email, adminEmails) },
          }),
        },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
      cookieCache: { enabled: true, maxAge: 5 * 60 },
    },
    advanced: {
      // A shared parent domain lets one cookie cover both hosts. It is the
      // better arrangement, but it is not the only one that has to work.
      crossSubDomainCookies: cookieDomain
        ? { enabled: true, domain: cookieDomain }
        : { enabled: false },
      // In production the web app and the API are always on different origins,
      // whether or not they share a parent, so the cookie has to be sent
      // cross-site. Keying this on AUTH_COOKIE_DOMAIN meant that forgetting
      // one setting silently signed everybody out on their next click.
      defaultCookieAttributes: crossSite
        ? { sameSite: 'none', secure: true, partitioned: true }
        : undefined,
    },
  });
}

/**
 * Reads a required setting, naming the file to fix when it is missing. Sign-in
 * cannot work without these, so the API refuses to start rather than failing
 * on the first person who tries to log in.
 */
function required(config: ConfigService, key: string): string {
  const value = config.get<string>(key);
  if (!value) {
    throw new Error(
      `${key} is not set. Copy backend/.env.example to backend/.env and fill it in.`,
    );
  }
  return value;
}
