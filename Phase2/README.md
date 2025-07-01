# Smart Library System - Phase 2 (Microservices)

This phase refactors the monolithic backend into three independent microservices: Book Service, User Service, and Loan Service. Each service is responsible for its own domain and communicates with others via REST APIs.

## Services Overview

### 1. Book Service
- Manages book catalog (CRUD)
- Tracks available and borrowed copies
- Exposes endpoints for book operations

### 2. User Service
- Handles user registration, authentication, and profiles
- Manages user roles (student, faculty, admin)
- Issues JWT tokens for authentication

### 3. Loan Service
- Manages book loans, returns, and extensions
- Tracks overdue loans and loan history
- Coordinates with Book and User services

## Tech Stack
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT for authentication (User Service)

## Getting Started

Each service is self-contained. To run a service:

1. Navigate to the service directory (e.g., `cd Phase2/book-service`)
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (see `.env.example` if available)
4. Start the service:
   ```bash
   npm start
   ```

Repeat for each service (`book-service`, `user-service`, `loan-service`).

## Service Endpoints

### Book Service
- `GET    /api/books`         List/search books
- `POST   /api/books`         Add a new book
- `PUT    /api/books/:id`     Update a book
- `DELETE /api/books/:id`     Delete a book

### User Service
- `POST   /api/users/register`   Register a new user
- `POST   /api/users/login`      Login and receive JWT
- `GET    /api/users/profile`    Get user profile

### Loan Service
- `POST   /api/loans`            Issue a loan
- `POST   /api/loans/returns`    Return a book
- `PUT    /api/loans/:id/extend` Extend a loan
- `GET    /api/loans/:user_id`   Get user's loan history



## Environment Variables
Each service should have its own `.env` file with relevant configuration (MongoDB URI, JWT secret, etc).

## License
This project is licensed under the ISC License.
