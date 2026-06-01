import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({
    example: 'budi@example.com',
    description: 'Email user yang sudah terdaftar.',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password akun user.',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password!: string;
}
