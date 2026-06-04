import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: 'ASUS VivoBook 14',
    description: 'Nama produk elektronik.',
    minLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name!: string;

  @ApiProperty({
    example: 'Laptop 14 inch dengan RAM 8GB dan SSD 512GB.',
    description: 'Deskripsi singkat produk.',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    example: 7500000,
    description:
      'Harga produk dalam rupiah. Maksimal 2 angka di belakang koma.',
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @ApiProperty({
    example: 15,
    description: 'Jumlah stok produk yang tersedia.',
    minimum: 0,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock!: number;

  @ApiProperty({
    example: 'https://example.com/images/asus-vivobook-14.jpg',
    description: 'URL gambar produk.',
  })
  @IsString()
  @IsNotEmpty()
  imageUrl!: string;

  @ApiProperty({
    example: 'Laptop',
    description:
      'Nama kategori tempat produk ini masuk. Sistem akan menghubungkan atau membuat kategori otomatis.',
    minLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  categoryName!: string;
}
