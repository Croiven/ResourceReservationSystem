# Resource Reservation System

A web application for browsing resources, viewing availability, and making reservations. This project is developed as part of a Master's thesis studying the structural quality and maintainability of software developed with AI assistance.

At this stage, the repository contains only the technical foundation. Application features (users, resources, reservations, authentication, etc.) will be implemented in later iterations.

## Technology Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, TypeScript, Vite, ESLint, Vitest, Vitest Coverage |
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

Component-based structure:

```
components/   # Reusable UI components
pages/        # Application-level views
hooks/        # Reusable React logic
services/     # Backend API communication
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

3. Generate the Prisma client:

```bash
cd backend
npm run db:generate
```

The application schema (users, resources, reservations) has not been created yet. Prisma is configured and ready for schema design in a future iteration.

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
| `npm run db:studio` | Open Prisma Studio |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `DATABASE_URL` | PostgreSQL connection string | (required) |

Never commit `.env` files. Use `.env.example` as a template.
