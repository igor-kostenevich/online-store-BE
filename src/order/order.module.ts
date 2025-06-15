import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { TelegramService } from 'src/telegram/telegram.service';
import { LiqpayModule } from 'src/liqpay/liqpay.module';

@Module({
  imports: [PrismaModule, AuthModule, LiqpayModule],
  controllers: [OrderController],
  providers: [OrderService, TelegramService],
  exports: [TelegramService],
})
export class OrderModule {}
