# 📁 File Upload & Processing API

A Node.js-based backend service that allows users to upload files (text, image, video, etc.), processes them using background workers (BullMQ + Redis), and stores metadata and extracted data in PostgreSQL via Prisma ORM.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL**
- **Redis Stack** (via Docker)

### Installation

1. **Start Redis Stack**
   ```bash
   docker run -d --name redis-stack -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
   ```
   
   RedisInsight UI will be available at: **http://localhost:8001**

2. **Clone and Setup**
   ```bash
   # Clone the repository
   git clone https://github.com/nikhilmohite123/File-uploader.git
   cd your-repo
   
   # Install dependencies
   npm install
   
   # Set up environment variables
   cp .env.example .env
   
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   
   # Start the server
   node server.js
   ```

---

## 🔐 Authentication Flow

1. **Register** → Create new account
2. **Login** → Get JWT token
3. **Use token** → Add `Authorization: Bearer <token>` header to requests

---

## 📚 API Documentation

### Authentication

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass"
}
```

#### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepass"
}
```

**Response:**
```json
{
  "token": "JWT_TOKEN_HERE"
}
```

### File Operations

#### Upload File
```http
POST /upload
Authorization: Bearer <token>
```

**Form Data:**
- `file` (multipart/form-data) - **Required**
- `title` (string) - *Optional*
- `description` (string) - *Optional*

#### Get File Metadata
```http
GET /files/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "originalFilename": "sample.pdf",
  "title": "My File",
  "status": "PROCESSED",
  "extractedData": "File type: PDF\nSHA-256: ....",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### List User Files
```http
GET /files?page=1
Authorization: Bearer <token>
```

Returns paginated list of files for the authenticated user.

---

## 🛠️ Tech Stack

- **Backend:** Node.js + Express
- **Database:** PostgreSQL with Prisma ORM
- **Queue System:** Redis + BullMQ for background processing
- **Authentication:** JWT tokens
- **File Processing:** Background workers for async processing

---

## 📁 Project Structure

```
├── server.js           # Main application entry point
├── routes/             # API route handlers
├── middleware/         # Authentication & validation
├── jobs/               # Background job processors
├── prisma/             # Database schema & migrations
├── uploads/            # Temporary file storage
├── config/             # All configuration files
├── controller/         # All router controllers
└── validation/         # Input validation schemas
```
