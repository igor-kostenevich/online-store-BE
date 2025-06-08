import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { ProductResponse } from 'src/product/dto/responces/product.dto';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  private normalize(p: any) {
    const ratings = p.reviews?.map((r: any) => r.rating) ?? [];
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

  async getWishlist(user: User): Promise<ProductResponse[]> {
    const items = await this.prisma.wishList.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            images: true,
            category: true,
            reviews: true,
          },
        },
      },
    });

    const normalized = items.map((entry) => this.normalize(entry.product));
    return plainToInstance(ProductResponse, normalized);
  }

  async addToWishlist(productId: string, user: User): Promise<ProductResponse> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { images: true, category: true, reviews: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.wishList.upsert({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        productId,
      },
    });

    return plainToInstance(ProductResponse, this.normalize(product));
  }

  async removeFromWishlist(productId: string, user: User) {
    await this.prisma.wishList.delete({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    return { message: 'Product removed from wishlist successfully' };
  }
}
