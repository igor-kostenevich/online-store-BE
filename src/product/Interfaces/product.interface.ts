import { PrismaService } from './../../prisma/prisma.service'

export type RawProduct = Awaited<ReturnType<typeof PrismaService.prototype.product.findUnique>>