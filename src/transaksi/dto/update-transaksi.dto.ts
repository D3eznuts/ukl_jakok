import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from 'generated/prisma/enums';

export class UpdateTransaksiDto {
  @ApiPropertyOptional({
    enum: OrderStatus,
    example: OrderStatus.PAID,
    description:
      'Status pesanan. Umumnya admin mengubah PENDING menjadi PAID, SHIPPED, COMPLETED, atau CANCELED.',
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    enum: PaymentMethod,
    example: PaymentMethod.E_WALLET,
    description: 'Ubah metode pembayaran transaksi.',
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    enum: PaymentStatus,
    example: PaymentStatus.PAID,
    description: 'Status pembayaran. PAID berarti pembayaran berhasil.',
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;
}
