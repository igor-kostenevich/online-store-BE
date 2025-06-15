import { Module } from '@nestjs/common';
import { LiqpayService } from './liqpay.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LiqpayController } from './liqpay.controller';

@Module({
  imports: [PrismaModule],
  controllers: [LiqpayController],
  providers: [LiqpayService],
  exports: [LiqpayService],
})
export class LiqpayModule {}
