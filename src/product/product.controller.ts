import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ProductResponse } from './dto/responces/product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Get all products', description: 'Retrieve a list of all available products' })
  @ApiOkResponse({ type: [ProductResponse], description: 'Array of products' })
  getAll() {
    return this.productService.findAll();
  }

  @Get(':slug')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get a product by its slug', description: 'Retrieve a single product using its unique slug' })
  @ApiOkResponse({ type: ProductResponse, description: 'The requested product' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  getBySlug(@Param('slug') slug: string) {
    return this.productService.findBySlug(slug);
  }
}
