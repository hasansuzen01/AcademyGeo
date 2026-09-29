import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuditService } from '../admin/audit.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { buildRobotsTxt } from './robots.js';
import type { UpdateSeoDto } from './dto.js';

/** One row, so "which settings apply" has a single answer. */
const SETTINGS_ID = 'site';

@Injectable()
export class SeoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly config: ConfigService,
  ) {}

  /**
   * The settings row, created with defaults on first read so the admin panel
   * never opens on an empty screen.
   */
  async getSettings() {
    return this.prisma.siteSeo.upsert({
      where: { id: SETTINGS_ID },
      update: {},
      create: {
        id: SETTINGS_ID,
        siteUrl:
          this.config.get<string>('WEB_URL')?.split(',')[0]?.trim() ?? 'http://localhost:3000',
      },
    });
  }

  async updateSettings(actorId: string, dto: UpdateSeoDto) {
    await this.getSettings();
    const settings = await this.prisma.siteSeo.update({ where: { id: SETTINGS_ID }, data: dto });

    await this.audit.record({
      actorId,
      action: 'update',
      entity: 'seo',
      entityId: SETTINGS_ID,
      summary: 'Updated the search engine settings',
    });

    return settings;
  }

  /**
   * The subset the browser is allowed to see.
   *
   * Everything here ends up in the page source anyway: verification tokens are
   * meta tags and measurement ids are script attributes.
   */
  async getPublicSettings() {
    const settings = await this.getSettings();

    return {
      siteName: settings.siteName,
      siteUrl: settings.siteUrl,
      siteDescription: settings.siteDescription,
      defaultMetaTitle: settings.defaultMetaTitle,
      defaultMetaDescription: settings.defaultMetaDescription,
      defaultKeywords: settings.defaultKeywords,
      defaultOgImageUrl: settings.defaultOgImageUrl,
      defaultRobotsMeta: settings.defaultRobotsMeta,
      sitemapEnabled: settings.sitemapEnabled,
      googleSiteVerification: settings.googleSiteVerification,
      googleAnalyticsId: settings.googleAnalyticsId,
      googleTagManagerId: settings.googleTagManagerId,
      bingSiteVerification: settings.bingSiteVerification,
      twitterSite: settings.twitterSite,
      organisationName: settings.organisationName,
      organisationLogo: settings.organisationLogo,
      contactEmail: settings.contactEmail,
      supportUrl: settings.supportUrl,
    };
  }

  async getRobotsTxt(): Promise<string> {
    const settings = await this.getSettings();

    return buildRobotsTxt(settings, this.config.get<string>('NODE_ENV'));
  }
}
