import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { prisma } from '@app/database';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const configService = new ConfigService();
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await prisma
    .$connect()
    .then(() => console.log('Database connected successfully'))
    .catch((error) => console.error('Database connection error:', error));

  app.enableCors({
    origin: configService.get('CORS_ORIGIN'),
    methods: configService.get('CORS_METHODS'),
    allowedHeaders: configService.get('CORS_ALLOWED_HEADERS'),
  });

  app.setGlobalPrefix('v1/auth');

  const PORT = configService.get('AUTH_PORT');
  await app.listen(PORT);
  console.log(`AUTH SERVICE RUNNING ON PORT: ${PORT}`);
}

bootstrap();
