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

  async findAllByUser(userId: string): Promise<Reservation[]> {
    return this.repo.find({
      where: { userId },
      relations: ['concert'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<Reservation[]> {
    return this.repo.find({
      relations: ['user', 'concert'],
      order: { createdAt: 'DESC' },
    });
  }
}
