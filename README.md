# Enterprise NestJS API Boilerplate

An enterprise-grade NestJS API boilerplate with built-in features for modern backend applications, developed by [Prosigns](https://www.prosigns.io/).

## About Prosigns

Prosigns Technologies is a leading provider of custom software development services in the USA, Canada, and Middle East. With a team of 135+ tech innovators, Prosigns specializes in:

- **Business Enablement**: Strategic solutions that drive operational efficiency and market expansion
- **Artificial Intelligence**: Turning data into actionable insights and competitive advantage
- **Digital Transformation**: Empowering businesses to thrive in the digital era
- **Engineering**: Precision-driven solutions for seamless performance and scalability

Prosigns offers services across diverse industries including SaaS, Healthcare, Finance, Oil and Gas, Logistics, Real Estate, and more.

For more information, visit [prosigns.io](https://www.prosigns.io/) or contact:

- Email: services@prosigns.io
- US: +1 945 229 2333

## Features

- **Authentication & authorization**: JWT access + refresh tokens, refresh token stored hashed in the database; role-based access control (RBAC); global JWT guard with `@Public()` for open routes
- **Database integration**:
  - **PostgreSQL** (Prisma ORM) — default and primary path for users, files, and auth
  - **MongoDB** (Mongoose) — repository layer present; Mongo path currently falls back to Prisma when selected
  - **MySQL** (TypeORM) — optional user repository implementation
  - **Supabase** — optional user repository via Supabase client
- **Configuration**: NestJS `ConfigModule` with typed namespaces + **Joi env validation** at startup (`src/config/env.validation.ts`)
- **Logging & errors**: Winston logging, **request IDs** (`X-Request-Id`), global exception filter; **sanitized error messages in production** (no stack/DB details to clients)
- **Validation**: `class-validator` / `class-transformer` with a strict global `ValidationPipe`
- **API versioning**: URI versioning with default version `v1` (e.g. `/api/v1/...`)
- **API documentation**: Swagger / OpenAPI (non-production)
- **Rate limiting**: `@nestjs/throttler` (global guard; **health routes skipped**; limits configurable via env)
- **Caching**: Redis when `REDIS_ENABLED=true`, otherwise **in-memory** cache (no Redis required for local dev)
- **File uploads**: Owner-scoped files (`userId`), **MIME allowlist**, path traversal checks on read/delete
- **Security**: Helmet, **configurable CORS** (`CORS_ORIGINS`), compression, graceful shutdown hooks
- **Internationalization**: `i18next` + middleware for `Accept-Language` / `?lang=`
- **Testing**: Jest (unit + e2e)
- **Docker**: `Dockerfile` (Node 20 Alpine) and `docker-compose.yml`
- **Linting**: ESLint 9 flat config (`eslint.config.js`)
- **Observability**: Prometheus metrics at `/api/v1/metrics` (no auth); optional OpenTelemetry traces when `OTEL_ENABLED=true` (standard `OTEL_*` variables)
- **Dependency automation**: Dependabot (npm + GitHub Actions); `npm run audit` in CI (report-only step)

## Requirements

- **Node.js 20+** and npm (see `engines` in `package.json`)
- **PostgreSQL** when using Prisma (default setup)
- **Redis** optional — set `REDIS_ENABLED=false` to run without Redis (in-memory cache)
- **Docker** (optional) for containerized run or CI-style workflows

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/prosigns/nestjs-api-boilerplate.git
cd nestjs-api-boilerplate
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Minimum for local development with PostgreSQL:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string for Prisma (**required** when `NODE_ENV=production`) |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Signing secrets (**required** in production; **min 32 characters** each) |
| `JWT_EXPIRES_IN` | Access token TTL (default `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL (default `7d`) |
| `CORS_ORIGINS` | `*` or comma-separated origins (use explicit origins in production) |
| `REDIS_ENABLED` | `true` / `false` — use in-memory cache when `false` |
| `REDIS_HOST` / `REDIS_PORT` | Redis host/port when `REDIS_ENABLED=true` |
| `THROTTLE_TTL` / `THROTTLE_LIMIT` | Global rate limit window (seconds) and max requests per window |
| `ALLOWED_UPLOAD_MIME_TYPES` | Comma-separated MIME types; empty = built-in defaults (images + PDF) |
| `DATABASE_TYPE` | `postgres` (default), `mongodb`, `supabase`, or `mysql` for user repository selection |
| `PORT` | HTTP port (default `3000`) |
| `NODE_ENV` | `development` / `production` / `test` (Swagger disabled in production) |

See `src/config/configuration.ts` for all supported env keys.

### 3. Prisma (PostgreSQL)

```bash
npx prisma generate
npx prisma migrate dev
```

Optional seed (admin + demo user):

```bash
npm run prisma:seed
```

### 4. Run

**Development**

```bash
npm run start:dev
```

**Production build**

```bash
npm run build
npm run start:prod
```

**Docker**

```bash
docker compose up -d
```

*(Adjust `docker-compose.yml` to match your Postgres/Redis URLs if needed.)*

## API base URL & documentation

- **Global prefix**: `/api`
- **Default version**: `v1` → routes look like `/api/v1/<controller>/...`

Examples:

- **Liveness**: `GET /api/v1/health` or `GET /api/v1/health/live` (process up; not rate-limited)
- **Readiness**: `GET /api/v1/health/ready` (checks database connectivity; use for orchestrators)
- Auth: `POST /api/v1/auth/login`, `POST /api/v1/auth/register`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`

**Swagger** (when `NODE_ENV !== production`):

```
http://localhost:3000/api/docs
```

**Prometheus** (process metrics; scrape without JWT):

```
http://localhost:3000/api/v1/metrics
```

**OpenTelemetry**: set `OTEL_ENABLED=true` and configure exporters (e.g. `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_SERVICE_NAME`). Traces are initialized before the Nest app boots (`src/telemetry/`).

## Multi-database support (users)

User persistence can switch implementations via `DATABASE_TYPE`:

| Value | Implementation |
|-------|----------------|
| `postgres` (default) | Prisma `User` model |
| `supabase` | Supabase table `users` |
| `mysql` | TypeORM entity |
| `mongodb` | Intended Mongoose path; currently falls back to Prisma in the factory |

Connection details per provider are documented in `src/config/configuration.ts` and the **Multi-Database** section below.

### PostgreSQL (Prisma)

```env
DATABASE_TYPE=postgres
DATABASE_URL=postgresql://postgres:password@localhost:5432/your_db?schema=public
```

### MongoDB

```env
DATABASE_TYPE=mongodb
MONGODB_URI=mongodb://username:password@localhost:27017/api
```

> **Note:** MongoDB selection currently logs a warning and uses the Prisma user repository until Mongoose is fully wired.

### MySQL (TypeORM)

```env
DATABASE_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USERNAME=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=api
MYSQL_SYNCHRONIZE=true
```

### Supabase

```env
DATABASE_TYPE=supabase
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

### Architecture

- **Repository pattern**: `BaseRepository<T>` in `src/common/database/repository/`
- **Factory**: `UserRepositoryFactory` picks the implementation from `DATABASE_TYPE`
- **Module**: `DatabaseModule.forRoot()` provides shared adapter services without forcing unused DB connections

## Project structure

```
├── prisma/                     # Schema, migrations, seed
├── src/
│   ├── common/
│   │   ├── database/           # DB adapters, repositories, Supabase / TypeORM helpers
│   │   ├── decorators/         # @Public(), @Roles()
│   │   ├── filters/            # Global exception filter
│   │   ├── guards/             # JWT, roles
│   │   ├── interceptors/       # Logging
│   │   ├── middleware/         # i18n
│   │   └── prisma/             # Prisma module & service
│   ├── config/                 # registerAs() config namespaces
│   ├── i18n/                   # i18n service & locale JSON files
│   ├── modules/
│   │   ├── auth/
│   │   ├── files/
│   │   ├── health/
│   │   └── users/
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   └── main.ts
├── test/                       # E2E specs (Jest)
├── .env.example
├── docker-compose.yml
├── Dockerfile                  # Node 20 Alpine
├── eslint.config.js            # ESLint 9 flat config
├── nest-cli.json
├── package.json
└── tsconfig.json
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Dev server with watch |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run `node dist/main` |
| `npm run lint` | ESLint |
| `npm run test` | Unit tests |
| `npm run test:e2e` | E2E tests |
| `npm run test:cov` | Coverage |
| `npm run prisma:seed` | Seed database |

## Testing

**Unit tests**

```bash
npm run test
```

**E2E tests**

E2E bootstraps the full `AppModule` and **Prisma connects on startup**, so you need a reachable PostgreSQL instance and env vars, for example:

```bash
set DATABASE_URL=postgresql://user:pass@localhost:5432/db?schema=public
set JWT_SECRET=test-secret
set JWT_REFRESH_SECRET=test-refresh-secret
npx prisma migrate deploy
npm run test:e2e
```

*(On Unix, use `export` instead of `set`.)*

CI runs migrations against a Postgres service before e2e (see `.github/workflows/ci-cd.yml`).

## Authentication

1. **Register** (`POST /api/v1/auth/register`) or **login** (`POST /api/v1/auth/login`) — returns `accessToken` and `refreshToken`.
2. **Protected routes**: send `Authorization: Bearer <accessToken>`.
3. **Refresh** (`POST /api/v1/auth/refresh`): body `{ "refreshToken": "..." }` — must match the hashed refresh token stored for the user after login/register.
4. **Logout** (`POST /api/v1/auth/logout`): requires access token; clears the stored refresh token.

Public registration always creates users with role `USER` (no client-controlled role escalation).

## License

This project is licensed under the MIT License — see the LICENSE file for details.
