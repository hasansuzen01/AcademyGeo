import { Controller, Get, UseGuards } from '@nestjs/common';

import { SessionGuard } from '../auth/session.guard.js';
import { MAX_UPLOAD_BYTES, R2Service } from './r2.service.js';

/**
 * Whether picture uploads are available, for any signed-in account.
 *
 * Avatars go to the same bucket as card pictures, so the profile page needs
 * this too. It used to ask the admin-only route, get a 403 and tell every
 * player that the bucket was not configured.
 */
@Controller('storage')
@UseGuards(SessionGuard)
export class StorageController {
  constructor(private readonly storage: R2Service) {}

  @Get()
  status() {
    return { configured: this.storage.isConfigured, maxUploadBytes: MAX_UPLOAD_BYTES };
  }
}
