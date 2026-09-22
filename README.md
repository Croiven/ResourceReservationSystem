# Resource Reservation System

A web application for browsing resources, viewing availability, and making reservations. This project is developed as part of a Master's thesis studying the structural quality and maintainability of software developed with AI assistance.

The repository contains a working backend API and a React frontend with login, registration, profile, resource browse, user reservation flows (book, list, edit, cancel), and admin-only management UI for resources, users, and all reservations.

## Technology Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, TypeScript, Vite, MUI, React Router, ESLint, Vitest, Vitest Coverage |
| Backend | Node.js, TypeScript, Express, ESLint, Vitest, Vitest Coverage |
| Database | PostgreSQL, Prisma ORM |
| Development | Git, npm |

## Project Structure

```
resource-reservation/
├── frontend/          # React SPA (independent application)
├── backend/           # Express REST API (independent application)
├── README.md
├── .gitignore
├── .prettierrc
└── sonar-project.properties
```

### Backend Architecture

Layered architecture with clear separation of concerns:

```
Routes → Controllers → Services → Repositories → Database
```

Supporting layers: `models/`, `validation/`, `middleware/`

### Frontend Architecture

Component-based structure with MUI as the shared UI library:

```
components/   # Reusable UI components (AppLayout, AppHeader, ProtectedRoute, AdminRoute)
pages/        # Application-level views (Home, Login, Register, Profile, Resources, Reservations, Admin*)
context/      # Auth state (AuthProvider)
hooks/        # Reusable React logic (useAuth)
services/     # Backend API communication (authApi, resourceApi, reservationApi, userApi, adminReservationApi, apiClient, tokenStorage)
utils/        # Date/time and display helpers (dateTime, reservationLabels, resourceLabels, userLabels)
theme/        # MUI theme configuration
types/        # Shared TypeScript types
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later recommended)
- [PostgreSQL](https://www.postgresql.org/)
- npm (included with Node.js)

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at [http://localhost:5173](http://localhost:5173). API requests to `/api/*` are proxied to the backend during development.

### Frontend Authentication

The frontend uses React Router for navigation, React Context for auth state, and MUI components throughout.

| Route | Page | Access |
|-------|------|--------|
| `/` | Home | Public |
| `/login` | Login | Public (redirects to `/profile` when logged in) |
| `/register` | Register | Public (redirects when logged in) |
| `/profile` | Profile | Protected |
| `/resources` | Resources | Public |
| `/resources/:id` | Resource detail (availability + booking) | Public (booking requires login) |
| `/reservations` | My Reservations | Protected |
| `/reservations/:id` | Reservation detail (edit/cancel) | Protected |
| `/admin/resources` | Manage resources (create/edit/deactivate) | Admin |
| `/admin/users` | Manage users (role, name, deactivate) | Admin |
| `/admin/reservations` | All reservations (filters, edit, cancel) | Admin |
| `/admin/reservations/:id` | Admin reservation detail | Admin |

**Sign in with seed data** (after running `npm run db:seed` in the backend):

- Regular user: `user@example.com` / `password`
- Admin user: `admin@example.com` / `password`

**User flows:**

1. **Register** — Creates an account via `POST /api/auth/register`, then redirects to login (no auto-login).
2. **Login** — Stores access and refresh tokens in `localStorage`, fetches the current user, and redirects to `/profile`.
3. **Profile** — Shows account details and a change-password form. A successful password change revokes all sessions and redirects to login.
4. **Logout** — Revokes the refresh token and clears stored tokens.

Protected routes use `ProtectedRoute`, which shows a loading indicator while auth state is bootstrapped from storage on app load. If the access token is expired, the app attempts a silent refresh before redirecting to login.

Admin routes use `AdminRoute`, which requires authentication and `role === 'ADMIN'`. Non-admins are redirected to the home page.

**Frontend auth files:**

| File | Purpose |
|------|---------|
| `frontend/src/context/AuthContext.tsx` | Auth provider (login, logout, register, changePassword) |
| `frontend/src/services/authApi.ts` | Auth API calls |
| `frontend/src/services/apiClient.ts` | Shared fetch wrapper with token refresh |
| `frontend/src/services/tokenStorage.ts` | localStorage token helpers |
| `frontend/src/theme/theme.ts` | MUI theme (project-wide) |

### Frontend Resource Browse

The browse UI at `/resources` lets anyone list and inspect bookable resources. No login is required.

**Features:**

- Search by name or description (debounced, server-side)
- Filter by resource type (`ROOM`, `EQUIPMENT`, `VEHICLE`, `OTHER`)
- Filter by status (defaults to active resources only)
- Click a row to open the detail page at `/resources/:id`

**Frontend resource files:**

| File | Purpose |
|------|---------|
| `frontend/src/pages/ResourcesPage.tsx` | Browse list with search and filters |
| `frontend/src/pages/ResourceDetailPage.tsx` | Single resource detail view |
| `frontend/src/services/resourceApi.ts` | Resource API calls |
| `frontend/src/types/resource.ts` | Resource types |
| `frontend/src/utils/resourceLabels.ts` | Display labels for resource types |

### Frontend Reservations

Authenticated users can manage their own bookings. New reservations are created from the resource detail page — there is no standalone create page.

**User flows:**

1. **Browse resources** — Open `/resources`, search/filter, and click a row to view details.
2. **View availability** — On `/resources/:id`, see a week calendar of booked time slots (public; no PII exposed). Navigate between weeks with prev/next controls.
3. **Book a resource** — When logged in, use the inline booking form on `/resources/:id`. Choose start and end times on the hour or half-hour (30-minute slots only). Start must be in the future; end must be after start. Availability is checked before submit; on success you are redirected to the reservation detail page.
4. **My Reservations** — At `/reservations`, list your bookings with status filters (Active / Cancelled / All). Edit reschedules via a modal; Cancel soft-cancels after confirmation.
5. **Reservation detail** — At `/reservations/:id`, view full details, edit times/notes, or cancel. Edit and cancel are disabled for cancelled reservations.

**Frontend reservation files:**

| File | Purpose |
|------|---------|
| `frontend/src/pages/ResourceDetailPage.tsx` | Availability calendar + inline booking form |
| `frontend/src/components/ResourceBookingsCalendar.tsx` | Week calendar view of booked slots |
| `frontend/src/utils/slotTime.ts` | 30-minute slot helpers and datetime constraints |
| `frontend/src/components/SlotDateTimeField.tsx` | Slot-aligned datetime-local input |
| `frontend/src/pages/ReservationsPage.tsx` | My Reservations table with filters |
| `frontend/src/pages/ReservationDetailPage.tsx` | Single reservation view, edit, cancel |
| `frontend/src/components/ReservationEditDialog.tsx` | Reschedule modal |
| `frontend/src/services/reservationApi.ts` | Reservation CRUD API calls |
| `frontend/src/services/resourceApi.ts` | Resource list/detail + bookings + availability |
| `frontend/src/types/reservation.ts` | Reservation types |
| `frontend/src/utils/dateTime.ts` | ISO ↔ datetime-local helpers |
| `frontend/src/utils/reservationLabels.ts` | Status labels and chip colors |

### Frontend Admin

Admin-only pages live under `/admin/*`. Admins see links in the header and on the home page.

**Admin flows:**

1. **Manage resources** — At `/admin/resources`, list all resources (defaults to all statuses), create new resources, edit name/description/type/active status, deactivate inactive resources, or reactivate them.
2. **Manage users** — At `/admin/users`, list users, edit names, promote/demote roles, and deactivate accounts. Admins cannot change their own role or deactivate their own account.
3. **All reservations** — At `/admin/reservations`, list every reservation with status, user, and resource filters. Edit or cancel any active booking; click a row for detail at `/admin/reservations/:id`.

`GET /api/reservations` remains scoped to the current user's own bookings even for admins. Use `GET /api/admin/reservations` for the admin list.

**Frontend admin files:**

| File | Purpose |
|------|---------|
| `frontend/src/components/AdminRoute.tsx` | Admin-only route guard |
| `frontend/src/pages/AdminResourcesPage.tsx` | Resource CRUD table |
| `frontend/src/components/ResourceFormDialog.tsx` | Create/edit resource modal |
| `frontend/src/pages/AdminUsersPage.tsx` | User management table |
| `frontend/src/components/UserEditDialog.tsx` | Edit user modal |
| `frontend/src/pages/AdminReservationsPage.tsx` | All reservations table with filters |
| `frontend/src/pages/AdminReservationDetailPage.tsx` | Admin reservation detail view |
| `frontend/src/services/userApi.ts` | User admin API calls |
| `frontend/src/services/adminReservationApi.ts` | Admin reservation list API |

## Backend Setup

1. Copy the example environment file and adjust values:

```bash
cd backend
cp .env.example .env
```

2. Install dependencies and generate the Prisma client:

```bash
npm install
npm run db:generate
```

3. Start the development server:

```bash
npm run dev
```

The backend runs at [http://localhost:3000](http://localhost:3000).

### Health Check

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "message": "Backend is running",
  "timestamp": "2026-01-01T12:00:00.000Z"
}
```

## Database Setup

1. Create a PostgreSQL database (e.g. `resource_reservation`).
2. Set the connection string in `backend/.env`:

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/resource_reservation?schema=public"
```

3. Run migrations and generate the Prisma client:

```bash
cd backend
npm run db:migrate
npm run db:generate
```

4. (Optional) Seed development data:

```bash
npm run db:seed
```

## Database Schema

The schema is defined in `backend/prisma/schema.prisma` and applied via Prisma migrations.

### Entities

| Entity | Table | Description |
|--------|-------|-------------|
| `User` | `users` | Application users (regular users and administrators) |
| `Resource` | `resources` | Bookable resources (rooms, equipment, vehicles, etc.) |
| `Reservation` | `reservations` | Time-bound bookings linking a user to a resource |
| `RefreshToken` | `refresh_tokens` | Hashed refresh tokens for JWT authentication |

### Relationships

- A **User** has many **Reservations**
- A **Resource** has many **Reservations**
- A **Reservation** belongs to one User and one Resource

Foreign keys use `ON DELETE RESTRICT` to preserve reservation history. Users and resources are deactivated via `isActive` rather than hard deletion.

### Enums

| Enum | Values |
|------|--------|
| `UserRole` | `USER`, `ADMIN` |
| `ResourceType` | `ROOM`, `EQUIPMENT`, `VEHICLE`, `OTHER` |
| `ReservationStatus` | `PENDING`, `CONFIRMED`, `CANCELLED` |

### Availability Rules

Resources use an **exclusive reservation model** — only one active reservation per resource at a time.

Overlap detection (implemented in the service layer):

```
existing.startTime < new.endTime AND existing.endTime > new.startTime
```

Only reservations with status `PENDING` or `CONFIRMED` block availability. `CANCELLED` reservations do not. Only resources with `isActive = true` are bookable.

**Booking rules:**

- Reservations must start on the hour or half-hour and last a multiple of 30 minutes.
- Create and update reject times in the past (`startTime` must be in the future).
- Cancelled reservations cannot be edited.
- Cancelling an already-cancelled reservation is idempotent (returns the current record).
- Listing reservations supports `resourceId` and `status` filters, always scoped to the current user's own bookings.

### Migrations

Initial migration: `backend/prisma/migrations/20260915164700_init_schema/`

Refresh tokens migration: `backend/prisma/migrations/20260916154000_add_refresh_tokens/`

```bash
cd backend
npm run db:migrate    # apply pending migrations
npm run db:studio     # browse data in Prisma Studio
npm run db:seed       # insert development seed data
```

### Seed Data

The seed script creates:

- Admin user: `admin@example.com` (role `ADMIN`)
- Regular user: `user@example.com` (role `USER`)
- Sample resources: Conference Room A, Portable Projector, Company Van
- One sample reservation

Dev password for all seed users: `password`

## Testing

Run tests in each application independently:

```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
npm test
```

Watch mode:

```bash
npm run test:watch
```

## Coverage

Generate coverage reports:

```bash
# Frontend
cd frontend
npm run test:coverage

# Backend
cd backend
npm run test:coverage
```

Coverage reports are written to the `coverage/` directory in each application.

## Linting

```bash
# Frontend
cd frontend
npm run lint

# Backend
cd backend
npm run lint
```

Auto-fix where possible:

```bash
npm run lint:fix
```

## Formatting

Prettier is configured at the repository root. Format code in each application:

```bash
# Frontend
cd frontend
npm run format

# Backend
cd backend
npm run format
```

Check formatting without writing:

```bash
npm run format:check
```

## SonarQube

The root `sonar-project.properties` file configures SonarQube analysis for both frontend and backend source code. To run analysis:

1. Generate coverage reports in both applications (see above).
2. Run the SonarQube scanner from the repository root:

```bash
sonar-scanner
```

A SonarQube server is not required during initial setup. The configuration supports analysis of bugs, code smells, vulnerabilities, duplication, complexity, maintainability, and test coverage.

## Available Scripts

### Frontend (`frontend/`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting |
| `npm run test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

### Backend (`backend/`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm run start` | Run compiled production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting |
| `npm run test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed development data |
| `npm run db:studio` | Open Prisma Studio |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `DATABASE_URL` | PostgreSQL connection string | (required) |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens | (required) |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens | (required) |
| `JWT_ACCESS_EXPIRES_IN` | Access token TTL | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL | `7d` |

Never commit `.env` files. Use `.env.example` as a template.

## Authentication API

Authentication uses JWT access + refresh tokens. Send access tokens via `Authorization: Bearer <token>` header.

### Auth endpoints — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/register` | Public | Self-register as `USER` |
| `POST` | `/login` | Public | Returns access + refresh token pair |
| `POST` | `/refresh` | Public | Exchange refresh token for new token pair |
| `POST` | `/logout` | Public | Revoke refresh token |
| `GET` | `/me` | Authenticated | Current user profile |
| `POST` | `/change-password` | Authenticated | Change password; revokes all refresh tokens |

### User management — `/api/users` (admin only)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | List all users |
| `GET` | `/:id` | Get user by ID |
| `PATCH` | `/:id` | Update user (role, isActive, name). Admins cannot change their own role or deactivate themselves. |
| `DELETE` | `/:id` | Soft-deactivate user. Admins cannot deactivate themselves. |

### Resource endpoints — `/api/resources`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | Public | List resources (supports query filters) |
| `GET` | `/:id/bookings` | Public | Busy intervals in a date range (no user PII) |
| `GET` | `/:id/availability` | Public | Check whether a time slot is available |
| `GET` | `/:id` | Public | Get resource by ID |
| `POST` | `/` | Admin | Create resource |
| `PATCH` | `/:id` | Admin | Update resource |
| `DELETE` | `/:id` | Admin | Deactivate resource |

**List query parameters** (`GET /api/resources`):

| Param | Values | Description |
|-------|--------|-------------|
| `active` | `true`, `false` | Filter by active status |
| `type` | `ROOM`, `EQUIPMENT`, `VEHICLE`, `OTHER` | Filter by resource type |
| `search` | string (1–100 chars) | Case-insensitive match on name or description |

Example:

```bash
curl "http://localhost:3000/api/resources?active=true&type=ROOM&search=conference"
```

**Bookings in range** (`GET /api/resources/:id/bookings`):

| Param | Type | Description |
|-------|------|-------------|
| `from` | ISO 8601 datetime | Range start (inclusive) |
| `to` | ISO 8601 datetime | Range end (inclusive) |

Returns non-cancelled reservations overlapping the range. Response shape:

```json
{
  "data": [
    { "startTime": "2026-09-20T10:00:00.000Z", "endTime": "2026-09-20T11:00:00.000Z", "status": "CONFIRMED" }
  ]
}
```

Example:

```bash
curl "http://localhost:3000/api/resources/<resourceId>/bookings?from=2026-09-01T00:00:00.000Z&to=2026-09-30T23:59:59.000Z"
```

**Slot availability check** (`GET /api/resources/:id/availability`):

| Param | Type | Description |
|-------|------|-------------|
| `startTime` | ISO 8601 datetime | Proposed booking start |
| `endTime` | ISO 8601 datetime | Proposed booking end |
| `excludeReservationId` | string (optional) | Exclude this reservation when checking (for reschedule) |

Response:

```json
{ "data": { "available": true } }
```

Example:

```bash
curl "http://localhost:3000/api/resources/<resourceId>/availability?startTime=2026-09-20T10:00:00.000Z&endTime=2026-09-20T11:00:00.000Z"
```

### Reservation endpoints — `/api/reservations`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | Authenticated | List current user's reservations (own only, including for admins) |
| `GET` | `/:id` | Authenticated | Get reservation (owner or admin) |
| `POST` | `/` | Authenticated | Create reservation for authenticated user |
| `PATCH` | `/:id` | Authenticated | Update reservation (owner or admin) |
| `DELETE` | `/:id` | Authenticated | Cancel reservation (owner or admin) |

**List query parameters** (`GET /api/reservations` — current user only):

| Param | Values | Description |
|-------|--------|-------------|
| `resourceId` | string | Filter by resource |
| `status` | `PENDING`, `CONFIRMED`, `CANCELLED` | Filter by status |

### Admin endpoints — `/api/admin` (admin only)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/reservations` | List all reservations across users |

**List query parameters** (`GET /api/admin/reservations`):

| Param | Values | Description |
|-------|--------|-------------|
| `userId` | string | Filter by booking user |
| `resourceId` | string | Filter by resource |
| `status` | `PENDING`, `CONFIRMED`, `CANCELLED` | Filter by status |

Example:

```bash
curl "http://localhost:3000/api/admin/reservations?status=CONFIRMED" \
  -H "Authorization: Bearer <adminAccessToken>"
```

### Example: login flow

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","firstName":"Regular","lastName":"User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Use access token
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <accessToken>"
```
