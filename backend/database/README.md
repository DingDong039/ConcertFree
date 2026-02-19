# Database Migrations & Seeding

This directory contains database migration and seed files for the Ticket Shop application.

## Directory Structure

```
database/
├── seed.sql     # SQL seed data for development/testing
└── seed.ts      # TypeScript seed runner script
```

## Available Commands

### Migration Commands

```bash
# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show

# Generate migration from entity changes
npm run migration:generate -- src/database/migrations/MigrationName

# Create empty migration
npm run migration:create -- src/database/migrations/MigrationName
```

### Seeding Commands

```bash
# Run seed using psql directly
npm run db:seed

# Or using the TypeScript runner
cd backend
npx ts-node -r tsconfig-paths/register database/seed.ts
```

### Development Workflow

```bash
# Fresh start - reset and reseed database
npm run db:reset && npm run db:seed

# Or manually:
npm run migration:revert  # Undo last migration
npm run migration:run     # Apply migrations
npm run db:seed           # Insert seed data
```

## Seed Data Contents

The seed data includes:

### Users (8 accounts)
| Email | Name | Role | Password |
|-------|------|------|----------|
| admin@ticketshop.com | System Administrator | admin | password123 |
| john.doe@email.com | John Doe | user | password123 |
| jane.smith@email.com | Jane Smith | user | password123 |
| mike.wilson@email.com | Mike Wilson | user | password123 |
| sarah.johnson@email.com | Sarah Johnson | user | password123 |
| david.brown@email.com | David Brown | user | password123 |
| emma.davis@email.com | Emma Davis | user | password123 |
| alex.martinez@email.com | Alex Martinez | user | password123 |

### Concerts (15 events)
- International artists (Taylor Swift, Coldplay, BTS, BLACKPINK, Metallica, Foo Fighters)
- Classical music (Vienna Philharmonic, Beethoven Symphony)
- Jazz (Jazz at Lincoln Center Orchestra)
- Electronic (Tomorrowland, Deadmau5)
- Thai artists (Bodyslam, Carabao)
- Special events (Indie Music Festival, NYE Countdown Party)

### Reservations (15 records)
- 13 active reservations
- 2 cancelled reservations (for testing)

## PostgreSQL 16 Compatibility

This seed file is compatible with PostgreSQL 16 and uses:
- `uuid-ossp` extension for UUID generation
- Native ENUM types for role and status fields
- Standard timestamp columns

## Environment Variables

Ensure these are set in your `.env` file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=concert_db
```
