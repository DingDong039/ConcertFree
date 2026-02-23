# 🎵 ConcertFree — Concert Reservation System

> Free concert ticket reservation system built with **Next.js 16** + **NestJS 11** + **PostgreSQL**

---

## 📁 Project Structure

```
concert-ticket-reservation-system/
├── backend/               → NestJS 11 REST API
│   └── src/
│       ├── common/        → Guards, Filters, Interceptors, Decorators
│       └── modules/       → Auth, Users, Concerts, Reservations
├── frontend/              → Next.js 16 (App Router)
│   └── src/
│       ├── app/           → Pages (auth, concerts, reservations, admin)
│       ├── lib/           → API client, Auth context
│       └── types/         → TypeScript interfaces
├── docker-compose.yml     → PostgreSQL database
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
│                    BACKEND (NestJS 11)                │
│                                                      │
│  Controller ──▶ Service ──▶ Repository ──▶ TypeORM  │
│       │             │                                │
│  Guards/JWT    Business Logic              PostgreSQL │
│  ValidationPipe  Transactions                        │
│  ExceptionFilter                                     │
└─────────────────────────────────────────────────────┘
```

### N-Tier / Clean Architecture

| Layer          | Responsibility                         | Files                  |
| -------------- | -------------------------------------- | ---------------------- |
| **Controller** | HTTP routing, auth guards, DTO parsing | `*.controller.ts`      |
| **Service**    | Business logic, rules, transactions    | `*.service.ts`         |
| **Repository** | Data access, TypeORM queries           | `*.repository.ts`      |
| **Entity**     | Database schema definition             | `entities/*.entity.ts` |
| **DTO**        | Input validation contracts             | `dto/*.dto.ts`         |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 24+
- Docker (for PostgreSQL)

### 1. Clone & Install

```bash
git clone <repo-url>
cd concert-ticket-reservation-system
```

### 2. Start Database

```bash
docker compose up -d
```

### 3. Backend

```bash
cd backend
npm install
npm run start:dev         # → http://localhost:4000/api/v1
```

**Environment variables** (`.env`):

```env
NODE_ENV=development
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=concert_db
JWT_SECRET=<your-secret-key>
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

### 3.1 Database Setup (Migrations & Seeding)

```bash
cd backend

# Run migrations to create tables
npm run migration:run

# (Optional) Seed mock data for development
npm run db:seed
```

<details>
<summary>📊 Available Migration Commands</summary>

```bash
npm run migration:run      # Apply pending migrations
npm run migration:revert   # Undo last migration
npm run migration:show     # Show migration status
npm run db:seed            # Seed development data
npm run db:seed:sql        # Seed using raw SQL (psql)
npm run db:reset           # Revert + re-run migrations
```

</details>

<details>
<summary>👤 Test Accounts (after seeding)</summary>

| Email                   | Role  | Password      |
| ----------------------- | ----- | ------------- |
| `admin@ticketshop.com`  | admin | `password123` |
| `john.doe@email.com`    | user  | `password123` |
| `jane.smith@email.com`  | user  | `password123` |
| `mike.wilson@email.com` | user  | `password123` |
| ...                     | user  | `password123` |

</details>

### 4. Frontend

```bash
cd frontend
npm install
npm run dev               # → http://localhost:3000
```

**Environment variables** (`.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

---

## 🗄️ Database Migrations & Seeding

### Migration Commands

```bash
cd backend

# Apply pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show

# Generate new migration (after entity changes)
npm run migration:generate -- src/database/migrations/MigrationName

# Create empty migration manually
npm run migration:create -- src/database/migrations/MigrationName
```

### Seeding Development Data

```bash
cd backend

# Run TypeScript seed script (recommended)
npm run db:seed

# Or run SQL directly with psql
npm run db:seed:sql
```

### Seed Data Contents

After running `npm run db:seed`, you'll have:

| Type             | Count | Description                  |
| ---------------- | ----- | ---------------------------- |
| **Users**        | 8     | 1 admin + 7 regular users    |
| **Concerts**     | 15    | International & Thai artists |
| **Reservations** | 15    | 13 active + 2 cancelled      |

**Test Accounts** (all use password: `password123`):

| Email                     | Role  |
| ------------------------- | ----- |
| `admin@ticketshop.com`    | admin |
| `john.doe@email.com`      | user  |
| `jane.smith@email.com`    | user  |
| `mike.wilson@email.com`   | user  |
| `sarah.johnson@email.com` | user  |

### Database Schema

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│    users    │       │   reservations   │       │  concerts   │
├─────────────┤       ├──────────────────┤       ├─────────────┤
│ id (UUID)   │◄──────│ userId (FK)      │───────►│ id (UUID)   │
│ email       │       │ concertId (FK)   │       │ name        │
│ name        │       │ status (enum)    │       │ description │
│ password    │       │ createdAt        │       │ totalSeats  │
│ role (enum) │       │ updatedAt        │       │ available   │
│ createdAt   │       └──────────────────┘       │ createdAt   │
│ updatedAt   │                                  │ updatedAt   │
└─────────────┘                                  └─────────────┘
```

---

## 🏗 System Architecture Considerations (High-Concurrency)

When handling flash sales (e.g., BLACKPINK concerts) where thousands of users access the system simultaneously, the following architectural improvements should be considered:

1. **Database Bottlenecks (Row-level Locking):**
   - **Current Implementation:** `UPDATE concerts SET availableSeats = availableSeats - 1` utilizes row-level locking, which works safely but forces requests to queue up sequentially. Under extreme load, this will cause database timeouts.
   - **Production Solution:** Implement **Redis** (In-Memory Database) to manage ticket inventory via atomic `DECR` operations which process at 100x the speed of relational databases. A Message Broker (e.g., Kafka / RabbitMQ) can then be used to persist the reservations asynchronously back to PostgreSQL.

2. **State Management & Payment Verification (Hold Time):**
   - **Current Implementation:** A reservation immediately gets marked as `ACTIVE` and `availableSeats` is deducted.
   - **Production Solution:** Implement a `PENDING_PAYMENT` state alongside a **15-Minute Expiry Window** (using Redis TTL or a Scheduled Cron Job). If payment is not completed in time, the reservation is marked `CANCELLED` and the seat is returned to the pool automatically.

3. **API Rate Limiting (Bot Protection):**
   - Use an API Gateway or framework-level Throttler (e.g., NestJS `ThrottlerModule`) to limit endpoints (e.g., max 5 booking requests per IP per minute) to prevent bot scripts from exhausting server resources and hoarding seats.

4. **Real-time UX Updates:**
   - **Current Implementation:** Users must reload the page or click a button to see if seats were taken by others.
   - **Production Solution:** Utilize **WebSockets (Socket.io)** or **Server-Sent Events (SSE)** to broadcast inventory changes to connected clients over the UI, creating a dynamic, real-time experience.

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

**Test files (31 tests total):**

| File                           | Tests | Coverage (Lines) |
| ------------------------------ | ----- | ---------------- |
| `concerts.service.spec.ts`     | 10    | 100%             |
| `reservations.service.spec.ts` | 10    | 92%              |
| `auth.service.spec.ts`         | 5     | 100%             |
| `users.service.spec.ts`        | 6     | 100%             |

---

## 📦 Libraries & Packages

### Backend (NestJS)

| Package                | Role                                     |
| ---------------------- | ---------------------------------------- |
| `@nestjs/core`         | NestJS framework core                    |
| `@nestjs/typeorm`      | TypeORM integration for database         |
| `@nestjs/config`       | Environment config via `.env`            |
| `@nestjs/jwt`          | JWT token generation & verification      |
| `@nestjs/passport`     | Auth strategy integration                |
| `passport-jwt`         | JWT extraction from Authorization header |
| `bcryptjs`             | Password hashing (12 salt rounds)        |
| `class-validator`      | DTO field validation decorators          |
| `class-transformer`    | DTO transformation + `@Exclude()`        |
| `@nestjs/mapped-types` | `PartialType` for UpdateDto              |
| `typeorm`              | ORM with migrations and query builder    |
| `pg`                   | PostgreSQL driver                        |

### Frontend (Next.js)

| Package               | Role                                         |
| --------------------- | -------------------------------------------- |
| `next`                | React framework with App Router              |
| `tailwindcss`         | Utility-first CSS framework (v4)             |
| `react` / `react-dom` | UI rendering                                 |
| Custom CSS            | Design tokens, hero gradient, responsive nav |

### Dev / Testing

| Package           | Role                        |
| ----------------- | --------------------------- |
| `@nestjs/testing` | NestJS test module builder  |
| `jest`            | Test runner                 |
| `ts-jest`         | TypeScript Jest transformer |
| `@types/*`        | TypeScript type definitions |

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

| Route                 | Role   | Description                      |
| --------------------- | ------ | -------------------------------- |
| `/`                   | Public | Landing page                     |
| `/auth/login`         | Public | Login form                       |
| `/auth/register`      | Public | Registration form                |
| `/concerts`           | User   | Browse all concerts + reserve    |
| `/reservations/me`    | User   | Own reservation history + cancel |
| `/admin/concerts`     | Admin  | Create / edit / delete concerts  |
| `/admin/reservations` | Admin  | All users reservation history    |

---

## 🔑 Admin Account

After running `npm run db:seed`, use these credentials:

```text
Email:    admin@ticketshop.com
Password: password123
```

To create a new admin manually:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

---

## 📐 Design Decisions

1. **Atomic seat decrement** — Uses `UPDATE WHERE availableSeats > 0` to prevent race conditions without external locks
2. **DB-level unique constraint** — `UNIQUE(userId, concertId)` prevents duplicate reservations at the database level
3. **Repository pattern** — All TypeORM queries isolated in `*.repository.ts`, services never use the ORM directly
4. **`@Exclude()` on password** — ClassSerializerInterceptor ensures the hash is never in any API response
5. **Standard response envelope** — All responses wrapped in `{ success, data, timestamp }` via interceptor
6. **Database indexes** — `@Index()` on `userId`, `concertId`, `status` columns in Reservation entity for query performance
