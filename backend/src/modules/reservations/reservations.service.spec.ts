/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/unbound-method */
// backend/src/modules/reservations/reservations.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ReservationsService } from './reservations.service';
import { ReservationsRepository } from './reservations.repository';
import { ConcertsService } from '../concerts/concerts.service';
import { Concert } from '../concerts/entities/concert.entity';
import { User } from '../users/entities/user.entity';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { Role } from '../../common/enums/role.enum';

// ─── Mock Factories ────────────────────────────────────────────────────────
const mockUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-001',
  email: 'user@test.com',
  name: 'Test User',
  password: 'hashed',
  role: Role.USER,
  reservations: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const mockConcert = (overrides: Partial<Concert> = {}): Concert => ({
  id: 'concert-001',
  name: 'Rock Night',
  description: 'Test',
  totalSeats: 100,
  availableSeats: 50,
  reservations: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const mockReservation = (
  overrides: Partial<Reservation> = {},
): Reservation => ({
  id: 'res-001',
  userId: 'user-001',
  concertId: 'concert-001',
  status: ReservationStatus.ACTIVE,
  user: mockUser(),
  concert: mockConcert(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// ─── Mock DataSource with transaction support ──────────────────────────────
const mockManager = {
  createQueryBuilder: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({ affected: 1 }),
  }),
  save: jest.fn(),
};

const mockDataSource = {
  transaction: jest.fn((cb) => cb(mockManager)),
};

// ─── Tests ─────────────────────────────────────────────────────────────────
describe('ReservationsService', () => {
  let service: ReservationsService;
  let reservationsRepo: jest.Mocked<ReservationsRepository>;
  let concertsService: jest.Mocked<ConcertsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: ReservationsRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findActiveByUserAndConcert: jest.fn(),
            findAllByUser: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: ConcertsService,
          useValue: { findOne: jest.fn() },
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    reservationsRepo = module.get(ReservationsRepository);
    concertsService = module.get(ConcertsService);

    // Reset manager mocks
    mockManager.save.mockReset();
    jest.clearAllMocks();

    // Re-setup transaction mock after reset
    mockDataSource.transaction.mockImplementation((cb) => cb(mockManager));
    mockManager.createQueryBuilder.mockReturnValue({
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 1 }),
    });
  });

  // ── reserve ───────────────────────────────────────────────────────────
  describe('reserve', () => {
    it('should successfully create a reservation', async () => {
      const user = mockUser();
      const concert = mockConcert({ availableSeats: 10 });
      const newRes = mockReservation();

      concertsService.findOne.mockResolvedValue(concert);
      reservationsRepo.findActiveByUserAndConcert.mockResolvedValue(null);
      reservationsRepo.create.mockReturnValue(newRes);
      mockManager.save.mockResolvedValue(newRes);

      const result = await service.reserve({ concertId: concert.id }, user);

      expect(result.status).toBe(ReservationStatus.ACTIVE);
      expect(reservationsRepo.create).toHaveBeenCalledWith({
        userId: user.id,
        concertId: concert.id,
        status: ReservationStatus.ACTIVE,
      });
    });

    it('should throw BadRequestException when no seats available', async () => {
      const concert = mockConcert({ availableSeats: 0 });
      concertsService.findOne.mockResolvedValue(concert);

      await expect(
        service.reserve({ concertId: concert.id }, mockUser()),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when user already has active reservation', async () => {
      const concert = mockConcert({ availableSeats: 5 });
      const existingRes = mockReservation();

      concertsService.findOne.mockResolvedValue(concert);
      reservationsRepo.findActiveByUserAndConcert.mockResolvedValue(
        existingRes,
      );

      await expect(
        service.reserve({ concertId: concert.id }, mockUser()),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ── cancel ────────────────────────────────────────────────────────────
  describe('cancel', () => {
    it('should cancel an active reservation', async () => {
      const user = mockUser();
      const res = mockReservation({ userId: user.id });
      const saved = { ...res, status: ReservationStatus.CANCELLED };

      reservationsRepo.findById.mockResolvedValue(res);
      mockManager.save.mockResolvedValue(saved);

      const result = await service.cancel(res.id, user);

      expect(result.status).toBe(ReservationStatus.CANCELLED);
    });

    it('should throw NotFoundException when reservation does not exist', async () => {
      reservationsRepo.findById.mockResolvedValue(null);

      await expect(service.cancel('non-existent', mockUser())).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException when user tries to cancel someone else's reservation", async () => {
      const owner = mockUser({ id: 'owner-id' });
      const other = mockUser({ id: 'other-id' });
      const res = mockReservation({ userId: owner.id });

      reservationsRepo.findById.mockResolvedValue(res);

      await expect(service.cancel(res.id, other)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException when reservation is already cancelled', async () => {
      const user = mockUser();
      const res = mockReservation({
        userId: user.id,
        status: ReservationStatus.CANCELLED,
      });

      reservationsRepo.findById.mockResolvedValue(res);

      await expect(service.cancel(res.id, user)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ── findMyReservations ────────────────────────────────────────────────
  describe('findMyReservations', () => {
    it('should return only reservations for the given user', async () => {
      const user = mockUser();
      const reservations = [
        mockReservation(),
        mockReservation({ id: 'res-002' }),
      ];

      reservationsRepo.findAllByUser.mockResolvedValue(reservations);

      const result = await service.findMyReservations(user.id);

      expect(reservationsRepo.findAllByUser).toHaveBeenCalledWith(user.id);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when user has no reservations', async () => {
      reservationsRepo.findAllByUser.mockResolvedValue([]);

      const result = await service.findMyReservations('user-id');
      expect(result).toEqual([]);
    });
  });

  // ── findAll (admin) ───────────────────────────────────────────────────
  describe('findAll', () => {
    it('should return all reservations', async () => {
      const all = [
        mockReservation({ id: 'r1', userId: 'u1' }),
        mockReservation({ id: 'r2', userId: 'u2' }),
        mockReservation({ id: 'r3', userId: 'u3' }),
      ];
      reservationsRepo.findAll.mockResolvedValue(all);

      const result = await service.findAll();
      expect(result).toHaveLength(3);
    });
  });
});
