import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({
    example: 'Budi Santoso',
    description: 'Nama lengkap user yang akan didaftarkan.',
    minLength: 2,
  })
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'budi@example.com',
    description:
      'Email unik untuk login. Email tidak boleh sama dengan user lain.',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'password123',
    description:
      'Password minimal 6 karakter. Password akan disimpan dalam bentuk hash.',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password!: string;
}
