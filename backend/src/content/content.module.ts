import { Module } from '@nestjs/common';

import { AuditService } from '../admin/audit.service.js';
import { AdminContentController } from './admin-content.controller.js';
import { BlogService } from './blog.service.js';
import { ContentController } from './content.controller.js';
import { PagesService } from './pages.service.js';
import { SeoService } from './seo.service.js';

@Module({
  controllers: [ContentController, AdminContentController],
  providers: [BlogService, PagesService, SeoService, AuditService],
})
export class ContentModule {}
