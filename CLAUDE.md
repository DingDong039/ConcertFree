# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ticket Shop - A concert ticket reservation system with:
- **Backend**: NestJS 11 + TypeORM + PostgreSQL
- **Frontend**: Next.js 16 + React 19 + Tailwind CSS 4
- **Auth**: JWT (Passport) with role-based access (ADMIN/USER)

## Development Commands

### Backend (from `/backend`)
```bash
npm install                 # Install dependencies
npm run start:dev           # Development server (port 4000)
npm run build               # Build for production
npm run start:prod          # Production server
npm run test                # Unit tests
npm run test:e2e            # E2E tests
npm run test:cov            # Test coverage
npm run lint                # ESLint
npm run format              # Prettier format
```

### Frontend (from `/frontend`)
```bash
npm install                 # Install dependencies
npm run dev                 # Development server (port 3000)
npm run build               # Build for production
npm run start               # Production server
npm run lint                # ESLint
```

### Database
```bash
docker-compose up -d        # Start PostgreSQL on port 5432
docker-compose down         # Stop database
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

### Backend Structure
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

### Frontend Structure
```
frontend/src/
├── app/                    # Next.js App Router
│   ├── (components)/       # Shared components (Navbar)
│   ├── auth/               # Login/Register pages
│   ├── admin/              # Admin-only pages (concerts, reservations)
│   ├── concerts/           # Public concert listing
│   └── reservations/       # User reservations
├── lib/
│   ├── api.ts              # Fetch wrapper with auth header
│   └── auth-context.tsx    # Auth state + login/logout
└── types/index.ts          # TypeScript interfaces
```

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
| Concerts | /concerts | POST | Yes | ADMIN |
| Concerts | /concerts/:id | PATCH | Yes | ADMIN |
| Concerts | /concerts/:id | DELETE | Yes | ADMIN |
| Reservations | /reservations | POST | Yes | USER |
| Reservations | /reservations/me | GET | Yes | USER |
| Reservations | /reservations/:id | DELETE | Yes | USER |
| Reservations | /reservations | GET | Yes | ADMIN |

## Key Patterns

- **Repository Pattern**: Each module has a dedicated repository class for database operations
- **Response Interceptor**: All responses wrapped in `{ success: boolean, data: T }`
- **Global ValidationPipe**: DTOs validated with class-validator, whitelist enabled
- **ClassSerializerInterceptor**: Excludes `@Exclude()` fields (e.g., password)
