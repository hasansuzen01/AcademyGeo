import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AdminGuard } from '../auth/admin.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/session.guard.js';
import { MAX_UPLOAD_BYTES, R2Service } from '../storage/r2.service.js';
import { AdminDecksService } from './admin-decks.service.js';
import { AdminMetasService } from './admin-metas.service.js';
import { AdminOverviewService } from './admin-overview.service.js';
import { AdminCountriesService } from './admin-countries.service.js';
import { AdminUsersService } from './admin-users.service.js';
import { AuditService } from './audit.service.js';
import {
  DeckOrderDto,
  MetaListQuery,
  PageQuery,
  SetRoleDto,
  SignUploadDto,
  UpsertCountryDto,
  UpsertDeckDto,
  UpsertMetaDto,
  UserListQuery,
} from './dto.js';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    private readonly metas: AdminMetasService,
    private readonly decks: AdminDecksService,
    private readonly countries: AdminCountriesService,
    private readonly users: AdminUsersService,
    private readonly overview: AdminOverviewService,
    private readonly audit: AuditService,
    private readonly storage: R2Service,
  ) {}

  @Get('overview')
  getOverview() {
    return this.overview.getOverview();
  }

  // -- Metas ----------------------------------------------------------------

  @Get('metas')
  listMetas(@Query() query: MetaListQuery) {
    return this.metas.list(query);
  }

  @Get('metas/:id')
  getMeta(@Param('id') id: string) {
    return this.metas.findOne(id);
  }

  @Post('metas')
  createMeta(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpsertMetaDto) {
    return this.metas.create(user.id, dto);
  }

  @Patch('metas/:id')
  updateMeta(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpsertMetaDto,
  ) {
    return this.metas.update(user.id, id, dto);
  }

  @Delete('metas/:id')
  deleteMeta(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.metas.remove(user.id, id);
  }

  // -- Decks ----------------------------------------------------------------

  @Get('decks')
  listDecks(@Query() query: PageQuery) {
    return this.decks.list(query);
  }

  @Get('decks/:id')
  getDeck(@Param('id') id: string) {
    return this.decks.findOne(id);
  }

  @Post('decks')
  createDeck(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpsertDeckDto) {
    return this.decks.create(user.id, dto);
  }

  @Patch('decks/:id')
  updateDeck(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpsertDeckDto,
  ) {
    return this.decks.update(user.id, id, dto);
  }

  @Put('decks/:id/metas')
  setDeckMetas(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: DeckOrderDto,
  ) {
    return this.decks.setMetas(user.id, id, dto);
  }

  @Delete('decks/:id')
  deleteDeck(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.decks.remove(user.id, id);
  }

  // -- Countries ------------------------------------------------------------

  @Get('countries')
  listCountries() {
    return this.countries.listCountries();
  }

  @Post('countries')
  createCountry(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpsertCountryDto) {
    return this.countries.createCountry(user.id, dto);
  }

  @Patch('countries/:code')
  updateCountry(
    @CurrentUser() user: AuthenticatedUser,
    @Param('code') code: string,
    @Body() dto: UpsertCountryDto,
  ) {
    return this.countries.updateCountry(user.id, code.toUpperCase(), dto);
  }

  @Delete('countries/:code')
  deleteCountry(@CurrentUser() user: AuthenticatedUser, @Param('code') code: string) {
    return this.countries.removeCountry(user.id, code.toUpperCase());
  }

  // -- Accounts -------------------------------------------------------------

  @Get('users')
  listUsers(@Query() query: UserListQuery) {
    return this.users.listUsers(query);
  }

  @Patch('users/:id/role')
  setRole(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: SetRoleDto,
  ) {
    return this.users.setRole(user.id, id, dto.role);
  }

  // -- Audit trail ----------------------------------------------------------

  @Get('audit')
  async listAudit(@Query() query: PageQuery) {
    const [items, total] = await Promise.all([
      this.audit.list({ take: query.take ?? 50, skip: query.skip ?? 0 }),
      this.audit.count(),
    ]);

    return { items, total };
  }

  // -- Uploads --------------------------------------------------------------

  @Post('uploads/sign')
  signUpload(@Body() dto: SignUploadDto) {
    if (dto.size > MAX_UPLOAD_BYTES) {
      throw new BadRequestException(
        `Pictures have to be under ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB`,
      );
    }

    return this.storage.createUploadTicket({
      prefix: dto.prefix ?? 'metas',
      filename: dto.filename,
      contentType: dto.contentType,
    });
  }

  @Get('storage')
  storageStatus() {
    return { configured: this.storage.isConfigured, maxUploadBytes: MAX_UPLOAD_BYTES };
  }
}
