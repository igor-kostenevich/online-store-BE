import { RawProduct } from './Interfaces/product.interface';
import { PrismaService } from './../prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ProductResponse } from './dto/responces/product.dto';
import { FlashSaleProductResponse } from './dto/responces/flash-sale-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prismaService: PrismaService) {}

  private dealsExpiresAt: Date | null = null
  private dealsCache: ProductResponse[] = []

  private normalize(p: RawProduct & { reviews?: { rating: number }[] }) {
    const ratings = p.reviews?.map(r => r.rating) ?? []
    const reviewCount = ratings.length
    const averageRating = reviewCount
      ? parseFloat((ratings.reduce((a, b) => a + b, 0) / reviewCount).toFixed(1))
      : null
  
    return {
      ...p,
      price: p?.price?.toNumber() ?? null,
      oldPrice: p?.oldPrice != null ? p.oldPrice.toNumber() : null,
      averageRating,
      reviewCount,
    }
  }  

  async findAll(): Promise<ProductResponse[]> {
    const products = await this.prismaService.product.findMany({
      include: { images: true, category: true, reviews: true, },
    })

    const mappedProducts = products.map(p => this.normalize(p))

    return plainToInstance(ProductResponse, mappedProducts);
  }

  async findBySlug(slug: string): Promise<ProductResponse> {
    const product = await this.prismaService.product.findUnique({
      where: { slug },
      include: { images: true, category: true, reviews: true},
    });

    if (!product) {
      throw new NotFoundException(`Product with slug="${slug}" not found`);
    }

    return plainToInstance(ProductResponse, this.normalize(product));
  }

  async getFlashSalesProducts(): Promise<FlashSaleProductResponse> {
    const now = new Date()

    if (!this.dealsExpiresAt || now > this.dealsExpiresAt) {
      const days = Math.floor(Math.random() * 5) + 3;
      this.dealsExpiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      const raws = await this.prismaService.product.findMany({
        where: { discount: { gt: 0 } },
        orderBy: { discount: 'desc' },
        include: { images: true, category: true, reviews: true },
      });

      this.dealsCache = plainToInstance(
        ProductResponse,
        raws.map(p => this.normalize(p))
      );
    }

    return {
      expiresAt: this.dealsExpiresAt.toISOString(),
      items: this.dealsCache,
    };
  }

  async getTopNewArrivals(): Promise<ProductResponse[]> {
    const raws = await this.prismaService.product.findMany({
      where: { isNew: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { images: true, category: true, reviews: true },
    });

    const items = raws.map(r => this.normalize(r));
    return plainToInstance(ProductResponse, items);
  }
}
