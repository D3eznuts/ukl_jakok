import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Toko Elektronik API')
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
    customSiteTitle: 'Toko Elektronik API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
