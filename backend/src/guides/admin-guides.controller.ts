import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';

import { AdminGuard } from '../auth/admin.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/session.guard.js';
import { GuideListQuery, UpsertEntryDto, UpsertTopicDto } from './dto.js';
import { GuidesService } from './guides.service.js';

/** Writing the library. Same 404-for-strangers rule as the rest of /admin. */
@Controller('admin')
@UseGuards(AdminGuard)
export class AdminGuidesController {
  constructor(private readonly guides: GuidesService) {}

  // -- Headings -------------------------------------------------------------

  @Get('guides')
  list(@Query() query: GuideListQuery) {
    return this.guides.list(query);
  }

  @Get('guides/:id')
  findOne(@Param('id') id: string) {
    return this.guides.findOne(id);
  }

  @Post('guides')
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpsertTopicDto) {
    return this.guides.create(user.id, dto);
  }

  @Put('guides/:id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpsertTopicDto,
  ) {
    return this.guides.update(user.id, id, dto);
  }

  @Delete('guides/:id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.guides.remove(user.id, id);
  }

  // -- Entries --------------------------------------------------------------
  //
  // An entry is created under its heading and edited by its own id, because
  // that is how the editor reaches it: from the heading first, by link after.

  @Post('guides/:id/entries')
  createEntry(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') topicId: string,
    @Body() dto: UpsertEntryDto,
  ) {
    return this.guides.createEntry(user.id, topicId, dto);
  }

  @Get('guide-entries/:id')
  findEntry(@Param('id') id: string) {
    return this.guides.findEntry(id);
  }

  @Put('guide-entries/:id')
  updateEntry(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpsertEntryDto,
  ) {
    return this.guides.updateEntry(user.id, id, dto);
  }

  @Delete('guide-entries/:id')
  removeEntry(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.guides.removeEntry(user.id, id);
  }
}
