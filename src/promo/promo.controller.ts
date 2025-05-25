import { Controller, Get, HttpCode } from '@nestjs/common';
import { PromoService } from './promo.service';
import { ApiOkResponse, ApiOperation, getSchemaPath } from '@nestjs/swagger';
import { ProductResponse } from '../product/dto/responces/product.dto';

@Controller('promo')
export class PromoController {
  constructor(private readonly promoService: PromoService) {}

  @Get('banner')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get promo banner with cached random product',
    description: 'Returns a random product (cached) with an expiry time',
  })
  @ApiOkResponse({
    description: 'Promo product',
    schema: {
      type: 'object',
      properties: {
        expiresAt: { type: 'string', format: 'date-time' },
        product: { $ref: getSchemaPath(ProductResponse) },
      },
    },
  })
  getPromoBanner() {
    return this.promoService.getPromoBanner();
  }
}
