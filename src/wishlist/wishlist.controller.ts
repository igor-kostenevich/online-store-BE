import { AddToWishlistDto } from './dto/wishlist.dto';
import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { ProductResponse } from 'src/product/dto/responces/product.dto';
import { User } from '@prisma/client';
import { Authorization } from 'src/auth/decorators/authorization.decorator';
import { Authorized } from 'src/auth/decorators/authorized.decorator';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Authorization()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Get wishlist' })
  @ApiOkResponse({ type: [ProductResponse] })
  getWishlist(@Authorized() user: User) {
    return this.wishlistService.getWishlist(user);
  }

  @Authorization()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Add product to wishlist' })
  @ApiOkResponse({ type: ProductResponse })
  addProductToWishlist(@Body() dto: AddToWishlistDto, @Authorized() user: User) {
    return this.wishlistService.addToWishlist(dto.productId, user);
  }

  @Authorization()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Delete(':productId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove product from wishlist' })
  removeProductFromWishlist(@Param('productId') productId: string, @Authorized() user: User) {
    return this.wishlistService.removeFromWishlist(productId, user);
  }
}

