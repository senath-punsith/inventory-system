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
