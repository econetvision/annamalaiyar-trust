# Annamalaiyar Trust Portal

Member portal for Annamalaiyar Trust (Chinna Salem, since 2012), part of the Sri Muruga Vilas Group.

## Features

- **Registration** — subscribers register and instantly receive a unique agent code (`AT<year>-<5 digits>`).
- **Agent code verification** — subscribers check their status on the Verify page; trust office staff verify
  codes from the Admin page. Verifying a code automatically issues a **₹250 gift voucher**.
- **Legacy page** — trust history, founding year, affiliated entities, and the official commemorative artwork.
- **Advertisement space** — a scrollable ad strip on the home page (backed by the `advertisements` table).
- **Product catalogue** — trust office staff upload products (name, category, weight/variant, price, image) from
  the Admin page; they display immediately on the public Product Catalogue page.
- **Annamalaiyar Expo** — Business Trade Fair Expo details: ticket price, claim value, gift voucher, prizes.
- **Home page menu** — lists all trust services (Diagnostic Center, Automobile Service, Sports Club, etc.).

## Run locally

### Backend (Flask + SQLite, uv-managed)

```
cd backend
uv sync
uv run python app.py
```

Runs on `http://127.0.0.1:5000`. Default admin key is `annamalaiyar2026` (override with `ADMIN_KEY` env var —
set this before deploying anywhere real).

### Frontend (React + Vite)

```
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` and proxies `/api/*` to the backend.

## Admin verification flow

1. A subscriber registers on `/register` and gets an agent code.
2. Trust office staff open `/admin`, enter the admin key, and verify the agent code.
3. The backend marks the subscriber verified and issues a unique ₹250 voucher.
4. The subscriber checks `/verify` with their agent code to see the voucher.

## Admin product catalogue

1. Open `/admin`, unlock with the admin key.
2. Fill in the "Manage Product Catalogue" form (name and price are required; category, weight/variant,
   description, and image are optional) and submit — images upload as multipart form data to
   `POST /api/admin/products` and are stored under `backend/instance/uploads/`.
3. The product appears immediately on `/products` for all visitors.
4. Use "Remove" on any product card in the admin list to delete it (also deletes the uploaded image file).
