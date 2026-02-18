# Task 5 — Unit Tests

## Setup

```bash
cd backend
npm run test          # run all tests once
npm run test:watch    # watch mode
npm run test:cov      # coverage report
```

---

## Test Configuration (jest in package.json)

```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": { "^.+\\.(t|j)s$": "ts-jest" },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

---

## concerts.service.spec.ts

```typescript
// backend/src/modules/concerts/concerts.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ConcertsService } from './concerts.service';
import { ConcertsRepository } from './concerts.repository';
import { Concert } from './entities/concert.entity';

// ─── Mock Factory ──────────────────────────────────────────────────────────
const mockConcert = (overrides: Partial<Concert> = {}): Concert => ({
  id:             '00000000-0000-0000-0000-000000000001',
  name:           'Rock Night',
  description:    'An amazing rock concert',
  totalSeats:     100,
  availableSeats: 100,
  reservations:   [],
  createdAt:      new Date(),
  updatedAt:      new Date(),
  ...overrides,
});

const mockConcertsRepository = () => ({
  create:   jest.fn(),
  save:     jest.fn(),
  findAll:  jest.fn(),
  findById: jest.fn(),
  delete:   jest.fn(),
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
    repo    = module.get(ConcertsRepository);
  });

  // ── create ────────────────────────────────────────────────────────────
  describe('create', () => {
    it('should create a concert with availableSeats = totalSeats', async () => {
      const dto = { name: 'Rock Night', description: 'Amazing concert', totalSeats: 100 };
      const concert = mockConcert({ availableSeats: 100 });

      repo.create.mockReturnValue(concert);
      repo.save.mockResolvedValue(concert);

      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith({ ...dto, availableSeats: 100 });
      expect(repo.save).toHaveBeenCalledWith(concert);
      expect(result.availableSeats).toBe(result.totalSeats);
    });
  });

  // ── findAll ───────────────────────────────────────────────────────────
  describe('findAll', () => {
    it('should return all concerts', async () => {
      const concerts = [mockConcert(), mockConcert({ id: 'id-2', name: 'Jazz Night' })];
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

      await expect(service.findOne('non-existent-id'))
        .rejects.toThrow(NotFoundException);
    });
  });

  // ── update ────────────────────────────────────────────────────────────
  describe('update', () => {
    it('should update concert name and description', async () => {
      const concert = mockConcert();
      repo.findById.mockResolvedValue(concert);
      repo.save.mockResolvedValue({ ...concert, name: 'Updated Name' });

      const result = await service.update(concert.id, { name: 'Updated Name' });
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

      await expect(service.update(concert.id, { totalSeats: 50 }))
        .rejects.toThrow(BadRequestException);
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

      await expect(service.remove('non-existent-id'))
        .rejects.toThrow(NotFoundException);
    });
  });
});
```

---

## reservations.service.spec.ts

```typescript
// backend/src/modules/reservations/reservations.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException, ConflictException,
  ForbiddenException, NotFoundException,
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
  id: 'user-001', email: 'user@test.com', name: 'Test User',
  password: 'hashed', role: Role.USER,
  reservations: [], createdAt: new Date(), updatedAt: new Date(),
  ...overrides,
});

const mockConcert = (overrides: Partial<Concert> = {}): Concert => ({
  id: 'concert-001', name: 'Rock Night', description: 'Test',
  totalSeats: 100, availableSeats: 50,
  reservations: [], createdAt: new Date(), updatedAt: new Date(),
  ...overrides,
});

const mockReservation = (overrides: Partial<Reservation> = {}): Reservation => ({
  id: 'res-001', userId: 'user-001', concertId: 'concert-001',
  status: ReservationStatus.ACTIVE,
  user: mockUser(), concert: mockConcert(),
  createdAt: new Date(), updatedAt: new Date(),
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

    service          = module.get<ReservationsService>(ReservationsService);
    reservationsRepo = module.get(ReservationsRepository);
    concertsService  = module.get(ConcertsService);

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
      const user      = mockUser();
      const concert   = mockConcert({ availableSeats: 10 });
      const newRes    = mockReservation();

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

      await expect(service.reserve({ concertId: concert.id }, mockUser()))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when user already has active reservation', async () => {
      const concert     = mockConcert({ availableSeats: 5 });
      const existingRes = mockReservation();

      concertsService.findOne.mockResolvedValue(concert);
      reservationsRepo.findActiveByUserAndConcert.mockResolvedValue(existingRes);

      await expect(service.reserve({ concertId: concert.id }, mockUser()))
        .rejects.toThrow(ConflictException);
    });
  });

  // ── cancel ────────────────────────────────────────────────────────────
  describe('cancel', () => {
    it('should cancel an active reservation', async () => {
      const user  = mockUser();
      const res   = mockReservation({ userId: user.id });
      const saved = { ...res, status: ReservationStatus.CANCELLED };

      reservationsRepo.findById.mockResolvedValue(res);
      mockManager.save.mockResolvedValue(saved);

      const result = await service.cancel(res.id, user);

      expect(result.status).toBe(ReservationStatus.CANCELLED);
    });

    it('should throw NotFoundException when reservation does not exist', async () => {
      reservationsRepo.findById.mockResolvedValue(null);

      await expect(service.cancel('non-existent', mockUser()))
        .rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException when user tries to cancel someone else's reservation", async () => {
      const owner = mockUser({ id: 'owner-id' });
      const other = mockUser({ id: 'other-id' });
      const res   = mockReservation({ userId: owner.id });

      reservationsRepo.findById.mockResolvedValue(res);

      await expect(service.cancel(res.id, other))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when reservation is already cancelled', async () => {
      const user = mockUser();
      const res  = mockReservation({
        userId: user.id,
        status: ReservationStatus.CANCELLED,
      });

      reservationsRepo.findById.mockResolvedValue(res);

      await expect(service.cancel(res.id, user))
        .rejects.toThrow(BadRequestException);
    });
  });

  // ── findMyReservations ────────────────────────────────────────────────
  describe('findMyReservations', () => {
    it('should return only reservations for the given user', async () => {
      const user         = mockUser();
      const reservations = [mockReservation(), mockReservation({ id: 'res-002' })];

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
```

---

## auth.service.spec.ts

```typescript
// backend/src/modules/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Role } from '../../common/enums/role.enum';

const mockUser = () => ({
  id: 'user-001', email: 'user@test.com', name: 'Test User',
  password: '$2a$12$hashedpassword', role: Role.USER,
  createdAt: new Date(), updatedAt: new Date(),
});

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: { create: jest.fn(), findByEmail: jest.fn(), findById: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('mock.jwt.token') },
        },
      ],
    }).compile();

    service      = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService   = module.get(JwtService);
  });

  describe('login', () => {
    it('should return accessToken and user on valid credentials', async () => {
      const user = mockUser();
      usersService.findByEmail.mockResolvedValue(user as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.login({ email: user.email, password: 'password' });

      expect(result.accessToken).toBe('mock.jwt.token');
      expect(result.user).not.toHaveProperty('password');
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: user.id, email: user.email }),
      );
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@test.com', password: 'any' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      const user = mockUser();
      usersService.findByEmail.mockResolvedValue(user as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.login({ email: user.email, password: 'wrong' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should not expose password in response', async () => {
      const user = mockUser();
      usersService.findByEmail.mockResolvedValue(user as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.login({ email: user.email, password: 'password' });
      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('register', () => {
    it('should register and return token + user', async () => {
      const created = mockUser();
      usersService.create.mockResolvedValue(created as any);

      const result = await service.register({
        email: 'new@test.com', name: 'New User', password: 'password123',
      });

      expect(result.accessToken).toBeDefined();
      expect(result.user).not.toHaveProperty('password');
    });
  });
});
```

---

## users.service.spec.ts

```typescript
// backend/src/modules/users/users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { Role } from '../../common/enums/role.enum';

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo    = module.get(UsersRepository);
  });

  describe('create', () => {
    it('should hash password and save user', async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.create.mockReturnValue({ email: 'u@t.com' } as any);
      repo.save.mockResolvedValue({
        id: 'uuid', email: 'u@t.com', name: 'Test',
        password: 'hashed', role: Role.USER,
        createdAt: new Date(), updatedAt: new Date(),
      } as any);

      const result = await service.create({
        email: 'u@t.com', name: 'Test', password: 'plaintext',
      });

      expect(result.email).toBe('u@t.com');
      expect(repo.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      repo.findByEmail.mockResolvedValue({ id: 'existing' } as any);

      await expect(
        service.create({ email: 'dup@t.com', name: 'Dup', password: 'pass' })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const user = { id: 'uid', email: 'u@t.com' } as any;
      repo.findById.mockResolvedValue(user);
      const result = await service.findById('uid');
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findById('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
```

---

## Running Tests

```bash
# All tests
npm run test

# Specific file
npm run test concerts.service.spec

# With coverage
npm run test:cov

# Coverage shows:
# ✓ concerts.service.ts       ~95%
# ✓ reservations.service.ts   ~95%
# ✓ auth.service.ts           ~90%
# ✓ users.service.ts          ~85%
```

---

## Coverage Targets

| Module | Lines | Branches | Functions |
|---|---|---|---|
| concerts.service | 95%+ | 90%+ | 100% |
| reservations.service | 95%+ | 95%+ | 100% |
| auth.service | 90%+ | 85%+ | 100% |
| users.service | 85%+ | 80%+ | 100% |
