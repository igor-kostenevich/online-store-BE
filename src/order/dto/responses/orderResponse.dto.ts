import { ApiProperty } from '@nestjs/swagger';
import { OrderItemResponse } from './orderItemResponse.dto';

export class OrderResponse {
  @ApiProperty({
    description: 'Order UUID',
    example: 'a3c705d5-f83d-4eee-92c9-111d37bf3b41',
  })
  id: string;

  @ApiProperty({
    description: 'Total amount for the order',
    example: 99.98,
  })
  total: number;

  @ApiProperty({
    description: 'Order status',
    example: 'pending',
  })
  status: string;

  @ApiProperty({
    description: 'Order creation timestamp',
    example: '2025-05-11T12:34:56.789Z',
  })
  createdAt: Date;

  @ApiProperty({
    type: [OrderItemResponse],
    description: 'List of items in the order',
  })
  items: OrderItemResponse[];

  @ApiProperty({
    description: 'LiqPay checkout data',
    type: 'object',
    additionalProperties: {
      type: 'string',
    },
  })
  liqpay?: {
    data: string;
    signature: string;
  }
}
