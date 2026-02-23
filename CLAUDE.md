# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ticket Shop - A concert ticket reservation system with:
- **Backend**: NestJS 11 + TypeORM + PostgreSQL
- **Frontend**: Next.js 16 + React 19 + Feature-Sliced Design (FSD)
- **Auth**: JWT (Passport) with role-based access (ADMIN/USER)

## Development Commands

### Backend (from `/backend`)
```bash
npm install                 # Install dependencies
npm run start:dev           # Development server (port 4000)
npm run build               # Build for production
npm run start:prod          # Production server
npm run test                # Unit tests
npm run test:watch          # Watch mode
npm run test:e2e            # E2E tests
npm run test:cov            # Test coverage
npm run test:debug          # Debug tests
npm run lint                # ESLint
npm run format              # Prettier format
```

### Database (from `/backend`)
```bash
npm run migration:run       # Apply pending migrations
npm run migration:revert    # Undo last migration
npm run migration:show      # Show migration status
npm run migration:generate  # Generate migration from entity changes
npm run db:seed             # Seed development data
npm run db:reset            # Revert + re-run migrations
docker-compose up -d        # Start PostgreSQL on port 5432
docker-compose down         # Stop database
```

### Frontend (from `/frontend`)
```bash
npm install                 # Install dependencies
npm run dev                 # Development server (port 3000)
npm run build               # Build for production
npm run start               # Production server
npm run lint                # ESLint
```

## Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=concert_db
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

## Architecture

### Backend Structure (N-Tier / Clean Architecture)
```
backend/src/
├── app.module.ts           # Root module with TypeORM config
├── main.ts                 # Bootstrap (global prefix: /api/v1)
├── common/
│   ├── decorators/         # @CurrentUser, @Roles
│   ├── enums/              # Role enum (ADMIN, USER)
│   ├── filters/            # GlobalExceptionFilter
│   ├── guards/             # JwtAuthGuard, RolesGuard
│   └── interceptors/       # ResponseInterceptor
└── modules/
    ├── auth/               # JWT auth (register/login)
    ├── users/              # User CRUD + repository pattern
    ├── concerts/           # Concert management (ADMIN creates)
    └── reservations/       # Ticket booking (USER reserves)
```

**Request Flow**: Controller → Service → Repository → TypeORM → PostgreSQL

### Frontend Structure (Feature-Sliced Design)
```
frontend/src/
├── app/                    # Next.js App Router (routing only)
│   ├── page.tsx            # Home page
│   ├── concerts/           # /concerts route
│   ├── auth/               # /auth/login, /auth/register
│   ├── reservations/       # /reservations/me
│   └── admin/              # /admin/concerts, /admin/reservations
├── views/                  # Page-level components
│   ├── home/               # HomePage component
│   ├── concerts/           # ConcertsPage component
│   ├── login/              # LoginPage component
│   ├── register/           # RegisterPage component
│   ├── reservations-me/    # ReservationsMePage component
│   ├── admin-concerts/     # AdminConcertsPage component
│   └── admin-reservations/ # AdminReservationsPage component
├── widgets/                # Composed features (entities + features + shared)
│   ├── navbar/             # Navigation bar
│   ├── concert-card/       # Concert card with reserve button
│   └── concert-form/       # Concert create/edit form
├── features/               # Business logic features
│   ├── auth/               # Login/register (model, api, ui)
│   ├── manage-concert/     # Admin concert CRUD
│   └── reserve-concert/    # User reservation flow
├── entities/               # Business domain models
│   ├── user/               # User type & model
│   ├── concert/            # Concert type, store, api, ui
│   └── reservation/        # Reservation type, store, api, ui
└── shared/                 # Cross-cutting utilities
    ├── api/                # request(), fetcher(), token helpers
    ├── config/             # APP_NAME, API_BASE_URL, ROUTES, STORAGE_KEYS
    ├── lib/                # Utility functions (cn, etc.)
    └── ui/                 # shadcn/ui components (Button, Card, Form, etc.)
```

**FSD Layer Rules**:
- **app**: Only routing, imports from views/shared
- **views**: Page composition, imports from widgets/features/entities/shared
- **widgets**: Composed features, imports from features/entities/shared
- **features**: Use-cases, imports from entities/shared
- **entities**: Business domain, imports only from shared
- **shared**: Lowest layer, no imports from other layers

### Data Model
- **User**: id, email, name, password (excluded), role, reservations[]
- **Concert**: id, name, description, totalSeats, availableSeats, reservations[]
- **Reservation**: id, userId, concertId, status (active/cancelled)

### API Endpoints
| Module | Endpoint | Method | Auth | Role |
|--------|----------|--------|------|------|
| Auth | /auth/register | POST | No | - |
| Auth | /auth/login | POST | No | - |
| Concerts | /concerts | GET | No | - |
| Concerts | /concerts/:id | GET | No | - |
| Concerts | /concerts | POST | Yes | ADMIN |
| Concerts | /concerts/:id | PATCH | Yes | ADMIN |
| Concerts | /concerts/:id | DELETE | Yes | ADMIN |
| Reservations | /reservations | POST | Yes | USER |
| Reservations | /reservations/me | GET | Yes | USER |
| Reservations | /reservations/:id | DELETE | Yes | USER |
| Reservations | /reservations | GET | Yes | ADMIN |

## Key Patterns

### Backend
- **Repository Pattern**: Each module has `*.repository.ts` for database operations
- **Response Interceptor**: All responses wrapped in `{ success: boolean, data: T }`
- **Global ValidationPipe**: DTOs validated with class-validator, whitelist enabled
- **ClassSerializerInterceptor**: Excludes `@Exclude()` fields (e.g., password)
- **Test Files**: Named `*.service.spec.ts`, run single test with `jest -- testName`

### Frontend
- **Zustand Stores**: State in `features/*/model/*.store.ts` and `entities/*/model/*.store.ts`
- **Auth Store**: `useAuthStore()` with `persist` middleware, exports hooks like `useUser()`, `useIsAdmin()`
- **API Layer**: `shared/api/request.ts` provides `request()`, `fetcher()`, `setToken()`, `getToken()`, `removeToken()`
- **Barrel Exports**: Each folder has `index.ts` for public API
- **Path Aliases**: Use `@/shared`, `@/entities`, `@/features`, `@/widgets`, `@/views`
