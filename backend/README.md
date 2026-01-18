# Co-founder & Investor Matchmaking Platform - Backend

Backend API for a matchmaking platform connecting founders with investors.

## 🏗️ Architecture

This backend follows a **Layered Architecture** (Modular Monolith) for scalability and maintainability.

```
backend/
├── app.js                      # Main entry point (Express + Socket.io)
├── .env                        # Environment variables (not in git)
├── .env.example                # Environment variables template
├── package.json
├── models/
│   └── User.js                 # Mongoose schema
├── middleware/
│   ├── auth.js                 # Clerk authentication
│   ├── upload.js               # Cloudinary file upload (auto-resize 400x400)
│   └── rateLimiter.js          # Upstash rate limiting
├── functionality/
│   ├── matchAlgorithm.js       # Match scoring logic
│   └── imageCleaner.js         # Cloudinary garbage collection
├── controllers/
│   ├── userController.js       # User profile management
│   └── matchController.js      # Match recommendations
└── routes/
    ├── userRoutes.js           # User API routes
    └── matchRoutes.js          # Match API routes
```

## 🚀 Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js 5.x
- **Database:** MongoDB (via Mongoose)
- **Authentication:** Clerk (`@clerk/express`)
- **Rate Limiting:** Upstash Redis
- **File Storage:** Cloudinary
- **Real-time:** Socket.io

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB running (local or Atlas)
- Accounts set up for:
  - [Clerk](https://dashboard.clerk.com) (Authentication)
  - [Cloudinary](https://console.cloudinary.com) (Image storage)
  - [Upstash](https://console.upstash.com) (Redis for rate limiting)

## 🔧 Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Fill in all required values (see Configuration section below)

3. **Start the server:**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## ⚙️ Configuration

Copy `.env.example` to `.env` and configure the following:

### Server Settings
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### MongoDB
```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/ideal-founders

# OR MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ideal-founders
```

### Clerk (Authentication)
Get from: https://dashboard.clerk.com
```env
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Cloudinary (Image Storage)
Get from: https://console.cloudinary.com
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Upstash Redis (Rate Limiting)
Get from: https://console.upstash.com
```env
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

## 🔌 API Endpoints

### Health Check
- `GET /health` - Server health status

### User Management (CRUD)
- `GET /api/users/me` - Get current user profile (Protected)
- `POST /api/users/onboard` - Create/update user profile (Protected, multipart/form-data)
  - Fields: `fullName`, `bio`, `role`, `skills`, `lookingFor`
  - File: `avatar` (auto-resized to 400x400)
- `DELETE /api/users/me` - Delete user profile and avatar (Protected)

### Matchmaking
- `GET /api/matches/recommendations` - Get top 10 match recommendations (Protected)
  - **Query Parameters:**
    - `filter=opposite` (default) - Find opposite role (founders see investors, investors see founders)
    - `filter=same` - Find same role (founders see other founders for co-founder matching)

### Rate Limiting
All `/api/*` routes are rate-limited to **10 requests per 10 seconds** per user/IP.

## 🔄 Real-time Features (Socket.io)

### Events

**Client → Server:**
- `join-room` - Join a chat room
  ```javascript
  socket.emit('join-room', roomId);
  ```
- `send-message` - Send a message to room
  ```javascript
  socket.emit('send-message', {
    roomId,
    message,
    senderId,
    senderName,
    timestamp
  });
  ```

**Server → Client:**
- `receive-message` - Receive messages from room
  ```javascript
  socket.on('receive-message', (data) => {
    // { message, senderId, senderName, timestamp }
  });
  ```

## 🧪 Testing

Health check:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-18T16:05:00.000Z",
  "uptime": 123.456
}
```

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin protection
- **Rate Limiting** - Upstash sliding window (10 req/10s)
- **Clerk Authentication** - Secure user authentication
- **Image Validation** - File type and size limits (5MB max)

## 📦 Key Features

### Match Algorithm
- +10 points per shared skill
- +20 points for matching industry
- Returns top 10 matches sorted by score

### Image Management
- Auto-resize all uploads to 400x400 (crop: cover)
- Automatic cleanup of old avatars when updating
- Optimized for bandwidth and storage costs

### Database Schema
User model includes:
- Clerk ID (unique, indexed)
- Role (founder/investor)
- Skills (array)
- Looking for (role + industry)
- Avatar (URL + public ID for deletion)

## 🐛 Troubleshooting

**MongoDB connection failed:**
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`

**Clerk authentication errors:**
- Verify Clerk keys are correct
- Ensure frontend uses same Clerk project

**Cloudinary upload fails:**
- Check Cloudinary credentials
- Verify file size is under 5MB

**Rate limit errors:**
- Verify Upstash Redis credentials
- Check Redis URL is accessible

## 📄 License

ISC
