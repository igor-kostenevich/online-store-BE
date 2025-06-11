import { PrismaModule } from './../prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PromoModule } from 'src/promo/promo.module';
import { CategoryModule } from 'src/category/category.module';

@Module({
  imports: [PrismaModule, PromoModule, CategoryModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
