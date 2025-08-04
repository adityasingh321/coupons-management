import { IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProductWiseDetailsDto {
  @ApiProperty({ 
    description: 'Product ID to apply discount on', 
    example: 12345,
    minimum: 1
  })
  @IsNumber()
  product_id: number;

  @ApiProperty({ 
    description: 'Discount percentage to apply on the specific product', 
    example: 25.0, 
    minimum: 0, 
    maximum: 100 
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  discount: number;
} 