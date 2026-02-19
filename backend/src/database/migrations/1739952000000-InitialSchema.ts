// backend/src/database/migrations/1739952000000-InitialSchema.ts
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class InitialSchema1739952000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ENUM types for PostgreSQL
    await queryRunner.query(`
      CREATE TYPE role_enum AS ENUM ('admin', 'user');
    `);

    await queryRunner.query(`
      CREATE TYPE reservation_status_enum AS ENUM ('active', 'cancelled');
    `);

    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'password',
            type: 'varchar',
          },
          {
            name: 'role',
            type: 'role_enum',
            default: `'user'`,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create concerts table
    await queryRunner.createTable(
      new Table({
        name: 'concerts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'totalSeats',
            type: 'integer',
          },
          {
            name: 'availableSeats',
            type: 'integer',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create reservations table
    await queryRunner.createTable(
      new Table({
        name: 'reservations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'concertId',
            type: 'uuid',
          },
          {
            name: 'status',
            type: 'reservation_status_enum',
            default: `'active'`,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        uniques: [
          {
            name: 'uq_reservations_user_concert',
            columnNames: ['userId', 'concertId'],
          },
        ],
      }),
      true,
    );

    // Create indexes for reservations table
    await queryRunner.createIndex(
      'reservations',
      new TableIndex({
        name: 'idx_reservations_user_id',
        columnNames: ['userId'],
      }),
    );

    await queryRunner.createIndex(
      'reservations',
      new TableIndex({
        name: 'idx_reservations_concert_id',
        columnNames: ['concertId'],
      }),
    );

    await queryRunner.createIndex(
      'reservations',
      new TableIndex({
        name: 'idx_reservations_status',
        columnNames: ['status'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'reservations',
      new TableForeignKey({
        name: 'fk_reservations_user',
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'reservations',
      new TableForeignKey({
        name: 'fk_reservations_concert',
        columnNames: ['concertId'],
        referencedTableName: 'concerts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Enable uuid-ossp extension if not exists
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    await queryRunner.dropForeignKey('reservations', 'fk_reservations_concert');
    await queryRunner.dropForeignKey('reservations', 'fk_reservations_user');

    // Drop indexes
    await queryRunner.dropIndex('reservations', 'idx_reservations_status');
    await queryRunner.dropIndex('reservations', 'idx_reservations_concert_id');
    await queryRunner.dropIndex('reservations', 'idx_reservations_user_id');

    // Drop tables
    await queryRunner.dropTable('reservations');
    await queryRunner.dropTable('concerts');
    await queryRunner.dropTable('users');

    // Drop ENUM types
    await queryRunner.query(`DROP TYPE IF EXISTS reservation_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS role_enum`);
  }
}
