
import { Body, Controller, Get, HttpCode, Param, Post, Headers } from '@nestjs/common';
import { ApiBearerAuth, ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiUnauthorizedResponse, ApiTags } from '@nestjs/swagger';
import { Authorization } from 'src/auth/decorators/authorization.decorator';
import { Authorized } from 'src/auth/decorators/authorized.decorator';
import { User } from '@prisma/client';
import { OrderResponse } from './dto/responses/orderResponse.dto';
import { CreateOrderDto } from './dto/createOrder.dto';
import { OrderService } from './order.service';
import { JwtService } from '@nestjs/jwt';
import { extractUserIdFromAuthHeader } from '../utils/auth.util';

@ApiTags('Orders')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService, private readonly jwtService: JwtService) {}

  @ApiOperation({
    summary: 'Place new order',
    description: 'Create a new order (guest or authenticated)',
  })
  @ApiCreatedResponse({ type: OrderResponse, description: 'Order created' })
  @ApiBadRequestResponse({ description: 'Invalid order data or insufficient stock' })
  @Post()
  @HttpCode(201)
  async place(@Body() dto: CreateOrderDto, @Headers('authorization') authHeader?: string,): Promise<OrderResponse> {
    const userId = extractUserIdFromAuthHeader(authHeader, this.jwtService);
    return this.orderService.placeOrder(dto, userId);
  }

  @Authorization()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List user orders',
    description: 'Retrieve all orders of the currently authenticated user',
  })
  @ApiOkResponse({
    description: 'Array of orders',
    type: [OrderResponse],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get()
  async list(
    @Authorized() user: User,
  ): Promise<OrderResponse[]> {
    return this.orderService.getUserOrders(user.id);
  }

  @Authorization()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get order details',
    description: 'Retrieve a specific order by its ID for the authenticated user',
  })
  @ApiOkResponse({
    description: 'Order details',
    type: OrderResponse,
  })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get(':id')
  async detail(
    @Authorized() user: User,
    @Param('id') id: string,
  ): Promise<OrderResponse> {
    return this.orderService.getOrderById(user.id, id);
  }
}
