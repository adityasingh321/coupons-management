import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from '../coupons/entities/coupon.entity';
import { CouponType } from '../common/enums/coupon-type.enum';

@Injectable()
export class SampleDataSeeder {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  async seed(): Promise<void> {
    const existingCoupons = await this.couponRepository.count();
    
    if (existingCoupons > 0) {
      console.log('Sample data already exists, skipping seeding...');
      return;
    }

    const sampleCoupons = [
      // Cart-wise coupons
      {
        type: CouponType.CART_WISE,
        details: {
          threshold: 100,
          discount: 10,
        },
        description: '10% off on orders over $100',
        code: 'SAVE10',
        max_discount: 50,
        is_active: true,
      },
      {
        type: CouponType.CART_WISE,
        details: {
          threshold: 200,
          discount: 15,
        },
        description: '15% off on orders over $200',
        code: 'SAVE15',
        max_discount: 100,
        is_active: true,
      },

      // Product-wise coupons
      {
        type: CouponType.PRODUCT_WISE,
        details: {
          product_id: 1,
          discount: 20,
        },
        description: '20% off on Product 1',
        code: 'PROD1_20',
        is_active: true,
      },
      {
        type: CouponType.PRODUCT_WISE,
        details: {
          product_id: 2,
          discount: 25,
        },
        description: '25% off on Product 2',
        code: 'PROD2_25',
        is_active: true,
      },

      // BxGy coupons
      {
        type: CouponType.BXGY,
        details: {
          buy_products: [
            { product_id: 1, quantity: 3 },
            { product_id: 2, quantity: 3 },
          ],
          get_products: [{ product_id: 3, quantity: 1 }],
          repetition_limit: 2,
        },
        description: 'Buy 3 of Product 1 or 2, get 1 of Product 3 free',
        code: 'B2G1',
        is_active: true,
      },
      {
        type: CouponType.BXGY,
        details: {
          buy_products: [{ product_id: 1, quantity: 2 }],
          get_products: [{ product_id: 2, quantity: 1 }],
          repetition_limit: 3,
        },
        description: 'Buy 2 of Product 1, get 1 of Product 2 free',
        code: 'B2G1_SIMPLE',
        is_active: true,
      },

      // Expired coupon example
      {
        type: CouponType.CART_WISE,
        details: {
          threshold: 50,
          discount: 5,
        },
        description: 'Expired coupon - 5% off on orders over $50',
        code: 'EXPIRED',
        expires_at: new Date('2020-01-01'),
        is_active: true,
      },

      // Usage limited coupon
      {
        type: CouponType.PRODUCT_WISE,
        details: {
          product_id: 3,
          discount: 30,
        },
        description: '30% off on Product 3 (limited usage)',
        code: 'LIMITED',
        max_usage: 5,
        usage_count: 3,
        is_active: true,
      },

      // Inactive coupon
      {
        type: CouponType.CART_WISE,
        details: {
          threshold: 150,
          discount: 12,
        },
        description: 'Inactive coupon - 12% off on orders over $150',
        code: 'INACTIVE',
        is_active: false,
      },
    ];

    for (const couponData of sampleCoupons) {
      const coupon = this.couponRepository.create(couponData);
      await this.couponRepository.save(coupon);
    }

    console.log(`Seeded ${sampleCoupons.length} sample coupons`);
  }
} 