# Smart Library System - Phase 3 (Microservices with NGINX)

This phase extends the microservices architecture by introducing an NGINX reverse proxy for unified API access, load balancing, and centralized logging. The system consists of three Node.js microservices (Book, User, Loan) and an NGINX gateway.

## Architecture Overview

- **NGINX**: Acts as a reverse proxy, routing API requests to the appropriate microservice and handling logging.
- **Book Service**: Manages book catalog and operations.
- **User Service**: Handles user registration, authentication, and profiles.
- **Loan Service**: Manages book loans, returns, and extensions.

## Features
- Unified API endpoint via NGINX
- Service isolation and independent scaling
- Centralized access and error logging (see `logs/`)

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- NGINX

### Setup Steps

1. **Start MongoDB** (if not already running)
2. **Install dependencies for each service:**
   ```bash
   cd Phase3/book-service && npm install
   cd ../user-service && npm install
   cd ../loan-service && npm install
   ```
3. **Configure environment variables** for each service (see `.env.example` if available)
4. **Start all microservices:**
   ```bash
   # In separate terminals or using a process manager like pm2
   npm start --prefix Phase3/book-service
   npm start --prefix Phase3/user-service
   npm start --prefix Phase3/loan-service
   ```
5. **Configure and start NGINX:**
   - Edit `Phase3/nginx.conf` if needed (default config routes /api/books, /api/users, /api/loans)
   - Start NGINX:
     ```bash
     sudo nginx -c $(pwd)/Phase3/nginx.conf
     ```

## API Gateway Endpoints (via NGINX)
- `/api/books` → Book Service
- `/api/users` → User Service
- `/api/loans` → Loan Service

## Logs
- All access and error logs are stored in `Phase3/logs/`

