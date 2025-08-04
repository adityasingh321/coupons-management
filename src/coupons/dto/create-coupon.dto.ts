import { IsEnum, IsObject, IsOptional, IsString, IsNumber, IsBoolean, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CouponType } from '../../common/enums/coupon-type.enum';
import { CartWiseDetailsDto } from './cart-wise-details.dto';
import { ProductWiseDetailsDto } from './product-wise-details.dto';
import { BxGyDetailsDto } from './bxgy-details.dto';

export class CreateCouponDto {
  @ApiProperty({ 
    enum: CouponType, 
    description: 'Type of coupon discount',
    example: 'cart-wise'
  })
  @IsEnum(CouponType)
  type: CouponType;

  @ApiProperty({ 
    description: 'Coupon details based on type. For cart-wise: {threshold: number, discount: number}. For product-wise: {product_id: number, discount: number}. For bxgy: {buy_products: Array, get_products: Array, repetition_limit: number}',
    example: {
      threshold: 200.00,
      discount: 20.0
    }
  })
  @IsObject()
  details: CartWiseDetailsDto | ProductWiseDetailsDto | BxGyDetailsDto;

  @ApiProperty({ 
    description: 'Whether coupon is active and can be used', 
    default: true,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({ 
    description: 'Expiration date when coupon becomes invalid', 
    required: false,
    example: '2024-12-31T23:59:59.000Z'
  })
  @IsOptional()
  @IsDateString()
  expires_at?: string;

  @ApiProperty({ 
    description: 'Maximum number of times this coupon can be used', 
    required: false,
    example: 100,
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  max_usage?: number;

  @ApiProperty({ 
    description: 'Minimum cart value required to apply this coupon', 
    required: false,
    example: 50.00,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  min_cart_value?: number;

  @ApiProperty({ 
    description: 'Maximum discount amount that can be applied', 
    required: false,
    example: 100.00,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  max_discount?: number;

  @ApiProperty({ 
    description: 'Human-readable description of the coupon offer', 
    required: false,
    example: 'Get 20% off on orders above $200'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'Unique coupon code for customer use', 
    required: false,
    example: 'SAVE20NOW'
  })
  @IsOptional()
  @IsString()
  code?: string;
}

export class UpdateCouponDto extends CreateCouponDto {
  @ApiProperty({ 
    description: 'Whether coupon is active and can be used',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
} 