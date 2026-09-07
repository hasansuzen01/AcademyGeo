import { Controller, Get, Param, Query } from '@nestjs/common';

import { GuidesService } from './guides.service.js';

const DEFAULT_LOCALE = 'en';

/** The library as a reader sees it. No account needed. */
@Controller('guides')
export class GuidesController {
  constructor(private readonly guides: GuidesService) {}

  @Get()
  list(@Query('locale') locale?: string) {
    return this.guides.listTopics(locale ?? DEFAULT_LOCALE);
  }

  @Get('sitemap')
  sitemap() {
    return this.guides.sitemapRows();
  }

  @Get('country/:code')
  forCountry(@Param('code') code: string) {
    return this.guides.listForCountry(code.toUpperCase());
  }

  @Get(':locale/:topic')
  readTopic(@Param('locale') locale: string, @Param('topic') topic: string) {
    return this.guides.readTopic(locale, topic);
  }

  @Get(':locale/:topic/:entry')
  readEntry(
    @Param('locale') locale: string,
    @Param('topic') topic: string,
    @Param('entry') entry: string,
  ) {
    return this.guides.readEntry(locale, topic, entry);
  }
}
