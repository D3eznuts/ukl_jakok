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
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateTransaksiDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateTransaksiItemDto)
  items!: CreateTransaksiItemDto[];

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;
}
