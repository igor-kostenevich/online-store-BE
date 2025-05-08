import { CustomLogger } from './common/logger/logger.service';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { setupSwagger } from './utils/swagger.util';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const config = app.get(ConfigService)

  app.use(cookieParser())
  app.useLogger(new CustomLogger())
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }))
  app.setGlobalPrefix('api')

  const allowedOrigins = config
    .getOrThrow<string>('ALLOWED_ORIGINS')
    .split(',')
    .map(o => o.trim())

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    exposedHeaders: ['Set-Cookie', 'Content-Disposition'],
    allowedHeaders: '*'
  })

  setupSwagger(app)

  await app.listen(3001);
}
bootstrap();
