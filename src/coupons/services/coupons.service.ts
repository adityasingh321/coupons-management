import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from '../entities/coupon.entity';
import { CreateCouponDto, UpdateCouponDto } from '../dto/create-coupon.dto';
import { CartDto } from '../../common/dto/cart-item.dto';
import { CouponCalculatorService } from './coupon-calculator.service';
import { ApplicableCouponDto, ApplyCouponResponseDto } from '../dto/coupon-response.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    private readonly couponCalculatorService: CouponCalculatorService,
  ) {}

  /**
   * Create a new coupon
   */
  async create(createCouponDto: CreateCouponDto): Promise<Coupon> {
    const coupon = this.couponRepository.create({
      ...createCouponDto,
      expires_at: createCouponDto.expires_at ? new Date(createCouponDto.expires_at) : null,
    });

    return await this.couponRepository.save(coupon);
  }

  /**
   * Get all coupons
   */
  async findAll(): Promise<Coupon[]> {
    return await this.couponRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Get a specific coupon by ID
   */
  async findOne(id: number): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }
    
    return coupon;
  }

  /**
   * Update a coupon
   */
  async update(id: number, updateCouponDto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.findOne(id);
    
    const updatedCoupon = {
      ...coupon,
      ...updateCouponDto,
      expires_at: updateCouponDto.expires_at ? new Date(updateCouponDto.expires_at) : coupon.expires_at,
    };

    return await this.couponRepository.save(updatedCoupon);
  }

  /**
   * Delete a coupon
   */
  async remove(id: number): Promise<void> {
    const coupon = await this.findOne(id);
    await this.couponRepository.remove(coupon);
  }

  /**
   * Get applicable coupons for a cart
   */
  async getApplicableCoupons(cartDto: CartDto): Promise<{ applicable_coupons: ApplicableCouponDto[] }> {
    const coupons = await this.couponRepository.find({
      where: { is_active: true },
    });

    const applicableCoupons = this.couponCalculatorService.calculateApplicableCoupons(
      coupons,
      cartDto.items,
    );

    return { applicable_coupons: applicableCoupons };
  }

  /**
   * Apply a specific coupon to the cart
   */
  async applyCoupon(id: number, cartDto: CartDto): Promise<ApplyCouponResponseDto> {
    const coupon = await this.findOne(id);
    
    if (!coupon.is_active) {
      throw new BadRequestException('Coupon is not active');
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      throw new BadRequestException('Coupon has expired');
    }

    if (coupon.max_usage && coupon.usage_count >= coupon.max_usage) {
      throw new BadRequestException('Coupon usage limit exceeded');
    }

    // Check minimum cart value
    const cartTotal = cartDto.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    if (coupon.min_cart_value && cartTotal < coupon.min_cart_value) {
      throw new BadRequestException(`Minimum cart value of ${coupon.min_cart_value} required`);
    }

    // Apply coupon to cart
    const result = this.couponCalculatorService.applyCouponToCart(coupon, cartDto.items);

    // Increment usage count
    await this.incrementUsageCount(id);

    return {
      updated_cart: {
        items: result.items,
        total_price: result.total_price,
        total_discount: result.total_discount,
        final_price: result.final_price,
      },
    };
  }

  /**
   * Increment coupon usage count
   */
  private async incrementUsageCount(id: number): Promise<void> {
    await this.couponRepository.increment({ id }, 'usage_count', 1);
  }

  /**
   * Validate coupon details based on type
   */
  validateCouponDetails(type: string, details: any): boolean {
    switch (type) {
      case 'cart-wise':
        return this.validateCartWiseDetails(details);
      case 'product-wise':
        return this.validateProductWiseDetails(details);
      case 'bxgy':
        return this.validateBxGyDetails(details);
      default:
        return false;
    }
  }

  private validateCartWiseDetails(details: any): boolean {
    return details && 
           typeof details.threshold === 'number' && 
           details.threshold >= 0 &&
           typeof details.discount === 'number' && 
           details.discount >= 0 && 
           details.discount <= 100;
  }

  private validateProductWiseDetails(details: any): boolean {
    return details && 
           typeof details.product_id === 'number' && 
           details.product_id > 0 &&
           typeof details.discount === 'number' && 
           details.discount >= 0 && 
           details.discount <= 100;
  }

  private validateBxGyDetails(details: any): boolean {
    return details && 
           Array.isArray(details.buy_products) && 
           details.buy_products.length > 0 &&
           Array.isArray(details.get_products) && 
           details.get_products.length > 0 &&
           typeof details.repetition_limit === 'number' && 
           details.repetition_limit > 0 &&
           details.buy_products.every(p => p.product_id && p.quantity > 0) &&
           details.get_products.every(p => p.product_id && p.quantity > 0);
  }
} 