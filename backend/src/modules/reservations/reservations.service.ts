// backend/src/modules/reservations/reservations.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ReservationsRepository } from './reservations.repository';
import { ConcertsService } from '../concerts/concerts.service';
import { CreateReservationDto } from './dto/reservation.dto';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
    private readonly concertsService: ConcertsService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Reserve a seat.
   * Rules:
   *  1. One active reservation per user per concert
   *  2. Concert must have available seats
   *  3. Seat decrement happens atomically (DB transaction)
   */
  async reserve(dto: CreateReservationDto, user: User): Promise<Reservation> {
    return this.dataSource.transaction(async (manager) => {
      const concert = await this.concertsService.findOne(dto.concertId);

      if (concert.availableSeats <= 0) {
        throw new BadRequestException('No seats available for this concert');
      }

      const existing =
        await this.reservationsRepository.findActiveByUserAndConcert(
          user.id,
          dto.concertId,
        );

      if (existing) {
        throw new ConflictException(
          'You already have an active reservation for this concert',
        );
      }

      // Atomic seat decrement — only succeeds if a seat is truly available
      const result = await manager
        .createQueryBuilder()
        .update('concerts')
        .set({ availableSeats: () => '"availableSeats" - 1' })
        .where('id = :id AND "availableSeats" > 0', { id: dto.concertId })
        .execute();

      if (result.affected === 0) {
        throw new BadRequestException(
          'No seats available (race condition prevented)',
        );
      }

      const reservation = this.reservationsRepository.create({
        userId: user.id,
        concertId: dto.concertId,
        status: ReservationStatus.ACTIVE,
      });

      return manager.save(reservation);
    });
  }

  /**
   * Cancel a reservation.
   * Only the owner can cancel; returns seat atomically.
   */
  async cancel(reservationId: string, user: User): Promise<Reservation> {
    return this.dataSource.transaction(async (manager) => {
      const reservation =
        await this.reservationsRepository.findById(reservationId);

      if (!reservation) throw new NotFoundException('Reservation not found');

      if (reservation.userId !== user.id) {
        throw new ForbiddenException(
          "Cannot cancel another user's reservation",
        );
      }

      if (reservation.status === ReservationStatus.CANCELLED) {
        throw new BadRequestException('Reservation is already cancelled');
      }

      // Return the seat atomically
      await manager
        .createQueryBuilder()
        .update('concerts')
        .set({ availableSeats: () => '"availableSeats" + 1' })
        .where('id = :id', { id: reservation.concertId })
        .execute();

      reservation.status = ReservationStatus.CANCELLED;
      return manager.save(reservation);
    });
  }

  async findMyReservations(userId: string): Promise<Reservation[]> {
    return this.reservationsRepository.findAllByUser(userId);
  }

  async findAll(): Promise<Reservation[]> {
    return this.reservationsRepository.findAll();
  }
}
