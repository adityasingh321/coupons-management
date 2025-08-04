import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponsController } from './controllers/coupons.controller';
import { CouponsService } from './services/coupons.service';
import { CouponCalculatorService } from './services/coupon-calculator.service';
import { Coupon } from './entities/coupon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon])],
  controllers: [CouponsController],
  providers: [CouponsService, CouponCalculatorService],
  exports: [CouponsService, CouponCalculatorService, TypeOrmModule],
})
export class CouponsModule {} 