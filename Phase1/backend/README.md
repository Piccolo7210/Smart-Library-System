# Smart Library System - Phase 1 (Monolithic Backend)

A monolithic Node.js backend for managing a smart library system. This service handles user authentication, book management, and loan processing in a single application.

## Features

- User registration, login, and profile management
- Book CRUD operations (add, update, delete, search)
- Loan management (issue, return, extend)
- Role-based access control (student, faculty, admin)
- Statistics endpoints for popular books and active users

## Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT for authentication (not used here in this phase)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB instance (local or cloud)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/piccolo7210/Smart-Library-System.git
   cd Smart-Library-System/Phase1/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the example environment file and configure it:
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```

### Running the Server

- Development mode:
  ```bash
  npm run dev
  ```
- Production mode:
  ```bash
  npm start
  ```

## Project Structure

```
backend/
  config/           # Database connection
  controllers/      # Route logic for users, books, loans
  middleware/       # Authentication middleware
  models/           # Mongoose schemas
  routes/           # Express route definitions
  .env              # Environment variables
  .gitignore        # Ignored files
  package.json      # Dependencies and scripts
  server.js         # App entry point
```

## API Overview

- `POST   /api/users/register`   Register a new user
- `POST   /api/users/login`      Login and receive JWT
- `GET    /api/books`            List/search books
- `POST   /api/books`            Add a new book
- `PUT    /api/books/:id`        Update a book
- `DELETE /api/books/:id`        Delete a book
- `POST   /api/loans`            Issue a loan
- `POST   /api/loans/returns`    Return a book
- `PUT    /api/loans/:id/extend` Extend a loan
- `GET    /api/stats/overview`   System statistics

## Environment Variables

Create a `.env` file in the backend directory with the following:

```
MONGODB_URI=your_mongodb_uri
PORT=3000
JWT_SECRET=your_jwt_secret
```


