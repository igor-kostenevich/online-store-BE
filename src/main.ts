import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { setupSwagger } from './utils/swagger.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }))
  app.setGlobalPrefix('api')

  setupSwagger(app)

  await app.listen(3001);
}
bootstrap();
