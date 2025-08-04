import { IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CartWiseDetailsDto {
  @ApiProperty({ 
    description: 'Minimum cart value required to apply this coupon', 
    example: 150.00,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  threshold: number;

  @ApiProperty({ 
    description: 'Discount percentage to apply', 
    example: 15.5, 
    minimum: 0, 
    maximum: 100 
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  discount: number;
} 