# Coupons Management API

A robust RESTful API for managing and applying different types of discount coupons in an e-commerce platform. Built with NestJS, TypeORM, and MySQL, this API provides comprehensive coupon management capabilities with support for cart-wise, product-wise, and Buy X Get Y (BxGy) discount types.

## 🚀 Features

- **Multiple Coupon Types**: Support for cart-wise, product-wise, and BxGy coupons
- **Flexible Discount Logic**: Complex discount calculations with various constraints
- **Comprehensive API**: Full CRUD operations for coupons
- **Cart Integration**: Apply coupons to shopping carts with real-time discount calculations
- **Validation & Error Handling**: Robust input validation and error management
- **Swagger Documentation**: Interactive API documentation
- **Unit Testing**: Comprehensive test coverage
- **Extensible Architecture**: Easy to add new coupon types in the future

## 📋 Table of Contents

- [Installation](#-installation)
- [Configuration](#-configuration)
- [API Endpoints](#-api-endpoints)
- [Coupon Types & Use Cases](#-coupon-types--use-cases)
- [Examples](#-examples)
- [Testing](#-testing)
- [Architecture](#-architecture)
- [Assumptions & Limitations](#-assumptions--limitations)
- [Future Enhancements](#-future-enhancements)

## 🛠 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd coupons-management-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up MySQL database**
   ```sql
   CREATE DATABASE coupons_db;
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run build
   npm run start:prod
   ```

## ⚙️ Configuration

The application uses environment variables for configuration. Key settings:

- `DB_HOST`: MySQL host (default: localhost)
- `DB_PORT`: MySQL port (default: 3306)
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `DB_DATABASE`: Database name
- `PORT`: Application port (default: 3000)

## 🔌 API Endpoints

### Coupon Management
- `POST /coupons` - Create a new coupon
- `GET /coupons` - Get all coupons
- `GET /coupons/:id` - Get a specific coupon
- `PUT /coupons/:id` - Update a coupon
- `DELETE /coupons/:id` - Delete a coupon

### Cart Operations
- `POST /coupons/applicable-coupons` - Get applicable coupons for a cart
- `POST /coupons/apply-coupon/:id` - Apply a specific coupon to cart

### Swagger Documentation
Visit `http://localhost:3000/api` for interactive API documentation.

## 🎫 Coupon Types & Use Cases

### 1. Cart-Wise Coupons

**Purpose**: Apply discounts to the entire cart based on total value.

**Implemented Cases**:
- ✅ Percentage discount on cart total above threshold
- ✅ Maximum discount cap
- ✅ Minimum cart value requirement
- ✅ Proportional discount distribution across items

**Example**: 10% off on carts over $100
```json
{
  "type": "cart-wise",
  "details": {
    "threshold": 100,
    "discount": 10
  },
  "max_discount": 50
}
```

**Edge Cases Handled**:
- Cart total below threshold (no discount applied)
- Maximum discount cap enforcement
- Zero or negative cart values
- Multiple items with proportional discount distribution

### 2. Product-Wise Coupons

**Purpose**: Apply discounts to specific products in the cart.

**Implemented Cases**:
- ✅ Percentage discount on specific products
- ✅ Multiple quantity support
- ✅ Maximum discount cap per product

**Example**: 20% off on Product A
```json
{
  "type": "product-wise",
  "details": {
    "product_id": 1,
    "discount": 20
  }
}
```

**Edge Cases Handled**:
- Product not in cart (no discount applied)
- Multiple quantities of same product
- Zero or negative product prices
- Product with zero quantity

### 3. Buy X Get Y (BxGy) Coupons

**Purpose**: Buy specified quantities of certain products, get others for free.

**Implemented Cases**:
- ✅ Buy X products from one set, get Y products from another set
- ✅ Repetition limits
- ✅ Multiple product combinations
- ✅ Complex quantity calculations

**Example**: Buy 2 products from [X, Y, Z], get 1 product from [A, B, C] free
```json
{
  "type": "bxgy",
  "details": {
    "buy_products": [
      {"product_id": 1, "quantity": 3},
      {"product_id": 2, "quantity": 3}
    ],
    "get_products": [
      {"product_id": 3, "quantity": 1}
    ],
    "repetition_limit": 2
  }
}
```

**Edge Cases Handled**:
- Insufficient buy products (no discount)
- Insufficient get products (limited by available quantity)
- Repetition limit enforcement
- Complex product combinations
- Partial fulfillment scenarios

## 📊 Additional Use Cases Considered

### Implemented Advanced Features

1. **Coupon Expiration**
   - ✅ Expiration date validation
   - ✅ Automatic filtering of expired coupons

2. **Usage Limits**
   - ✅ Maximum usage count per coupon
   - ✅ Usage tracking and increment

3. **Cart Value Constraints**
   - ✅ Minimum cart value requirements
   - ✅ Maximum discount caps

4. **Coupon Status Management**
   - ✅ Active/inactive coupon status
   - ✅ Bulk status updates

### Complex Scenarios Handled

1. **Multiple Coupon Types in Same Cart**
   - System can identify all applicable coupons
   - Each coupon type calculated independently

2. **BxGy with Complex Constraints**
   - Multiple buy products with different quantities
   - Multiple get products with different quantities
   - Repetition limits with partial fulfillment

3. **Edge Case Calculations**
   - Zero quantities
   - Negative prices (rejected)
   - Fractional discounts (rounded appropriately)
   - Maximum discount enforcement

## 🧪 Examples

### Creating a Cart-Wise Coupon
```bash
curl -X POST http://localhost:3000/coupons \
  -H "Content-Type: application/json" \
  -d '{
    "type": "cart-wise",
    "details": {
      "threshold": 100,
      "discount": 10
    },
    "description": "10% off on orders over $100",
    "max_discount": 50
  }'
```

### Getting Applicable Coupons
```bash
curl -X POST http://localhost:3000/coupons/applicable-coupons \
  -H "Content-Type: application/json" \
  -d '{
    "cart": {
      "items": [
        {"product_id": 1, "quantity": 6, "price": 50},
        {"product_id": 2, "quantity": 3, "price": 30},
        {"product_id": 3, "quantity": 2, "price": 25}
      ]
    }
  }'
```

### Applying a Coupon
```bash
curl -X POST http://localhost:3000/coupons/apply-coupon/1 \
  -H "Content-Type: application/json" \
  -d '{
    "cart": {
      "items": [
        {"product_id": 1, "quantity": 6, "price": 50},
        {"product_id": 2, "quantity": 3, "price": 30},
        {"product_id": 3, "quantity": 2, "price": 25}
      ]
    }
  }'
```

## 🧪 Testing

Run the test suite:

```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

The test suite covers:
- ✅ Coupon calculation logic
- ✅ Edge cases and error scenarios
- ✅ Different coupon types
- ✅ Complex BxGy scenarios
- ✅ Validation and constraints

## 🏗 Architecture

### Core Components

1. **CouponCalculatorService**: Handles complex discount calculations
2. **CouponsService**: Manages CRUD operations and business logic
3. **CouponsController**: Exposes REST endpoints
4. **TypeORM Entities**: Database models and relationships

### Design Patterns

- **Strategy Pattern**: Different calculation strategies for each coupon type
- **Factory Pattern**: Easy addition of new coupon types
- **Repository Pattern**: Clean data access layer
- **DTO Pattern**: Input/output validation and transformation

### Extensibility

The system is designed for easy extension:
- New coupon types can be added by implementing calculation strategies
- Additional constraints can be added to existing types
- Database schema supports flexible coupon details storage

## ⚠️ Assumptions & Limitations

### Current Assumptions

1. **Product Management**: Products are managed externally; only product IDs are used
2. **User Management**: No user authentication/authorization implemented
3. **Cart Persistence**: Carts are not persisted; only calculations are performed
4. **Currency**: All amounts are in the same currency (no multi-currency support)
5. **Concurrent Usage**: No handling of concurrent coupon usage
6. **Inventory**: No inventory validation during coupon application

### Implementation Limitations

1. **Single Coupon Application**: Only one coupon can be applied at a time
2. **No Coupon Stacking**: Multiple coupons cannot be combined
3. **No User-Specific Coupons**: All coupons are global (no per-user limits)
4. **No Geographic Restrictions**: No location-based coupon restrictions
5. **No Time-Based Restrictions**: No specific time windows (only expiration dates)
6. **No Category-Based Coupons**: No support for product category discounts

### Technical Limitations

1. **Database**: MySQL-specific features used
2. **Performance**: No caching layer for frequently accessed coupons
3. **Scalability**: No distributed system considerations
4. **Monitoring**: No comprehensive logging or monitoring

## 🔮 Future Enhancements

### High Priority
1. **Coupon Stacking**: Allow multiple coupons to be applied simultaneously
2. **User-Specific Coupons**: Per-user usage limits and restrictions
3. **Category-Based Coupons**: Discounts on product categories
4. **Time-Based Restrictions**: Specific time windows for coupon validity
5. **Geographic Restrictions**: Location-based coupon availability

### Medium Priority
1. **Caching Layer**: Redis integration for performance
2. **Analytics**: Coupon usage analytics and reporting
3. **Bulk Operations**: Bulk coupon creation and management
4. **Advanced BxGy**: More complex buy-get combinations
5. **Coupon Templates**: Reusable coupon templates

### Low Priority
1. **Multi-Currency Support**: Different currencies for different regions
2. **Inventory Integration**: Real-time inventory validation
3. **Machine Learning**: Smart coupon recommendations
4. **A/B Testing**: Coupon effectiveness testing
5. **Advanced Analytics**: Predictive analytics for coupon performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or issues:
1. Check the Swagger documentation at `/api`
2. Review the test cases for usage examples
3. Open an issue in the repository

---

**Note**: This implementation focuses on core coupon functionality with a solid foundation for future enhancements. The architecture is designed to be scalable and maintainable, making it easy to add new features as business requirements evolve. 