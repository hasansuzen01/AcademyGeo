import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import type { PrismaService } from '../prisma/prisma.service.js';
import type { RedisService } from '../redis/redis.service.js';
import { AnswersService } from './answers.service.js';

const meta = {
  id: 'meta-1',
  countryCode: 'NO',
  difficulty: 2,
  titleEn: 'Norwegian plate',
  titleTr: 'Norveç plakası',
  descriptionEn: 'A blue strip on the left.',
  descriptionTr: 'Solda mavi şerit.',
  imageAuthor: null,
  imageLicense: null,
  imageSourceUrl: null,
  country: { code: 'NO', nameEn: 'Norway', nameTr: 'Norveç' },
};

function setup({ metaFound = true, countryKnown = true } = {}) {
  const prisma = {
    meta: { findUnique: vi.fn(async () => (metaFound ? meta : null)) },
    country: { findUnique: vi.fn(async () => (countryKnown ? { code: 'SE' } : null)) },
    reviewCard: { findUnique: vi.fn(), upsert: vi.fn() },
    reviewLog: { create: vi.fn() },
    dailyActivity: { upsert: vi.fn() },
    $transaction: vi.fn(),
  };
  const redis = { invalidate: vi.fn() };
  const service = new AnswersService(
    prisma as unknown as PrismaService,
    redis as unknown as RedisService,
  );

  return { service, prisma, redis };
}

describe('AnswersService.check', () => {
  // A visitor who has not signed in gets the same verdict and explanation a
  // player does, so the practice they try is the practice they would get.
  it('grades a wrong guess and names the right country', async () => {
    const { service } = setup();

    const answer = await service.check('meta-1', 'se');

    expect(answer.correct).toBe(false);
    expect(answer.country).toEqual({ code: 'NO', nameEn: 'Norway', nameTr: 'Norveç' });
    expect(answer.explanation.titleTr).toBe('Norveç plakası');
  });

  it('grades a right guess, whatever the case of the code', async () => {
    const { service } = setup();

    expect((await service.check('meta-1', 'no')).correct).toBe(true);
  });

  // Nobody is signed in, so there is nobody to remember anything for.
  it('writes nothing and clears no cache', async () => {
    const { service, prisma, redis } = setup();

    await service.check('meta-1', 'SE');

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.reviewCard.upsert).not.toHaveBeenCalled();
    expect(prisma.reviewLog.create).not.toHaveBeenCalled();
    expect(redis.invalidate).not.toHaveBeenCalled();
  });

  it('refuses a card that does not exist', async () => {
    const { service } = setup({ metaFound: false });

    await expect(service.check('missing', 'SE')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('refuses a country code that is not a country', async () => {
    const { service } = setup({ countryKnown: false });

    await expect(service.check('meta-1', 'ZZ')).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('CheckAnswerDto', () => {
  it('asks only for the card and the guess, not a response time', async () => {
    const { plainToInstance } = await import('class-transformer');
    const { validateSync } = await import('class-validator');
    const { CheckAnswerDto } = await import('./dto.js');

    const ok = plainToInstance(CheckAnswerDto, { metaId: 'meta-1', guessedCountryCode: 'NO' });
    const bad = plainToInstance(CheckAnswerDto, { metaId: '', guessedCountryCode: 'NOR' });

    expect(validateSync(ok)).toEqual([]);
    expect(validateSync(bad).map((error) => error.property).sort()).toEqual([
      'guessedCountryCode',
      'metaId',
    ]);
  });
});
