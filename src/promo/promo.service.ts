import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { ProductResponse } from '../product/dto/responces/product.dto';
import { createAdvancedCache } from '../utils/cacheTimer.util';

@Injectable()
export class PromoService {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly promoCache = createAdvancedCache<ProductResponse>(
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
    const expiry = this.promoCache.getExpiry();
    if (!expiry || new Date(expiry) <= new Date()) {  
      const totalCount = await this.prismaService.product.count();
  
      if (totalCount === 0) {
        throw new Error('No products found in the database');
      }
  
      const randomIndex = Math.floor(Math.random() * totalCount);
  
      const randomProduct = await this.prismaService.product.findFirst({
        skip: randomIndex,
        include: { images: true, category: true, reviews: true },
      });
  
      if (!randomProduct) {
        throw new Error('Failed to fetch random product');
      }
  
      const normalized = plainToInstance(ProductResponse, this.normalize(randomProduct));
      
      this.promoCache.set(normalized);
    }
  
    return {
      expiresAt: this.promoCache.getExpiry()!,
      product: this.promoCache.get()!,
    };
  }
}
