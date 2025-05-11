import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'UUID of the product',
    example: 'f1c705d5-f83d-4eee-92c9-000d37bf3b40',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Quantity of this product to order',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  quantity: number;
}