import { ProductResponse } from './product.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FlashSaleProductResponse {
  @ApiProperty({
    type: () => ProductResponse,
    isArray: true,
    description: 'List of product with sale'
  })
  @Type(() => ProductResponse)
  items: ProductResponse[];

  @ApiProperty({ description: 'Expiration date of the sale' })
  expiresAt: string;
}
