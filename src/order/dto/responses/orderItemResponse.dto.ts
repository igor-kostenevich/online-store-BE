import { ApiProperty } from '@nestjs/swagger';

export class OrderItemResponse {
  @ApiProperty({
    description: 'UUID of the product',
    example: 'f1c705d5-f83d-4eee-92c9-000d37bf3b40',
  })
  productId: string;

  @ApiProperty({
    description: 'Name of the product at the time of order',
    example: 'iPhone 15 Pro',
  })
  name?: string;

  @ApiProperty({
    description: 'Preview image of the product',
    example: 'https://example.com/images/iphone15pro.jpg',
  })
  image?: string;

  @ApiProperty({
    description: 'Quantity ordered',
    example: 2,
  })
  quantity: number;

  @ApiProperty({
    description: 'Unit price at the moment of order',
    example: 49.99,
  })
  price: number;
}
