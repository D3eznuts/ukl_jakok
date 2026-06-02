import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(process.cwd(), 'public'), {
    prefix: '/assets/',
  });
  app.useStaticAssets(join(process.cwd(), 'node_modules', 'three', 'build'), {
    prefix: '/vendor/three/',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
app.enableCors({
    origin: 'localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  const swaggerConfig = new DocumentBuilder()
    .setTitle('ElectroTech')
    .setDescription(
      [
        'Dokumentasi REST API untuk toko elektronik sederhana.',
        '',
        'Alur umum penggunaan:',
        '1. Register atau login melalui endpoint Auth.',
        '2. Klik tombol Authorize dan masukkan token dengan format: Bearer <accessToken>.',
        '3. Admin membuat kategori dan produk.',
        '4. User membuat transaksi checkout dari produk yang tersedia.',
        '5. Admin memperbarui status pembayaran dan pesanan.',
      ].join('\n'),
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Masukkan token JWT dari response login/register. Format: Bearer <accessToken>.',
      },
      'access-token',
    )
    .addTag('App', 'Endpoint dasar untuk cek aplikasi.')
    .addTag('Auth', 'Register, login, profil user aktif, dan akses admin.')
    .addTag('Users', 'Manajemen data user.')
    .addTag('Categories', 'Manajemen kategori produk elektronik.')
    .addTag('Products', 'Katalog produk, stok, harga, dan pencarian produk.')
    .addTag(
      'Transaksi',
      'Checkout, daftar order, detail order, update status, dan pembatalan.',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    customSiteTitle: 'ElectroTech API Docs',
    customCssUrl: '/assets/swagger/swagger-theme.css',
    customJs: '/assets/swagger/swagger-scene.js',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
