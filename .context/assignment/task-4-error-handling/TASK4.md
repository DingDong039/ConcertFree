# Task 4 — Server Side Error Handling

## Strategy

```
Backend:                          Frontend:
─────────────────────────────     ─────────────────────────────
ValidationPipe (DTO)         →    API client throws Error
GlobalExceptionFilter        →    try/catch in components
Typed HTTP Exceptions        →    Inline error state display
Standard error envelope      →    Toast / Alert UI
```

---

## Backend — GlobalExceptionFilter

Catches **all** exceptions globally, formats them into a consistent JSON envelope.

```typescript
// backend/src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter, Catch, ArgumentsHost,
  HttpException, HttpStatus, Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()   // catches everything — HttpException AND unexpected errors
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request  = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()   // preserves class-validator field errors
        : 'Internal server error';

    this.logger.error(
      `${request.method} ${request.url} → ${status}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json({
      statusCode: status,
      timestamp:  new Date().toISOString(),
      path:       request.url,
      message,              // can be string OR object (array of validation errors)
    });
  }
}
```

### Registration in AppModule

```typescript
// backend/src/app.module.ts
providers: [
  { provide: APP_FILTER,      useClass: GlobalExceptionFilter },
  { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
],
```

---

## Backend — ValidationPipe (DTO Validation)

Registered globally in `main.ts` — validates every incoming request body.

```typescript
// backend/src/main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist:            true,   // strip unknown fields silently
    forbidNonWhitelisted: true,   // 400 if unknown fields are sent
    transform:            true,   // auto-cast (e.g. "100" → 100)
  }),
);
```

### Example: Missing fields → 400 response

**Request:**
```http
POST /api/v1/concerts
Content-Type: application/json

{ "name": "Rock Night" }
```

**Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "timestamp": "2024-01-15T10:00:00.000Z",
  "path": "/api/v1/concerts",
  "message": {
    "statusCode": 400,
    "message": [
      "description must be longer than or equal to 10 characters",
      "description must be a string",
      "totalSeats must not be less than 1",
      "totalSeats must be an integer number"
    ],
    "error": "Bad Request"
  }
}
```

---

## Backend — Typed HTTP Exceptions in Services

Each service method throws the **most semantically correct** exception:

```typescript
// ─── concerts.service.ts ──────────────────────────────────────
async findOne(id: string): Promise<Concert> {
  const concert = await this.concertsRepository.findById(id);
  if (!concert) throw new NotFoundException(`Concert #${id} not found`);
  //                        ^^^^^^^^^^^^^^^^^ 404
  return concert;
}

async update(id: string, dto: UpdateConcertDto): Promise<Concert> {
  const concert = await this.findOne(id);
  if (dto.totalSeats !== undefined) {
    const reserved = concert.totalSeats - concert.availableSeats;
    if (dto.totalSeats < reserved) {
      throw new BadRequestException(
        `Cannot reduce seats below reserved count (${reserved})`,
      );                // ^^^^^^^^^^^^^^^^^ 400
    }
  }
  ...
}

// ─── reservations.service.ts ─────────────────────────────────
async reserve(dto, user): Promise<Reservation> {
  const concert = await this.concertsService.findOne(dto.concertId);

  if (concert.availableSeats <= 0)
    throw new BadRequestException('No seats available');     // 400

  const existing = await this.repo.findActiveByUserAndConcert(user.id, dto.concertId);
  if (existing)
    throw new ConflictException('Already reserved');         // 409
  ...
}

async cancel(id, user): Promise<Reservation> {
  const r = await this.repo.findById(id);
  if (!r)
    throw new NotFoundException('Reservation not found');    // 404

  if (r.userId !== user.id)
    throw new ForbiddenException('Cannot cancel others');    // 403

  if (r.status === ReservationStatus.CANCELLED)
    throw new BadRequestException('Already cancelled');      // 400
  ...
}

// ─── users.service.ts ────────────────────────────────────────
async create(dto): Promise<User> {
  const existing = await this.repo.findByEmail(dto.email);
  if (existing)
    throw new ConflictException('Email already in use');     // 409
  ...
}

// ─── auth.service.ts ─────────────────────────────────────────
async login(dto): Promise<...> {
  const user = await this.usersService.findByEmail(dto.email);
  if (!user) throw new UnauthorizedException('Invalid credentials'); // 401

  const isMatch = await bcrypt.compare(dto.password, user.password);
  if (!isMatch) throw new UnauthorizedException('Invalid credentials'); // 401
  ...
}
```

---

## HTTP Status Code Reference Used

| Code | Exception Class | When |
|---|---|---|
| 400 | `BadRequestException` | Invalid data, no seats, already cancelled |
| 401 | `UnauthorizedException` | Wrong credentials, invalid JWT |
| 403 | `ForbiddenException` | Correct credentials but wrong role |
| 404 | `NotFoundException` | Resource not found |
| 409 | `ConflictException` | Duplicate reservation, email taken |
| 500 | (caught by filter) | Unexpected server errors |

---

## Frontend — API Client Error Propagation

```typescript
// frontend/src/lib/api.ts
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    // Parse error body from backend
    const error = await res.json().catch(() => ({ message: res.statusText }));

    // Flatten validation array or use string message
    const msg = Array.isArray(error.message?.message)
      ? error.message.message.join(', ')
      : error.message || 'Request failed';

    throw new Error(msg);   // propagates to components via try/catch
  }
  ...
}
```

---

## Frontend — Error Display in Components

### Pattern: local error state + try/catch

```tsx
// Concerts Page — reserve with error feedback
const [error, setError] = useState('');

const handleReserve = async (concertId: string) => {
  setError('');
  setLoadingId(concertId);
  try {
    await reservationsApi.reserve(concertId);
    // optimistic UI update
  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : 'Reservation failed');
  } finally {
    setLoadingId(null);
  }
};

// Error is displayed inline above the list:
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700
                  text-sm rounded-xl px-4 py-3 mb-6" role="alert">
    {error}
  </div>
)}
```

### Pattern: Auth form error

```tsx
// Login Page
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);
  try {
    await login(email, password);
  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : 'Login failed');
  } finally {
    setIsLoading(false);
  }
};

// Inside the form — error is shown above fields:
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700
                  text-sm rounded-xl px-4 py-3" role="alert">
    {error}
  </div>
)}
```

---

## Full Error Flow Diagram

```
User Action (e.g. click Reserve)
    │
    ▼
reservationsApi.reserve(concertId)    ← frontend/src/lib/api.ts
    │
    ▼
POST /api/v1/reservations             ← HTTP request
    │
    ▼
JwtAuthGuard                          ← 401 if no token
    │
    ▼
ValidationPipe                        ← 400 if DTO invalid
    │
    ▼
ReservationsService.reserve()
    ├── Concert not found?            → NotFoundException  (404)
    ├── No seats?                     → BadRequestException (400)
    ├── Already reserved?             → ConflictException  (409)
    └── DB error?                     → caught by filter   (500)
    │
    ▼
GlobalExceptionFilter                 ← formats all errors
    │
    ▼
{ statusCode, message, path, timestamp }
    │
    ▼
api.ts throws new Error(message)
    │
    ▼
catch (err) in component
    │
    ▼
setError(err.message)
    │
    ▼
<div role="alert">{error}</div>       ← shown to user
```

---

## Response Interceptor (Success Wrapper)

```typescript
// backend/src/common/interceptors/response.interceptor.ts
import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success:   boolean;
  data:      T;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success:   true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```
