Markdown
# Hotel Reservation & Front Desk Management System

A full-stack hotel management web platform built for single-hotel operations. It features a guest booking engine, an interactive front-desk dashboard, atomic concurrency protection for simultaneous room reservations, and database-level server-side pagination.

---

## 🎥 Video Demonstration & Walkthrough

A complete 5–10 minute demonstration walking through the guest booking flow, staff front desk dashboard (check-in/check-out), room management, server-side pagination, and the concurrency test execution:

👉 **[Watch the Video Walkthrough on Google Drive](https://drive.google.com/file/d/1V5Pi9pn4IMGBh1rcecUPPSLj7scnA3dQ/view?usp=share_link)**

---

## 1. Technology Stack

- **Runtime & Language**: Node.js (v18+), TypeScript (Strict Mode across client and server)
- **Backend API**: Express.js, TypeScript
- **Database & ODM**: MongoDB Atlas, Mongoose
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS
- **Authentication**: JWT (JSON Web Tokens) with Role-Based Access Control (Guest / Staff)
- **Testing**: Jest, Supertest

---

## 2. Architecture & Design Principles

The project implements a **Layered Modular Architecture** ensuring complete separation of concerns:

backend/src/
├── config/         # MongoDB Atlas connection & environment setup
├── models/         # Mongoose models with compound indexes
├── routes/         # Express endpoint definitions & RBAC guards
├── controllers/    # Request/Response orchestration & HTTP status mapping
├── services/       # Core business logic: availability, pricing & transactions
├── middlewares/    # Authentication (JWT verification) & Error handling
├── types/          # Domain TypeScript interfaces & enums
└── utils/          # Database seeding script & helper functions


### Core Business Rules & Server Ownership
- **Strict Server Authority**: The client never calculates prices or confirms room availability. The server strictly validates dates, calculates total nights, reads the room rate snapshot (`priceSnapshot`), and derives total costs.
- **Date Validation**: Check-out must occur strictly after check-in, and booking dates in the past are rejected.
- **Capacity Enforcement**: Multi-room bookings enforce that total guests do not exceed `capacity * roomCount`.
- **Reservation Lifecycle**:
  $$\text{Pending} \longrightarrow \text{Confirmed} \longrightarrow \text{Checked-in} \longrightarrow \text{Checked-out}$$
  - Self-cancellations by guests are strictly restricted to `Pending` and `Confirmed` reservations.
  - Invalid state skips (e.g., attempting to check out a pending reservation directly) are blocked with HTTP `400 Bad Request`.

---

## 3. Concurrency Strategy & Data Consistency

### The Problem
When multiple guests attempt to book the final available room for overlapping dates at nearly the same instant, naive read-then-write logic causes race conditions, duplicate confirmations, or negative inventory.

### Concurrency Solution
1. **Overlap Calculation**: Two reservations overlap if and only if:
   $$\text{existingCheckIn} < \text{requestedCheckOut} \quad\text{and}\quad \text{existingCheckOut} > \text{requestedCheckIn}$$
2. **ACID Multi-Document Transactions**: Booking reservations execute inside a MongoDB multi-document session transaction (`startTransaction()`).
3. **Pessimistic Verification**: Inside the active transaction session, the service queries all active bookings (`Pending`, `Confirmed`, `Checked-in`) for the selected dates.
4. **Collision Handling**: If remaining inventory is less than requested, the transaction immediately calls `session.abortTransaction()` and returns an **HTTP 409 Conflict**. The winning request commits atomically with **HTTP 201 Created**.
5. **Database Indexing**: A compound index optimizes availability lookups:
   ```typescript
   reservationSchema.index({ roomTypeId: 1, status: 1, checkIn: 1, checkOut: 1 });
4. Server-Side Pagination & Query Performance
The staff reservation table enforces database-level pagination using .skip((page - 1) * limit) and .limit(limit) rather than fetching full collections into memory:   
Technical AssesSment - Full Stack Developer.pdf

Paginated API Contract (GET /api/reservations/staff/all)
Query Parameters: page (default 1), limit (default 10), status (optional filter)   
Technical AssesSment - Full Stack Developer.pdf

Response Shape:

JSON
{
  "data": [ /* Array of reservation documents */ ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalCount": 28,
    "totalPages": 3
  }
}
5. Scalability & Production Readiness
Stateless Architecture: The Express API uses stateless JWT authentication. No local memory sessions or process-specific state are held, allowing instances to scale horizontally behind a reverse proxy (e.g., AWS ALB or Nginx).   
Technical AssesSment - Full Stack Developer.pdf
+ 1

Database Connection Pooling: Mongoose manages a persistent connection pool to MongoDB Atlas, reusing sockets efficiently under high request volumes.

Failure Mitigations:

Rate Limiting: API rate limiting (express-rate-limit) prevents denial-of-service spikes on booking endpoints.

Idempotency: Booking submissions can utilize client-generated idempotency keys to avoid duplicate bookings from network retries.

Caching: Static room descriptions and facilities can be cached in Redis with invalidation on updates.

6. Local Setup & Running Instructions
Prerequisites
Node.js (v18+)

MongoDB Atlas cluster URL (or local MongoDB instance)

1. Backend Setup
Bash
cd backend
npm install
Create a .env file in backend/:

Code snippet
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=super_secret_hotel_key_2026
JWT_EXPIRES_IN=7d
Seed initial data (creates demo rooms, staff, and guest credentials):

Bash
npm run seed
Start the backend API server:

Bash
npm run dev
Server runs at http://localhost:5000.

2. Frontend Setup
Bash
cd ../frontend
npm install
npm run dev
Client runs at http://localhost:5173.

7. Demo Accounts & Verification
The database seeder automatically provides test credentials:

Role	Email	Password	
Access Capabilities

Staff / Admin	staff@hotel.com	password123	
Dashboard metrics, check-in/out, room & inventory management, paginated bookings

Guest	guest@hotel.com	password123	
Availability search, room booking, self-service cancellation

8. Automated Testing
Run the automated integration test verifying atomic concurrency and overbooking prevention:

Bash
cd backend
npm run test
   
Technical AssesSment - Full Stack Developer.pdf
The test fires two simultaneous booking requests competing for a single room inventory unit, asserting that exactly one succeeds (201) and the competing write is rejected (409).
