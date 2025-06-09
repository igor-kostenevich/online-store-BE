import { RawAutocompleteProduct, RawProduct } from './Interfaces/product.interface';
import { PrismaService } from './../prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ProductResponse } from './dto/responces/product.dto';
import { FlashSaleProductResponse } from './dto/responces/flash-sale-product.dto';
import { createCacheWithExpiry } from '../utils/cacheTimer.util';
import { ProductAutocompleteDto } from './dto/responces/product-autocomplete.dto';
import { PromoService } from 'src/promo/promo.service';
import { shuffle } from 'lodash'

@Injectable()
export class ProductService {
  constructor(private readonly prismaService: PrismaService, private readonly promoService: PromoService) {}

  private readonly flashSalesCache = createCacheWithExpiry<ProductResponse[]>((Math.floor(Math.random() * 4) + 2) * 24 * 60 * 60 * 1000)

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
    return this.getMixedCategoryProducts();
  }

  async getHomepageProductBlocks() {
    const [newArrivals, bestSelling, discounts, banner, allProducts] = await Promise.all([
      this.getTopNewArrivals(),
      this.getBestSellingProducts(),
      this.getFlashSalesProducts().then(r => ({...r, items: r.items.slice(0, 12)})),
      this.promoService.getPromoBanner(),
      this.getMixedCategoryProducts().then(r => r.slice(0, 24)),
    ]);
  
    return {
      newArrivals,
      bestSelling: bestSelling.slice(0, 4),
      discounts,
      banner,
      allProducts,
    };
  }

  async getMixedCategoryProducts(): Promise<ProductResponse[]> {
    const products = await this.prismaService.product.findMany({
      where: {
        categoryId: { not: undefined },
      },
      include: {
        images: true,
        category: true,
        reviews: true,
      },
    });

    const groupedByCategory = new Map<string, RawProduct[]>();

    for (const product of products) {
      const categoryId = product.categoryId;
      if (!groupedByCategory.has(categoryId)) {
        groupedByCategory.set(categoryId, []);
      }
      groupedByCategory.get(categoryId)!.push(product);
    }

    const representativeProducts: RawProduct[] = [];

    for (const productsInCategory of groupedByCategory.values()) {
      const randomProduct = productsInCategory[Math.floor(Math.random() * productsInCategory.length)];
      representativeProducts.push(randomProduct);
    }

    const finalSelection = shuffle(representativeProducts)

    const normalized = finalSelection
      .filter((p): p is RawProduct & { reviews?: { rating: number }[] } => p !== null)
      .map((p) => this.normalize(p));

    return plainToInstance(ProductResponse, normalized);
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
    if (this.flashSalesCache.isExpired()) {
      const days = Math.floor(Math.random() * 5) + 3;
      const durationMs = days * 24 * 60 * 60 * 1000;

      const raws = await this.prismaService.product.findMany({
        where: { discount: { gt: 0 } },
        orderBy: { discount: 'desc' },
        include: { images: true, category: true, reviews: true },
      });

      const normalizedProducts = plainToInstance(
        ProductResponse,
        raws.map((p) => this.normalize(p))
      );

      this.flashSalesCache.set(normalizedProducts);
      (this.flashSalesCache as any).expiresAt = new Date(Date.now() + durationMs);
    }

    return {
      expiresAt: this.flashSalesCache.getExpiry()!,
      items: this.flashSalesCache.get()!,
    };
  }

  async getTopNewArrivals(): Promise<ProductResponse[]> {
    const raws = await this.prismaService.product.findMany({
      where: { isNew: true },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: { images: true, category: true, reviews: true },
    });

    const items = raws.map(r => this.normalize(r));
    return plainToInstance(ProductResponse, items);
  }

  async getBestSellingProducts(): Promise<ProductResponse[]> {
    const MAX_ITEMS = 60;
  
    const salesCounts = await this.prismaService.orderItem.findMany({
      select: { productId: true, quantity: true },
    });
  
    const salesMap = new Map<string, number>();
    salesCounts.forEach(({ productId, quantity }) => {
      salesMap.set(productId, (salesMap.get(productId) || 0) + quantity);
    });
  
    const reviews = await this.prismaService.review.findMany({
      select: { productId: true, rating: true },
    });
  
    const ratingSumMap = new Map<string, { sum: number; count: number }>();
    reviews.forEach(({ productId, rating }) => {
      const entry = ratingSumMap.get(productId) || { sum: 0, count: 0 };
      ratingSumMap.set(productId, { sum: entry.sum + rating, count: entry.count + 1 });
    });
  
    const ratingMap = new Map<string, number>();
    ratingSumMap.forEach((value, productId) => {
      ratingMap.set(productId, value.sum / value.count);
    });
  
    const allProducts = await this.prismaService.product.findMany({
      include: { images: true, category: true, reviews: true },
    });
  
    const productsWithScore = allProducts.map((p) => {
      const totalSales = salesMap.get(p.id) || 0;
      const avgRating = ratingMap.get(p.id) || 0;
  
      const score = totalSales * 0.7 + avgRating * 10 * 0.3;
      return { product: p, score };
    });
  
    const topProducts = productsWithScore
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_ITEMS)
      .map((entry) => this.normalize(entry.product));
  
    return plainToInstance(ProductResponse, topProducts);
  }

  async searchProducts(query: string): Promise<ProductAutocompleteDto[]> {
    const q = query?.trim();
    if (!q || q.length < 3) return [];
  
    const isShortQuery = q.length <= 8;
  
    const sql = isShortQuery
      ? `
        SELECT 
          p.id,
          p.name,
          p.price,
          p.slug,
          img.id as "imageId",
          img.url as "imageUrl"
        FROM "products" p
        LEFT JOIN "product_images" img
          ON img."productId" = p.id AND img."isMain" = true
        WHERE p.name ILIKE '%' || $1 || '%'
           OR p.description ILIKE '%' || $1 || '%'
        ORDER BY p."updatedAt" DESC
        LIMIT 20
      `
      : `
        SELECT 
          p.id,
          p.name,
          p.price,
          p.slug,
          img.id as "imageId",
          img.url as "imageUrl"
        FROM "products" p
        LEFT JOIN "product_images" img
          ON img."productId" = p.id AND img."isMain" = true
        WHERE p.name % $1 OR p.description % $1
        ORDER BY p."updatedAt" DESC
        LIMIT 20
      `;
  
    const rawResults = await this.prismaService.$queryRawUnsafe<RawAutocompleteProduct[]>(sql, q);
  
    const transformed = rawResults.map(r => {
      return plainToInstance(ProductAutocompleteDto, {
        id: r.id,
        name: r.name,
        slug: r.slug,
        price: parseFloat(r.price.toString()),
        image: r.imageId && r.imageUrl
          ? { id: r.imageId, url: r.imageUrl }
          : undefined
      });
    });
  
    return transformed;
  }
  
}
