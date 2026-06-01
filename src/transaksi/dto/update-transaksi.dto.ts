import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus, PaymentMethod, PaymentStatus } from 'generated/prisma/enums';

export class UpdateTransaksiDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;
}
