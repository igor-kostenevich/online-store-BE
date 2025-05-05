import { CategoryResponse } from './dto/responces/category.dto';
import { ClassSerializerInterceptor, Controller, Get, HttpCode, UseInterceptors } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @HttpCode(200)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Get all categories', description: 'Returns all categories' })
  @ApiOkResponse({ type: [CategoryResponse] })
  async getAll(): Promise<CategoryResponse[]> {
    return await this.categoryService.getAllCategories()
  }
}
