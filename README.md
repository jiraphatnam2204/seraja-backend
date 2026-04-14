# SERaja Backend API

Express + MongoDB backend for authentication, campgrounds, and bookings.

## Tech Stack

- Node.js + Express (CommonJS)
- MongoDB + Mongoose
- JWT authentication
- Swagger UI (`/api-docs`) from `openapi.yaml`

## Project Structure

```text
.
├─ config/
├─ controllers/
├─ middleware/
├─ models/
├─ routes/
├─ seeds/
├─ openapi.yaml
└─ server.js
```

## Environment Variables

Create `config/config.env`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
CORS_ORIGIN=http://localhost:3000
```

## Installation and Run

```bash
npm install
npm run dev
```

Production mode:

```bash
npm start
```

## Available Scripts

- `npm run dev` Start with nodemon.
- `npm start` Start with Node.
- `npm run format` Format with Prettier.
- `npm run gen:types` Generate TypeScript API types from `openapi.yaml` to `types/generated.ts`.
- `npm run seed` Seed demo data.
- `npm run seed:delete` Delete all data.

## API Base URL

- Local: `http://localhost:5000`
- Base path: `/api/v1`

## API Documentation

- Swagger UI: `GET /api-docs`
- OpenAPI file: `openapi.yaml`

## Authentication

- Login/register returns a JWT token.
- For protected routes, send:

```http
Authorization: Bearer <token>
```

Roles in the system:

- `user`
- `campOwner`
- `admin`

## Main Endpoints

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me` (protected)
- `GET /api/v1/auth/logout` (protected)

### Campgrounds

- `GET /api/v1/campgrounds`
- `GET /api/v1/campgrounds/:id`
- `POST /api/v1/campgrounds` (admin)
- `PUT /api/v1/campgrounds/:id` (admin or owner)
- `DELETE /api/v1/campgrounds/:id` (admin)

### Bookings

- `GET /api/v1/bookings` (protected, role-scoped data)
- `GET /api/v1/bookings/:id` (protected)
- `PUT /api/v1/bookings/:id` (protected)
- `DELETE /api/v1/bookings/:id` (protected)
- `PUT /api/v1/bookings/:id/cancel` (protected)
- `PUT /api/v1/bookings/:id/checkin` (campOwner)
- `PUT /api/v1/bookings/:id/checkout` (campOwner)
- `GET /api/v1/bookings/export` (campOwner/admin, CSV)
- `GET /api/v1/bookings/today-checkouts` (campOwner/admin)
- `GET /api/v1/campgrounds/:campgroundId/bookings` (protected)
- `POST /api/v1/campgrounds/:campgroundId/bookings` (protected)

Notes:

- Booking stay is limited to 1-3 nights.
- Guest booking requires both `guestName` and `guestTel`, and only `campOwner` or `admin` can create guest bookings.
- The route `POST /api/v1/bookings` exists in code but is effectively legacy; use the nested campground route for booking creation.

## Query Features

Some list endpoints support:

- Field selection: `?select=name,province`
- Sorting: `?sort=checkInDate,-createdAt`
- Operator filters: `?capacity[gte]=10`

## Seed Data

Run:

```bash
npm run seed
```

Seed includes:

- 2 admins
- 1 camp owner
- 2 regular users
- 10 campgrounds
- 10 bookings across statuses (`confirmed`, `checked-in`, `checked-out`, `cancelled`)

Sample seeded accounts:

- `admin1@example.com` / `admin123`
- `admin2@example.com` / `admin123`
- `somchai.owner@example.com` / `password123`
- `john.smith@example.com` / `password123`
- `sarah.johnson@example.com` / `password123`

## Security Middleware

Configured in `server.js`:

- `helmet`
- `express-mongo-sanitize`
- `express-xss-sanitizer`
- `hpp`
- `cors`

`express-rate-limit` is currently present but commented out.
