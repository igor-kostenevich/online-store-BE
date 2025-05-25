import { PaginationInterceptor } from './../common/interceptors/pagination.interceptor';
import { ClassSerializerInterceptor, Controller, Get, HttpCode, Param, UseInterceptors } from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiExtraModels, ApiQuery, getSchemaPath } from '@nestjs/swagger';
import { ProductResponse } from './dto/responces/product.dto';
import { PageDto } from 'src/common/dto/pagination/page.dto';

@Controller('product')
@ApiExtraModels(PageDto, ProductResponse) 
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(PaginationInterceptor)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Get all products', description: 'Retrieve a list of all available products' })
  @ApiOkResponse({
    description: 'List of products',
    schema: {
      oneOf: [
        { type: 'array', items: { $ref: getSchemaPath(ProductResponse) } },
        { $ref: getSchemaPath(PageDto) },
      ],
    },
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (optional, default: 1)',
    schema: { type: 'integer', default: 1 },
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page (optional, default: 20)',
    schema: { type: 'integer', default: 20 },
  })
  getAll() {
    return this.productService.findAll();
  }
  

  @Get('discounts')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get all discounted products (paged)', description: 'Retrieve paginated list of products with discount > 0' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (optional)', schema: { type: 'integer', default: 1 } })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (optional)', schema: { type: 'integer', default: 20 } })
  @ApiOkResponse({
    description: 'Paginated list of discounted products',
    schema: { $ref: getSchemaPath(PageDto) },
  })
  getDiscounts() {
    return this.productService.getFlashSalesProducts();
  }

  @Get('new-arrivals')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get top 5 new arrival products',
    description: 'Returns up to 5 most recent products marked as new arrivals',
  })
  @ApiOkResponse({
    description: 'Array of up to 5 newest products',
    type: [ProductResponse],
  })
  getTopNewArrivals(): Promise<ProductResponse[]> {
    return this.productService.getTopNewArrivals();
  }

  @Get('best-selling')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get all best selling products',
    description: 'Retrieve paginated list of products ranked by combined sales and rating score',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (optional)', schema: { type: 'integer', default: 1 } })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (optional)', schema: { type: 'integer', default: 20 } })
  @ApiOkResponse({
    description: 'Paginated list of best-selling products',
    schema: { $ref: getSchemaPath(PageDto) },
  })
  getBestSellingProducts() {
    return this.productService.getBestSellingProducts();
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
