import { Prisma } from '@prisma/client';
import { PrismaService } from './../../prisma/prisma.service'

export type RawProduct = Awaited<ReturnType<typeof PrismaService.prototype.product.findUnique>>

export interface RawAutocompleteProduct {
  id: string;
  name: string;
  price: Prisma.Decimal;
  imageId?: string | null;
  imageUrl?: string | null;
}