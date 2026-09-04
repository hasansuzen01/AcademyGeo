import { BadRequestException, Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';

import { SignUploadDto, UpdateProfileDto } from '../admin/dto.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/session.guard.js';
import { SessionGuard } from '../auth/session.guard.js';
import { MAX_UPLOAD_BYTES, R2Service } from '../storage/r2.service.js';
import { ProfileService } from './profile.service.js';

@Controller('profile')
@UseGuards(SessionGuard)
export class ProfileController {
  constructor(
    private readonly profile: ProfileService,
    private readonly storage: R2Service,
  ) {}

  @Get()
  get(@CurrentUser() user: AuthenticatedUser) {
    return this.profile.getProfile(user.id);
  }

  @Patch()
  update(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto) {
    return this.profile.update(user.id, dto);
  }

  /**
   * Signs an avatar upload. The prefix is fixed so nobody can write elsewhere,
   * and the object name is the account id so a new picture replaces the old one
   * instead of leaving it behind in the bucket.
   */
  @Post('avatar-upload')
  signAvatar(@CurrentUser() user: AuthenticatedUser, @Body() dto: SignUploadDto) {
    if (dto.size > MAX_UPLOAD_BYTES) {
      throw new BadRequestException(
        `Pictures have to be under ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB`,
      );
    }

    return this.storage.createUploadTicket({
      prefix: 'avatars',
      filename: dto.filename,
      contentType: dto.contentType,
      name: user.id,
    });
  }
}
