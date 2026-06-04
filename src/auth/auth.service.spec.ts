jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaServiceMock {},
}));

jest.mock('../bcrypt/bcrypt.service', () => ({
  BcryptService: class BcryptServiceMock {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { BcryptService } from '../bcrypt/bcrypt.service';

describe('AuthService', () => {
  let service: AuthService;
  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
  const bcryptMock = {
    hashPassword: jest.fn(),
    comparePasswords: jest.fn(),
  };
  const jwtMock = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: BcryptService,
          useValue: bcryptMock,
        },
        {
          provide: JwtService,
          useValue: jwtMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('register should create a USER without returning a token', async () => {
    const createAuthDto = {
      name: 'Budi Santoso',
      email: 'budi@example.com',
      password: 'password123',
    };
    const createdUser = {
      id: 'clx123userid',
      email: createAuthDto.email,
      name: createAuthDto.name,
      role: 'USER',
    };

    prismaMock.user.findUnique.mockResolvedValue(null);
    bcryptMock.hashPassword.mockResolvedValue('hashed-password');
    prismaMock.user.create.mockResolvedValue(createdUser);

    await expect(service.register(createAuthDto)).resolves.toEqual(createdUser);
    expect(jwtMock.sign).not.toHaveBeenCalled();
  });
});
