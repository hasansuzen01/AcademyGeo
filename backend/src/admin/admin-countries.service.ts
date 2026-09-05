import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from './audit.service.js';
import type { UpsertCountryDto } from './dto.js';

/** The country list the answer buttons are drawn from. */
@Injectable()
export class AdminCountriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  listCountries() {
    return this.prisma.country.findMany({
      include: { _count: { select: { metas: true } } },
      orderBy: { nameEn: 'asc' },
    });
  }

  async createCountry(actorId: string, dto: UpsertCountryDto) {
    const country = await this.prisma.country.create({ data: dto });

    await this.audit.record({
      actorId,
      action: 'create',
      entity: 'country',
      entityId: country.code,
      summary: `Added ${country.nameEn}`,
    });

    return country;
  }

  async updateCountry(actorId: string, code: string, dto: UpsertCountryDto) {
    const existing = await this.prisma.country.findUnique({ where: { code } });
    if (!existing) throw new NotFoundException('Country not found');

    const country = await this.prisma.country.update({
      where: { code },
      data: { nameEn: dto.nameEn, nameTr: dto.nameTr, region: dto.region },
    });

    await this.audit.record({
      actorId,
      action: 'update',
      entity: 'country',
      entityId: code,
      summary: `Edited ${country.nameEn}`,
    });

    return country;
  }

  async removeCountry(actorId: string, code: string) {
    const country = await this.prisma.country.findUnique({
      where: { code },
      include: { _count: { select: { metas: true } } },
    });
    if (!country) throw new NotFoundException('Country not found');

    // Deleting would cascade to its metas and take everyone's review history
    // for those cards with it, so the metas have to be moved or removed first.
    if (country._count.metas > 0) {
      throw new BadRequestException(
        `${country.nameEn} still has ${country._count.metas} metas. Move or delete them first.`,
      );
    }

    await this.prisma.country.delete({ where: { code } });

    await this.audit.record({
      actorId,
      action: 'delete',
      entity: 'country',
      entityId: code,
      summary: `Removed ${country.nameEn}`,
    });

    return { code };
  }
}
