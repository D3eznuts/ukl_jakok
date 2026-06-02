import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthRole } from '../auth/auth.types';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AuthRole.ADMIN)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({
    summary: 'Lihat semua user',
    description:
      'Mengambil daftar user tanpa menampilkan password. Cocok untuk panel admin sederhana.',
  })
  @ApiOkResponse({
    description: 'Daftar user berhasil diambil.',
    schema: {
      example: [
        {
          id: 'clx123userid',
          email: 'budi@example.com',
          name: 'Budi Santoso',
          role: 'USER',
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token tidak valid atau tidak dikirim.',
  })
  @ApiForbiddenResponse({
    description: 'User bukan ADMIN.',
  })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lihat detail user',
    description: 'Mengambil satu user berdasarkan ID.',
  })
  @ApiParam({
    name: 'id',
    example: 'clx123userid',
    description: 'ID user.',
  })
  @ApiOkResponse({
    description: 'Detail user berhasil diambil.',
    schema: {
      example: {
        id: 'clx123userid',
        email: 'budi@example.com',
        name: 'Budi Santoso',
        role: 'USER',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User tidak ditemukan.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token tidak valid atau tidak dikirim.',
  })
  @ApiForbiddenResponse({
    description: 'User bukan ADMIN.',
  })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update user',
    description:
      'Mengubah data user. Field bersifat opsional, tetapi minimal satu field harus dikirim.',
  })
  @ApiParam({
    name: 'id',
    example: 'clx123userid',
    description: 'ID user yang akan diubah.',
  })
  @ApiOkResponse({
    description: 'User berhasil diupdate.',
    schema: {
      example: {
        id: 'clx123userid',
        email: 'budi.update@example.com',
        name: 'Budi Update',
        role: 'USER',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Body kosong atau field tidak valid.',
  })
  @ApiNotFoundResponse({
    description: 'User tidak ditemukan.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token tidak valid atau tidak dikirim.',
  })
  @ApiForbiddenResponse({
    description: 'User bukan ADMIN.',
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Hapus user',
    description: 'Menghapus user berdasarkan ID.',
  })
  @ApiParam({
    name: 'id',
    example: 'clx123userid',
    description: 'ID user yang akan dihapus.',
  })
  @ApiOkResponse({
    description: 'User berhasil dihapus.',
    schema: {
      example: {
        id: 'clx123userid',
        email: 'budi@example.com',
        name: 'Budi Santoso',
        role: 'USER',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User tidak ditemukan.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token tidak valid atau tidak dikirim.',
  })
  @ApiForbiddenResponse({
    description: 'User bukan ADMIN.',
  })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
