import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { BcryptService } from '../bcrypt/bcrypt.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { AuthResponse, AuthRole, AuthUser, JwtPayload } from './auth.types';

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
} as const;

const privateUserSelect = {
  id: true,
  email: true,
  name: true,
  password: true,
  role: true,
} as const;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createAuthDto: CreateAuthDto): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createAuthDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await this.bcryptService.hashPassword(
      createAuthDto.password,
    );

    const user = await this.prisma.user.create({
      data: {
        name: createAuthDto.name,
        email: createAuthDto.email,
        password: hashedPassword,
        role: AuthRole.USER,
      },
      select: publicUserSelect,
    });

    return this.buildAuthResponse(user);
  }

  async login(loginAuthDto: LoginAuthDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginAuthDto.email },
      select: privateUserSelect,
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await this.bcryptService.comparePasswords(
      loginAuthDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  }

  buildAuthResponse(user: AuthUser): AuthResponse {
    return {
      accessToken: this.signToken(user),
      tokenType: 'Bearer',
      user,
    };
  }

  signToken(user: AuthUser): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }
}
