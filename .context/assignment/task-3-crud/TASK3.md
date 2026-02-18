# Task 3 — Free Concert Tickets CRUD

## Architecture Overview

```
HTTP Request
    │
    ▼
Controller        ← Validate DTO, Guard check, route
    │
    ▼
Service           ← Business logic, rules enforcement
    │
    ▼
Repository        ← Data access (TypeORM wrapper)
    │
    ▼
Database (PostgreSQL)
```

**Separation of Concerns:**
- `Controller` — HTTP layer only (routing, guards, DTOs)
- `Service` — all business rules live here
- `Repository` — all DB queries live here (Single Responsibility)

---

## Entity Relationship Diagram

```
┌─────────────┐          ┌──────────────────┐          ┌───────────────┐
│    users    │          │  reservations    │          │   concerts    │
├─────────────┤          ├──────────────────┤          ├───────────────┤
│ id (uuid)   │◄────────►│ id (uuid)        │◄────────►│ id (uuid)     │
│ email       │  1    *  │ userId (FK)      │  *    1  │ name          │
│ name        │          │ concertId (FK)   │          │ description   │
│ password    │          │ status (enum)    │          │ totalSeats    │
│ role (enum) │          │ createdAt        │          │ availableSeats│
│ createdAt   │          │ updatedAt        │          │ createdAt     │
└─────────────┘          └──────────────────┘          └───────────────┘

Unique constraint: (userId, concertId) → 1 reservation per user per concert
```

---

## Database Entities

### User Entity

```typescript
// backend/src/modules/users/entities/user.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from '../../../common/enums/role.enum';
import { Reservation } from '../../reservations/entities/reservation.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  @Exclude()           // Never expose password in responses
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @OneToMany(() => Reservation, (r) => r.user)
  reservations: Reservation[];

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
```

### Concert Entity

```typescript
// backend/src/modules/concerts/entities/concert.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';
import { Reservation } from '../../reservations/entities/reservation.entity';

@Entity('concerts')
export class Concert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int' })
  totalSeats: number;

  @Column({ type: 'int' })
  availableSeats: number;

  @OneToMany(() => Reservation, (r) => r.concert)
  reservations: Reservation[];

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
```

### Reservation Entity

```typescript
// backend/src/modules/reservations/entities/reservation.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Concert } from '../../concerts/entities/concert.entity';

export enum ReservationStatus {
  ACTIVE    = 'active',
  CANCELLED = 'cancelled',
}

@Entity('reservations')
@Unique(['userId', 'concertId'])   // DB-level constraint: 1 reservation per user per concert
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column() userId: string;
  @Column() concertId: string;

  @Column({ type: 'enum', enum: ReservationStatus, default: ReservationStatus.ACTIVE })
  status: ReservationStatus;

  @ManyToOne(() => User,    (u) => u.reservations,   { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Concert, (c) => c.reservations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'concertId' })
  concert: Concert;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
```

---

## Auth Module

### Role Enum

```typescript
// backend/src/common/enums/role.enum.ts
export enum Role {
  ADMIN = 'admin',
  USER  = 'user',
}
```

### JWT Strategy

```typescript
// backend/src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) throw new UnauthorizedException();
    return user;    // → attached as request.user
  }
}
```

### Auth Service

```typescript
// backend/src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);
    return this.buildTokenPayload(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return this.buildTokenPayload(user);
  }

  private buildTokenPayload(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const { password: _, ...userWithoutPassword } = user;
    return {
      accessToken: this.jwtService.sign(payload),
      user: userWithoutPassword,
    };
  }
}
```

---

## Concerts Module

### DTOs

```typescript
// backend/src/modules/concerts/dto/concert.dto.ts
import { IsString, IsInt, MinLength, MaxLength, Min, Max } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateConcertDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  name: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsInt()
  @Min(1)
  @Max(100000)
  totalSeats: number;
}

export class UpdateConcertDto extends PartialType(CreateConcertDto) {}
```

### Repository (Data Access Layer)

```typescript
// backend/src/modules/concerts/concerts.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Concert } from './entities/concert.entity';

@Injectable()
export class ConcertsRepository {
  constructor(
    @InjectRepository(Concert)
    private readonly repo: Repository<Concert>,
  ) {}

  create(data: Partial<Concert>): Concert           { return this.repo.create(data); }
  async save(c: Concert): Promise<Concert>          { return this.repo.save(c); }
  async findAll(): Promise<Concert[]>               { return this.repo.find({ order: { createdAt: 'DESC' } }); }
  async findById(id: string): Promise<Concert|null> { return this.repo.findOne({ where: { id } }); }
  async delete(id: string): Promise<void>           { await this.repo.delete(id); }
}
```

### Service (Business Logic)

```typescript
// backend/src/modules/concerts/concerts.service.ts
import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { ConcertsRepository } from './concerts.repository';
import { CreateConcertDto, UpdateConcertDto } from './dto/concert.dto';
import { Concert } from './entities/concert.entity';

@Injectable()
export class ConcertsService {
  constructor(private readonly concertsRepository: ConcertsRepository) {}

  async create(dto: CreateConcertDto): Promise<Concert> {
    const concert = this.concertsRepository.create({
      ...dto,
      availableSeats: dto.totalSeats,   // all seats available on creation
    });
    return this.concertsRepository.save(concert);
  }

  async findAll(): Promise<Concert[]> {
    return this.concertsRepository.findAll();
  }

  async findOne(id: string): Promise<Concert> {
    const concert = await this.concertsRepository.findById(id);
    if (!concert) throw new NotFoundException(`Concert #${id} not found`);
    return concert;
  }

  async update(id: string, dto: UpdateConcertDto): Promise<Concert> {
    const concert = await this.findOne(id);

    if (dto.totalSeats !== undefined) {
      const reservedSeats = concert.totalSeats - concert.availableSeats;
      if (dto.totalSeats < reservedSeats) {
        throw new BadRequestException(
          `Cannot reduce seats below reserved count (${reservedSeats})`,
        );
      }
      concert.availableSeats = dto.totalSeats - reservedSeats;
    }

    Object.assign(concert, dto);
    return this.concertsRepository.save(concert);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);   // throws 404 if not found
    await this.concertsRepository.delete(id);
  }
}
```

### Controller

```typescript
// backend/src/modules/concerts/concerts.controller.ts
import {
  Controller, Get, Post, Patch, Delete, Param, Body,
  UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ConcertsService } from './concerts.service';
import { CreateConcertDto, UpdateConcertDto } from './dto/concert.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('concerts')
export class ConcertsController {
  constructor(private readonly concertsService: ConcertsService) {}

  // ── Public / User ──────────────────────────────────────────
  @Get()
  findAll() { return this.concertsService.findAll(); }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.concertsService.findOne(id);
  }

  // ── Admin only ─────────────────────────────────────────────
  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() dto: CreateConcertDto) {
    return this.concertsService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateConcertDto,
  ) { return this.concertsService.update(id, dto); }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.concertsService.remove(id);
  }
}
```

---

## Reservations Module

### Service (Critical Business Rules + Transactions)

```typescript
// backend/src/modules/reservations/reservations.service.ts
import {
  Injectable, NotFoundException, ConflictException,
  ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ReservationsRepository } from './reservations.repository';
import { ConcertsService } from '../concerts/concerts.service';
import { CreateReservationDto } from './dto/reservation.dto';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
    private readonly concertsService: ConcertsService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Reserve a seat.
   * Rules:
   *  1. One active reservation per user per concert
   *  2. Concert must have available seats
   *  3. Seat decrement happens atomically (DB transaction)
   */
  async reserve(dto: CreateReservationDto, user: User): Promise<Reservation> {
    return this.dataSource.transaction(async (manager) => {
      const concert = await this.concertsService.findOne(dto.concertId);

      if (concert.availableSeats <= 0) {
        throw new BadRequestException('No seats available for this concert');
      }

      const existing = await this.reservationsRepository
        .findActiveByUserAndConcert(user.id, dto.concertId);

      if (existing) {
        throw new ConflictException(
          'You already have an active reservation for this concert',
        );
      }

      // Atomic seat decrement — only succeeds if a seat is truly available
      const result = await manager
        .createQueryBuilder()
        .update('concerts')
        .set({ availableSeats: () => '"availableSeats" - 1' })
        .where('id = :id AND "availableSeats" > 0', { id: dto.concertId })
        .execute();

      if (result.affected === 0) {
        throw new BadRequestException('No seats available (race condition prevented)');
      }

      const reservation = this.reservationsRepository.create({
        userId: user.id,
        concertId: dto.concertId,
        status: ReservationStatus.ACTIVE,
      });

      return manager.save(reservation);
    });
  }

  /**
   * Cancel a reservation.
   * Only the owner can cancel; returns seat atomically.
   */
  async cancel(reservationId: string, user: User): Promise<Reservation> {
    return this.dataSource.transaction(async (manager) => {
      const reservation = await this.reservationsRepository.findById(reservationId);

      if (!reservation) throw new NotFoundException('Reservation not found');

      if (reservation.userId !== user.id) {
        throw new ForbiddenException("Cannot cancel another user's reservation");
      }

      if (reservation.status === ReservationStatus.CANCELLED) {
        throw new BadRequestException('Reservation is already cancelled');
      }

      // Return the seat atomically
      await manager
        .createQueryBuilder()
        .update('concerts')
        .set({ availableSeats: () => '"availableSeats" + 1' })
        .where('id = :id', { id: reservation.concertId })
        .execute();

      reservation.status = ReservationStatus.CANCELLED;
      return manager.save(reservation);
    });
  }

  async findMyReservations(userId: string): Promise<Reservation[]> {
    return this.reservationsRepository.findAllByUser(userId);
  }

  async findAll(): Promise<Reservation[]> {
    return this.reservationsRepository.findAll();
  }
}
```

### Controller

```typescript
// backend/src/modules/reservations/reservations.controller.ts
import {
  Controller, Post, Delete, Get, Param, Body,
  UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/reservation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { User } from '../users/entities/user.entity';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  // ── User ────────────────────────────────────────────────────
  @Post()
  reserve(@Body() dto: CreateReservationDto, @CurrentUser() user: User) {
    return this.reservationsService.reserve(dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) { return this.reservationsService.cancel(id, user); }

  @Get('me')
  myReservations(@CurrentUser() user: User) {
    return this.reservationsService.findMyReservations(user.id);
  }

  // ── Admin ───────────────────────────────────────────────────
  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  findAll() { return this.reservationsService.findAll(); }
}
```

---

## API Endpoint Summary

| Method | Path | Role | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register user |
| POST | `/auth/login` | Public | Login |
| GET | `/concerts` | Public | View all concerts |
| GET | `/concerts/:id` | Public | View one concert |
| POST | `/concerts` | Admin | Create concert |
| PATCH | `/concerts/:id` | Admin | Update concert |
| DELETE | `/concerts/:id` | Admin | Delete concert |
| POST | `/reservations` | User | Reserve a seat |
| DELETE | `/reservations/:id` | User | Cancel reservation |
| GET | `/reservations/me` | User | Own history |
| GET | `/reservations` | Admin | All users history |

---

## Standard API Response Envelope

Every response is wrapped automatically by `ResponseInterceptor`:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

Error responses (via `GlobalExceptionFilter`):

```json
{
  "statusCode": 400,
  "timestamp": "2024-01-15T10:00:00.000Z",
  "path": "/api/v1/reservations",
  "message": "No seats available for this concert"
}
```

---

## Frontend — API Client

```typescript
// frontend/src/lib/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'Request failed');
  }

  if (res.status === 204) return undefined as T;

  const json: { success: boolean; data: T } = await res.json();
  return json.data;
}

export const concertsApi = {
  getAll:  ()                    => request<Concert[]>('/concerts'),
  getOne:  (id: string)          => request<Concert>(`/concerts/${id}`),
  create:  (body: CreateConcertPayload) =>
    request<Concert>('/concerts', { method: 'POST', body: JSON.stringify(body) }),
  update:  (id: string, body: Partial<CreateConcertPayload>) =>
    request<Concert>(`/concerts/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete:  (id: string)          =>
    request<void>(`/concerts/${id}`, { method: 'DELETE' }),
};

export const reservationsApi = {
  reserve: (concertId: string)   =>
    request<Reservation>('/reservations', { method: 'POST', body: JSON.stringify({ concertId }) }),
  cancel:  (id: string)          =>
    request<Reservation>(`/reservations/${id}`, { method: 'DELETE' }),
  getMine: ()                    => request<Reservation[]>('/reservations/me'),
  getAll:  ()                    => request<Reservation[]>('/reservations'),
};
```
