// backend/src/modules/concerts/concerts.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Concert } from './entities/concert.entity';

@Injectable()
export class ConcertsRepository {
  constructor(
    @InjectRepository(Concert)
    private readonly repo: Repository<Concert>,
  ) {}

  create(data: Partial<Concert>): Concert {
    return this.repo.create(data);
  }

  async save(concert: Concert): Promise<Concert> {
    return this.repo.save(concert);
  }

  async findAll(): Promise<Concert[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<[Concert[], number]> {
    return this.repo.findAndCount({
      where: search
        ? [
            { name: ILike(`%${search}%`) },
            { description: ILike(`%${search}%`) },
          ]
        : {},
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findById(id: string): Promise<Concert | null> {
    return this.repo.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
