# Inventory Management System

Internal Inventory Management System for Ceyntics Systems (Pvt) Ltd.

## Stack

- Backend: Laravel 9 API + Sanctum
- Database: PostgreSQL
- Frontend: React + Vite

## Repository Structure

- `inventory-system/`: Laravel API project
- `frontend/`: React frontend project

## Backend Setup (Laravel API)

```bash
cd inventory-system
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

Default seeded admin user:

- Email: `admin@ceyntics.local`
- Password: `ChangeMe123!`

Change this password immediately after first login.

## PostgreSQL Environment

The backend `.env` and `.env.example` are set for PostgreSQL defaults:

- `DB_CONNECTION=pgsql`
- `DB_HOST=127.0.0.1`
- `DB_PORT=5432`
- `DB_DATABASE=inventory_system`
- `DB_USERNAME=postgres`

Update these values for your local machine.

## Frontend Setup (React)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend environment value:

- `VITE_API_BASE_URL=http://127.0.0.1:8000/api`

## Bonus: Cloud Hosting Access

To complete the bonus requirement (system accessible after hosting), deploy backend and frontend, then share URLs and credentials.

### 1. Backend environment variable mapping

If your cloud provider gives a managed PostgreSQL service variable, create this variable in your backend service:

- `DATABASE_URL=${{ Postgres.DATABASE_URL }}`

Also set:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `DB_CONNECTION=pgsql`

Laravel already supports `DATABASE_URL` in `config/database.php`, so no extra code changes are required.

### 2. Backend deploy commands

Run these on deploy/release:

```bash
php artisan key:generate --force
php artisan migrate --force
php artisan db:seed --force
php artisan storage:link
```

### 3. Frontend production variable

Set in frontend hosting service:

- `VITE_API_BASE_URL=https://<your-backend-domain>/api`

### 4. What to submit as proof of access

- Frontend URL (live)
- Backend API URL (live)
- Admin credentials
- Staff credentials

Quick verification steps:

- Login succeeds from hosted frontend
- Create cupboard/place/item succeeds
- Borrow and return actions succeed
- Admin can open activity logs

## Implemented Backend Modules

- Login/logout authentication with Sanctum
- No public registration route
- Admin-only user creation and role assignment (`admin`, `staff`)
- Cupboards CRUD
- Places CRUD (belongs to cupboard)
- Items CRUD with quantity and status controls
- Borrowing and return workflow with stock updates
- Audit logs with user, timestamp, and old/new value snapshots

## API Notes

- Base URL: `http://127.0.0.1:8000/api`
- Public route:
  - `POST /login`
- Protected routes (Bearer token required):
  - cupboards, places, items, borrowings
- Admin-only routes:
  - `GET/POST /users`
  - `PATCH /users/{id}/role`
  - `GET /activity-logs`

## Tests

Feature tests added for:

- Login and admin/staff authorization behavior
- Borrowing/return stock lifecycle

Run tests:

```bash
cd inventory-system
php artisan test
```
