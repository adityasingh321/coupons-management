import { ApiProperty } from '@nestjs/swagger';
import { CouponType } from '../../common/enums/coupon-type.enum';

export class ApplicableCouponDto {
  @ApiProperty({ 
    description: 'Unique identifier of the coupon',
    example: 1
  })
  coupon_id: number;

  @ApiProperty({ 
    enum: CouponType, 
    description: 'Type of coupon discount',
    example: 'cart-wise'
  })
  type: CouponType;

  @ApiProperty({ 
    description: 'Total discount amount that can be applied',
    example: 25.50
  })
  discount: number;

  @ApiProperty({ 
    description: 'Human-readable description of the coupon offer',
    example: 'Get 15% off on orders above $150'
  })
  description?: string;

  @ApiProperty({ 
    description: 'Unique coupon code for customer use',
    example: 'SAVE15NOW'
  })
  code?: string;
}

export class CartItemWithDiscountDto {
  @ApiProperty({ 
    description: 'Unique identifier of the product',
    example: 12345
  })
  product_id: number;

  @ApiProperty({ 
    description: 'Quantity of the product in cart',
    example: 2,
    minimum: 1
  })
  quantity: number;

  @ApiProperty({ 
    description: 'Price per unit of the product',
    example: 29.99
  })
  price: number;

  @ApiProperty({ 
    description: 'Total discount amount applied to this specific item',
    example: 5.99
  })
  total_discount: number;
}

export class UpdatedCartDto {
  @ApiProperty({ 
    type: [CartItemWithDiscountDto], 
    description: 'Cart items with applied discounts',
    example: [
      {
        product_id: 12345,
        quantity: 2,
        price: 29.99,
        total_discount: 5.99
      },
      {
        product_id: 67890,
        quantity: 1,
        price: 49.99,
        total_discount: 10.00
      }
    ]
  })
  items: CartItemWithDiscountDto[];

  @ApiProperty({ 
    description: 'Total price before any discounts are applied',
    example: 109.97
  })
  total_price: number;

  @ApiProperty({ 
    description: 'Total discount amount applied across all items',
    example: 15.99
  })
  total_discount: number;

  @ApiProperty({ 
    description: 'Final price after all discounts are applied',
    example: 93.98
  })
  final_price: number;
}

export class ApplyCouponResponseDto {
  @ApiProperty({ 
    description: 'Updated cart with applied discounts and final pricing',
    type: UpdatedCartDto
  })
  updated_cart: UpdatedCartDto;
} 