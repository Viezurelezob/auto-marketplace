# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

AutoMarket is a Romanian car marketplace (inspired by Autovit/OLX Auto) with two independent packages:

- **`server/`** — Node.js + Express + Prisma ORM + PostgreSQL, runs on port 3001
- **`client/`** — React 18 + Vite + Tailwind CSS, runs on port 5173

Both packages use ES modules (`"type": "module"`). They are separate `npm install` contexts.

### Backend (`server/`)

`server/src/index.js` is the entry point. It wires together: Helmet security headers, CORS (restricted to `CLIENT_URL`), rate limiting (`middleware/rateLimiter.js`), all REST routes, and a Socket.io server attached to the same HTTP server instance.

**Important**: The Stripe webhook route (`POST /api/payments/webhook`) is registered *before* `express.json()` to receive the raw body required for Stripe signature verification. Do not move it.

On startup, `startAlertsJob()` launches a background cron that runs `services/alertsJob.js` — it checks saved searches and sends email notifications via Nodemailer (Gmail App Password).

Layer pattern: **routes** → **controllers** → **Prisma client**. Most business logic lives in controllers. `emailService.js` and `alertsJob.js` are the only standalone service modules.

### Image Uploads

In development (no `CLOUDINARY_CLOUD_NAME` env var), Multer stores files locally in `uploads/` which is served as static. In production, `uploadController.js` uploads to Cloudinary. `Listing.images` stores a **JSON-stringified array of URL strings** (`String @default("[]")`) — always `JSON.parse()` when reading and `JSON.stringify()` when writing.

### Real-time Messaging

Socket.io requires a valid JWT in `socket.handshake.auth.token` (verified on connection). Clients join rooms named `conv_<conversationId>`. The `server/src/socket.js` module provides `setIo`/`getIo` to share the Socket.io instance with `messagesController.js` for emitting events from HTTP handlers.

### Frontend (`client/`)

`client/src/services/api.js` is the **single Axios instance** for all API calls. Interceptors automatically inject the JWT from `localStorage` and remove it on 401. All API methods are exported as named objects (`listingsAPI`, `adminAPI`, `messagesAPI`, etc.) — always use these, not raw `axios`.

State is managed with React Context only:
- `AuthContext` — current user object and login/logout actions
- `FavoritesContext` — favorite listing IDs, synced with the backend on mount
- `CompareContext` — listings selected for side-by-side comparison (drives the `CompareBar` overlay)

Route guards: `ProtectedRoute` requires any authenticated user; `AdminRoute` additionally requires `role === 'ADMIN'`.

## Commands

### Server

```bash
cd server
npm install
npm run db:push      # sync Prisma schema to the database
npm run db:seed      # seed 12 demo listings + 2 accounts
npm run dev          # nodemon src/index.js → http://localhost:3001
npm run db:studio    # Prisma Studio GUI for inspecting data
```

### Client

```bash
cd client
npm install
npm run dev          # Vite dev server → http://localhost:5173
npm run build        # production build → client/dist/
npm run preview      # preview the production build locally
```

## Environment Variables

Copy `.env.example` to `.env` in both `server/` and `client/`.

**`server/.env`** — required:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — signing secret for JWT tokens
- `CLIENT_URL` — frontend origin allowed by CORS (default: `http://localhost:5173`)

**`server/.env`** — optional (production):
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — if set, images upload to Cloudinary instead of local disk
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PREMIUM_PRICE_ID`, `STRIPE_FEATURED_PRICE_ID` — for Stripe Checkout
- `EMAIL_USER`, `EMAIL_PASS` — Gmail App Password for transactional emails

**`client/.env`**:
- `VITE_API_URL` — backend API base URL (defaults to `/api` in dev proxy)
- `VITE_SOCKET_URL` — Socket.io server URL

## Database

Schema lives in `server/prisma/schema.prisma`. After any schema change run:

```bash
cd server && npm run db:push
```

Key model notes:
- `Listing.images` is a `String` storing a JSON array — always parse/stringify it.
- `Listing.status` values: `ACTIVE`, `DRAFT`, `SOLD`.
- `User.role` values: `USER`, `ADMIN`.
- `Conversation` links a `Listing`, a buyer `User`, and a seller `User`. Messages are nested under it.
- `PriceHistory` is appended automatically in `listingsController.js` whenever a listing price changes.

## Deployment

- **Server**: Render (see `render.yaml`) — build: `npm install && npx prisma generate && npx prisma db push`, start: `npm start`.
- **Client**: Vercel — `client/vercel.json` rewrites all paths to `/index.html` for SPA routing.

## Demo Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@automarket.ro | Admin1234! |
| User | demo@automarket.ro | Demo1234! |
