jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaServiceMock {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { TransaksiService } from './transaksi.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TransaksiService', () => {
  let service: TransaksiService;
  const prismaMock = {
    $transaction: jest.fn(),
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransaksiService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<TransaksiService>(TransaksiService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
