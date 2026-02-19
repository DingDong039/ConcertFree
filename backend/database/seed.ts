// backend/database/seed.ts
// Seed script runner for development/testing environments
// Run with: npx ts-node -r tsconfig-paths/register database/seed.ts

import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

async function runSeed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'concert_db',
  });

  try {
    console.log('🔌 Connecting to database...');
    await dataSource.initialize();

    console.log('📖 Reading seed.sql file...');
    const seedPath = path.join(__dirname, 'seed.sql');
    const sql = fs.readFileSync(seedPath, 'utf8');

    console.log('🌱 Running seed data...');
    await dataSource.query(sql);

    console.log('✅ Seed data inserted successfully!');

    // Display summary
    const userCount = await dataSource.query('SELECT COUNT(*) FROM users');
    const concertCount = await dataSource.query('SELECT COUNT(*) FROM concerts');
    const reservationCount = await dataSource.query('SELECT COUNT(*) FROM reservations');

    console.log('\n📊 Data Summary:');
    console.log(`   Users:        ${userCount[0].count}`);
    console.log(`   Concerts:     ${concertCount[0].count}`);
    console.log(`   Reservations: ${reservationCount[0].count}`);

  } catch (error) {
    console.error('❌ Error running seed:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

runSeed();
