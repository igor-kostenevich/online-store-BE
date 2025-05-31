import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { PromoModule } from './promo/promo.module';
import { TelegramModule } from './telegram/telegram.module';
import { TelegramService } from './telegram/telegram.service';
import { MailModule } from './mail/mail.module';

@Module({
  controllers: [AppController],
  providers: [AppService, TelegramService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule, 
    AuthModule,
    CategoryModule,
    ProductModule,
    OrderModule,
    PromoModule,
    TelegramModule,
    MailModule,
  ],
})
export class AppModule {}
