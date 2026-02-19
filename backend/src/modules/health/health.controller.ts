// backend/src/modules/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  HealthCheck,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Database connection check
      () => this.db.pingCheck('database'),
      // Memory check - heap size should not exceed 150MB
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      // Memory check - RSS should not exceed 150MB
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
      // Disk check - storage path should have at least 1GB free
      () => this.disk.checkStorage('disk', { thresholdPercent: 0.9, path: '/' }),
    ]);
  }

  @Get('liveness')
  @HealthCheck()
  liveness() {
    // Lightweight check for Kubernetes liveness probe
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    ]);
  }

  @Get('readiness')
  @HealthCheck()
  readiness() {
    // Full check for Kubernetes readiness probe
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }
}
