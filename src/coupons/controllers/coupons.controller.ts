import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CouponsService } from '../services/coupons.service';
import { CreateCouponDto, UpdateCouponDto } from '../dto';
import { CartDto } from '../../common/dto/cart-item.dto';
import { Coupon } from '../entities/coupon.entity';
import { ApplicableCouponDto, ApplyCouponResponseDto } from '../dto';

@ApiTags('coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new coupon' })
  @ApiResponse({ 
    status: 201, 
    description: 'Coupon created successfully',
    type: Coupon 
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid coupon data' })
  async create(@Body(ValidationPipe) createCouponDto: CreateCouponDto): Promise<Coupon> {
    return await this.couponsService.create(createCouponDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all coupons' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all coupons',
    type: [Coupon] 
  })
  async findAll(): Promise<Coupon[]> {
    return await this.couponsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific coupon by ID' })
  @ApiParam({ name: 'id', description: 'Coupon ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Coupon found',
    type: Coupon 
  })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Coupon> {
    return await this.couponsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a specific coupon' })
  @ApiParam({ name: 'id', description: 'Coupon ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Coupon updated successfully',
    type: Coupon 
  })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid update data' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateCouponDto: UpdateCouponDto,
  ): Promise<Coupon> {
    return await this.couponsService.update(id, updateCouponDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a specific coupon' })
  @ApiParam({ name: 'id', description: 'Coupon ID', type: 'number' })
  @ApiResponse({ status: 204, description: 'Coupon deleted successfully' })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.couponsService.remove(id);
  }

  @Post('applicable-coupons')
  @ApiOperation({ summary: 'Get all applicable coupons for a given cart' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of applicable coupons with calculated discounts',
    schema: {
      type: 'object',
      properties: {
        applicable_coupons: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              coupon_id: { type: 'number' },
              type: { type: 'string', enum: ['cart-wise', 'product-wise', 'bxgy'] },
              discount: { type: 'number' },
              description: { type: 'string' },
              code: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid cart data' })
  async getApplicableCoupons(
    @Body(ValidationPipe) cartDto: CartDto,
  ): Promise<{ applicable_coupons: ApplicableCouponDto[] }> {
    return await this.couponsService.getApplicableCoupons(cartDto);
  }

  @Post('apply-coupon/:id')
  @ApiOperation({ summary: 'Apply a specific coupon to the cart' })
  @ApiParam({ name: 'id', description: 'Coupon ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Coupon applied successfully',
    type: ApplyCouponResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Coupon cannot be applied' })
  async applyCoupon(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) cartDto: CartDto,
  ): Promise<ApplyCouponResponseDto> {
    return await this.couponsService.applyCoupon(id, cartDto);
  }
} 