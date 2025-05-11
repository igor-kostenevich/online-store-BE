import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { Prisma } from '@prisma/client';
import { OrderItemResponse } from './dto/responses/orderItemResponse.dto';
import { OrderResponse } from './dto/responses/orderResponse.dto';
import { CreateOrderDto } from './dto/createOrder.dto';

@Injectable()
export class OrderService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Create new order.
   * @param dto - order data
   * @param userId - optional user ID for authenticated users
   */
  async placeOrder(dto: CreateOrderDto, userId?: string): Promise<OrderResponse> {
    const productIds = dto.items.map(i => i.productId);
    const products = await this.prismaService.product.findMany({
      where: { id: { in: productIds } },
    });
    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products not found');
    }

    const priceMap = new Map<string, number>();
    for (const product of products) {
      priceMap.set(product.id, product.price.toNumber());
    }
    for (const item of dto.items) {
      const product = products.find(p => p.id === item.productId);
      if (product && item.quantity > product.stock) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.id}`,
        );
      }
    }

    const total = dto.items.reduce(
      (sum, item) => sum + (priceMap.get(item.productId) ?? 0) * item.quantity,
      0,
    );

    const order = await this.prismaService.$transaction(async tx => {
      for (const item of dto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return tx.order.create({
        data: {
          ...(userId
            ? { user: { connect: { id: userId } } }
            : {}),
          customerEmail: dto.customerEmail,
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          total: new Prisma.Decimal(total),
          items: {
            create: dto.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: new Prisma.Decimal(priceMap.get(item.productId) ?? 0),
            })),
          },
        },
        include: { items: true },
      });
    });

    const response: OrderResponse = {
      id: order.id,
      total: order.total.toNumber(),
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map(
        (i): OrderItemResponse => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price.toNumber(),
        }),
      ),
    };

    return plainToInstance(OrderResponse, response);
  }

  /**
   * Returns all orders of the user.
   */
  async getUserOrders(userId: string): Promise<OrderResponse[]> {
    const orders = await this.prismaService.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(order =>
      plainToInstance(OrderResponse, {
        id: order.id,
        total: order.total.toNumber(),
        status: order.status,
        createdAt: order.createdAt,
        items: order.items.map(
          (i): OrderItemResponse => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price.toNumber(),
          }),
        ),
      }),
    );
  }

  /**
   * Returns order by ID.
   */
  async getOrderById(
    userId: string,
    orderId: string,
  ): Promise<OrderResponse> {
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order || order.userId !== userId) {
      throw new NotFoundException(`Order with id=${orderId} not found`);
    }

    const response: OrderResponse = {
      id: order.id,
      total: order.total.toNumber(),
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map(
        (i): OrderItemResponse => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price.toNumber(),
        }),
      ),
    };

    return plainToInstance(OrderResponse, response);
  }
}
