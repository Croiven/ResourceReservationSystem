# Resource Reservation System

A web application for browsing resources, viewing availability, and making reservations. This project is developed as part of a Master's thesis studying the structural quality and maintainability of software developed with AI assistance.

The repository contains a working backend API and a React frontend with login, registration, profile, and resource browse pages. Reservation UI and admin resource management UI are planned for later iterations.

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
components/   # Reusable UI components (AppLayout, AppHeader, ProtectedRoute)
pages/        # Application-level views (Home, Login, Register, Profile)
context/      # Auth state (AuthProvider)
hooks/        # Reusable React logic (useAuth)
services/     # Backend API communication (authApi, apiClient, tokenStorage)
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
| `/resources/:id` | Resource detail | Public |

**Sign in with seed data** (after running `npm run db:seed` in the backend):

- Email: `user@example.com`
- Password: `password`

**User flows:**

1. **Register** — Creates an account via `POST /api/auth/register`, then redirects to login (no auto-login).
2. **Login** — Stores access and refresh tokens in `localStorage`, fetches the current user, and redirects to `/profile`.
3. **Profile** — Shows account details and a change-password form. A successful password change revokes all sessions and redirects to login.
4. **Logout** — Revokes the refresh token and clears stored tokens.

Protected routes use `ProtectedRoute`, which shows a loading indicator while auth state is bootstrapped from storage on app load. If the access token is expired, the app attempts a silent refresh before redirecting to login.

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

Overlap detection (to be implemented in the service layer):

```
existing.startTime < new.endTime AND existing.endTime > new.startTime
```

Only reservations with status `PENDING` or `CONFIRMED` block availability. `CANCELLED` reservations do not. Only resources with `isActive = true` are bookable.

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
| `PATCH` | `/:id` | Update user (role, isActive, name) |
| `DELETE` | `/:id` | Soft-deactivate user |

### Resource endpoints — `/api/resources`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | Public | List resources (supports query filters) |
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

### Reservation endpoints — `/api/reservations`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | Authenticated | List reservations (users see own; admins see all) |
| `GET` | `/:id` | Authenticated | Get reservation (owner or admin) |
| `POST` | `/` | Authenticated | Create reservation for authenticated user |
| `PATCH` | `/:id` | Authenticated | Update reservation (owner or admin) |
| `DELETE` | `/:id` | Authenticated | Cancel reservation (owner or admin) |

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
