import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { ProductResponse } from '../product/dto/responces/product.dto';
import { createCacheWithExpiry } from '../utils/cacheTimer.util';

@Injectable()
export class PromoService {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly promoCache = createCacheWithExpiry<ProductResponse>(
    (Math.floor(Math.random() * 4) + 2) * 24 * 60 * 60 * 1000
  );

  private normalize(p: any) {
    const ratings = p.reviews?.map((r) => r.rating) ?? [];
    const reviewCount = ratings.length;
    const averageRating = reviewCount
      ? parseFloat((ratings.reduce((a, b) => a + b, 0) / reviewCount).toFixed(1))
      : null;

    return {
      ...p,
      price: p?.price?.toNumber() ?? null,
      oldPrice: p?.oldPrice != null ? p.oldPrice.toNumber() : null,
      averageRating,
      reviewCount,
    };
  }

  async getPromoBanner(): Promise<{ expiresAt: string; product: ProductResponse }> {
    if (this.promoCache.isExpired()) {
      // Генерируем новое время (случайно 3–7 дней)
      const days = Math.floor(Math.random() * 5) + 3;
      const durationMs = days * 24 * 60 * 60 * 1000;
  
      // Узнаём общее количество продуктов
      const totalCount = await this.prismaService.product.count();
  
      if (totalCount === 0) {
        throw new Error('No products found in the database');
      }
  
      // Берём случайный индекс
      const randomIndex = Math.floor(Math.random() * totalCount);
  
      // Тянем случайный продукт с пропуском
      const randomProduct = await this.prismaService.product.findFirst({
        skip: randomIndex,
        include: { images: true, category: true, reviews: true },
      });
  
      if (!randomProduct) {
        throw new Error('Failed to fetch random product');
      }
  
      const normalized = plainToInstance(ProductResponse, this.normalize(randomProduct));
      
      // Кладём в кеш
      this.promoCache.set(normalized);
      // Обновляем время истечения кеша вручную
      (this.promoCache as any).expiresAt = new Date(Date.now() + durationMs);
    }
  
    return {
      expiresAt: this.promoCache.getExpiry()!,
      product: this.promoCache.get()!,
    };
  }
}
