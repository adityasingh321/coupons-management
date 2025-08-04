FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port (Cloud Run uses PORT env var)
EXPOSE 8080

# Start the application
CMD ["node", "dist/main.js"] 