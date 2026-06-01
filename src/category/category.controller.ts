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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthRole } from '../auth/auth.types';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Buat kategori produk',
    description:
      'Membuat kategori baru seperti Laptop, Smartphone, Aksesoris, atau Komponen PC. Endpoint ini khusus ADMIN.',
  })
  @ApiCreatedResponse({
    description: 'Kategori berhasil dibuat.',
    schema: {
      example: {
        id: 'clx123categoryid',
        name: 'Laptop',
        productCount: 0,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Body request tidak valid.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token tidak valid atau tidak dikirim.',
  })
  @ApiForbiddenResponse({
    description: 'User bukan ADMIN.',
  })
  @ApiConflictResponse({
    description: 'Nama kategori sudah dipakai.',
  })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lihat semua kategori',
    description:
      'Mengambil semua kategori produk beserta jumlah produk di masing-masing kategori.',
  })
  @ApiOkResponse({
    description: 'Daftar kategori berhasil diambil.',
    schema: {
      example: [
        {
          id: 'clx123categoryid',
          name: 'Laptop',
          productCount: 3,
        },
      ],
    },
  })
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lihat detail kategori',
    description: 'Mengambil detail kategori beserta daftar produk di dalamnya.',
  })
  @ApiParam({
    name: 'id',
    example: 'clx123categoryid',
    description: 'ID kategori.',
  })
  @ApiOkResponse({
    description: 'Detail kategori berhasil diambil.',
    schema: {
      example: {
        id: 'clx123categoryid',
        name: 'Laptop',
        products: [
          {
            id: 'clx123productid',
            name: 'ASUS VivoBook 14',
            description: 'Laptop 14 inch dengan RAM 8GB dan SSD 512GB.',
            price: 7500000,
            stock: 15,
            imageUrl: 'https://example.com/images/asus-vivobook-14.jpg',
          },
        ],
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Kategori tidak ditemukan.',
  })
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update kategori',
    description: 'Mengubah nama kategori. Endpoint ini khusus ADMIN.',
  })
  @ApiParam({
    name: 'id',
    example: 'clx123categoryid',
    description: 'ID kategori yang akan diubah.',
  })
  @ApiOkResponse({
    description: 'Kategori berhasil diupdate.',
    schema: {
      example: {
        id: 'clx123categoryid',
        name: 'Laptop Gaming',
        productCount: 3,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Body kosong atau tidak valid.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token tidak valid atau tidak dikirim.',
  })
  @ApiForbiddenResponse({
    description: 'User bukan ADMIN.',
  })
  @ApiNotFoundResponse({
    description: 'Kategori tidak ditemukan.',
  })
  @ApiConflictResponse({
    description: 'Nama kategori sudah dipakai.',
  })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Hapus kategori',
    description:
      'Menghapus kategori. Kategori tidak bisa dihapus jika masih memiliki produk. Endpoint ini khusus ADMIN.',
  })
  @ApiParam({
    name: 'id',
    example: 'clx123categoryid',
    description: 'ID kategori yang akan dihapus.',
  })
  @ApiOkResponse({
    description: 'Kategori berhasil dihapus.',
    schema: {
      example: {
        id: 'clx123categoryid',
        name: 'Laptop',
        productCount: 0,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Kategori masih memiliki produk.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token tidak valid atau tidak dikirim.',
  })
  @ApiForbiddenResponse({
    description: 'User bukan ADMIN.',
  })
  @ApiNotFoundResponse({
    description: 'Kategori tidak ditemukan.',
  })
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
