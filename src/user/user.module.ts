import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BcryptModule } from '../bcrypt/bcrypt.module';

@Module({
  imports: [PrismaModule, BcryptModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
