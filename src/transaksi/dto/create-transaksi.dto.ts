import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from 'generated/prisma/enums';

export class CreateTransaksiItemDto {
  @ApiProperty({
    example: 'clx123productid',
    description: 'ID produk yang ingin dibeli.',
  })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({
    example: 2,
    description: 'Jumlah produk yang dibeli. Minimal 1.',
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateTransaksiDto {
  @ApiProperty({
    type: () => [CreateTransaksiItemDto],
    description:
      'Daftar produk yang dibeli. Jika productId sama dikirim lebih dari sekali, sistem akan menggabungkan quantity.',
    example: [
      {
        productId: 'clx123productid',
        quantity: 2,
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateTransaksiItemDto)
  items!: CreateTransaksiItemDto[];

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.TRANSFER,
    description: 'Metode pembayaran untuk transaksi.',
  })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;
}
