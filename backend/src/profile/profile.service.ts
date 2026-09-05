import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import type { UpdateProfileDto } from '../admin/dto.js';

const PROFILE_FIELDS = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
  createdAt: true,
} as const;

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  /** The account page: who you are, plus what you have built up so far. */
  async getProfile(userId: string) {
    const [user, cards, answers, firstLog] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: PROFILE_FIELDS }),
      this.prisma.reviewCard.count({ where: { userId } }),
      this.prisma.reviewLog.count({ where: { userId } }),
      this.prisma.reviewLog.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      }),
    ]);

    return {
      ...user,
      trackedMetas: cards,
      totalAnswers: answers,
      firstAnswerAt: firstLog?.createdAt ?? null,
    };
  }

  update(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { name: dto.name, image: dto.image },
      select: PROFILE_FIELDS,
    });
  }
}
