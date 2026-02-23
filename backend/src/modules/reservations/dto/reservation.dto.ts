import { Matches } from 'class-validator';

export class CreateReservationDto {
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, {
    message: 'concertId must be a UUID',
  })
  concertId: string;
}
