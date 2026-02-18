# Task 1 — Basic Setup and Landing Page

## Overview

ตั้งค่า Monorepo แบ่งเป็น `frontend/` (Next.js 16) และ `backend/` (NestJS 10)

---

## Project Structure

```
concert-app/
├── frontend/                  ← Next.js 16 (App Router)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx     ← Root layout + AuthProvider
│   │   │   ├── page.tsx       ← Landing page (/)
│   │   │   └── globals.css
│   │   ├── lib/
│   │   │   ├── api.ts         ← Centralized API client
│   │   │   └── auth-context.tsx
│   │   └── types/index.ts
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                   ← NestJS 10
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── concerts/
│   │   │   └── reservations/
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   ├── guards/
│   │   │   ├── filters/
│   │   │   ├── enums/
│   │   │   └── interceptors/
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── package.json
│
└── docker-compose.yml
```

---

## Setup Commands

### Backend (NestJS)

```bash
# 1. สร้าง NestJS project
npx @nestjs/cli new backend --package-manager npm

# 2. ติดตั้ง dependencies
cd backend
npm install @nestjs/config @nestjs/jwt @nestjs/passport @nestjs/typeorm
npm install passport passport-jwt bcryptjs typeorm pg
npm install class-validator class-transformer @nestjs/mapped-types
npm install -D @types/passport-jwt @types/bcryptjs

# 3. Generate resources
nest generate resource modules/users
nest generate resource modules/concerts
nest generate resource modules/reservations
nest generate module modules/auth
nest generate service modules/auth
nest generate controller modules/auth
```

### Frontend (Next.js)

```bash
# 1. สร้าง Next.js project
npx create-next-app@latest frontend \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir

cd frontend
```

---

## Backend — main.ts

```typescript
// backend/src/main.ts
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global DTO validation + transform
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,             // strip unknown fields
      forbidNonWhitelisted: true,  // throw if unknown fields sent
      transform: true,             // auto-cast types
    }),
  );

  // Auto-exclude @Exclude() fields (e.g. password)
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  await app.listen(process.env.PORT || 4000);
  console.log(`🚀 Backend: http://localhost:4000/api/v1`);
}

bootstrap();
```

---

## Backend — app.module.ts

```typescript
// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ConcertsModule } from './modules/concerts/concerts.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USER', 'postgres'),
        password: config.get('DB_PASS', 'postgres'),
        database: config.get('DB_NAME', 'concert_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: config.get('NODE_ENV') !== 'production',
      }),
    }),

    AuthModule,
    UsersModule,
    ConcertsModule,
    ReservationsModule,
  ],
  providers: [
    { provide: APP_FILTER,      useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
```

---

## Frontend — Root Layout

```tsx
// frontend/src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ConcertFree — Free Tickets for Everyone',
  description: 'Browse and reserve free concert tickets',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

---

## Frontend — Landing Page

```tsx
// frontend/src/app/page.tsx
import Link from 'next/link';
import Navbar from './(components)/layout/Navbar';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="hero-gradient text-white py-24 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <p className="text-violet-200 font-semibold uppercase tracking-widest text-sm mb-4">
              100% Free Events
            </p>
            <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6">
              Live Music for <br />
              <span className="text-yellow-300">Everyone</span>
            </h1>
            <p className="text-violet-100 text-lg sm:text-xl mb-10 max-w-xl mx-auto">
              Browse upcoming free concerts and reserve your seat —
              no credit card needed, ever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/concerts"
                className="bg-white text-violet-700 font-bold px-8 py-3.5 rounded-xl
                           hover:bg-violet-50 transition-colors duration-200"
              >
                Browse Concerts
              </Link>
              <Link
                href="/auth/register"
                className="bg-violet-600 text-white font-bold px-8 py-3.5 rounded-xl
                           border border-violet-400 hover:bg-violet-500 transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why ConcertFree?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '🎟️', title: 'Free Tickets',
                desc: 'All events listed are 100% free. No hidden fees.' },
              { icon: '⚡', title: 'Instant Reservation',
                desc: 'Reserve your seat in one click. Cancellation is just as easy.' },
              { icon: '📱', title: 'Works Everywhere',
                desc: 'Optimized for mobile, tablet, and desktop.' },
            ].map((f) => (
              <div key={f.title} className="card text-center">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="text-center py-6 text-sm text-gray-400 border-t border-gray-100">
        © {new Date().getFullYear()} ConcertFree — Built with Next.js & NestJS
      </footer>
    </>
  );
}
```

---

## Environment Variables

### backend/.env
```env
NODE_ENV=development
PORT=4000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=concert_db

JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:3000
```

### frontend/.env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

---

## docker-compose.yml (Local Dev)

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: concert_db
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s
      retries: 5

  backend:
    build: ./backend
    env_file: ./backend/.env
    ports:
      - '4000:4000'
    depends_on:
      postgres:
        condition: service_healthy

  frontend:
    build: ./frontend
    env_file: ./frontend/.env.local
    ports:
      - '3000:3000'
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

## Quick Start (No Docker)

```bash
# Terminal 1 — Database
docker run -d \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=concert_db \
  -p 5432:5432 \
  postgres:16-alpine

# Terminal 2 — Backend
cd backend
cp .env.example .env
npm install
npm run start:dev   # http://localhost:4000/api/v1

# Terminal 3 — Frontend
cd frontend
cp .env.local.example .env.local
npm install
npm run dev         # http://localhost:3000
```
