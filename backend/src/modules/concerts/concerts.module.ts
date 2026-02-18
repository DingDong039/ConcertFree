// backend/src/modules/concerts/concerts.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Concert } from './entities/concert.entity';
import { ConcertsService } from './concerts.service';
import { ConcertsController } from './concerts.controller';
import { ConcertsRepository } from './concerts.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Concert])],
  controllers: [ConcertsController],
  providers: [ConcertsService, ConcertsRepository],
  exports: [ConcertsService],
})
export class ConcertsModule {}
