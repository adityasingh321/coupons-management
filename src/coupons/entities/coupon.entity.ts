import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CouponType } from '../../common/enums/coupon-type.enum';

@Entity('coupons')
export class Coupon {
  @ApiProperty({ 
    description: 'Unique identifier of the coupon',
    example: 1
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ 
    enum: CouponType, 
    description: 'Type of coupon discount',
    example: 'cart-wise'
  })
  @Column({
    type: 'enum',
    enum: CouponType,
    nullable: false,
  })
  type: CouponType;

  @ApiProperty({ 
    description: 'Coupon details based on type',
    example: {
      threshold: 200.00,
      discount: 20.0
    }
  })
  @Column({ type: 'json', nullable: false })
  details: any;

  @ApiProperty({ 
    description: 'Whether coupon is active and can be used',
    example: true
  })
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @ApiProperty({ 
    description: 'Expiration date when coupon becomes invalid',
    example: '2024-12-31T23:59:59.000Z'
  })
  @Column({ type: 'datetime', nullable: true })
  expires_at: Date;

  @ApiProperty({ 
    description: 'Number of times this coupon has been used',
    example: 5
  })
  @Column({ type: 'int', default: 0 })
  usage_count: number;

  @ApiProperty({ 
    description: 'Maximum number of times this coupon can be used',
    example: 100
  })
  @Column({ type: 'int', nullable: true })
  max_usage: number;

  @ApiProperty({ 
    description: 'Minimum cart value required to apply this coupon',
    example: 50.00
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  min_cart_value: number;

  @ApiProperty({ 
    description: 'Maximum discount amount that can be applied',
    example: 100.00
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  max_discount: number;

  @ApiProperty({ 
    description: 'Human-readable description of the coupon offer',
    example: 'Get 20% off on orders above $200'
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ 
    description: 'Unique coupon code for customer use',
    example: 'SAVE20NOW'
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  code: string;

  @ApiProperty({ 
    description: 'Timestamp when the coupon was created',
    example: '2024-01-15T10:30:00.000Z'
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ 
    description: 'Timestamp when the coupon was last updated',
    example: '2024-01-15T10:30:00.000Z'
  })
  @UpdateDateColumn()
  updated_at: Date;
} 