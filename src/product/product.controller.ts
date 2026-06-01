import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthRole } from '../auth/auth.types';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Buat produk',
    description:
      'Menambahkan produk elektronik baru ke katalog. Category ID harus sudah ada. Endpoint ini khusus ADMIN.',
  })
  @ApiCreatedResponse({
    description: 'Produk berhasil dibuat.',
    schema: {
      example: {
        id: 'clx123productid',
        name: 'ASUS VivoBook 14',
        description: 'Laptop 14 inch dengan RAM 8GB dan SSD 512GB.',
        price: 7500000,
        stock: 15,
        imageUrl: 'https://example.com/images/asus-vivobook-14.jpg',
        categoryId: 'clx123categoryid',
        category: {
          id: 'clx123categoryid',
          name: 'Laptop',
        },
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
  @ApiNotFoundResponse({
    description: 'Kategori tidak ditemukan.',
  })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lihat katalog produk',
    description:
      'Mengambil daftar produk dengan pagination, pencarian nama/deskripsi, dan filter kategori.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    example: 'laptop',
    description: 'Cari berdasarkan nama atau deskripsi produk.',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    example: 'clx123categoryid',
    description: 'Filter produk berdasarkan ID kategori.',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    example: 0,
    description: 'Jumlah data yang dilewati.',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    example: 20,
    description: 'Jumlah data yang diambil.',
  })
  @ApiOkResponse({
    description: 'Daftar produk berhasil diambil.',
    schema: {
      example: {
        data: [
          {
            id: 'clx123productid',
            name: 'ASUS VivoBook 14',
            description: 'Laptop 14 inch dengan RAM 8GB dan SSD 512GB.',
            price: 7500000,
            stock: 15,
            imageUrl: 'https://example.com/images/asus-vivobook-14.jpg',
            categoryId: 'clx123categoryid',
            category: {
              id: 'clx123categoryid',
              name: 'Laptop',
            },
          },
        ],
        meta: {
          total: 1,
          skip: 0,
          take: 20,
        },
      },
    },
  })
  findAll(@Query() query: ProductQueryDto) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lihat detail produk',
    description: 'Mengambil satu produk berdasarkan ID.',
  })
  @ApiParam({
    name: 'id',
    example: 'clx123productid',
    description: 'ID produk.',
  })
  @ApiOkResponse({
    description: 'Detail produk berhasil diambil.',
    schema: {
      example: {
        id: 'clx123productid',
        name: 'ASUS VivoBook 14',
        description: 'Laptop 14 inch dengan RAM 8GB dan SSD 512GB.',
        price: 7500000,
        stock: 15,
        imageUrl: 'https://example.com/images/asus-vivobook-14.jpg',
        categoryId: 'clx123categoryid',
        category: {
          id: 'clx123categoryid',
          name: 'Laptop',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Produk tidak ditemukan.',
  })
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update produk',
    description:
      'Mengubah data produk seperti nama, deskripsi, harga, stok, gambar, atau kategori. Endpoint ini khusus ADMIN.',
  })
  @ApiParam({
    name: 'id',
    example: 'clx123productid',
    description: 'ID produk yang akan diubah.',
  })
  @ApiOkResponse({
    description: 'Produk berhasil diupdate.',
    schema: {
      example: {
        id: 'clx123productid',
        name: 'ASUS VivoBook 14 OLED',
        description: 'Laptop 14 inch OLED dengan RAM 16GB dan SSD 512GB.',
        price: 9500000,
        stock: 10,
        imageUrl: 'https://example.com/images/asus-vivobook-14-oled.jpg',
        categoryId: 'clx123categoryid',
        category: {
          id: 'clx123categoryid',
          name: 'Laptop',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Body kosong atau field tidak valid.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token tidak valid atau tidak dikirim.',
  })
  @ApiForbiddenResponse({
    description: 'User bukan ADMIN.',
  })
  @ApiNotFoundResponse({
    description: 'Produk atau kategori tidak ditemukan.',
  })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Hapus produk',
    description:
      'Menghapus produk dari katalog. Produk yang sudah pernah masuk transaksi tidak bisa dihapus; set stok menjadi 0 jika tidak ingin dijual. Endpoint ini khusus ADMIN.',
  })
  @ApiParam({
    name: 'id',
    example: 'clx123productid',
    description: 'ID produk yang akan dihapus.',
  })
  @ApiOkResponse({
    description: 'Produk berhasil dihapus.',
    schema: {
      example: {
        id: 'clx123productid',
        name: 'ASUS VivoBook 14',
        description: 'Laptop 14 inch dengan RAM 8GB dan SSD 512GB.',
        price: 7500000,
        stock: 15,
        imageUrl: 'https://example.com/images/asus-vivobook-14.jpg',
        categoryId: 'clx123categoryid',
        category: {
          id: 'clx123categoryid',
          name: 'Laptop',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Produk sudah pernah masuk transaksi.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token tidak valid atau tidak dikirim.',
  })
  @ApiForbiddenResponse({
    description: 'User bukan ADMIN.',
  })
  @ApiNotFoundResponse({
    description: 'Produk tidak ditemukan.',
  })
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
