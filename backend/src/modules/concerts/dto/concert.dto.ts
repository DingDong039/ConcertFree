// backend/src/modules/concerts/dto/concert.dto.ts
import {
  IsString,
  IsInt,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateConcertDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  name: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsInt()
  @Min(1)
  @Max(100000)
  totalSeats: number;
}

export class UpdateConcertDto extends PartialType(CreateConcertDto) {}
