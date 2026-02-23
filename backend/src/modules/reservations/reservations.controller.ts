// backend/src/modules/reservations/reservations.controller.ts
import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/reservation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { User } from '../users/entities/user.entity';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  reserve(@Body() dto: CreateReservationDto, @CurrentUser() user: User) {
    return this.reservationsService.reserve(dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  cancel(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.reservationsService.cancel(id, user);
  }

  @Get('me')
  myReservations(
    @CurrentUser() user: User,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(0), ParseIntPipe) limit: number,
  ) {
    if (page > 0 && limit > 0) {
      return this.reservationsService.findMyReservationsPaginated(
        user.id,
        page,
        limit,
      );
    }
    return this.reservationsService.findMyReservations(user.id);
  }

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  findAll(
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(0), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    if (page > 0 && limit > 0) {
      return this.reservationsService.findAllPaginated(page, limit, search);
    }
    return this.reservationsService.findAll(search);
  }
}
