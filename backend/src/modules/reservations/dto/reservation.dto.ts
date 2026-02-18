// backend/src/modules/reservations/dto/reservation.dto.ts
import { IsUUID } from 'class-validator';

export class CreateReservationDto {
  @IsUUID()
  concertId: string;
}
