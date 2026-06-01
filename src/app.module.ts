import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { BcryptModule } from './bcrypt/bcrypt.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TransaksiModule } from './transaksi/transaksi.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    PrismaModule,
    BcryptModule,
    AuthModule,
    UserModule,
    CategoryModule,
    ProductModule,
    TransaksiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
