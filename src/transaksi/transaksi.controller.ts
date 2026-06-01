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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TransaksiService } from './transaksi.service';
import { CreateTransaksiDto } from './dto/create-transaksi.dto';
import { UpdateTransaksiDto } from './dto/update-transaksi.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthRole } from '../auth/auth.types';
import type { AuthUser } from '../auth/auth.types';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Transaksi')
@ApiBearerAuth('access-token')
@Controller('transaksi')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransaksiController {
  constructor(private readonly transaksiService: TransaksiService) {}

  @Post()
  @ApiOperation({
    summary: 'Checkout produk',
    description:
      'Membuat transaksi baru dari daftar produk. Sistem akan mengecek stok, menghitung total, mengurangi stok, membuat order item, dan membuat payment dengan status PENDING.',
  })
  @ApiCreatedResponse({
    description: 'Transaksi berhasil dibuat.',
    schema: {
      example: {
        id: 'clx123orderid',
        userId: 'clx123userid',
        user: {
          id: 'clx123userid',
          name: 'Budi Santoso',
          email: 'budi@example.com',
        },
        total: 15000000,
        status: 'PENDING',
        createdAt: '2026-06-01T03:00:00.000Z',
        payment: {
          id: 'clx123paymentid',
          method: 'TRANSFER',
          status: 'PENDING',
        },
        items: [
          {
            id: 'clx123orderitemid',
            productId: 'clx123productid',
            quantity: 2,
            price: 7500000,
            subtotal: 15000000,
            product: {
              id: 'clx123productid',
              name: 'ASUS VivoBook 14',
              price: 7500000,
              stock: 13,
              imageUrl: 'https://example.com/images/asus-vivobook-14.jpg',
              category: {
                id: 'clx123categoryid',
                name: 'Laptop',
              },
            },
          },
        ],
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Body tidak valid, stok tidak cukup, atau stok berubah saat checkout.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token tidak valid atau tidak dikirim.',
  })
  @ApiNotFoundResponse({
    description: 'Salah satu produk tidak ditemukan.',
  })
  create(
    @CurrentUser() user: AuthUser,
    @Body() createTransaksiDto: CreateTransaksiDto,
  ) {
    return this.transaksiService.create(user.id, createTransaksiDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lihat daftar transaksi',
    description:
      'USER hanya melihat transaksi miliknya sendiri. ADMIN bisa melihat semua transaksi.',
  })
  @ApiOkResponse({
    description: 'Daftar transaksi berhasil diambil.',
    schema: {
      example: [
        {
          id: 'clx123orderid',
          userId: 'clx123userid',
          total: 15000000,
          status: 'PENDING',
          createdAt: '2026-06-01T03:00:00.000Z',
          payment: {
            id: 'clx123paymentid',
            method: 'TRANSFER',
            status: 'PENDING',
          },
          items: [
            {
              id: 'clx123orderitemid',
              productId: 'clx123productid',
              quantity: 2,
              price: 7500000,
              subtotal: 15000000,
            },
          ],
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token tidak valid atau tidak dikirim.',
  })
  findAll(@CurrentUser() user: AuthUser) {
    return this.transaksiService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lihat detail transaksi',
    description:
      'Mengambil detail transaksi berdasarkan ID. USER hanya bisa mengakses transaksi miliknya sendiri.',
  })
  @ApiParam({
    name: 'id',
    example: 'clx123orderid',
    description: 'ID transaksi/order.',
  })
  @ApiOkResponse({
    description: 'Detail transaksi berhasil diambil.',
    schema: {
      example: {
        id: 'clx123orderid',
        userId: 'clx123userid',
        user: {
          id: 'clx123userid',
          name: 'Budi Santoso',
          email: 'budi@example.com',
        },
        total: 15000000,
        status: 'PENDING',
        createdAt: '2026-06-01T03:00:00.000Z',
        payment: {
          id: 'clx123paymentid',
          method: 'TRANSFER',
          status: 'PENDING',
        },
        items: [
          {
            id: 'clx123orderitemid',
            productId: 'clx123productid',
            quantity: 2,
            price: 7500000,
            subtotal: 15000000,
            product: {
              id: 'clx123productid',
              name: 'ASUS VivoBook 14',
              price: 7500000,
              stock: 13,
              imageUrl: 'https://example.com/images/asus-vivobook-14.jpg',
              category: {
                id: 'clx123categoryid',
                name: 'Laptop',
              },
            },
          },
        ],
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token tidak valid atau tidak dikirim.',
  })
  @ApiForbiddenResponse({
    description: 'User mencoba membuka transaksi milik user lain.',
  })
  @ApiNotFoundResponse({
    description: 'Transaksi tidak ditemukan.',
  })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.transaksiService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(AuthRole.ADMIN)
  @ApiOperation({
    summary: 'Update status transaksi',
    description:
      'Mengubah status pesanan, metode pembayaran, atau status pembayaran. Endpoint ini khusus ADMIN. Jika status diubah menjadi CANCELED, stok produk akan dikembalikan.',
  })
  @ApiParam({
    name: 'id',
    example: 'clx123orderid',
    description: 'ID transaksi/order yang akan diupdate.',
  })
  @ApiOkResponse({
    description: 'Transaksi berhasil diupdate.',
    schema: {
      example: {
        id: 'clx123orderid',
        userId: 'clx123userid',
        total: 15000000,
        status: 'PAID',
        payment: {
          id: 'clx123paymentid',
          method: 'TRANSFER',
          status: 'PAID',
        },
        items: [
          {
            id: 'clx123orderitemid',
            productId: 'clx123productid',
            quantity: 2,
            price: 7500000,
            subtotal: 15000000,
          },
        ],
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Body kosong, field tidak valid, atau transaksi batal dicoba diaktifkan lagi.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token tidak valid atau tidak dikirim.',
  })
  @ApiForbiddenResponse({
    description: 'User bukan ADMIN.',
  })
  @ApiNotFoundResponse({
    description: 'Transaksi tidak ditemukan.',
  })
  update(
    @Param('id') id: string,
    @Body() updateTransaksiDto: UpdateTransaksiDto,
  ) {
    return this.transaksiService.update(id, updateTransaksiDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Batalkan transaksi',
    description:
      'Membatalkan transaksi dan mengembalikan stok produk. USER hanya bisa membatalkan transaksi miliknya yang masih PENDING. ADMIN bisa membatalkan transaksi yang masih aktif.',
  })
  @ApiParam({
    name: 'id',
    example: 'clx123orderid',
    description: 'ID transaksi/order yang akan dibatalkan.',
  })
  @ApiOkResponse({
    description: 'Transaksi berhasil dibatalkan.',
    schema: {
      example: {
        id: 'clx123orderid',
        userId: 'clx123userid',
        total: 15000000,
        status: 'CANCELED',
        payment: {
          id: 'clx123paymentid',
          method: 'TRANSFER',
          status: 'FAILED',
        },
        items: [
          {
            id: 'clx123orderitemid',
            productId: 'clx123productid',
            quantity: 2,
            price: 7500000,
            subtotal: 15000000,
          },
        ],
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Transaksi sudah dibatalkan atau user mencoba membatalkan transaksi yang tidak lagi PENDING.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token tidak valid atau tidak dikirim.',
  })
  @ApiForbiddenResponse({
    description: 'User mencoba membatalkan transaksi milik user lain.',
  })
  @ApiNotFoundResponse({
    description: 'Transaksi tidak ditemukan.',
  })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.transaksiService.remove(id, user);
  }
}
