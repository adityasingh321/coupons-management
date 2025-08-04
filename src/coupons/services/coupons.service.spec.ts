import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CouponCalculatorService } from './coupon-calculator.service';
import { Coupon } from '../entities/coupon.entity';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { CartDto } from '../../common/dto/cart-item.dto';
import { CouponType } from '../../common/enums/coupon-type.enum';

describe('CouponsService', () => {
  let service: CouponsService;
  let couponRepository: Repository<Coupon>;
  let calculatorService: CouponCalculatorService;

  const mockCouponRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    increment: jest.fn(),
  };

  const mockCalculatorService = {
    calculateApplicableCoupons: jest.fn(),
    applyCouponToCart: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponsService,
        {
          provide: getRepositoryToken(Coupon),
          useValue: mockCouponRepository,
        },
        {
          provide: CouponCalculatorService,
          useValue: mockCalculatorService,
        },
      ],
    }).compile();

    service = module.get<CouponsService>(CouponsService);
    couponRepository = module.get<Repository<Coupon>>(getRepositoryToken(Coupon));
    calculatorService = module.get<CouponCalculatorService>(CouponCalculatorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new coupon', async () => {
      const createCouponDto: CreateCouponDto = {
        type: CouponType.CART_WISE,
        details: { threshold: 100, discount: 10 },
        description: 'Test coupon',
      };

      const expectedCoupon = {
        id: 1,
        ...createCouponDto,
        is_active: true,
        usage_count: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockCouponRepository.create.mockReturnValue(expectedCoupon);
      mockCouponRepository.save.mockResolvedValue(expectedCoupon);

      const result = await service.create(createCouponDto);

      expect(mockCouponRepository.create).toHaveBeenCalledWith({
        ...createCouponDto,
        expires_at: null,
      });
      expect(mockCouponRepository.save).toHaveBeenCalledWith(expectedCoupon);
      expect(result).toEqual(expectedCoupon);
    });

    it('should handle expiration date', async () => {
      const createCouponDto: CreateCouponDto = {
        type: CouponType.CART_WISE,
        details: { threshold: 100, discount: 10 },
        expires_at: '2024-12-31T23:59:59.000Z',
      };

      const expectedCoupon = {
        id: 1,
        ...createCouponDto,
        expires_at: new Date('2024-12-31T23:59:59.000Z'),
        is_active: true,
        usage_count: 0,
      };

      mockCouponRepository.create.mockReturnValue(expectedCoupon);
      mockCouponRepository.save.mockResolvedValue(expectedCoupon);

      const result = await service.create(createCouponDto);

      expect(result.expires_at).toEqual(new Date('2024-12-31T23:59:59.000Z'));
    });
  });

  describe('findAll', () => {
    it('should return all coupons ordered by creation date', async () => {
      const expectedCoupons = [
        { id: 1, type: CouponType.CART_WISE, created_at: new Date('2024-01-02') },
        { id: 2, type: CouponType.PRODUCT_WISE, created_at: new Date('2024-01-01') },
      ];

      mockCouponRepository.find.mockResolvedValue(expectedCoupons);

      const result = await service.findAll();

      expect(mockCouponRepository.find).toHaveBeenCalledWith({
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(expectedCoupons);
    });
  });

  describe('findOne', () => {
    it('should return a coupon by ID', async () => {
      const expectedCoupon = {
        id: 1,
        type: CouponType.CART_WISE,
        details: { threshold: 100, discount: 10 },
      };

      mockCouponRepository.findOne.mockResolvedValue(expectedCoupon);

      const result = await service.findOne(1);

      expect(mockCouponRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(expectedCoupon);
    });

    it('should throw NotFoundException when coupon not found', async () => {
      mockCouponRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('Coupon with ID 999 not found');
    });
  });

  describe('update', () => {
    it('should update an existing coupon', async () => {
      const existingCoupon = {
        id: 1,
        type: CouponType.CART_WISE,
        details: { threshold: 100, discount: 10 },
        expires_at: null,
      };

      const updateDto = {
        type: CouponType.CART_WISE,
        details: { threshold: 150, discount: 15 },
        description: 'Updated coupon',
      };

      const expectedUpdatedCoupon = {
        ...existingCoupon,
        ...updateDto,
      };

      mockCouponRepository.findOne.mockResolvedValue(existingCoupon);
      mockCouponRepository.save.mockResolvedValue(expectedUpdatedCoupon);

      const result = await service.update(1, updateDto);

      expect(mockCouponRepository.save).toHaveBeenCalledWith(expectedUpdatedCoupon);
      expect(result).toEqual(expectedUpdatedCoupon);
    });

    it('should handle expiration date update', async () => {
      const existingCoupon = {
        id: 1,
        type: CouponType.CART_WISE,
        details: { threshold: 100, discount: 10 },
        expires_at: null,
      };

      const updateDto = {
        type: CouponType.CART_WISE,
        details: { threshold: 100, discount: 10 },
        expires_at: '2024-12-31T23:59:59.000Z',
      };

      const expectedUpdatedCoupon = {
        ...existingCoupon,
        expires_at: new Date('2024-12-31T23:59:59.000Z'),
      };

      mockCouponRepository.findOne.mockResolvedValue(existingCoupon);
      mockCouponRepository.save.mockResolvedValue(expectedUpdatedCoupon);

      const result = await service.update(1, updateDto);

      expect(result.expires_at).toEqual(new Date('2024-12-31T23:59:59.000Z'));
    });
  });

  describe('remove', () => {
    it('should remove an existing coupon', async () => {
      const existingCoupon = {
        id: 1,
        type: CouponType.CART_WISE,
        details: { threshold: 100, discount: 10 },
      };

      mockCouponRepository.findOne.mockResolvedValue(existingCoupon);
      mockCouponRepository.remove.mockResolvedValue(existingCoupon);

      await service.remove(1);

      expect(mockCouponRepository.remove).toHaveBeenCalledWith(existingCoupon);
    });

    it('should throw NotFoundException when trying to remove non-existent coupon', async () => {
      mockCouponRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getApplicableCoupons', () => {
    it('should return applicable coupons for a cart', async () => {
      const cartDto: CartDto = {
        items: [
          { product_id: 1, quantity: 2, price: 50 },
          { product_id: 2, quantity: 1, price: 30 },
        ],
      };

      const activeCoupons = [
        { id: 1, type: CouponType.CART_WISE, is_active: true },
        { id: 2, type: CouponType.PRODUCT_WISE, is_active: true },
      ];

      const applicableCoupons = [
        { coupon_id: 1, type: CouponType.CART_WISE, discount: 13 },
      ];

      mockCouponRepository.find.mockResolvedValue(activeCoupons);
      mockCalculatorService.calculateApplicableCoupons.mockReturnValue(applicableCoupons);

      const result = await service.getApplicableCoupons(cartDto);

      expect(mockCouponRepository.find).toHaveBeenCalledWith({
        where: { is_active: true },
      });
      expect(mockCalculatorService.calculateApplicableCoupons).toHaveBeenCalledWith(
        activeCoupons,
        cartDto.items,
      );
      expect(result).toEqual({ applicable_coupons: applicableCoupons });
    });
  });

  describe('applyCoupon', () => {
    const cartDto: CartDto = {
      items: [
        { product_id: 1, quantity: 2, price: 50 },
        { product_id: 2, quantity: 1, price: 30 },
      ],
    };

    it('should apply a valid coupon to cart', async () => {
      const coupon = {
        id: 1,
        type: CouponType.CART_WISE,
        details: { threshold: 100, discount: 10 },
        is_active: true,
        usage_count: 0,
        max_usage: 10,
      };

      const calculationResult = {
        items: [
          { product_id: 1, quantity: 2, price: 50, total_discount: 10 },
          { product_id: 2, quantity: 1, price: 30, total_discount: 3 },
        ],
        total_price: 130,
        total_discount: 13,
        final_price: 117,
      };

      mockCouponRepository.findOne.mockResolvedValue(coupon);
      mockCalculatorService.applyCouponToCart.mockReturnValue(calculationResult);
      mockCouponRepository.increment.mockResolvedValue(undefined);

      const result = await service.applyCoupon(1, cartDto);

      expect(mockCouponRepository.increment).toHaveBeenCalledWith({ id: 1 }, 'usage_count', 1);
      expect(result).toEqual({
        updated_cart: calculationResult,
      });
    });

    it('should throw BadRequestException for inactive coupon', async () => {
      const coupon = {
        id: 1,
        type: CouponType.CART_WISE,
        details: { threshold: 100, discount: 10 },
        is_active: false,
      };

      mockCouponRepository.findOne.mockResolvedValue(coupon);

      await expect(service.applyCoupon(1, cartDto)).rejects.toThrow(BadRequestException);
      await expect(service.applyCoupon(1, cartDto)).rejects.toThrow('Coupon is not active');
    });

    it('should throw BadRequestException for expired coupon', async () => {
      const coupon = {
        id: 1,
        type: CouponType.CART_WISE,
        details: { threshold: 100, discount: 10 },
        is_active: true,
        expires_at: new Date('2020-01-01'),
      };

      mockCouponRepository.findOne.mockResolvedValue(coupon);

      await expect(service.applyCoupon(1, cartDto)).rejects.toThrow(BadRequestException);
      await expect(service.applyCoupon(1, cartDto)).rejects.toThrow('Coupon has expired');
    });

    it('should throw BadRequestException when usage limit exceeded', async () => {
      const coupon = {
        id: 1,
        type: CouponType.CART_WISE,
        details: { threshold: 100, discount: 10 },
        is_active: true,
        usage_count: 5,
        max_usage: 5,
      };

      mockCouponRepository.findOne.mockResolvedValue(coupon);

      await expect(service.applyCoupon(1, cartDto)).rejects.toThrow(BadRequestException);
      await expect(service.applyCoupon(1, cartDto)).rejects.toThrow('Coupon usage limit exceeded');
    });

    it('should throw BadRequestException when minimum cart value not met', async () => {
      const coupon = {
        id: 1,
        type: CouponType.CART_WISE,
        details: { threshold: 100, discount: 10 },
        is_active: true,
        min_cart_value: 200,
      };

      mockCouponRepository.findOne.mockResolvedValue(coupon);

      await expect(service.applyCoupon(1, cartDto)).rejects.toThrow(BadRequestException);
      await expect(service.applyCoupon(1, cartDto)).rejects.toThrow('Minimum cart value of 200 required');
    });
  });

  describe('validateCouponDetails', () => {
    it('should validate cart-wise coupon details', () => {
      const validDetails = { threshold: 100, discount: 10 };
      const invalidDetails = { threshold: -10, discount: 150 };

      expect(service.validateCouponDetails('cart-wise', validDetails)).toBe(true);
      expect(service.validateCouponDetails('cart-wise', invalidDetails)).toBe(false);
    });

    it('should validate product-wise coupon details', () => {
      const validDetails = { product_id: 1, discount: 20 };
      const invalidDetails = { product_id: 0, discount: 150 };

      expect(service.validateCouponDetails('product-wise', validDetails)).toBe(true);
      expect(service.validateCouponDetails('product-wise', invalidDetails)).toBe(false);
    });

    it('should validate BxGy coupon details', () => {
      const validDetails = {
        buy_products: [{ product_id: 1, quantity: 2 }],
        get_products: [{ product_id: 2, quantity: 1 }],
        repetition_limit: 3,
      };
      const invalidDetails = {
        buy_products: [],
        get_products: [{ product_id: 2, quantity: 1 }],
        repetition_limit: 0,
      };

      expect(service.validateCouponDetails('bxgy', validDetails)).toBe(true);
      expect(service.validateCouponDetails('bxgy', invalidDetails)).toBe(false);
    });

    it('should return false for unsupported coupon types', () => {
      expect(service.validateCouponDetails('unsupported', {})).toBe(false);
    });
  });
}); 