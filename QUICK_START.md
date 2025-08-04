# Quick Start Guide

Get the Coupons Management API up and running in minutes!

## 🚀 Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- Docker (optional, for containerized setup)

## 📦 Option 1: Local Development

### 1. Clone and Install
```bash
git clone <repository-url>
cd coupons-management-api
npm install
```

### 2. Database Setup
```sql
CREATE DATABASE coupons_db;
```

### 3. Environment Configuration
```bash
cp env.example .env
# Edit .env with your database credentials
```

### 4. Start the Application
```bash
# Development mode with auto-reload
npm run start:dev

# Or production mode
npm run build
npm run start:prod
```

### 5. Seed Sample Data (Optional)
```bash
npm run seed
```

## 🐳 Option 2: Docker Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd coupons-management-api
```

### 2. Start with Docker Compose
```bash
docker-compose up -d
```

### 3. Seed Sample Data
```bash
docker-compose exec app npm run seed
```

## ✅ Verify Installation

1. **API Health Check**
   ```bash
   curl http://localhost:3000/coupons
   ```

2. **Swagger Documentation**
   Visit: http://localhost:3000/api

3. **Test Sample Coupons**
   ```bash
   # Get all coupons
   curl http://localhost:3000/coupons
   
   # Get applicable coupons for a cart
   curl -X POST http://localhost:3000/coupons/applicable-coupons \
     -H "Content-Type: application/json" \
     -d '{
       "cart": {
         "items": [
           {"product_id": 1, "quantity": 2, "price": 50},
           {"product_id": 2, "quantity": 1, "price": 30}
         ]
       }
     }'
   ```

## 🧪 Run Tests

```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 📚 Next Steps

1. **Explore the API**: Visit http://localhost:3000/api for interactive documentation
2. **Review Examples**: Check the README.md for detailed examples
3. **Run Tests**: Ensure all tests pass with `npm run test`
4. **Customize**: Modify coupon types and business logic as needed

## 🔧 Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database `coupons_db` exists

### Port Already in Use
- Change port in `.env`: `PORT=3001`
- Or kill existing process: `lsof -ti:3000 | xargs kill -9`

### Docker Issues
- Check Docker is running
- Remove existing containers: `docker-compose down -v`
- Rebuild: `docker-compose up --build`

## 📞 Support

- Check the main README.md for detailed documentation
- Review test cases for usage examples
- Open an issue for bugs or feature requests

---

**Happy coding! 🎉** 