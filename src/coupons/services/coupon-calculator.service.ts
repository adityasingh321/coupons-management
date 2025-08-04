import { Injectable } from '@nestjs/common';
import { CouponType } from '../../common/enums/coupon-type.enum';
import { CartItemDto } from '../../common/dto/cart-item.dto';

export interface CartItemWithDiscount extends CartItemDto {
  total_discount: number;
}

export interface CartCalculationResult {
  items: CartItemWithDiscount[];
  total_price: number;
  total_discount: number;
  final_price: number;
}

@Injectable()
export class CouponCalculatorService {
  
  /**
   * Calculate applicable coupons for a given cart
   */
  calculateApplicableCoupons(coupons: any[], cart: CartItemDto[]): any[] {
    const applicableCoupons = [];
    const cartTotal = this.calculateCartTotal(cart);

    for (const coupon of coupons) {
      if (!this.isCouponValid(coupon)) {
        continue;
      }

      const discount = this.calculateCouponDiscount(coupon, cart, cartTotal);
      
      if (discount > 0) {
        applicableCoupons.push({
          coupon_id: coupon.id,
          type: coupon.type,
          discount,
          description: coupon.description,
          code: coupon.code,
        });
      }
    }

    return applicableCoupons;
  }

  /**
   * Apply a specific coupon to the cart
   */
  applyCouponToCart(coupon: any, cart: CartItemDto[]): CartCalculationResult {
    const cartTotal = this.calculateCartTotal(cart);
    const itemsWithDiscount = cart.map(item => ({ ...item, total_discount: 0 }));

    switch (coupon.type) {
      case CouponType.CART_WISE:
        return this.applyCartWiseCoupon(coupon, itemsWithDiscount, cartTotal);
      
      case CouponType.PRODUCT_WISE:
        return this.applyProductWiseCoupon(coupon, itemsWithDiscount, cartTotal);
      
      case CouponType.BXGY:
        return this.applyBxGyCoupon(coupon, itemsWithDiscount, cartTotal);
      
      default:
        throw new Error(`Unsupported coupon type: ${coupon.type}`);
    }
  }

  /**
   * Calculate cart total
   */
  private calculateCartTotal(cart: CartItemDto[]): number {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  /**
   * Check if coupon is valid (not expired, active, within usage limits)
   */
  private isCouponValid(coupon: any): boolean {
    if (!coupon.is_active) {
      return false;
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return false;
    }

    if (coupon.max_usage && coupon.usage_count >= coupon.max_usage) {
      return false;
    }

    return true;
  }

  /**
   * Calculate discount amount for a coupon
   */
  private calculateCouponDiscount(coupon: any, cart: CartItemDto[], cartTotal: number): number {
    if (coupon.min_cart_value && cartTotal < coupon.min_cart_value) {
      return 0;
    }

    switch (coupon.type) {
      case CouponType.CART_WISE:
        return this.calculateCartWiseDiscount(coupon, cartTotal);
      
      case CouponType.PRODUCT_WISE:
        return this.calculateProductWiseDiscount(coupon, cart);
      
      case CouponType.BXGY:
        return this.calculateBxGyDiscount(coupon, cart);
      
      default:
        return 0;
    }
  }

  /**
   * Calculate cart-wise discount
   */
  private calculateCartWiseDiscount(coupon: any, cartTotal: number): number {
    const { threshold, discount } = coupon.details;
    
    if (cartTotal < threshold) {
      return 0;
    }

    const discountAmount = (cartTotal * discount) / 100;
    return coupon.max_discount ? Math.min(discountAmount, coupon.max_discount) : discountAmount;
  }

  /**
   * Calculate product-wise discount
   */
  private calculateProductWiseDiscount(coupon: any, cart: CartItemDto[]): number {
    const { product_id, discount } = coupon.details;
    const productItem = cart.find(item => item.product_id === product_id);
    
    if (!productItem) {
      return 0;
    }

    const discountAmount = (productItem.price * productItem.quantity * discount) / 100;
    return coupon.max_discount ? Math.min(discountAmount, coupon.max_discount) : discountAmount;
  }

  /**
   * Calculate BxGy discount
   */
  private calculateBxGyDiscount(coupon: any, cart: CartItemDto[]): number {
    const { buy_products, get_products, repetition_limit } = coupon.details;
    
    // Calculate how many times the BxGy offer can be applied
    const buyProductCounts = this.getProductCounts(cart, buy_products.map(p => p.product_id));
    
    // Calculate total available buy products and total required
    let totalAvailable = 0;
    let totalRequired = 0;
    
    for (const buyProduct of buy_products) {
      const availableCount = buyProductCounts[buyProduct.product_id] || 0;
      totalAvailable += availableCount;
      totalRequired += buyProduct.quantity;
    }
    
    // Calculate how many times we can apply the offer
    let maxRepetitions = Math.floor(totalAvailable / totalRequired);
    
    // Apply repetition limit
    maxRepetitions = Math.min(maxRepetitions, repetition_limit);
    
    // Calculate total discount
    let totalDiscount = 0;
    for (const getProduct of get_products) {
      const productItem = cart.find(item => item.product_id === getProduct.product_id);
      if (productItem) {
        const freeQuantity = getProduct.quantity * maxRepetitions;
        const actualFreeQuantity = Math.min(freeQuantity, productItem.quantity);
        totalDiscount += actualFreeQuantity * productItem.price;
      }
    }
    
    return totalDiscount;
  }

  /**
   * Get product counts from cart
   */
  private getProductCounts(cart: CartItemDto[], productIds: number[]): Record<number, number> {
    const counts: Record<number, number> = {};
    
    for (const item of cart) {
      if (productIds.includes(item.product_id)) {
        counts[item.product_id] = (counts[item.product_id] || 0) + item.quantity;
      }
    }
    
    return counts;
  }

  /**
   * Apply cart-wise coupon to cart
   */
  private applyCartWiseCoupon(coupon: any, items: CartItemWithDiscount[], cartTotal: number): CartCalculationResult {
    const discount = this.calculateCartWiseDiscount(coupon, cartTotal);
    const discountRatio = discount / cartTotal;
    
    // Distribute discount proportionally across all items
    for (const item of items) {
      const itemTotal = item.price * item.quantity;
      item.total_discount = itemTotal * discountRatio;
    }
    
    return {
      items,
      total_price: cartTotal,
      total_discount: discount,
      final_price: cartTotal - discount,
    };
  }

  /**
   * Apply product-wise coupon to cart
   */
  private applyProductWiseCoupon(coupon: any, items: CartItemWithDiscount[], cartTotal: number): CartCalculationResult {
    const { product_id, discount } = coupon.details;
    const discountRatio = discount / 100;
    
    let totalDiscount = 0;
    
    for (const item of items) {
      if (item.product_id === product_id) {
        const itemTotal = item.price * item.quantity;
        item.total_discount = itemTotal * discountRatio;
        totalDiscount += item.total_discount;
      }
    }
    
    return {
      items,
      total_price: cartTotal,
      total_discount: totalDiscount,
      final_price: cartTotal - totalDiscount,
    };
  }

  /**
   * Apply BxGy coupon to cart
   */
  private applyBxGyCoupon(coupon: any, items: CartItemWithDiscount[], cartTotal: number): CartCalculationResult {
    const { buy_products, get_products, repetition_limit } = coupon.details;
    
    // Calculate how many times the BxGy offer can be applied
    const buyProductCounts = this.getProductCounts(items, buy_products.map(p => p.product_id));
    
    // Calculate total available buy products and total required
    let totalAvailable = 0;
    let totalRequired = 0;
    
    for (const buyProduct of buy_products) {
      const availableCount = buyProductCounts[buyProduct.product_id] || 0;
      totalAvailable += availableCount;
      totalRequired += buyProduct.quantity;
    }
    
    // Calculate how many times we can apply the offer
    let maxRepetitions = Math.floor(totalAvailable / totalRequired);
    
    // Apply repetition limit
    maxRepetitions = Math.min(maxRepetitions, repetition_limit);
    
    let totalDiscount = 0;
    
    // Apply discount to get products
    for (const getProduct of get_products) {
      const item = items.find(i => i.product_id === getProduct.product_id);
      if (item) {
        const freeQuantity = getProduct.quantity * maxRepetitions;
        const actualFreeQuantity = Math.min(freeQuantity, item.quantity);
        item.total_discount = actualFreeQuantity * item.price;
        totalDiscount += item.total_discount;
      }
    }
    
    return {
      items,
      total_price: cartTotal,
      total_discount: totalDiscount,
      final_price: cartTotal - totalDiscount,
    };
  }
} 