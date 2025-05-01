import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { setupSwagger } from './utils/swagger.util';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService)

  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }))
  app.setGlobalPrefix('api')
  app.enableCors({
    origin: config.getOrThrow<string>('ALLOWED_ORIGINS').split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    exposedHeaders: ['Set-Cookie', 'Content-Disposition'],
    allowedHeaders: '*'
  })

  setupSwagger(app)

  await app.listen(3001);
}
bootstrap();
