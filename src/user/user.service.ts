import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BcryptService } from '../bcrypt/bcrypt.service';

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
} as const;

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bcryptService: BcryptService,
  ) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: userSelect,
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    const hasUpdateData =
      updateUserDto.email !== undefined ||
      updateUserDto.password !== undefined ||
      updateUserDto.name !== undefined;

    if (!hasUpdateData) {
      throw new BadRequestException('No update data provided');
    }

    const hashedPassword =
      updateUserDto.password !== undefined
        ? await this.bcryptService.hashPassword(updateUserDto.password)
        : undefined;

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(updateUserDto.email !== undefined ? { email: updateUserDto.email } : {}),
        ...(hashedPassword !== undefined ? { password: hashedPassword } : {}),
        ...(updateUserDto.name !== undefined ? { name: updateUserDto.name } : {}),
        ...(updateUserDto.role !== undefined ? { role: updateUserDto.role } : {}),
      },
      select: userSelect,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.user.delete({
      where: { id },
      select: userSelect,
    });
  }
}
