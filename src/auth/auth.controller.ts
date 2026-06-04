import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthRole } from './auth.types';
import type { AuthUser } from './auth.types';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register user baru',
    description:
      'Membuat akun pembeli baru dengan role USER. Login melalui endpoint /auth/login untuk mendapatkan accessToken.',
  })
  @ApiCreatedResponse({
    description: 'Register berhasil.',
    schema: {
      example: {
        id: 'clx123userid',
        email: 'budi@example.com',
        name: 'Budi Santoso',
        role: 'USER',
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Body request tidak valid, misalnya email salah atau password terlalu pendek.',
  })
  @ApiConflictResponse({
    description: 'Email sudah terdaftar.',
  })
  register(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.register(createAuthDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login user',
    description:
      'Login menggunakan email dan password. Gunakan accessToken dari response untuk endpoint yang butuh Bearer JWT.',
  })
  @ApiOkResponse({
    description: 'Login berhasil.',
    schema: {
      example: {
        accessToken: 'jwt-token',
        tokenType: 'Bearer',
        user: {
          id: 'clx123userid',
          email: 'budi@example.com',
          name: 'Budi Santoso',
          role: 'USER',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Body request tidak valid.',
  })
  @ApiUnauthorizedResponse({
    description: 'Email atau password salah.',
  })
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Lihat profil user aktif',
    description:
      'Mengambil data user dari token JWT yang sedang digunakan di header Authorization.',
  })
  @ApiOkResponse({
    description: 'Profil user aktif.',
    schema: {
      example: {
        id: 'clx123userid',
        email: 'budi@example.com',
        name: 'Budi Santoso',
        role: 'USER',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token tidak ada, salah, atau sudah kedaluwarsa.',
  })
  me(@CurrentUser() user: AuthUser) {
    return user;
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Cek akses admin',
    description: 'Endpoint khusus user dengan role ADMIN.',
  })
  @ApiOkResponse({
    description: 'User memiliki akses admin.',
    schema: {
      example: {
        message: 'Admin access granted',
        user: {
          id: 'clx123adminid',
          email: 'admin@example.com',
          name: 'Admin Toko',
          role: 'ADMIN',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token tidak valid atau tidak dikirim.',
  })
  @ApiForbiddenResponse({
    description: 'User bukan ADMIN.',
  })
  admin(@CurrentUser() user: AuthUser) {
    return {
      message: 'Admin access granted',
      user,
    };
  }
}
