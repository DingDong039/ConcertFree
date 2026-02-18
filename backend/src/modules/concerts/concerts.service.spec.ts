/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/unbound-method, @typescript-eslint/require-await */
// backend/src/modules/concerts/concerts.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ConcertsService } from './concerts.service';
import { ConcertsRepository } from './concerts.repository';
import { Concert } from './entities/concert.entity';

// ─── Mock Factory ──────────────────────────────────────────────────────────
const mockConcert = (overrides: Partial<Concert> = {}): Concert => ({
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Rock Night',
  description: 'An amazing rock concert',
  totalSeats: 100,
  availableSeats: 100,
  reservations: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const mockConcertsRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  delete: jest.fn(),
});

// ─── Tests ─────────────────────────────────────────────────────────────────
describe('ConcertsService', () => {
  let service: ConcertsService;
  let repo: ReturnType<typeof mockConcertsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConcertsService,
        { provide: ConcertsRepository, useFactory: mockConcertsRepository },
      ],
    }).compile();

    service = module.get<ConcertsService>(ConcertsService);
    repo = module.get(ConcertsRepository);
  });

  // ── create ────────────────────────────────────────────────────────────
  describe('create', () => {
    it('should create a concert with availableSeats = totalSeats', async () => {
      const dto = {
        name: 'Rock Night',
        description: 'Amazing concert',
        totalSeats: 100,
      };
      const concert = mockConcert({ availableSeats: 100 });

      repo.create.mockReturnValue(concert);
      repo.save.mockResolvedValue(concert);

      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith({
        ...dto,
        availableSeats: 100,
      });
      expect(repo.save).toHaveBeenCalledWith(concert);
      expect(result.availableSeats).toBe(result.totalSeats);
    });
  });

  // ── findAll ───────────────────────────────────────────────────────────
  describe('findAll', () => {
    it('should return all concerts', async () => {
      const concerts = [
        mockConcert(),
        mockConcert({ id: 'id-2', name: 'Jazz Night' }),
      ];
      repo.findAll.mockResolvedValue(concerts);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(repo.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no concerts exist', async () => {
      repo.findAll.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  // ── findOne ───────────────────────────────────────────────────────────
  describe('findOne', () => {
    it('should return a concert when found', async () => {
      const concert = mockConcert();
      repo.findById.mockResolvedValue(concert);

      const result = await service.findOne(concert.id);
      expect(result).toEqual(concert);
    });

    it('should throw NotFoundException when concert does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── update ────────────────────────────────────────────────────────────
  describe('update', () => {
    it('should update concert name and description', async () => {
      const concert = mockConcert();
      repo.findById.mockResolvedValue(concert);
      repo.save.mockResolvedValue({ ...concert, name: 'Updated Name' });

      const result = await service.update(concert.id, {
        name: 'Updated Name',
      });
      expect(result.name).toBe('Updated Name');
    });

    it('should recalculate availableSeats when totalSeats is increased', async () => {
      // 40 reserved out of 100
      const concert = mockConcert({ totalSeats: 100, availableSeats: 60 });
      repo.findById.mockResolvedValue(concert);
      repo.save.mockImplementation(async (c) => c);

      const result = await service.update(concert.id, { totalSeats: 150 });
      // 150 - 40 reserved = 110 available
      expect(result.availableSeats).toBe(110);
    });

    it('should throw BadRequestException when reducing seats below reserved count', async () => {
      // 60 reserved (totalSeats=100, available=40)
      const concert = mockConcert({ totalSeats: 100, availableSeats: 40 });
      repo.findById.mockResolvedValue(concert);

      await expect(
        service.update(concert.id, { totalSeats: 50 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── remove ────────────────────────────────────────────────────────────
  describe('remove', () => {
    it('should delete a concert', async () => {
      const concert = mockConcert();
      repo.findById.mockResolvedValue(concert);
      repo.delete.mockResolvedValue(undefined);

      await service.remove(concert.id);

      expect(repo.delete).toHaveBeenCalledWith(concert.id);
    });

    it('should throw NotFoundException when concert does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
