import { Test, TestingModule } from '@nestjs/testing';
import { CouponCalculatorService } from './coupon-calculator.service';
import { CouponType } from '../../common/enums/coupon-type.enum';
import { CartItemDto } from '../../common/dto/cart-item.dto';

describe('CouponCalculatorService', () => {
  let service: CouponCalculatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CouponCalculatorService],
    }).compile();

    service = module.get<CouponCalculatorService>(CouponCalculatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateApplicableCoupons', () => {
    const mockCart: CartItemDto[] = [
      { product_id: 1, quantity: 2, price: 50 },
      { product_id: 2, quantity: 1, price: 30 },
    ];

    it('should return empty array when no coupons are provided', () => {
      const result = service.calculateApplicableCoupons([], mockCart);
      expect(result).toEqual([]);
    });

    it('should filter out inactive coupons', () => {
      const coupons = [
        {
          id: 1,
          type: CouponType.CART_WISE,
          details: { threshold: 100, discount: 10 },
          is_active: false,
        },
      ];

      const result = service.calculateApplicableCoupons(coupons, mockCart);
      expect(result).toEqual([]);
    });

    it('should filter out expired coupons', () => {
      const coupons = [
        {
          id: 1,
          type: CouponType.CART_WISE,
          details: { threshold: 100, discount: 10 },
          is_active: true,
          expires_at: new Date('2020-01-01'),
        },
      ];

      const result = service.calculateApplicableCoupons(coupons, mockCart);
      expect(result).toEqual([]);
    });

    it('should filter out coupons that exceed usage limit', () => {
      const coupons = [
        {
          id: 1,
          type: CouponType.CART_WISE,
          details: { threshold: 100, discount: 10 },
          is_active: true,
          max_usage: 5,
          usage_count: 5,
        },
      ];

      const result = service.calculateApplicableCoupons(coupons, mockCart);
      expect(result).toEqual([]);
    });

    it('should calculate cart-wise discount correctly', () => {
      const coupons = [
        {
          id: 1,
          type: CouponType.CART_WISE,
          details: { threshold: 100, discount: 10 },
          is_active: true,
        },
      ];

      const result = service.calculateApplicableCoupons(coupons, mockCart);
      expect(result).toHaveLength(1);
      expect(result[0].coupon_id).toBe(1);
      expect(result[0].type).toBe(CouponType.CART_WISE);
      expect(result[0].discount).toBe(13); // 10% of 130
    });

    it('should not apply cart-wise coupon when threshold not met', () => {
      const coupons = [
        {
          id: 1,
          type: CouponType.CART_WISE,
          details: { threshold: 200, discount: 10 },
          is_active: true,
        },
      ];

      const result = service.calculateApplicableCoupons(coupons, mockCart);
      expect(result).toEqual([]);
    });

    it('should calculate product-wise discount correctly', () => {
      const coupons = [
        {
          id: 1,
          type: CouponType.PRODUCT_WISE,
          details: { product_id: 1, discount: 20 },
          is_active: true,
        },
      ];

      const result = service.calculateApplicableCoupons(coupons, mockCart);
      expect(result).toHaveLength(1);
      expect(result[0].coupon_id).toBe(1);
      expect(result[0].type).toBe(CouponType.PRODUCT_WISE);
      expect(result[0].discount).toBe(20); // 20% of 100 (2 * 50)
    });

    it('should not apply product-wise coupon when product not in cart', () => {
      const coupons = [
        {
          id: 1,
          type: CouponType.PRODUCT_WISE,
          details: { product_id: 999, discount: 20 },
          is_active: true,
        },
      ];

      const result = service.calculateApplicableCoupons(coupons, mockCart);
      expect(result).toEqual([]);
    });

    it('should calculate BxGy discount correctly', () => {
      const cart: CartItemDto[] = [
        { product_id: 1, quantity: 6, price: 50 }, // Buy products
        { product_id: 2, quantity: 3, price: 30 }, // Buy products
        { product_id: 3, quantity: 2, price: 25 }, // Get products
      ];

      const coupons = [
        {
          id: 1,
          type: CouponType.BXGY,
          details: {
            buy_products: [
              { product_id: 1, quantity: 3 },
              { product_id: 2, quantity: 3 },
            ],
            get_products: [{ product_id: 3, quantity: 1 }],
            repetition_limit: 2,
          },
          is_active: true,
        },
      ];

      const result = service.calculateApplicableCoupons(coupons, cart);
      expect(result).toHaveLength(1);
      expect(result[0].coupon_id).toBe(1);
      expect(result[0].type).toBe(CouponType.BXGY);
      expect(result[0].discount).toBe(25); // 1 free item * 25
    });
  });

  describe('applyCouponToCart', () => {
    const mockCart: CartItemDto[] = [
      { product_id: 1, quantity: 2, price: 50 },
      { product_id: 2, quantity: 1, price: 30 },
    ];

    it('should apply cart-wise coupon correctly', () => {
      const coupon = {
        id: 1,
        type: CouponType.CART_WISE,
        details: { threshold: 100, discount: 10 },
        is_active: true,
      };

      const result = service.applyCouponToCart(coupon, mockCart);
      
      expect(result.total_price).toBe(130);
      expect(result.total_discount).toBe(13);
      expect(result.final_price).toBe(117);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].total_discount).toBe(10); // Proportional discount
      expect(result.items[1].total_discount).toBe(3); // Proportional discount
    });

    it('should apply product-wise coupon correctly', () => {
      const coupon = {
        id: 1,
        type: CouponType.PRODUCT_WISE,
        details: { product_id: 1, discount: 20 },
        is_active: true,
      };

      const result = service.applyCouponToCart(coupon, mockCart);
      
      expect(result.total_price).toBe(130);
      expect(result.total_discount).toBe(20);
      expect(result.final_price).toBe(110);
      expect(result.items[0].total_discount).toBe(20); // Only product 1 gets discount
      expect(result.items[1].total_discount).toBe(0); // Product 2 gets no discount
    });

    it('should apply BxGy coupon correctly', () => {
      const cart: CartItemDto[] = [
        { product_id: 1, quantity: 6, price: 50 },
        { product_id: 2, quantity: 3, price: 30 },
        { product_id: 3, quantity: 2, price: 25 },
      ];

      const coupon = {
        id: 1,
        type: CouponType.BXGY,
        details: {
          buy_products: [
            { product_id: 1, quantity: 3 },
            { product_id: 2, quantity: 3 },
          ],
          get_products: [{ product_id: 3, quantity: 1 }],
          repetition_limit: 2,
        },
        is_active: true,
      };

      const result = service.applyCouponToCart(coupon, cart);
      
      expect(result.total_price).toBe(440);
      expect(result.total_discount).toBe(25);
      expect(result.final_price).toBe(415);
      expect(result.items[2].total_discount).toBe(25); // 1 free item * 25
    });

    it('should throw error for unsupported coupon type', () => {
      const coupon = {
        id: 1,
        type: 'unsupported-type',
        details: {},
        is_active: true,
      };

      expect(() => service.applyCouponToCart(coupon, mockCart)).toThrow(
        'Unsupported coupon type: unsupported-type'
      );
    });
  });
}); 