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

      const existing = await this.reservationsRepository.findByUserAndConcert(
        user.id,
        dto.concertId,
      );

      if (existing) {
        if (existing.status === ReservationStatus.ACTIVE) {
          throw new ConflictException(
            'You already have an active reservation for this concert',
          );
        }

        if (existing.status === ReservationStatus.CANCELLED) {
          const cooldownDurationMs = 10 * 60 * 1000;
          const timeSinceCancelMs = Date.now() - existing.updatedAt.getTime();

          if (timeSinceCancelMs < cooldownDurationMs) {
            const timeRemaining = Math.ceil(
              (cooldownDurationMs - timeSinceCancelMs) / 60000,
            );
            throw new BadRequestException(
              `Please wait ${timeRemaining} minute(s) before re-booking this concert`,
            );
          }
        }
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

      if (existing) {
        // If the reservation was previously cancelled, reactivate it
        existing.status = ReservationStatus.ACTIVE;
        return manager.save(existing);
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

  async findMyReservationsPaginated(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{
    data: Reservation[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [data, total] = await this.reservationsRepository.findPaginatedByUser(
      userId,
      page,
      limit,
    );
    return { data, total, page, limit };
  }

  async findAll(search?: string): Promise<Reservation[]> {
    return this.reservationsRepository.findAll(search);
  }

  async findAllPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{
    data: Reservation[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [data, total] = await this.reservationsRepository.findPaginated(
      page,
      limit,
      search,
    );
    return { data, total, page, limit };
  }
}
