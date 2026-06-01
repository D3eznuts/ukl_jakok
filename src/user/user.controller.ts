import { Controller, Get, Body, Patch, Param, Delete } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@Controller('user')
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
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
