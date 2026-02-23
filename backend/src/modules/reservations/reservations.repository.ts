// backend/src/modules/reservations/reservations.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from './entities/reservation.entity';

@Injectable()
export class ReservationsRepository {
  constructor(
    @InjectRepository(Reservation)
    private readonly repo: Repository<Reservation>,
  ) {}

  create(data: Partial<Reservation>): Reservation {
    return this.repo.create(data);
  }

  async save(reservation: Reservation): Promise<Reservation> {
    return this.repo.save(reservation);
  }

  async findById(id: string): Promise<Reservation | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['concert'],
    });
  }

  async findActiveByUserAndConcert(
    userId: string,
    concertId: string,
  ): Promise<Reservation | null> {
    return this.repo.findOne({
      where: {
        userId,
        concertId,
        status: ReservationStatus.ACTIVE,
      },
    });
  }

  async findByUserAndConcert(
    userId: string,
    concertId: string,
  ): Promise<Reservation | null> {
    return this.repo.findOne({
      where: {
        userId,
        concertId,
      },
    });
  }

  async findAllByUser(userId: string): Promise<Reservation[]> {
    return this.repo.find({
      where: { userId },
      relations: ['concert'],
      order: { createdAt: 'DESC' },
    });
  }

  async findPaginatedByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<[Reservation[], number]> {
    return this.repo.findAndCount({
      where: { userId },
      relations: ['concert'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findAll(search?: string): Promise<Reservation[]> {
    const qb = this.repo
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.user', 'user')
      .leftJoinAndSelect('reservation.concert', 'concert')
      .orderBy('reservation.createdAt', 'DESC');

    if (search) {
      qb.where('user.name ILIKE :search OR user.email ILIKE :search', {
        search: `%${search}%`,
      });
    }

    return qb.getMany();
  }

  async findPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<[Reservation[], number]> {
    const qb = this.repo
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.user', 'user')
      .leftJoinAndSelect('reservation.concert', 'concert')
      .orderBy('reservation.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.where('user.name ILIKE :search OR user.email ILIKE :search', {
        search: `%${search}%`,
      });
    }

    return qb.getManyAndCount();
  }
}
