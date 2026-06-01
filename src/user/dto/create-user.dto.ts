import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export class CreateUserDto {
  @ApiProperty({
    example: 'Admin Toko',
    description: 'Nama user.',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'admin@example.com',
    description: 'Email unik user.',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password minimal 6 karakter.',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({
    enum: UserRole,
    example: UserRole.USER,
    description: 'Role user. USER untuk pembeli, ADMIN untuk pengelola toko.',
  })
  @IsEnum(UserRole)
  role?: UserRole;
}
