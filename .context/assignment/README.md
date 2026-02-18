# 🎵 ConcertFree — Full-Stack Assignment

> Free concert ticket reservation system built with **Next.js 16** + **NestJS 11** + **PostgreSQL**

---

## 📁 Assignment Structure

```
concert-app/
├── task-1-setup/          → TASK1.md   — Project setup & configuration
├── task-2-responsive/     → TASK2.md   — Responsive design (CSS + Tailwind)
├── task-3-crud/           → TASK3.md   — CRUD API + Frontend pages
├── task-4-error-handling/ → TASK4.md   — Error handling (BE + FE)
├── task-5-unit-tests/     → TASK5.md   — Unit tests (NestJS + Jest)
├── bonus/                 → BONUS.md   — Performance & concurrency
└── README.md              ← this file
```

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 16)             │
│  App Router │ AuthProvider │ API Client │ Tailwind   │
└──────────────────────┬──────────────────────────────┘
                       │ REST (JSON)
┌──────────────────────▼──────────────────────────────┐
│                    BACKEND (NestJS 10)               │
│                                                      │
│  Controller ──▶ Service ──▶ Repository ──▶ TypeORM  │
│       │             │                                │
│  Guards/JWT    Business Logic              PostgreSQL │
│  ValidationPipe  Transactions                        │
│  ExceptionFilter                                     │
└─────────────────────────────────────────────────────┘
```

### N-Tier / Clean Architecture

| Layer | Responsibility | Files |
|---|---|---|
| **Controller** | HTTP routing, auth guards, DTO parsing | `*.controller.ts` |
| **Service** | Business logic, rules, transactions | `*.service.ts` |
| **Repository** | Data access, TypeORM queries | `*.repository.ts` |
| **Entity** | Database schema definition | `entities/*.entity.ts` |
| **DTO** | Input validation contracts | `dto/*.dto.ts` |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 24
- PostgreSQL 18  (or Docker)

### 1. Clone & setup

```bash
git clone <repo-url>
cd concert-app
```

### 2. Start Database

```bash
docker run -d \
  --name concert_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=concert_db \
  -p 5432:5432 \
  postgres:16-alpine
```

### 3. Backend

```bash
cd backend
cp .env.example .env      # edit if needed
npm install
npm run start:dev         # → http://localhost:4000/api/v1
```

### 4. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev               # → http://localhost:3000
```

---

## 🧪 Running Unit Tests

```bash
cd backend

# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov
```

**Test files:**
- `concerts.service.spec.ts`
- `reservations.service.spec.ts`
- `auth.service.spec.ts`
- `users.service.spec.ts`

---

## 📦 Libraries & Packages

### Backend (NestJS)

| Package | Role |
|---|---|
| `@nestjs/core` | NestJS framework core |
| `@nestjs/typeorm` | TypeORM integration for database |
| `@nestjs/config` | Environment config via `.env` |
| `@nestjs/jwt` | JWT token generation & verification |
| `@nestjs/passport` | Auth strategy integration |
| `passport-jwt` | JWT extraction from Authorization header |
| `bcryptjs` | Password hashing (12 salt rounds) |
| `class-validator` | DTO field validation decorators |
| `class-transformer` | DTO transformation + `@Exclude()` |
| `@nestjs/mapped-types` | `PartialType` for UpdateDto |
| `typeorm` | ORM with migrations and query builder |
| `pg` | PostgreSQL driver |

### Frontend (Next.js)

| Package | Role |
|---|---|
| `next` | React framework with App Router |
| `tailwindcss` | Utility-first CSS framework |
| `react` / `react-dom` | UI rendering |
| Custom CSS | Design tokens, hero gradient, responsive nav |

### Dev / Testing

| Package | Role |
|---|---|
| `@nestjs/testing` | NestJS test module builder |
| `jest` | Test runner |
| `ts-jest` | TypeScript Jest transformer |
| `@types/*` | TypeScript type definitions |

---

## 🔐 API Endpoints

```
POST   /api/v1/auth/register          Register user
POST   /api/v1/auth/login             Login

GET    /api/v1/concerts               View all concerts (public)
GET    /api/v1/concerts/:id           View one concert (public)
POST   /api/v1/concerts               Create concert (Admin)
PATCH  /api/v1/concerts/:id           Update concert (Admin)
DELETE /api/v1/concerts/:id           Delete concert (Admin)

POST   /api/v1/reservations           Reserve seat (User)
DELETE /api/v1/reservations/:id       Cancel reservation (User)
GET    /api/v1/reservations/me        Own history (User)
GET    /api/v1/reservations           All reservations (Admin)
```

---

## 🌐 Pages

| Route | Role | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/auth/login` | Public | Login form |
| `/auth/register` | Public | Registration form |
| `/concerts` | User | Browse all concerts + reserve |
| `/reservations/me` | User | Own reservation history + cancel |
| `/admin/concerts` | Admin | Create / delete concerts |
| `/admin/reservations` | Admin | All users reservation history |

---

## 🔑 Default Admin Account

To create an admin, register normally then update the role in DB:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

Or seed script:
```typescript
// You can add a seed in backend/src/database/seed.ts
```

---

## 📐 Design Decisions

1. **Atomic seat decrement** — Uses `UPDATE WHERE availableSeats > 0` to prevent race conditions without external locks
2. **DB-level unique constraint** — `UNIQUE(userId, concertId)` prevents duplicate reservations at the database level
3. **Repository pattern** — All TypeORM queries isolated in `*.repository.ts`, services never use the ORM directly
4. **`@Exclude()` on password** — ClassSerializerInterceptor ensures the hash is never in any API response
5. **Standard response envelope** — All responses wrapped in `{ success, data, timestamp }` via interceptor
