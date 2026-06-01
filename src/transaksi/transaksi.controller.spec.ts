jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaServiceMock {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { TransaksiController } from './transaksi.controller';
import { TransaksiService } from './transaksi.service';

describe('TransaksiController', () => {
  let controller: TransaksiController;
  const transaksiServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransaksiController],
      providers: [
        {
          provide: TransaksiService,
          useValue: transaksiServiceMock,
        },
      ],
    }).compile();

    controller = module.get<TransaksiController>(TransaksiController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
