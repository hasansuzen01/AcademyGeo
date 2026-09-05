import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';

import { AdminGuard } from '../auth/admin.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/session.guard.js';
import { BlogService } from './blog.service.js';
import { PagesService } from './pages.service.js';
import { SeoService } from './seo.service.js';
import { ContentListQuery, UpdateSeoDto, UpsertPageDto, UpsertPostDto } from './dto.js';

/** Writing and publishing. Same 404-for-strangers rule as the rest of /admin. */
@Controller('admin')
@UseGuards(AdminGuard)
export class AdminContentController {
  constructor(
    private readonly blog: BlogService,
    private readonly pages: PagesService,
    private readonly seo: SeoService,
  ) {}

  // -- Blog -----------------------------------------------------------------

  @Get('posts')
  listPosts(@Query() query: ContentListQuery) {
    return this.blog.list(query);
  }

  @Get('posts/:id')
  getPost(@Param('id') id: string) {
    return this.blog.findOne(id);
  }

  @Post('posts')
  createPost(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpsertPostDto) {
    return this.blog.create(user.id, dto);
  }

  @Put('posts/:id')
  updatePost(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpsertPostDto,
  ) {
    return this.blog.update(user.id, id, dto);
  }

  @Delete('posts/:id')
  deletePost(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.blog.remove(user.id, id);
  }

  // -- Footer pages ---------------------------------------------------------

  @Get('pages')
  listPages(@Query() query: ContentListQuery) {
    return this.pages.list(query);
  }

  @Get('pages/:id')
  getPage(@Param('id') id: string) {
    return this.pages.findOne(id);
  }

  @Post('pages')
  createPage(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpsertPageDto) {
    return this.pages.create(user.id, dto);
  }

  @Put('pages/:id')
  updatePage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpsertPageDto,
  ) {
    return this.pages.update(user.id, id, dto);
  }

  @Delete('pages/:id')
  deletePage(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.pages.remove(user.id, id);
  }

  // -- Search engines -------------------------------------------------------

  @Get('seo')
  getSeo() {
    return this.seo.getSettings();
  }

  @Put('seo')
  updateSeo(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateSeoDto) {
    return this.seo.updateSettings(user.id, dto);
  }
}
