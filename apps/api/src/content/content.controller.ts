import { Controller, Get, Header, Param, Query } from '@nestjs/common';

import { BlogService } from './blog.service.js';
import { PagesService } from './pages.service.js';
import { SeoService } from './seo.service.js';

const DEFAULT_LOCALE = 'en';

/** Everything a reader sees. No account needed, nothing here is private. */
@Controller()
export class ContentController {
  constructor(
    private readonly blog: BlogService,
    private readonly pages: PagesService,
    private readonly seo: SeoService,
  ) {}

  @Get('blog')
  listPosts(@Query('locale') locale?: string) {
    return this.blog.listPublished(locale ?? DEFAULT_LOCALE);
  }

  @Get('blog/sitemap')
  postSitemap() {
    return this.blog.sitemapRows();
  }

  @Get('blog/:locale/:slug')
  readPost(@Param('locale') locale: string, @Param('slug') slug: string) {
    return this.blog.readPublished(locale, slug);
  }

  @Get('pages')
  listPages(@Query('locale') locale?: string) {
    return this.pages.listForFooter(locale ?? DEFAULT_LOCALE);
  }

  @Get('pages/sitemap')
  pageSitemap() {
    return this.pages.sitemapRows();
  }

  @Get('pages/:locale/:slug')
  readPage(@Param('locale') locale: string, @Param('slug') slug: string) {
    return this.pages.readPublished(locale, slug);
  }

  @Get('seo/public')
  publicSeo() {
    return this.seo.getPublicSettings();
  }

  @Get('seo/robots.txt')
  @Header('content-type', 'text/plain; charset=utf-8')
  robots() {
    return this.seo.getRobotsTxt();
  }
}
