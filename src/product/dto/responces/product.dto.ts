import { CategoryResponse } from './../../../category/dto/responces/category.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProductImageResponse } from './product-image.dto';

export class ProductResponse {
  @ApiProperty({ description: 'Product UUID' })
  id: string;

  @ApiProperty({ description: 'Product name' })
  name: string;

  @ApiProperty({ description: 'URL slug for the product' })
  slug: string;

  @ApiPropertyOptional({ description: 'Product description' })
  description?: string;

  @ApiProperty({ description: 'Current price' })
  price: number;

  @ApiPropertyOptional({ description: 'Original price (for discount calculation)' })
  oldPrice?: number;

  @ApiPropertyOptional({ description: 'Discount percentage' })
  discount?: number;

  @ApiProperty({ description: 'Quantity in stock' })
  stock: number;

  @ApiProperty({ type: () => CategoryResponse, description: 'Associated category' })
  @Type(() => CategoryResponse)
  category: CategoryResponse;

  @ApiProperty({
    type: () => ProductImageResponse,
    isArray: true,
    description: 'List of product images'
  })
  @Type(() => ProductImageResponse)
  images: ProductImageResponse[];

  @ApiProperty({
    type: String,
    isArray: true,
    description: 'Available colors (names or HEX codes)'
  })
  colors: string[];

  @ApiProperty({
    enum: ['XS', 'S', 'M', 'L', 'XL'],
    isArray: true,
    description: 'Available sizes'
  })
  sizes: Array<'XS' | 'S' | 'M' | 'L' | 'XL'>;

  @ApiProperty({ description: 'Flag indicating if this is a new arrival' })
  isNew: boolean;

  @ApiProperty({ description: 'Record creation timestamp', type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last update timestamp', type: String, format: 'date-time' })
  updatedAt: Date;
}
