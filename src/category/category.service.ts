import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoryResponse } from './dto/responces/category.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllCategories(): Promise<CategoryResponse[]> {
    const categories = await this.prismaService.category.findMany({
      where: { parentId: null },
      include: {
        children: true,
      },
    })

    return plainToInstance(CategoryResponse, categories)
  }

  async getCategoryWithChildren(slug: string): Promise<CategoryResponse> {
    const category = await this.prismaService.category.findUnique({
      where: { slug },
      include: { children: true },
    });
    if (!category) {
      throw new NotFoundException(`Category "${slug}" not found`);
    }
    return plainToInstance(CategoryResponse, category);
  }
}
