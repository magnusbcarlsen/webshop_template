// backend/src/exhibitions/exhibitions.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { ExhibitionsService } from './exhibitions.service';
import { Exhibition } from './entities/exhibition.entity';

describe('ExhibitionsService', () => {
  let service: ExhibitionsService;
  let repo: jest.Mocked<Repository<Exhibition>>;

  beforeEach(async () => {
    const repoMock = {
      find: jest.fn(),
    } as unknown as jest.Mocked<Repository<Exhibition>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExhibitionsService,
        { provide: getRepositoryToken(Exhibition), useValue: repoMock },
        { provide: 'S3', useValue: { send: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get<ExhibitionsService>(ExhibitionsService);
    repo = module.get(getRepositoryToken(Exhibition));
  });

  describe('findActive', () => {
    it('queries with is_active=true, today between display_from and display_until, ordered by eventStartDate ASC', async () => {
      repo.find.mockResolvedValue([]);

      await service.findActive(new Date('2026-06-15T12:00:00Z'));

      expect(repo.find).toHaveBeenCalledTimes(1);
      const args = repo.find.mock.calls[0][0]!;
      expect(args.where).toMatchObject({ isActive: true });
      const where = args.where as Record<string, unknown>;
      expect(where.displayFrom).toEqual(LessThanOrEqual('2026-06-15'));
      expect(where.displayUntil).toEqual(MoreThanOrEqual('2026-06-15'));
      expect(args.order).toEqual({ eventStartDate: 'ASC' });
    });

    it('returns the rows the repository returns', async () => {
      const rows = [
        { id: 1, title: 'Summer show' } as unknown as Exhibition,
      ];
      repo.find.mockResolvedValue(rows);

      const result = await service.findActive(new Date('2026-06-15'));

      expect(result).toBe(rows);
    });
  });
});
