// backend/src/modules/concerts/concerts.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConcertsRepository } from './concerts.repository';
import { CreateConcertDto, UpdateConcertDto } from './dto/concert.dto';
import { Concert } from './entities/concert.entity';

@Injectable()
export class ConcertsService {
  constructor(private readonly concertsRepository: ConcertsRepository) {}

  async create(dto: CreateConcertDto): Promise<Concert> {
    const concert = this.concertsRepository.create({
      ...dto,
      availableSeats: dto.totalSeats,
    });
    return this.concertsRepository.save(concert);
  }

  async findAll(): Promise<Concert[]> {
    return this.concertsRepository.findAll();
  }

  async findPaginated(
    page: number,
    limit: number,
  ): Promise<{ data: Concert[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.concertsRepository.findPaginated(
      page,
      limit,
    );
    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Concert> {
    const concert = await this.concertsRepository.findById(id);
    if (!concert) throw new NotFoundException(`Concert #${id} not found`);
    return concert;
  }

  async update(id: string, dto: UpdateConcertDto): Promise<Concert> {
    const concert = await this.findOne(id);

    if (dto.totalSeats !== undefined) {
      const reservedSeats = concert.totalSeats - concert.availableSeats;
      if (dto.totalSeats < reservedSeats) {
        throw new BadRequestException(
          `Cannot reduce seats below reserved count (${reservedSeats})`,
        );
      }
      concert.availableSeats = dto.totalSeats - reservedSeats;
    }

    Object.assign(concert, dto);
    return this.concertsRepository.save(concert);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.concertsRepository.delete(id);
  }
}
