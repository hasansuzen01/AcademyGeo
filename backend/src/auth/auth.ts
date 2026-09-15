import { ConfigService } from '@nestjs/config';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { APIError } from 'better-auth/api';

import type { PrismaService } from '../prisma/prisma.service.js';
import type { R2Service } from '../storage/r2.service.js';
import { USER_ADDITIONAL_FIELDS, parseAdminEmails, resolveInitialRole } from './admin-bootstrap.js';
import { needsCrossSiteCookie } from './cross-site.js';
import { ownedAvatarKey, selfDeleteBlocker } from './self-delete.js';

export type Auth = ReturnType<typeof createAuth>;

export const AUTH_BASE_PATH = '/api/auth';

export function createAuth(prisma: PrismaService, config: ConfigService, storage: R2Service) {
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
    // A sign-in that fails before its own error address is known, such as the
    // browser's back button replaying a callback whose state was already
    // spent, would otherwise end on the API's bare root with nothing to press.
    // The web app's sign-in page explains it and offers the button again.
    onAPIError: { errorURL: `${webUrl.split(',')[0].trim().replace(/\/+$/, '')}/sign-in` },
    emailAndPassword: { enabled: false },
    socialProviders: {
      google: {
        clientId: required(config, 'GOOGLE_CLIENT_ID'),
        clientSecret: required(config, 'GOOGLE_CLIENT_SECRET'),
      },
    },
    // Without this the role column is invisible to the adapter and the hook
    // below writes into nothing.
    user: {
      additionalFields: USER_ADDITIONAL_FIELDS,
      // Players delete their own account from the profile page. Better Auth
      // removes the row, the sessions and the cookies, and asks for a sign-in
      // from the last day first; the database cascade takes the answers, runs
      // and badges with the row.
      deleteUser: {
        enabled: true,
        beforeDelete: async (user) => {
          const [account, activeAdmins] = await Promise.all([
            prisma.user.findUnique({
              where: { id: user.id },
              select: { role: true, status: true },
            }),
            prisma.user.count({ where: { role: 'ADMIN', status: 'ACTIVE' } }),
          ]);

          if (account && selfDeleteBlocker(account, activeAdmins)) {
            throw new APIError('BAD_REQUEST', {
              code: 'LAST_ADMIN',
              message: 'This is the only admin left. Promote someone else first.',
            });
          }
        },
        afterDelete: async (user) => {
          const avatar = ownedAvatarKey(
            user.image,
            storage.isConfigured ? storage.publicUrl('') : null,
          );
          if (avatar) await storage.remove(avatar).catch(() => undefined);

          // No name or email: the person asked for their data to go.
          await prisma.auditLog.create({
            data: {
              action: 'delete',
              entity: 'user',
              entityId: user.id,
              summary: 'An account was deleted by its owner',
            },
          });
        },
      },
    },
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
      //
      // Not partitioned. A partitioned cookie is filed under the site of the
      // tab it was set in, and sign-in sets its cookies in two different tabs:
      // the state cookie on a fetch from the web app, the session cookie on
      // the API's own callback page. Across sites the two land in separate
      // jars, so the callback cannot find the state it just issued and
      // answers `state_mismatch`, and the web app never sees the session.
      defaultCookieAttributes: crossSite ? { sameSite: 'none', secure: true } : undefined,
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
