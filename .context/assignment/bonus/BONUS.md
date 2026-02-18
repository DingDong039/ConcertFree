# Bonus — Performance Optimization & Concurrency Handling

---

## Part 1: Optimizing for Intensive Data & High Traffic

### Problem
เว็บมี data เยอะ + user เข้าพร้อมกันเยอะ → ต้องทำให้ scalable ในทุก layer

---

### Layer 1 — Database Optimization

#### Indexing
```sql
-- Query ที่ใช้บ่อย → ต้องมี index
CREATE INDEX idx_reservations_user_id    ON reservations (userId);
CREATE INDEX idx_reservations_concert_id ON reservations (concertId);
CREATE INDEX idx_reservations_status     ON reservations (status);

-- Compound index สำหรับ "find active reservation by user+concert"
CREATE UNIQUE INDEX idx_reservations_user_concert
  ON reservations (userId, concertId);
```

#### Connection Pooling
```typescript
// TypeORM connection pool — ไม่เปิด connection ใหม่ทุก request
TypeOrmModule.forRoot({
  ...
  extra: {
    max: 20,               // max connections ใน pool
    min: 5,                // keep-alive minimum
    acquire: 30000,        // timeout รอ connection (ms)
    idle: 10000,           // ปิด connection ที่ไม่ใช้ (ms)
  },
})
```

#### Read Replicas
```
Primary DB  ─── writes (INSERT/UPDATE/DELETE)
Replica DB  ─── reads  (SELECT)

ใช้ TypeORM multiple datasource หรือ PgBouncer
```

---

### Layer 2 — Caching

#### Redis Cache (คนดู concert list เยอะ → cache ไว้)
```typescript
// ติดตั้ง: npm install @nestjs/cache-manager cache-manager-redis-store

// concerts.service.ts
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class ConcertsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly concertsRepository: ConcertsRepository,
  ) {}

  async findAll(): Promise<Concert[]> {
    const CACHE_KEY = 'concerts:all';
    const TTL_SECONDS = 60;   // cache 60 วินาที

    // Check cache first
    const cached = await this.cacheManager.get<Concert[]>(CACHE_KEY);
    if (cached) return cached;

    // Miss → query DB → store in cache
    const concerts = await this.concertsRepository.findAll();
    await this.cacheManager.set(CACHE_KEY, concerts, TTL_SECONDS);

    return concerts;
  }

  async create(dto: CreateConcertDto): Promise<Concert> {
    const concert = await this.createInDb(dto);
    await this.cacheManager.del('concerts:all');   // invalidate cache
    return concert;
  }
}
```

#### Cache Strategy Summary

| Data | Cache TTL | Strategy |
|---|---|---|
| Concert list | 60s | Cache-aside, invalidate on write |
| Single concert | 30s | Cache-aside per ID |
| Reservations (admin) | No cache | Always fresh |
| User's own reservations | 10s | Short TTL |

---

### Layer 3 — API Performance

#### Pagination (ไม่ return ทุก record)
```typescript
// concerts.controller.ts
@Get()
findAll(
  @Query('page',  new DefaultValuePipe(1),   ParseIntPipe) page:  number,
  @Query('limit', new DefaultValuePipe(20),  ParseIntPipe) limit: number,
) { return this.concertsService.findAll({ page, limit }); }

// concerts.service.ts
async findAll({ page, limit }): Promise<{ data: Concert[]; total: number }> {
  const [data, total] = await this.repo.findAndCount({
    order: { createdAt: 'DESC' },
    skip:  (page - 1) * limit,
    take:  limit,
  });
  return { data, total };
}
```

#### Response Compression
```typescript
// main.ts
import compression from 'compression';
app.use(compression());   // gzip responses → ลด bandwidth
```

#### Rate Limiting
```typescript
// npm install @nestjs/throttler
ThrottlerModule.forRoot([{
  ttl:   60_000,   // window 60s
  limit: 100,      // max 100 req per IP per 60s
}])
```

---

### Layer 4 — Infrastructure / Deployment

```
                     ┌─────────────┐
Internet ──────────▶ │  CDN / WAF  │  (static assets, DDoS protection)
                     └──────┬──────┘
                             │
                     ┌──────▼──────┐
                     │ Load Balancer│  (Nginx / ALB)
                     └──────┬──────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
        │ NestJS #1 │  │ NestJS #2 │  │ NestJS #3 │  (horizontal scale)
        └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
              └──────────────┼──────────────┘
                             │
              ┌──────────────┼──────────────┐
              │                             │
        ┌─────▼─────┐               ┌──────▼──────┐
        │  Redis    │               │  PostgreSQL  │
        │  Cache    │               │  + Replicas  │
        └───────────┘               └─────────────┘
```

---

## Part 2: Handling Many Users Reserving at the Same Time

### Problem (Race Condition)
```
User A: reads availableSeats = 1
User B: reads availableSeats = 1
User A: reserves → availableSeats = 0 ✓
User B: reserves → availableSeats = -1 ✗  ← OVERBOOKING!
```

---

### Solution 1 — Atomic SQL Update (ที่ใช้ใน code นี้)

วิธีนี้ใช้ **database atomic operation** แก้ race condition ในระดับ DB:

```typescript
// reservations.service.ts
async reserve(dto, user) {
  return this.dataSource.transaction(async (manager) => {

    // Atomic decrement — SQL ทำ read+write ใน operation เดียว
    // "availableSeats > 0" เป็น guard ใน WHERE clause
    const result = await manager
      .createQueryBuilder()
      .update('concerts')
      .set({ availableSeats: () => '"availableSeats" - 1' })
      .where('id = :id AND "availableSeats" > 0', { id: dto.concertId })
      .execute();

    // ถ้า affected = 0 → ไม่มีที่นั่ง (race condition ถูกป้องกัน)
    if (result.affected === 0) {
      throw new BadRequestException('No seats available');
    }

    // บันทึก reservation
    return manager.save(reservation);
  });
}
```

**ทำไมถึงป้องกัน race condition ได้?**
- SQL `UPDATE WHERE availableSeats > 0` เป็น atomic operation
- Database row-level lock จะป้องกัน concurrent update
- ถ้า 1000 users ส่ง request พร้อมกัน → DB จะ serialize และแค่คนที่ "ชนะ" lock จะได้ที่นั่ง

---

### Solution 2 — Optimistic Locking (เพิ่ม @VersionColumn)

```typescript
@Entity('concerts')
export class Concert {
  ...
  @VersionColumn()
  version: number;   // auto-increment ทุก UPDATE
}

// ใน service: TypeORM จะ throw OptimisticLockVersionMismatchError
// ถ้า version ไม่ตรง → retry หรือ throw 409 Conflict
```

---

### Solution 3 — Distributed Lock with Redis (Enterprise Scale)

สำหรับ load ที่สูงมาก เช่น 10,000+ concurrent:

```typescript
// npm install ioredis redlock
import Redlock from 'redlock';

@Injectable()
export class ReservationsService {
  private redlock: Redlock;

  constructor(...) {
    this.redlock = new Redlock([redisClient], {
      retryCount: 3,
      retryDelay: 200,   // ms
    });
  }

  async reserve(dto, user) {
    // Lock concert resource สำหรับ 5 วินาที
    const lock = await this.redlock.acquire(
      [`concert:${dto.concertId}:lock`],
      5000
    );

    try {
      // ตรงนี้ guaranteed ว่ามีแค่ 1 instance ที่ทำงาน
      return await this.doReserve(dto, user);
    } finally {
      await lock.release();   // unlock เสมอ
    }
  }
}
```

---

### Solution 4 — Queue-Based Reservation (High Throughput)

สำหรับ concerts ที่ tickets หมดเร็วมาก (เช่น Taylor Swift):

```
User → API → Queue (BullMQ/Redis) → Worker → DB
               ↓
         acknowledge immediately
         "your request is in queue"
               ↓ (async)
         Worker processes FIFO
         sends email/notification when done
```

```typescript
// npm install @nestjs/bull bull

@Controller('reservations')
export class ReservationsController {
  @Post()
  async reserve(@Body() dto, @CurrentUser() user) {
    // ไม่ทำ DB ทันที — ส่ง job เข้า queue
    const job = await this.reservationQueue.add('reserve', {
      userId: user.id,
      concertId: dto.concertId,
    });

    return { jobId: job.id, message: 'Your request is being processed' };
  }
}

@Processor('reservations')
export class ReservationProcessor {
  @Process('reserve')
  async handleReserve(job: Job) {
    // Worker ทำ DB operation ตาม queue order (FIFO)
    return this.reservationsService.reserve(job.data, job.data.userId);
  }
}
```

---

### Comparison of Approaches

| Approach | Complexity | Throughput | Use Case |
|---|---|---|---|
| Atomic SQL (ใช้ใน project นี้) | Low ⭐ | Medium | ทั่วไป, concerts ส่วนใหญ่ |
| Optimistic Locking | Low ⭐ | Medium | Low-contention |
| Redis Distributed Lock | Medium ⭐⭐ | High | Microservices, multiple instances |
| Queue-Based | High ⭐⭐⭐ | Very High | Viral events, flash sales |

สำหรับ project นี้ใช้ **Atomic SQL** เพราะ:
- Simple ที่สุด, no external dependency เพิ่ม
- PostgreSQL row-level locking รับประกัน correctness
- เหมาะกับ scale ระดับ concert ปกติ

---

### Summary

```
ปัญหา: Intensive data + High traffic

แนวทางแก้:
1. DB:           Index + Connection Pool + Read Replica
2. Cache:        Redis (concert list, ลด DB load)
3. API:          Pagination + Compression + Rate limiting
4. Infra:        Horizontal scale + Load balancer + CDN

ปัญหา: Race condition ใน seat reservation

แนวทางแก้:
1. Atomic SQL UPDATE WHERE availableSeats > 0  (ใช้แล้ว)
2. Database Transaction isolation
3. Redis Distributed Lock (เมื่อ scale เป็น microservices)
4. Queue-based processing (เมื่อต้องการ handle spike traffic)
```
