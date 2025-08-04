import { IsNumber, IsPositive, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CartItemDto {
  @ApiProperty({ 
    description: 'Unique identifier of the product',
    example: 12345,
    minimum: 1
  })
  @IsNumber()
  product_id: number;

  @ApiProperty({ 
    description: 'Quantity of the product in cart',
    example: 3,
    minimum: 1
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;

  @ApiProperty({ 
    description: 'Price per unit of the product',
    example: 29.99,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  price: number;
}

export class CartDto {
  @ApiProperty({ 
    type: [CartItemDto], 
    description: 'Array of cart items with product details',
    example: [
      {
        product_id: 12345,
        quantity: 2,
        price: 29.99
      },
      {
        product_id: 67890,
        quantity: 1,
        price: 49.99
      }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];
} 