# API Gateway - IMSQuty Microservices

Node.js-based API Gateway for routing requests to microservices.

## Features

- ✅ **Request Routing** - Routes to 10 microservices
- ✅ **JWT Authentication** - Validates JWT tokens
- ✅ **Rate Limiting** - 100 req/min general, 5 req/min for login
- ✅ **CORS Handling** - Configurable CORS
- ✅ **Logging** - Winston logger with file output
- ✅ **Health Checks** - `/health` endpoint
- ✅ **Error Handling** - Graceful error responses

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev

# Start production server
npm start
```

## Environment Variables

See `.env.example` for all configuration options.

## API Endpoints

- `GET /health` - Health check
- `GET /api/v1` - API info
- `POST /api/v1/auth/*` - Auth endpoints (no auth required)
- All other `/api/v1/*` - Requires JWT authentication

## Rate Limits

- **General API:** 100 requests/minute
- **Login:** 5 requests/minute
- **Response:** 429 Too Many Requests when exceeded

## JWT Token Format

```
Authorization: Bearer <token>
```

Token must be valid JWT signed with `JWT_SECRET`.

## Service Discovery

Automatically forwards requests to appropriate microservice based on route:

- `/api/v1/auth/*` → Auth Service (8001)
- `/api/v1/users/*` → User Service (8002)
- `/api/v1/assets/*` → Asset Service (8003)
- `/api/v1/tickets/*` → Ticket Service (8004)
- etc.

## Headers Forwarded to Services

- `X-User-Id` - Authenticated user ID
- `X-User-Email` - Authenticated user email
- `X-User-Roles` - User roles (JSON array)
- `X-Real-IP` - Client IP address
- `X-Forwarded-For` - Original client IP

## Error Responses

```json
{
  "success": false,
  "message": "Error description",
  "error": "Stack trace (if debug enabled)"
}
```

## Logging

Logs are written to:
- `combined.log` - All logs
- `error.log` - Error logs only
- Console - Development output

## Docker

```bash
# Build image
docker build -t imsquty-api-gateway .

# Run container
docker run -p 8000:8000 --env-file .env imsquty-api-gateway
```

## Testing

```bash
# Run tests
npm test

# Test health endpoint
curl http://localhost:8000/health
```

---

**Port:** 8000  
**Last Updated:** December 18, 2025
