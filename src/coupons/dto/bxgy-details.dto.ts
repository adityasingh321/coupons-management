import { IsNumber, Min, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BxGyProductDto {
  @ApiProperty({ 
    description: 'Product ID for buy/get offer', 
    example: 1001,
    minimum: 1
  })
  @IsNumber()
  product_id: number;

  @ApiProperty({ 
    description: 'Quantity required for this product in the offer', 
    example: 2,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class BxGyDetailsDto {
  @ApiProperty({ 
    type: [BxGyProductDto], 
    description: 'Products to buy to qualify for the offer',
    example: [
      { product_id: 1001, quantity: 2 },
      { product_id: 1002, quantity: 1 }
    ]
  })
  @IsArray()
  buy_products: BxGyProductDto[];

  @ApiProperty({ 
    type: [BxGyProductDto], 
    description: 'Products to get for free when conditions are met',
    example: [
      { product_id: 1003, quantity: 1 }
    ]
  })
  @IsArray()
  get_products: BxGyProductDto[];

  @ApiProperty({ 
    description: 'Maximum number of times this offer can be applied', 
    example: 3,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  repetition_limit: number;
} 