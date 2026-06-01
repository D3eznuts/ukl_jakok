import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TransaksiService } from './transaksi.service';
import { CreateTransaksiDto } from './dto/create-transaksi.dto';
import { UpdateTransaksiDto } from './dto/update-transaksi.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthRole } from '../auth/auth.types';
import type { AuthUser } from '../auth/auth.types';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('transaksi')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransaksiController {
  constructor(private readonly transaksiService: TransaksiService) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() createTransaksiDto: CreateTransaksiDto,
  ) {
    return this.transaksiService.create(user.id, createTransaksiDto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.transaksiService.findAll(user);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.transaksiService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(AuthRole.ADMIN)
  update(@Param('id') id: string, @Body() updateTransaksiDto: UpdateTransaksiDto) {
    return this.transaksiService.update(id, updateTransaksiDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.transaksiService.remove(id, user);
  }
}
